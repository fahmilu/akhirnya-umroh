# Akhirnya Umroh — Buku Pegangan & Buku Doa (mobile web)

Aplikasi Nuxt 4 statis (bisa dipasang sebagai PWA & dibuka offline) dari dua PDF jejak imani:
**Buku Pegangan Manasik Haji & Umrah** dan **Buku Doa**.

## Jalankan

```bash
npm install
npm run dev        # http://localhost:3000
npm run generate   # hasil statis di .output/public -> upload ke Netlify/Vercel/Cloudflare Pages/Nginx
```

## Struktur

```
app/
  data/books.json          # daftar isi (bab & bagian)
  data/search.json         # indeks pencarian (MiniSearch, dimuat saat dibutuhkan)
  data/{pegangan,doa}/*.json  # isi per bab (di-load lazy)
  pages/                   # / , /[book] , /[book]/[chapter] , /cari , /tanda
  components/BlockList.vue # render blok: paragraf, list, teks Arab, gambar, tabel, halaman
public/books/              # gambar crop teks Arab, foto, & halaman infografis (webp)
scripts/extract.py         # generator data dari PDF
```

## Cara kerja konversi PDF

- Teks latin/Indonesia diekstrak jadi HTML → bisa reflow di layar HP & bisa dicari.
- **Teks Arab dipotong sebagai gambar langsung dari PDF**, karena ekstraksi teks Arab dari font
  KFGQPC di PDF ini rusak (harakat & ligatur "Allah" berantakan). Dengan gambar, bacaan 100% sama dengan buku.
  Ketuk teks Arab untuk memperbesar.
- Halaman yang berupa infografis/tabel rumit ditampilkan sebagai gambar halaman (bisa di-zoom),
  teksnya tetap masuk ke pencarian ("Tampilkan teks halaman").

## Update dari PDF baru

```bash
pip install pymupdf pillow
mkdir -p pdf && cp "Buku Pegangan ....pdf" pdf/Buku_Pegangan.pdf && cp "Buku Doa ....pdf" pdf/Buku_Doa.pdf
npm run extract
```

Rentang halaman tiap bab diatur di `PEGANGAN` / `DOA` dalam `scripts/extract.py` (pakai nomor halaman cetak).
