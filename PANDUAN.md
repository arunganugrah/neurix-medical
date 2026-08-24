# PANDUAN — Neurix Medical (Website Bimbel)

Dibangun dengan Next.js + Firebase, mengikuti pola yang sama dengan proyek MedMind /
AM Bangunan Anda sebelumnya: murid login pakai **kode voucher**, admin login pakai
**email/password Firebase Auth**, dan semua konten (kelas, materi, video, kuis)
dikelola lewat panel `/admin`.

---

## 1. Struktur Folder

```
neurix-medical/
├── app/
│   ├── layout.js            ← Layout global + font
│   ├── globals.css          ← Tailwind + animasi (nx-page, nx-lift, dst)
│   ├── page.js               ← Landing page ("Learn. Understand. Heal.")
│   ├── login/page.js         ← Login murid (kode voucher)
│   ├── admin-login/page.js   ← Login admin (email/password)
│   ├── admin/page.js         ← Panel admin (CMS)
│   └── dashboard/page.js     ← Dashboard murid (sidebar + semua fitur)
├── lib/
│   └── firebase.js           ← Konfigurasi Firebase ← EDIT DI SINI
├── firestore.rules           ← Rules keamanan Firestore ← COPY KE FIREBASE
├── jsconfig.json              ← Alias "@/..." ke root folder
├── package.json
└── PANDUAN.md                 ← File ini
```

---

## 2. Buat Proyek & Install

```bash
cd ~/Projects
# salin folder neurix-medical yang diberikan, lalu:
cd neurix-medical
npm install
```

---

## 3. Bagian A — Menyambungkan Firebase

### A1. Buat Proyek Firebase
1. Buka https://console.firebase.google.com → **Add project** → beri nama `neurix-medical`.
2. Matikan Google Analytics (lebih simpel) → **Create project**.

### A2. Daftarkan Aplikasi Web
1. Di halaman proyek, klik ikon **`</>`** (Web).
2. Beri nama `neurix-medical-web` → **Register app**.
3. Muncul objek `firebaseConfig` berisi 6 nilai — biarkan halaman ini terbuka.

### A3. Aktifkan Authentication (untuk admin)
1. **Build > Authentication** → **Get started**.
2. Tab **Sign-in method** → aktifkan **Email/Password** → **Save**.
3. Tab **Users** → **Add user** → isi email & password admin. **Catat baik-baik.**

### A4. Aktifkan Firestore Database
1. **Build > Firestore Database** → **Create database**.
2. Lokasi: `asia-southeast1` (Jakarta/Singapura).
3. **Production mode** → **Enable**.

### A5. Pasang Security Rules
1. **Firestore Database > Rules** → hapus isi lama, tempel isi file `firestore.rules`.
2. Ganti `EMAIL_ADMIN_ANDA` dengan email admin dari A3.
3. **Publish**.

### A6. Isi Konfigurasi Firebase di Kode

Buka `lib/firebase.js`:

```javascript
const firebaseConfig = {
  apiKey:            "AIzaSy...",
  authDomain:        "neurix-medical.firebaseapp.com",
  projectId:         "neurix-medical",
  storageBucket:     "neurix-medical.appspot.com",
  messagingSenderId: "123456789",
  appId:             "1:123...:web:abc...",
};
```
Ganti 6 nilai `MASUKKAN_...` dengan nilai dari A2, lalu simpan.

> Catatan: proyek ini **tidak** memakai Firebase Storage. File materi (PDF) dan
> video disimpan sebagai **link** (Google Drive, YouTube tak-listed, dsb.) yang
> ditempel di form admin — sama seperti pola MedMind, supaya tetap gratis di paket Spark.

---

## 4. Bagian B — Jalankan & Isi Data Awal

### B1. Jalankan Server
```bash
npm run dev
```
Tunggu hingga muncul `✓ Ready on http://localhost:3000`.

### B2. Login Admin
- Buka `localhost:3000/admin-login`, masuk dengan email & password dari A3.
- Anda akan diarahkan ke `/admin`.

### B3. Setup Data Berurutan
1. **Tab Kategori** — tambah kategori: Kardiovaskular, Respirasi, Neurologi, Farmakologi, dst.
2. **Tab Kelas** — tambah jadwal kelas (judul, kategori, tanggal, jam, kapasitas).
3. **Tab Materi** — tambah materi (judul, kategori, link file, ukuran).
4. **Tab Video** — tambah video/rekaman (judul, kategori, link, durasi, pengajar).
5. **Tab Kuis** — buat kuis per kategori, lalu isi soal lewat **Input Massal**:
   ```
   Pada miopia, bayangan jatuh di mana?
   *Depan retina
   Tepat di retina
   Belakang retina
   # Bola mata terlalu panjang, fokus di depan retina.
   ```
   (baris `*` di depan = jawaban benar, baris `#` = pembahasan, pisahkan tiap soal dengan baris kosong)
