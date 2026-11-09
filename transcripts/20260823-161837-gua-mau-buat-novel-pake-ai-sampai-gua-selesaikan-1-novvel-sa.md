# Diskusi AI: gua mau buat novel pake ai sampai gua selesaikan 1 novvel sampai 1 buku itu gimana cara nya agar tidak ngawur dan tidak seperti ketikan ai

- Tanggal: 23/8/2026, 16.16.15
- Peserta: Gemini, GPT, Claude
- Juri: Claude
- Ronde: 3

---

## Ronde 1

### [Gemini]

Sebagai **Gemini**, posisi awal saya tegas: **AI tidak boleh dibiarkan menulis novel secara otonom dari awal sampai akhir jika kamu ingin hasilnya tidak ngawur dan tidak terasa generik. Kuncinya adalah memposisikan AI sebagai *junior co-writer* dan *sparring partner*, sementara kamu tetap menjadi arsitek cerita, sutradara, sekaligus editor utamanya.**

Alasan dan sikap konkret saya:

1. **Atasi *Memory Drift* dengan Struktur Modular (Bukan *One-Click Generation*)**
   Penyebab utama cerita AI menjadi ngawur di tengah jalan adalah keterbatasan memori konteks jangka panjang. Jika diminta menulis langsung per bab tanpa kendali ketat, AI akan melupakan detail, mengubah kepribadian karakter, atau membuat plot *twist* yang inkonsisten. Solusinya harus hierarkis: kamu wajib menyusun **Story Bible** (profil karakter, aturan dunia, *plot outline*), lalu menugaskan AI menulis **adegan demi adegan (*scene-by-scene beat sheet*)**, bukan bab per bab apalagi satu buku sekaligus.

2. **Hilangkan "Bau AI" dengan Mengunci *Voice* dan Injeksi Subteks**
   Ciri khas ketikan AI adalah kalimat yang terlalu rapi, monoton, klise (*purple prose*), dan sering mendikte emosi (banyak *telling*, sedikit *showing*). Kamu harus memberi batasan gaya (*style constraints*) yang ketat—seperti melarang metafora basi, membatasi panjang kalimat, dan menuntut dialog yang realistis. Draf dari AI harus kamu anggap sebagai tanah liat mentah yang wajib dipoles kembali dengan ritme, humor, dan emosi manusiawi yang hanya kamu yang mengerti.

**Kesimpulan posisi saya:** AI sangat efektif untuk memangkas *writer’s block* dan mempercepat *drafting*, tetapi sebuah novel utuh yang solid hanya bisa tercapai jika kontrol arah, logika logika sebab-akibat, dan jiwa ceritanya 100% tetap dipegang oleh kamu.

### [GPT]

Bisa, tapi AI harus diposisikan sebagai co-writer dan editor—bukan mesin yang menulis novel sendirian. Kalau semua bab disuruh “lanjutkan cerita,” hasilnya hampir pasti ngawur: karakter berubah, konflik melebar, dan bahasanya terasa generik.

Sikap saya: kamu tetap jadi sutradara utama. Sebelum menulis, buat “bible” novel: premis, tema, profil karakter, aturan dunia, garis waktu, konflik tiap bab, serta gaya bahasa yang kamu mau. Tulis dulu sendiri adegan-adegan penting atau minimal keputusan emosionalnya; AI dipakai untuk bikin opsi, merapikan draf, mencari lubang logika, dan mengembangkan adegan dalam batas yang jelas.

Agar tidak terasa seperti ketikan AI, jangan pakai hasil pertama mentah-mentah. Minta AI menulis pendek per adegan, lalu kamu revisi dengan pengalaman, pilihan kata, detail lokal, dan sudut pandangmu sendiri. Suara penulis lahir dari seleksi dan revisi—bukan dari prompt yang makin panjang.

### [Claude]

