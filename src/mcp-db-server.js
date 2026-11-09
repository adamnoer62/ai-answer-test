#!/usr/bin/env node
// Standalone MCP (stdio) server exposing read-only access to the local
// `wrapstation` MySQL database, so discussion participants can ground their
// answers ("prediksi", dll) in real data. Registered per-CLI via `mcp add`.
//
// Safety model:
//   - Connects with a dedicated MySQL user (wrapstation_ai_ro) that only has
//     SELECT on the wrapstation database — enforced at the DB level.
//   - The `query` tool additionally rejects anything that isn't a single
//     read-only SELECT, as defense in depth.
import path from "node:path";
import { fileURLToPath } from "node:url";
import mysql from "mysql2/promise";
import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
process.loadEnvFile(path.join(__dirname, "..", ".env"));

const DB_NAME = process.env.WRAPSTATION_DB_NAME || "wrapstation";
const MAX_ROWS = 200;

const pool = mysql.createPool({
  host: process.env.WRAPSTATION_DB_HOST || "127.0.0.1",
  port: Number(process.env.WRAPSTATION_DB_PORT || 3306),
  user: process.env.WRAPSTATION_DB_USER,
  password: process.env.WRAPSTATION_DB_PASSWORD,
  database: DB_NAME,
  connectionLimit: 3,
  connectTimeout: 8000,
});

const FORBIDDEN = /\b(insert|update|delete|drop|alter|create|truncate|grant|revoke|replace|call|exec|execute|into\s+outfile|load_file|lock\s+tables|set\s)\b/i;

function assertSelectOnly(sql) {
  const trimmed = sql.trim().replace(/;+\s*$/, "");
  if (!/^select\b/i.test(trimmed)) {
    throw new Error("Hanya query SELECT yang diizinkan.");
  }
  if (trimmed.includes(";")) {
    throw new Error("Tidak boleh ada beberapa statement (';') dalam satu query.");
  }
  if (FORBIDDEN.test(trimmed)) {
    throw new Error("Query mengandung kata kunci yang tidak diizinkan (hanya SELECT baca-saja).");
  }
  return trimmed;
}

async function listTableNames() {
  const [rows] = await pool.query("SHOW TABLES");
  return rows.map((r) => Object.values(r)[0]);
}

function text(value) {
  return { content: [{ type: "text", text: typeof value === "string" ? value : JSON.stringify(value, null, 2) }] };
}

const server = new McpServer({ name: "wrapstation-db", version: "1.0.0" });

server.registerTool(
  "list_tables",
  {
    title: "List Wrapstation tables",
    description: `Daftar semua tabel di database MySQL '${DB_NAME}' beserta jumlah barisnya. Panggil ini dulu untuk tahu tabel apa saja yang tersedia sebelum query.`,
    inputSchema: {},
  },
  async () => {
    const [rows] = await pool.query(
      `SELECT table_name AS tbl, table_rows AS approx_rows FROM information_schema.tables WHERE table_schema = ? ORDER BY table_name`,
      [DB_NAME]
    );
    return text(rows);
  }
);

server.registerTool(
  "describe_table",
  {
    title: "Describe a Wrapstation table",
    description: "Lihat struktur kolom (nama, tipe, nullable, key) dari satu tabel.",
    inputSchema: { table: z.string().describe("Nama tabel persis seperti hasil list_tables") },
  },
  async ({ table }) => {
    const known = await listTableNames();
    if (!known.includes(table)) {
      throw new Error(`Tabel '${table}' tidak ditemukan. Panggil list_tables untuk daftar yang valid.`);
    }
    const [rows] = await pool.query(`DESCRIBE \`${table}\``);
    return text(rows);
  }
);

server.registerTool(
  "query",
  {
    title: "Run a read-only SQL query",
    description: `Jalankan satu query SELECT read-only ke database '${DB_NAME}'. Wajib SELECT tunggal, tanpa titik-koma ganda. Hasil dibatasi maksimal ${MAX_ROWS} baris (LIMIT ditambahkan otomatis kalau belum ada).`,
    inputSchema: { sql: z.string().describe("Satu statement SELECT, misal: SELECT * FROM product LIMIT 10") },
  },
  async ({ sql }) => {
    let safe = assertSelectOnly(sql);
    if (!/\blimit\s+\d+/i.test(safe)) {
      safe += ` LIMIT ${MAX_ROWS}`;
    }
    const [rows] = await pool.query(safe);
    return text(rows);
  }
);

const transport = new StdioServerTransport();
await server.connect(transport);
