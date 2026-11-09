# Orchestrator — Multi-AI CLI Orchestrator

Beberapa AI (Gemini, GPT/Codex, Claude, atau agent kustom dengan persona sendiri) berdebat terhadap satu topik lewat beberapa ronde secara live, lalu satu AI netral (default: Claude) menyimpulkan dan meranking hasilnya. Semua lewat CLI yang sudah kamu login (`agy`, `codex`, `claude`) — tidak pakai API key sendiri.

## Menjalankan

Backend (server) tetap zero-dependency, tapi frontend sekarang React + Framer Motion + GSAP dan butuh build sekali:

```bash
npm run build   # sekali saja (atau setiap kali ubah kode di client/) — install + build frontend
npm start       # jalankan server
```

Buka [http://localhost:4173](http://localhost:4173).

Untuk mode development frontend (hot reload): `cd client && npm run dev` (jalan di :5173, proxy `/api` ke server backend di :4173 — backend tetap harus jalan lewat `npm start` di root secara terpisah).

## Cara kerja

1. Di panel kiri (sidebar), pilih minimal 2 peserta dan tandai satu sebagai juri (ikon bintang).
2. Isi topik dan jumlah ronde, lalu mulai.
3. Tiap ronde, semua peserta terpilih dipanggil **paralel** lewat subprocess CLI mereka masing-masing, membaca seluruh histori diskusi sebelumnya, lalu memberi tanggapan baru.
4. Di atas transkrip ada dua tampilan yang bisa ditoggle (tombol **Kantor** / **Wajah**):
   - **Kantor** (default) — tiap peserta jadi karakter pixel-art di ruang kerja bareng (meja, kursi, rak buku, jam), pakai asset dari `characters/` dan `home assets/`. Klik ikon pensil di pojok karakter untuk **ganti baju & rambut** (kulit, rambut, atasan, bawahan, kaos kaki, sepatu — semua layer terpisah, bisa dicampur bebas), tersimpan per-agent di localStorage browser (murni kosmetik, tidak nyentuh backend/config).
   - **Wajah** (battle strip lama) — wajah ekspresif tiap peserta: berdenyut saat berpikir, garis penghubung menyala ungu saat dua peserta sama-sama sedang menjawab (lagi "beradu" beneran), dan **animasi marah** (alis-V, cemberut, goyang) muncul otomatis kalau jawaban seseorang mengandung bahasa bantahan/koreksi terhadap peserta lain.
   
   Status "berpikir/senang/marah" di kedua tampilan didorong dari event SSE yang sama — heuristik clash-nya di `client/src/clash.js`, murni kosmetik, tidak memengaruhi penilaian juri.
5. Jawaban tiap peserta tampil progresif seperti sedang diketik langsung (bukan konten fiktif — teks asli, hanya cara tampilnya bertahap).
6. Kalau jawaban antar model terlalu mirip 2 ronde berturut-turut, diskusi otomatis berhenti lebih awal (deteksi agreement-loop).
7. Setelah diskusi selesai, juri membaca seluruh transkrip dan mengeluarkan kesimpulan terstruktur: **ranking/leaderboard tiap jawaban**, ringkasan posisi, poin disepakati, poin diperdebatkan, dan rekomendasi akhir.
8. Transkrip lengkap (Markdown + JSON) otomatis tersimpan ke folder `transcripts/`, dan bisa diunduh dari layar hasil.

## Menambah AI / bikin agent dengan persona sendiri

Klik **"Tambah Agent"** di sidebar (tidak perlu edit file):

- **Nama Agent** — bebas, misal "Kritikus VC" atau "Pengacara Skeptis".
- **Mesin Dasar** — Gemini (Antigravity CLI), GPT (Codex CLI), atau Claude (Claude Code CLI). Ini yang benar-benar menjalankan agent-nya.
- **Model** (opsional) — varian model spesifik dari mesin itu (misal `Gemini 3.1 Pro (High)`, `opus`, dll). Kosongkan untuk pakai default.
- **Persona/Peran** (opsional) — instruksi peran yang disisipkan ke setiap prompt agent ini di setiap ronde, jadi agent akan konsisten menjawab dari sudut pandang itu walau mesin dasarnya sama dengan agent lain.

**Klik kanan** nama peserta di sidebar (seperti klik kanan file di Google Drive) untuk **Edit Agent** — bisa ubah nama, model, warna, dan persona kapan saja, termasuk untuk Gemini/GPT/Claude bawaan (mesin dasarnya tetap terkunci, tidak bisa diganti). Agent kustom juga bisa dihapus dari menu yang sama.

Agent kustom tersimpan ke `custom-models.json` (bukan `config.json`), jadi tetap ada setelah restart, dan bisa dihapus lagi lewat ikon tempat sampah di sidebar.

Kalau mau menambah **mesin CLI baru** (bukan cuma agent baru dari mesin yang sudah ada), edit `engines` di [config.json](config.json) — butuh `command`, `baseArgs` dengan placeholder `{PROMPT}`/`{OUTFILE}`/`{MODELFLAGS}`, dan tipe `output` (`json` dengan `textPath`, atau `last-message-file`).

## Akses database Wrapstation (MySQL lokal)

Semua peserta (dan juri) punya akses **read-only** ke database MySQL lokal `wrapstation` (XAMPP, `localhost:3306`) lewat MCP tool bernama `wrapstation-db`, jadi kalau topik diskusinya menyangkut data/prediksi bisnis (penjualan, produk, dll), mereka bisa query data nyata sendiri alih-alih menebak.

- **Kredensial**: pakai user MySQL khusus `wrapstation_ai_ro` (bukan `root`) yang cuma punya `GRANT SELECT` ke database `wrapstation` — sudah dites tidak bisa INSERT/UPDATE/DELETE atau akses database lain, walau nanti kena prompt injection sekalipun. Password tersimpan di `.env` (gitignored).
- **Tools yang tersedia**: `list_tables`, `describe_table`, `query` (hanya SELECT tunggal, otomatis dibatasi 200 baris). Implementasinya di `src/mcp-db-server.js`.
- **Terdaftar di 3 CLI** lewat `claude mcp add` / `codex mcp add` / `agy mcp add` (scope user/global, supaya kepakai walau tiap panggilan CLI jalan dari direktori kerja sementara yang berbeda-beda).
- Codex butuh `--approve-for-me` (bukan `-s read-only`) di `config.json` supaya panggilan tool MCP tidak diblokir izin non-interaktif; Claude butuh `--allowedTools mcp__wrapstation-db` supaya boleh pakai tool ini meski tools lain (Bash/Write/dll) tetap terkunci total.
- Kalau mau ganti scope tabel (misal blokir tabel HR/payroll seperti `gaji_exclude`/`kasbon`), edit `GRANT` di MySQL untuk user `wrapstation_ai_ro`, bukan di kode — itu titik kontrol yang sesungguhnya.

## Struktur

**Backend** (Node core saja, zero dependency):
- `server.js` — HTTP server + SSE.
- `src/runner.js` — eksekutor generik untuk tiap CLI model.
- `src/model-resolver.js` — merangkai `engine` + entry model/agent jadi command siap-jalan.
- `src/custom-models-store.js` — simpan/hapus/edit agent kustom ke `custom-models.json`.
- `src/orchestrator.js` — logika ronde, prompt builder (termasuk persona), judge, event stream.
- `src/similarity.js` — deteksi agreement-loop.
- `src/store.js` — simpan transkrip ke `.md` / `.json`.
- `config.json` — mesin CLI (`engines`), model bawaan (`models`), dan pengaturan (ronde default, threshold, dll).

**Frontend** (`client/`, React + Vite, build ke `public/`):
- `client/src/App.jsx` — state utama & SSE wiring.
- `client/src/components/BattleStrip.jsx` + `ExpressiveAvatar.jsx` — wajah ekspresif live (Framer Motion untuk mood, GSAP untuk efek goyang/kilat saat "clash").
- `client/src/components/OfficeScene.jsx` + `PixelCharacter.jsx` + `CharacterPicker.jsx` — tampilan "Kantor": ruang kerja pixel-art per sesi diskusi, karakter tiap peserta (layer skin/rambut/baju terpisah, bisa diganti-ganti), dan popover ganti baju. Logika sprite grid + katalog asset ada di `client/src/office/` (`spriteGrid.js`, `characterCatalog.js`, `appearance.js`). Asset sumber (`characters/`, `home assets/`) sudah di-crop/disalin ke `client/public/assets/office/` supaya ikut ter-build ke `public/`.
- `client/src/components/MessageBubble.jsx` — bubble transkrip + efek ketik (GSAP-driven).
- `client/src/components/VerdictView.jsx` — leaderboard & kartu kesimpulan (Framer Motion stagger).
- `client/src/components/Sidebar.jsx`, `RosterItem.jsx`, `ContextMenu.jsx`, `AgentModal.jsx` — manajemen peserta/agent + klik-kanan edit.
- `client/src/clash.js` — heuristik kata kunci untuk deteksi "pushback" (memicu animasi marah).
- `client/src/assets/lottie/` — animasi Lottie (thinking, clash, judge-gavel, trophy-confetti, conversation, sleep, no-connection), di-load lazy per komponen lewat `useLottieData.js` + `components/LottiePlayer.jsx` biar tidak membengkakkan bundle awal.
- `public/` — hasil build (jangan diedit manual, akan tertimpa saat `npm run build`).

## Catatan

- `npm audit` di `client/` melaporkan 1 kerentanan (esbuild dev-server, moderate) — itu masalah lawas Vite yang cuma berlaku ke server pengembangan (`vite dev`), bukan hasil build produksi yang dipakai `npm start`. Belum saya perbaiki karena perbaikannya lompat ke Vite versi major baru (breaking change); aman diabaikan untuk pemakaian lokal seperti ini.
