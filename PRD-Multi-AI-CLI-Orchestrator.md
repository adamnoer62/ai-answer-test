# PRD: Multi-AI CLI Orchestrator

**Versi:** 0.1 (Draft)
**Tanggal:** 23 Agustus 2026
**Pemilik Produk:** —
**Status:** Draft awal

---

## 1. Ringkasan (Overview)

Sebuah tool berbasis CLI/script yang memungkinkan beberapa AI model (Claude, GPT, Gemini, dll) berdiskusi/berdebat terhadap satu prompt dari user, dengan Claude berperan sebagai **moderator/judge** yang membaca seluruh percakapan dan memberikan kesimpulan akhir — bukan ikut serta sebagai peserta debat.

## 2. Latar Belakang & Masalah

- Setiap AI punya kekuatan & bias jawaban yang berbeda. Membandingkan jawaban satu-satu secara manual itu lambat dan nggak terstruktur.
- Tools yang ada sekarang (lmarena.ai, dsb) fokus ke voting manual, bukan diskusi/debat antar model plus kesimpulan otomatis.
- User ingin alur: beberapa AI saling menanggapi → satu AI netral menyimpulkan → user dapat jawaban akhir yang lebih matang tanpa harus baca semua debat.

## 3. Tujuan (Goals)

1. User bisa memasukkan satu prompt/topik, lalu beberapa AI berdiskusi otomatis beberapa ronde.
2. Claude (atau model lain yang ditentukan) bertindak sebagai judge/moderator, bukan peserta.
3. Output akhir berupa kesimpulan terstruktur: poin disepakati, poin beda pendapat, rekomendasi akhir.
4. Bisa dijalankan dari terminal (CLI script), ringan, dan mudah dikonfigurasi (tambah/kurangi model).

## 4. Target Pengguna

- Individual developer/power user yang punya akses ke beberapa AI provider (API key atau CLI login) dan ingin membandingkan/mengombinasikan hasilnya untuk riset, brainstorming, atau decision-making.

## 5. Non-Goals (Di Luar Cakupan v1)

- Bukan aplikasi web dengan UI penuh (v1 fokus CLI/terminal).
- Bukan real-time multi-user chat room.
- Tidak menangani fine-tuning atau training model apa pun.
- Tidak mendukung voice/multimodal di v1 (teks saja).

## 6. User Stories

| # | Sebagai... | Saya ingin... | Agar... |
|---|---|---|---|
| 1 | User | memasukkan satu prompt/topik | semua AI peserta mulai diskusi dari titik yang sama |
| 2 | User | menentukan jumlah ronde diskusi | bisa kontrol durasi & biaya |
| 3 | User | melihat transkrip lengkap tiap model | bisa audit siapa bilang apa |
| 4 | User | dapat kesimpulan akhir dari judge | tidak perlu baca semua debat manual |
| 5 | User | menambah/mengurangi model peserta lewat config | fleksibel sesuai API/CLI yang dimiliki |
| 6 | User | melihat proses berjalan (streaming/log) | tahu progress, bukan nunggu blank |

## 7. Functional Requirements

### 7.1 Input
- User memasukkan: topik/prompt, jumlah ronde (default: 2-3), daftar model peserta.
- Config file (`config.yaml`/`.json`) untuk daftar model, API key/CLI command, dan parameter (max tokens, temperature, dll).

### 7.2 Orkestrasi Diskusi
- Round-robin: tiap ronde, setiap model peserta membaca **seluruh history percakapan** (diformat dengan label `[NamaModel]: ...`) lalu memberi tanggapan baru.
- History disimpan sebagai satu struktur data (list of turns) yang terus di-append.
- Instruksi ke tiap model harus eksplisit: tanggapi/kritik/tambahkan perspektif baru — bukan cuma "setuju".
- Ada guard terhadap infinite agreement loop (misal deteksi jawaban terlalu mirip N ronde berturut-turut → hentikan lebih awal).