6. **Tab Pengumuman** — tambah pengumuman yang tampil di dashboard murid.
7. **Tab Voucher** — buat kode voucher (mis. `NRX-2026-001`) + nama murid + tier member.

### B4. Login sebagai Murid
- Buka `localhost:3000/login`, masukkan kode voucher dari B3.7.
- Anda akan diarahkan ke `/dashboard` dan melihat sidebar: Dashboard, My Classes,
  Materials, Video/Recordings, Quiz & Try Out, Raport, Progress, dll.

---

## 5. Bagian C — Publikasi ke Internet (Vercel)

### C1. Upload ke GitHub
```bash
cd ~/Projects/neurix-medical
git init
git add .
git commit -m "Neurix Medical v1.0"
```
Buat repo baru di GitHub (kosong, tanpa README), lalu:
```bash
git remote add origin https://github.com/USERNAME-ANDA/neurix-medical.git
git branch -M main
git push -u origin main
```

### C2. Deploy ke Vercel
1. https://vercel.com → sign up dengan GitHub.
2. **Add New > Project** → pilih repo `neurix-medical` → **Import** → **Deploy**.
3. Anda mendapat link seperti `https://neurix-medical-xxxx.vercel.app`.

### C3. Izinkan Domain Vercel di Firebase
**Authentication > Settings > Authorized domains** → **Add domain** → masukkan domain Vercel Anda.

### C4. Update di Masa Mendatang
```bash
git add .
git commit -m "update: layout"
git push
```
Vercel otomatis deploy ulang. Menambah kelas/materi/kuis lewat `/admin` tidak perlu push — langsung tersimpan ke Firebase.

---

## 6. Struktur Data Firestore

| Koleksi | Isi | Siapa bisa tulis |
|---|---|---|
| `categories` | Kategori materi (nama, emoji) | Admin only |
| `classes` | Jadwal kelas (judul, tanggal, jam, kapasitas) | Admin only |
| `materials` | Materi belajar (judul, link file) | Admin only |
| `videos` | Video/rekaman kelas | Admin only |
| `quizzes` | Kuis & soal per kategori | Admin only |
| `announcements` | Pengumuman di dashboard | Admin only |
| `vouchers` | Kode akses murid (aktif/nonaktif, nama, tier) | Admin only, dibaca semua (untuk validasi login) |

Progress belajar murid (skor kuis, topik dikuasai) disimpan di **localStorage
browser murid** — sama seperti pola MedMind — bukan di Firestore, supaya tetap
sederhana. Jika ke depan Anda ingin progress tersinkron lintas perangkat, itu
perlu koleksi Firestore tambahan (mis. `progress/{voucherCode}`) — beri tahu
saya kapan pun Anda ingin saya bantu kembangkan bagian itu.

---

## 7. Halaman yang Masih Placeholder

Sidebar dashboard murid juga menampilkan menu **Assignments, Consultation,
Calendar, Messages, Profile, Settings** — ini sengaja saya buat sebagai
halaman "🚧 Coming Soon" karena scope awal difokuskan pada bagian yang ada di
desain (kelas, materi, video, kuis, raport, progress). Kalau Anda ingin salah
satu dikembangkan penuh, sebutkan saja fitur mana yang paling prioritas.

---

## 8. Troubleshooting

### Error: "Cannot find module firebase"
```bash
npm install
```

### Gagal login admin: "auth/invalid-credential"
Pastikan email & password sesuai dengan yang didaftarkan di Firebase Authentication (A3).

### Voucher "tidak valid" padahal sudah dibuat
- Pastikan kolom `active` bernilai `true` di Firestore (toggle "Aktifkan" di tab Voucher).
- Kode voucher case-sensitive di Firestore tapi form login otomatis meng-uppercase-kan input — pastikan Anda menyimpan kode voucher di admin juga dalam huruf besar.

### Halaman redirect ke /login terus
Pastikan `lib/firebase.js` sudah diisi config yang benar (A6).

### Konten (kelas/materi/kuis) tidak muncul di dashboard murid
Pastikan Firestore Rules sudah di-**publish** (A5) — tanpa rules yang benar, `getDocs` bisa gagal diam-diam (cek Console browser F12 untuk error permission).

---

*Dibuat untuk Neurix Medical — Website Bimbel v1.0*
