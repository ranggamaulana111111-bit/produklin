# Design System & UI/UX Guidelines
**Konsep Visual:** *Sacred Monochrome & Quiet Luxury* (Kemewahan yang Tenang & Agamis)

---

## 1. Arah Seni (Art Direction)
Desain website ini menggabungkan estetika arsitektur Islam modern (garis bersih, lengkungan halus, permainan bayangan dan cahaya) dengan gaya editorial *high-fashion* minimalis. Tidak ada elemen yang ramai atau warna yang berteriak; kemewahan ditampilkan melalui ruang kosong (*whitespace*), tekstur kain, dan tipografi yang anggun.

---

## 2. Palet Warna (Color Palette)
Dominasi warna abu-abu dirancang dengan gradasi yang hangat dan dingin agar tidak terlihat membosankan atau suram, melainkan memancarkan keteduhan.

| Nama Warna | Kode Hex | Penggunaan Utama | Makna / Nuansa |
| :--- | :--- | :--- | :--- |
| **Alabaster Mist** | `#F4F4F6` | *Background* utama halaman | Kesucian, ruang bernapas, terang |
| **Silver Silk** | `#D1D5DB` | *Card background*, garis pembatas halus (*borders*) | Kelembutan kain sutra, keanggunan |
| **Warm Pewter** | `#8E9299` | Teks sekunder, ikon, aksen elemen | Ketenangan, netralitas, keseimbangan |
| **Deep Slate** | `#374151` | Bagian *banner* promosi, *footer* | Kedalaman, kekuatan karakter |
| **Obsidian Charcoal**| `#18181B` | Teks utama (*Heading & Body*), Tombol CTA utama | Ketegasan, kemewahan mutlak |
| **Champagne Gold** | `#C5B396` | Aksen mikro (*badge* eksklusif, *hover state*) | Sentuhan kemuliaan yang lembut |

---

## 3. Tipografi (Typography)
Perpaduan antara huruf *Serif* klasik yang memberikan kesan agamis/ningrat dan *Sans-Serif* bersih untuk keterbacaan modern.

* **Heading (Judul Utama & Kutipan):**
  * **Font:** *Cormorant Garamond* atau *Playfair Display* (Light / Regular / Italic).
  * **Karakter:** Anggun, puitis, memiliki lekukan yang mengingatkan pada kaligrafi klasik namun dalam huruf Latin.
* **Body & Navigasi (Teks Penjelasan & Harga):**
  * **Font:** *Plus Jakarta Sans* atau *Montserrat* (Light / Medium).
  * **Karakter:** Bersih, geometris, mudah dibaca di layar ponsel, dengan jarak antar huruf (*letter-spacing*) yang sedikit renggang (`tracking-wider`) pada bagian menu untuk kesan mewah.

---

## 4. Komponen UI & Tata Letak (Layout & Components)

### 4.1. Lengkungan & Garis (Shapes & Borders)
* Menggunakan garis tipis (`1px solid #D1D5DB`) untuk memisahkan antar seksi.
* Untuk bingkai foto utama (*Hero* atau *Featured*), gunakan bentuk **Arch (Kubah Halus)** di bagian atas (`border-radius: 200px 200px 0 0`) sebagai representasi subtil dari arsitektur Islami yang megah.

### 4.2. Tombol (Buttons)
* **Primary Button:** Latar belakang `#18181B` (Obsidian Charcoal), teks `#F4F4F6` (Alabaster Mist), sudut tajam atau sedikit melengkung (`border-radius: 2px`), *uppercase*, *letter-spacing* lebar.
* **Hover Effect:** Transisi halus selama `400ms` berubah warna menjadi `#374151` dengan garis bawah tipis berwarna `#C5B396` (Champagne Gold).

### 4.3. Animasi & Interaksi (Micro-interactions)
* **Smooth Scrolling:** Pergerakan halaman yang lambat dan mulus saat digulir.
* **Fade-in Up:** Elemen teks dan gambar muncul perlahan dari bawah ke atas saat pengguna menggulir halaman, menciptakan ritme membaca yang tenang (tidak terburu-buru).
* **Image Zoom-on-Hover:** Saat kursor diarahkan ke foto produk, gambar membesar secara sangat halus (`scale(1.03)` dalam waktu `0.8s`) untuk menonjolkan detail serat kain hijab.

---

## 5. Panduan Fotografi (Photography Guidelines)
* **Pencahayaan:** *Soft-diffused lighting* (cahaya lembut seperti pagi hari yang berkabut) dengan bayangan yang artistik.
* **Pose Model:** Sopan, menunduk anggun, atau menatap dengan tenang (*serene expression*). Hindari pose yang terlalu agresif atau glamor berlebihan. Fokus pada bagaimana hijab menutup dada dengan rapi dan jatuh dengan indah.
* **Latar Belakang Foto:** Studio bertekstur semen ekspos halus, kain linen abu-abu, atau arsitektur batu alam berwarna *monochrome*.