### 7.3 Role Judge (Claude)
- Setelah diskusi selesai (N ronde atau berhenti awal), seluruh transkrip dikirim ke Claude dengan system prompt eksplisit: "Kamu BUKAN peserta diskusi, tugasmu menganalisis & menyimpulkan."
- Output judge terstruktur:
  - Ringkasan tiap model (posisi utama)
  - Poin yang disepakati semua
  - Poin yang jadi perdebatan & alasannya
  - Rekomendasi/jawaban akhir menurut judge
  - (Opsional) skor/ranking tiap model berdasarkan rubric (akurasi, kedalaman, relevansi)

### 7.4 Output & Tampilan
- Transkrip lengkap disimpan ke file (misal `.md` atau `.json`) untuk arsip.
- Kesimpulan akhir ditampilkan terpisah/menonjol di terminal.
- (Opsional v1.5) Export ke HTML sederhana biar enak dibaca.

### 7.5 Konfigurasi Model
- Support model via API key langsung (disarankan sebagai default, lebih stabil daripada CLI).
- Support pemanggilan CLI eksternal sebagai fallback (via subprocess), dengan output parser untuk strip ANSI/format aneh.

## 8. Non-Functional Requirements

- **Reliabilitas:** kalau satu model gagal/timeout, diskusi tetap lanjut dengan model lain (bukan crash total); dicatat sebagai "no response".
- **Konfigurabilitas:** nambah model baru tidak perlu ubah core logic, cukup tambah entry di config.
- **Biaya terkontrol:** ada estimasi/limit token per sesi biar nggak boncos karena diskusi multi-ronde x multi-model.
- **Kecepatan:** panggilan ke tiap model dalam satu ronde dijalankan paralel (async), bukan sequential, biar nggak nunggu lama.
- **Portabilitas:** jalan di Python atau Node, cross-platform (macOS/Linux minimal; Windows nice-to-have).

## 9. Arsitektur (High-Level)

```
User Input (prompt, rounds, model list)
        │
        ▼
   Orchestrator (script)
        │
   ┌────┴────┬─────────┬─────────┐
   ▼         ▼         ▼         ▼
 Model A   Model B   Model C   Model D   (paralel per ronde)
   │         │         │         │
   └────┬────┴─────────┴─────────┘
        ▼
  History Store (append tiap ronde)
        │
        ▼
   Loop N ronde / stop-condition
        │
        ▼
   Judge Call (Claude) → baca full history
        │
        ▼
   Kesimpulan Terstruktur + Transkrip Tersimpan
```

## 10. Metrik Keberhasilan

- Waktu total dari input prompt sampai kesimpulan akhir (target: reasonable, misal < beberapa menit untuk 3 model x 2 ronde).
- Tidak ada crash saat satu provider down/error.
- Subjektif: kesimpulan judge dirasa representatif & berguna dibanding baca transkrip manual (feedback user).

## 11. Risiko & Mitigasi

| Risiko | Mitigasi |
|---|---|
| Rate limit/biaya tiap provider beda-beda | Config limit token & ronde per sesi |
| Model saling "setuju terus" tanpa insight baru | Prompt eksplisit anti-agreement + deteksi kemiripan jawaban |
| Context window kepotong di ronde lanjut | Strategi ringkas/summarize history kalau makin panjang |
| CLI provider berubah/auth gagal (seperti kasus Gemini CLI) | Prioritaskan API key sebagai jalur utama, CLI sebagai fallback opsional |
| Bias judge ke satu model tertentu | Rubric eksplisit + instruksi netral di system prompt judge |

## 12. Roadmap Bertahap

- **v1 (MVP):** CLI script, 2-3 model via API key, round-robin diskusi, Claude sebagai judge, output ke terminal + file transkrip.
- **v1.5:** Tambah dukungan CLI fallback, deteksi agreement-loop, export HTML.
- **v2:** UI web sederhana (opsional), ranking/skor per model, dukung lebih banyak provider sekaligus.

## 13. Open Questions

- Model mana saja yang wajib didukung di v1 (fix list atau full configurable)?
- Format transkrip disimpan: Markdown, JSON, atau keduanya?
- Apakah butuh mode "debat terarah" (pro vs kontra) selain diskusi bebas?