Posisi saya: bisa, tapi AI hanya boleh jadi alat bantu di lapisan eksekusi kalimat—bukan pemegang kendali cerita. Kalau arah cerita, keputusan plot, dan suara narasi diserahkan ke AI, hasilnya pasti berasa "ketikan AI": generik, plot ngambang, karakter tidak konsisten. Supaya tidak ngawur, tiga hal harus tetap dipegang manusia sepenuhnya:

1. **Kerangka besar (outline & bible) dibuat manusia dulu, detail.** Sinopsis per bab, arc karakter, timeline, aturan dunia cerita — semua ditulis sendiri sebelum AI disentuh. AI dipakai untuk brainstorming opsi, bukan untuk memutuskan. Tanpa outline solid, AI akan improvisasi plot sendiri tiap sesi dan hasilnya akan berkontradiksi antar bab (nama berubah, timeline lompat, kepribadian karakter goyang).

2. **Proses per-bab harus iteratif dan diedit tangan, bukan generate-lalu-tempel.** Pola yang realistis: kamu tulis draf kasar atau poin adegan → minta AI perbaiki kalimat/dialog dengan gaya spesifik yang kamu contohkan → kamu revisi ulang dengan suara sendiri. Kalau langsung suruh AI "tulis bab 5" dari nol tanpa draf awal, hasilnya generik karena AI menebak apa yang "biasanya" ditulis, bukan apa yang unik dari ceritamu.

3. **"Tidak seperti ketikan AI" itu soal suara (voice), bukan soal tata bahasa.** AI cenderung menghasilkan kalimat rapi-simetris, banyak triplet ("dia merasa X, Y, dan Z"), metafora klise, dan narasi yang menjelaskan emosi alih-alih menunjukkannya. Untuk menghindarinya: berikan AI contoh tulisanmu sendiri sebagai referensi gaya, minta ia meniru ritme kalimatmu, lalu edit ulang bagian yang "terlalu rapi" — biasanya justru ketidaksempurnaan kecil (kalimat pendek tiba-tiba, keheningan yang tidak dijelaskan) yang bikin terasa manusiawi.

Praktisnya: gunakan AI untuk continuity-checking (deteksi kontradiksi dengan bible-mu), brainstorming dialog/adegan alternatif, dan polishing kalimat — tapi setiap output AI harus lewat filter editingmu sebelum masuk draf final. Kalau targetnya satu novel utuh selesai, disiplin proses ini lebih penting daripada model AI mana yang dipakai.

## Ronde 2

### [Gemini]

[Gemini]:

Melihat konsensus dari GPT dan Claude, kita semua sepakat bahwa **Story Bible** dan **Human-in-the-loop Editing** adalah fondasi wajib. Namun, teori itu sering gagal saat eksekusi teknis di lapangan. 

Untuk membawa diskusi ini ke level praktis yang belum disentuh sebelumnya, ada 3 koreksi dan strategi eksekusi konkret:

---

### 1. Jangan *Dump* Seluruh Story Bible (Gunakan *Context Slicing / Just-In-Time Context*)
Kesalahan umum penulis adalah menempelkan seluruh dokumen Story Bible (puluhan halaman) ke setiap prompt. Ini memicu **Attention Dilution / Context Pollution**—AI justru terdistraksi, kehilangan fokus adegan, dan cenderung mengulang-ulang informasi latar belakang.
* **Koreksi:** Beri AI *makan* per adegan secara modular. Di setiap prompt adegan, cukup suntikkan **3 lapis konteks**:
  1. *Immediate Goal:* Apa yang ingin dicapai karakter di 500 kata ini?
  2. *Immediate Obstacle:* Apa/siapa yang menghalangi mereka?
  3. *Physical & Secret Constraints:* Barang apa yang ada di ruangan, dan rahasia apa yang belum boleh bocor ke karakter lawan bicara.

---

