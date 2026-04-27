# Aplikasi Pengingat Tugas

Aplikasi web sederhana untuk mencatat tugas dan mengatur pengingat berbasis browser.

## Fitur

- Tambah tugas dengan judul, deskripsi, tanggal, dan waktu pengingat
- Simpan data secara lokal menggunakan `localStorage`
- Notifikasi browser saat waktu pengingat tiba
- Tandai tugas sebagai selesai atau hapus tugas
- Tampilan responsif untuk desktop dan mobile

## Cara Menjalankan

1. Buka file `index.html` di browser.
2. Klik tombol **Aktifkan Notifikasi** agar pengingat bisa muncul sebagai notifikasi browser.
3. Tambahkan tugas baru dari formulir.

## Catatan

- Jika browser menolak notifikasi, aplikasi akan menampilkan pengingat menggunakan dialog `alert`.
- Data tersimpan di browser yang sama, jadi tidak otomatis sinkron ke perangkat lain.