### 2. Kunci *Conflict Resolution Bias* (Penyakit Terbesar Plot AI)
Model bahasa secara alami dilatih untuk menjadi "penolong" yang sopan, sehingga AI memiliki bias bawaan untuk **menyelesaikan konflik terlalu cepat** atau menutup tiap adegan dengan refleksi moral yang klise (*"Dan di saat itulah, dia menyadari arti sebenarnya dari..."*).
* **Solusi Prompting:** Berikan instruksi negatif eksplisit (*Negative Constraints*):
  * *"Dilarang menyelesaikan konflik dalam adegan ini."*
  * *"Karakter A tidak boleh berkompromi atau meminta maaf."*
  * *"Haram menulis paragraf kesimpulan/refleksi filosofis di akhir adegan; potong langsung di tengah aksi/dialog yang menggantung (*hard cut*)."*

---

### 3. Pisahkan Percakapan Menjadi 3 *Thread/Role* Terpisah
Menulis novel 1 buku dalam satu sesi/chatbox panjang akan merusak kualitas (*context degradation* dan bias konfirmasi). Pisahkan alur kerja ke dalam **3 thread berbeda**:
* **Thread 1: The Architect (Plot & Logic):** Sesi khusus untuk menguji logika sebab-akibat, *foreshadowing*, dan membedah *plot hole*.
* **Thread 2: The Drafter (Scene Generator):** Sesi bersih (*fresh context*) hanya untuk mengeksekusi draf 400–800 kata per *beat* berdasarkan instruksi dari Thread 1.
* **Thread 3: The Ruthless Redliner (Anti-AI Editor):** Sesi dengan prompt sistem khusus untuk memburu kalimat simetris, metafora usang, kata sifat berlebih, dan trik narasi klise khas AI sebelum kamu memolesnya secara manual.

---

**Intinya:** Menulis 1 novel utuh dengan AI bukan soal seberapa panjang prompt-mu, melainkan **seberapa disiplin kamu mengisolasi konteks, menekan bias harmonisasi AI, dan memecah proses kreatif menjadi sistem *pipelining* yang terukur.**

### [GPT]

Saya koreksi satu hal: AI tidak harus dibatasi hanya di “lapisan eksekusi kalimat.” AI boleh membantu merancang plot dan outline juga—asal ia memberi beberapa opsi beserta konsekuensi, sementara keputusan kanon tetap kamu yang tetapkan. Kalau semua outline wajib dibuat manusia dari nol, AI justru kurang dimanfaatkan.

Yang belum dibahas adalah sistem kontrol produksi. Buat tiga dokumen hidup:

- **Story bible:** fakta yang tidak boleh berubah.
- **Peta bab/adegan:** tujuan, konflik, perubahan karakter, dan informasi yang terungkap.
- **Log revisi/kanon:** setiap keputusan baru dicatat setelah bab selesai.

Sebelum AI menulis satu adegan, beri “kontrak adegan”: POV, tujuan tokoh, hambatan, perubahan di akhir, fakta yang wajib muncul, dan hal yang dilarang. Sesudahnya, jangan cuma edit gaya; minta AI mengaudit dengan checklist: “apa yang berubah dari status karakter?”, “ada fakta baru yang belum masuk bible?”, “ada dialog yang menjelaskan emosi terlalu gamblang?”

Target utamanya bukan menghasilkan teks yang “tidak terdeteksi AI,” melainkan teks yang punya pilihan artistik sengaja: detail spesifik, konflik batin yang tidak dijelaskan habis-habisan, dan konsekuensi antarbab. AI bisa mempercepat draf; konsistensi dan selera penulis lah yang membuatnya menjadi novel.

### [Claude]

Menambahkan tiga hal yang belum disentuh di ronde ini — semuanya soal *skala* dan *blind spot* proses, bukan filosofi umum yang sudah disepakati bertiga:

1. **Masalah sebenarnya bukan "per-adegan", tapi bertahan sampai ~80.000-100.000 kata.** Semua saran di atas (bible, scene-by-scene, edit manual) benar tapi belum bicara soal daya tahan proyek. Titik gagal paling umum bukan AI yang ngawur di bab 3, tapi penulis kehabisan energi di bab 15 lalu mulai *generate-tempel* tanpa filter karena kejar target selesai. Solusinya butuh manajemen proyek eksplisit: target kata per minggu, checkpoint tiap 5 bab untuk baca ulang dari awal (bukan cuma bab terakhir), dan "continuity document" yang di-update setiap selesai bab — bukan cuma ditulis di awal lalu dilupakan.

2. **Instruksi "jangan kedengaran seperti AI" sering *counterproductive*.** Kalau kamu prompt "hindari kata 'menyelinap', 'namun', metafora klise", model biasanya cuma ganti dengan klise lain yang belum ada di daftar larangan — bukan benar-benar menulis lebih manusiawi. Yang lebih efektif: bikin daftar *banned phrase* yang **berkembang dari hasil nyata**, bukan tebakan di awal. Caranya, setelah tiap bab selesai, minta AI (atau tempel manual) daftar frasa/pola yang berulang di draf itu sendiri, lalu masukkan itu jadi larangan eksplisit untuk bab berikutnya. Daftar itu jadi makin personal dan makin akurat seiring novel berjalan — bukan daftar generik "hindari purple prose" yang semua orang pakai.

3. **Jangan minta AI cek konsistensi ceritanya sendiri dalam sesi/model yang sama.** Ketiga poin di atas menyarankan AI untuk continuity-check, tapi model yang sama yang menulis draf punya blind spot yang sama saat mengoreksi — dia cenderung "percaya" pilihannya sendiri. Praktis: continuity-checking sebaiknya dilakukan di sesi baru (context bersih, hanya dikasih bible + bab yang mau dicek) atau bahkan model lain, supaya deteksi kontradiksi (umur karakter berubah, luka yang hilang sendiri, timeline lompat) tidak ikut ketutup asumsi yang sama dengan penulis drafnya.

Poin tambahan di luar craft: kalau tujuannya diterbitkan (KDP, Wattpad/Storial, penerbit lokal), cek dulu kebijakan disclosure konten AI dari platform tujuan — ini teknis, tapi bisa menentukan berapa persen "AI-assisted" yang masih boleh diklaim sebagai karya orisinal, dan itu memengaruhi seberapa jauh proses editing manual di poin 2-3 di atas harus didokumentasikan.

## Ronde 3

### [Gemini]

[Gemini]:

Menanggapi poin Claude soal *burnout* di bab 15 (80k kata) dan kontrak adegan GPT, kita perlu membedah **dua penyakit fatal teknis** yang biasanya membunuh novel AI di tengah jalan dan belum disentuh sama sekali:

---

### 1. Rusak *Gricean Cooperativeness* (Penyebab Utama Dialog AI Terasa Kering & Palsu)
Secara teknis, LLM dilatih untuk patuh pada *Prinsip Kerjasama Grice*—yaitu selalu menjawab pertanyaan secara jujur, informatif, dan relevan. Di dunia nyata dan fiksi berkualitas, **manusia hampir tidak pernah berbicara seperti itu.** Dialog fiksi hidup dari *deflection*, kebohongan, salah paham yang disengaja, dan agenda tersembunyi.

* **Penyakit Dialog AI:** Karakter A bertanya *"Kamu dari mana?"*, Karakter B langsung menjawab *"Dari gudang belakang mencari berkas."* Ini instan mematikan tensi.
* **Intervensi Eksekusi:** Beri aturan dialog friksional (*Conversational Friction*):
  * *Terapkan aturan "No Direct Answers":* Tokoh dilarang menjawab pertanyaan lawan bicara secara langsung; mereka harus mengalihkan topik, membalas dengan pertanyaan, atau merespons dengan aksi fisik.
  * *Inject Asymmetric Knowledge:* Satu karakter harus berbicara tentang sesuatu yang sama sekali berbeda dari apa yang ada di kepala lawan bicaranya (subteks murni).

---

### 2. Aturan *Value Charge Shift* / Pergeseran Nilai (Obat Anti-Stagnasi Bab 15 / Act II)
Penulis kehabisan stamina di bab 15 bukan hanya karena malas, tetapi karena **plot terjebak dalam adegan hampa (*filler*)**. AI sangat pintar memproduksi prosa indah 1.000 kata yang setelah dibaca turns out **tidak mengubah apa pun dalam cerita**.

* **Koreksi:** Jangan ukur progres dari *jumlah kata*, tapi dari **Pergeseran Muatan Nilai (*Value Delta*)**:
  * Setiap adegan wajib bergerak dari satu polaritas ke polaritas sebaliknya: **Positif ke Negatif (+ ke -)** atau **Negatif ke Positif (- ke +)**. (Contoh: *Percaya Diri (+)* $\to$ *Tersudut (-)*).
  * Jika draf adegan dari AI dimulai dalam kondisi ragu (-) dan berakhir tetap ragu (-), **Delta Nilai = 0**. Draf itu sampah, jangan diedit—minta AI regenerasi dengan *turning point* yang jelas atau hapus adegannya.

---

### 3. *Sensory Anchoring* Jauh Lebih Efektif daripada Sekadar *Banlist*
Menyambung usulan Claude soal *dynamic banlist*: melarang kata klise (*negative prompting*) sering memicu *pink-elephant effect* pada model (makin dilarang, model makin fokus mencari sinonim klise yang sama kakunya).

* **Solusi Proaktif:** Daripada sibuk mencatat apa yang dilarang, **paksa AI menggunakan 2 jangkar fisik konkret (*Sensory Anchors*)** non-visual di tiap adegan:
  * Bukan *"Tunjukkan dia gelisah tanpa kata 'gelisah'"*, melainkan *"Adegan ini harus melibatkan korek api kayu yang basah dan bau solar yang pekat."*
  * Ketika model dipaksa menenun interaksi fisik dengan objek spesifik, ia secara otomatis tidak punya ruang token untuk menulis metafora abstrak atau refleksi filosofis generik khas AI.

---

**Kesimpulan Ronde 3:** Untuk menembus 1 buku tanpa ngawur: **hancurkan dialog sopan AI dengan aturan friksi, tolak adegan yang Delta Nilainya nol, dan ikat setiap *beat* pada jangkar sensorik fisik konkret.**

### [GPT]

Saya tambahkan satu koreksi: pemisahan tiga thread memang membantu fokus, tapi kalau terlalu terpisah bisa membuat novel terasa ditulis oleh tiga orang berbeda. Thread drafter perlu menerima “paket suara” yang ringkas dan terus diperbarui: contoh 1–2 halaman prosa final, daftar pilihan diksi khas, ritme dialog, serta hal yang sengaja tidak dijelaskan. Bible menjaga fakta; paket suara menjaga rasa.

Yang juga belum dibahas: bedakan revisi struktur dari revisi kalimat. Banyak orang memoles draf AI terlalu cepat, padahal masalah terbesar biasanya bukan kata-katanya, melainkan adegannya tidak mengubah apa pun. Sebelum mengedit gaya, cek setiap adegan:

- Apa yang diinginkan tokoh?
- Apa harga/kegagalannya?
- Informasi atau relasi apa yang berubah?
- Kalau adegan dihapus, apakah cerita benar-benar kehilangan sesuatu?

Jika jawabannya tidak jelas, jangan “perbagus” teksnya—rancang ulang adegannya.

Terakhir, buat *version control* sederhana: simpan draf awal AI, revisi manusia, dan alasan keputusan besar. Bukan demi pembuktian “ini bukan AI”, melainkan supaya kamu bisa melihat pola: bagian mana yang selalu harus kamu rombak, dialog macam apa yang paling hidup saat kamu tulis sendiri, dan kebiasaan AI apa yang terus menyusup. Dari situ, penggunaan AI makin presisi sepanjang buku, bukan sekadar makin banyak prompt.

Targetnya bukan mengakali detektor AI. Targetnya: setiap pilihan penting—sudut pandang, konflik, detail, ritme, dan akhir adegan—punya alasan artistik yang kamu sadar dan kamu pertanggungjawabkan.

### [Claude]

Tiga hal yang belum disentuh sama sekali di dua ronde ini, dan menurut saya lebih penting daripada teknik prompting tambahan:

1. **Genre menentukan toleransi "bau AI", tapi belum ada yang membedakannya.** Semua saran di atas (variasi kalimat, subteks, konflik yang tidak selesai) itu standar fiksi literer. Kalau targetnya novel pop/genre — romance, thriller ringan, fantasi Wattpad-style — pembaca justru *mengharapkan* pola tertentu: dialog eksplisit soal perasaan, ritme kalimat yang rapi, resolusi konflik per bab yang jelas. Menerapkan "larangan telling, larangan closure" ala fiksi literer ke naskah genre populer malah bisa membuat pacing terasa aneh untuk pembaca targetnya. Sebelum pakai daftar larangan gaya dari siapa pun di atas, tentukan dulu genre dan baca 3-5 novel pembanding yang sukses di genre itu — barometer "ngawur atau tidak" harus dikalibrasi ke ekspektasi genre, bukan ke standar generik "tulisan bagus."

2. **Bahaya sycophancy bukan cuma soal AI menutup konflik terlalu cepat — ini soal AI jadi validator yang tidak bisa dipercaya.** Begitu kamu tanya ke AI "apakah bab ini bagus?" atau "apakah plot twist ini masuk akal?", jawabannya hampir selalu cenderung positif, apa pun kualitas aslinya. Ini masalah serius untuk proyek panjang karena penulis solo tanpa pembaca lain jadi mengandalkan AI sebagai satu-satunya sinyal kualitas — dan sinyal itu bias ke arah "iya, bagus." Solusinya: jangan pernah pakai AI untuk validasi kualitas holistik ("apakah ini bagus"), hanya untuk pengecekan spesifik dan terverifikasi sendiri (kontinuitas fakta, konsistensi timeline). Untuk penilaian kualitas naratif, wajib ada pembaca manusia — minimal beta reader — sebelum menganggap draf final.

3. **Sisi legal/orisinalitas belum dibahas, padahal ini yang menentukan apakah "novelnya" bisa diklaim sebagai karyamu.** Di banyak yurisdiksi (termasuk arah kebijakan US Copyright Office), teks yang murni dihasilkan mesin tanpa kontribusi kreatif manusia yang substansial tidak otomatis mendapat perlindungan hak cipta sebagai karya orisinal — kontribusi manusia harus bisa ditunjukkan dan idealnya didokumentasikan. Untuk penerbit lokal Indonesia pun mulai ada kebijakan disclosure AI-assisted content. Implikasi praktis: simpan jejak proses — draf manual awal, revisi tangan, log keputusan kreatif (poin GPT soal "log revisi/kanon" ternyata berguna ganda: bukan cuma untuk kontinuitas cerita, tapi juga bukti kontribusi manusia kalau suatu saat orisinalitas dipertanyakan penerbit atau platform).

Intinya: diskusi ini sudah sangat matang di level proses (bible, kontrak adegan, pipelining). Yang masih kosong adalah kalibrasi terhadap *target* — genre pembaca, batas ketergantungan pada validasi AI, dan status legal hasil akhirnya.

---

## Kesimpulan Juri

### Ringkasan Posisi
- **Gemini:** AI hanya boleh jadi junior co-writer/sparring partner, bukan penulis otonom; solusi teknis utamanya adalah pipelining ketat—context slicing per adegan (bukan dump seluruh bible), pemisahan kerja jadi 3 thread terpisah (Architect, Drafter, Redliner), dan aturan teknis konkret untuk membongkar pola khas AI: memecah Gricean cooperativeness dialog, mengukur progres lewat 'Value Delta' tiap adegan, serta memakai sensory anchoring fisik alih-alih sekadar banlist kata.
- **GPT:** AI boleh dilibatkan lebih luas termasuk brainstorming plot/outline (memberi opsi + konsekuensi), tapi keputusan kanon tetap manusia; kuncinya sistem kontrol produksi (story bible, peta bab, log revisi/kanon) dan kontrak adegan eksplisit sebelum AI menulis. Ia juga menekankan 'paket suara' agar hasil tiga thread tidak terasa ditulis orang berbeda, membedakan revisi struktur vs revisi kalimat, dan version control draf untuk melacak pola kebiasaan AI—tujuan akhirnya bukan mengakali detektor AI tapi memastikan tiap pilihan artistik punya alasan sadar.
- **Claude:** AI hanya boleh jadi alat di lapisan eksekusi kalimat, bukan pemegang kendali cerita; kerangka besar harus dibuat manusia dulu, proses per-bab iteratif dan diedit tangan, dan 'bau AI' adalah soal voice bukan tata bahasa. Di ronde lanjutan ia menyoroti isu skala/blind spot yang belum dibahas: daya tahan proyek sampai 80-100rb kata, banlist dinamis berbasis hasil nyata, continuity-check di sesi/model terpisah, kalibrasi 'ngawur' terhadap ekspektasi genre, bahaya AI sebagai validator kualitas yang sycophantic, serta aspek legal/orisinalitas dan dokumentasi kontribusi manusia.

### Poin Disepakati
- AI tidak boleh menulis novel secara otonom dari awal sampai akhir; manusia harus tetap memegang kendali arah cerita, plot, dan keputusan kanon.
- Wajib ada 'story bible'/dokumen kanon (profil karakter, aturan dunia, timeline) yang dibuat/disepakati sebelum AI menulis adegan.
- Proses harus dilakukan per-adegan/per-bab secara iteratif dengan instruksi/kontrak yang jelas, bukan generate-satu-buku-sekaligus lalu tempel mentah.
- Draf AI wajib melalui revisi/editing manusia sebelum dianggap final; 'suara' penulis lahir dari seleksi dan revisi, bukan dari prompt.
- 'Terasa seperti ketikan AI' bersumber dari pola/gaya (kalimat rapi-simetris, telling berlebih, resolusi konflik terlalu cepat/klise), bukan sekadar tata bahasa, dan perlu ditangani lewat instruksi gaya serta pengeditan manual yang berkelanjutan.
- Diperlukan dokumentasi/pencatatan proses (log revisi, jejak draf) sepanjang penulisan, bukan hanya di awal proyek.

### Poin Diperdebatkan
- **Seberapa jauh AI boleh dilibatkan dalam perancangan plot/outline** — Claude (ronde 1) membatasi AI hanya di lapisan eksekusi kalimat dan menyatakan kerangka besar harus 100% dibuat manusia; GPT secara eksplisit mengoreksi ini, berpendapat AI boleh membantu merancang plot/outline asal memberi opsi+konsekuensi sementara keputusan kanon tetap di tangan manusia—perbedaan ini soal seberapa besar manusia harus 'dari nol' vs 'dibantu AI' di tahap ideasi.
- **Cara paling efektif menghindari 'bau AI': banlist/negative constraint vs sensory anchoring vs kalibrasi genre** — Gemini awalnya mengusulkan negative constraints eksplisit lalu di ronde 3 mengoreksi dirinya sendiri (banlist memicu 'pink-elephant effect') dan beralih ke sensory anchoring; Claude mengusulkan banlist dinamis yang tumbuh dari hasil nyata; Claude juga menambahkan bahwa standar 'tidak ngawur' itu sendiri relatif terhadap genre (fiksi literer vs pop/genre), sehingga aturan anti-AI generik dari Gemini/GPT bisa salah kalibrasi untuk novel genre populer—ini mencerminkan penekanan berbeda pada teknik prompting granular vs kalibrasi ekspektasi pembaca.
- **Apakah AI aman dipakai untuk menilai kualitas/kontinuitas naskahnya sendiri** — Gemini dan GPT mengusulkan penggunaan AI untuk continuity-checking dan audit checklist tanpa syarat khusus, sementara Claude menambahkan caveat penting: AI cenderung sycophantic sehingga tidak bisa dipercaya untuk penilaian kualitas holistik, dan continuity-check harus dilakukan di sesi/model terpisah dari yang menulis draf—perbedaan muncul karena Claude fokus pada bias struktural model (self-trust blind spot) yang belum dipertimbangkan Gemini/GPT.

### Rekomendasi Akhir
Gabungkan tiga lapisan yang diusulkan ketiga model karena saling melengkapi, bukan bertentangan: (1) Fondasi kontrol—story bible, peta bab/kontrak adegan (GPT), dan log revisi/kanon yang di-update tiap bab, dengan AI boleh membantu brainstorming plot asal keputusan akhir tetap manusia; (2) Eksekusi teknis per-adegan—context slicing (bukan dump bible penuh), sensory anchoring dan aturan friksi dialog untuk menghindari pola 'AI sopan' (Gemini), dikombinasikan dengan 'paket suara' yang konsisten lintas sesi (GPT) supaya nada tidak pecah; (3) Kalibrasi dan kehati-hatian meta—sesuaikan standar 'tidak ngawur/tidak berbau AI' dengan genre target, jangan andalkan AI untuk validasi kualitas holistik (wajib ada beta reader manusia), lakukan continuity-check di sesi/model terpisah dari penulis draf, kelola stamina proyek dengan checkpoint baca-ulang berkala, dan dokumentasikan kontribusi manusia untuk kebutuhan legal/orisinalitas platform. Urutan prioritas praktis: bangun bible dan kontrak adegan dulu → tulis/generate per-adegan dengan jangkar sensorik dan batasan gaya → edit manual dengan suara sendiri → audit kontinuitas di sesi terpisah → validasi kualitas naratif lewat pembaca manusia, bukan AI.

### Skor
| Model | Akurasi | Kedalaman | Relevansi | Catatan |
|---|---|---|---|---|
| Gemini | 8 | 9 | 9 | Sangat kuat di teknik prompting konkret dan mekanisme linguistik (Gricean cooperativeness, Value Delta, sensory anchoring); istilah teknis kadang terasa dibuat-buat/overclaim ilmiah tanpa sumber jelas, tapi tetap relevan dan praktis serta jujur mengoreksi saran sendiri (banlist) di ronde 3. |
| GPT | 8 | 7 | 9 | Paling seimbang dan pragmatis, konsisten membedakan revisi struktur vs kalimat dan mendorong sistem kontrol produksi yang jelas; kedalaman sedikit di bawah Gemini/Claude karena lebih sedikit poin baru yang benar-benar orisinal di tiap ronde, lebih banyak memperkuat/mensistematisasi ide bersama. |
| Claude | 9 | 9 | 8 | Paling banyak membuka blind spot baru (burnout/stamina proyek, sycophancy AI sebagai validator, kalibrasi genre, isu legal/orisinalitas) dan paling hati-hati soal risiko epistemik; relevansi sedikit lebih rendah karena poin legal/genre agak melebar dari pertanyaan teknis inti 'cara menulis agar tidak ngawur'. |
