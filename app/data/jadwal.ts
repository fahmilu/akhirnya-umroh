// Sumber: "Itinerary Umrah Couple Onyx Best Deal 11 - 19 Nov 2026" &
// "Jadwal Sholat Umrah 11 - 19 November 2026 - Onyx" (jejak imani).
// Jam dalam Waktu Standar Arab (AST, GMT+3), kecuali item bertanda tz WIB (GMT+7).

export type Kind = 'sholat' | 'makan' | 'kajian' | 'perjalanan' | 'ziarah' | 'umrah' | 'bebas' | 'persiapan' | 'istirahat'

export interface Item {
  start: string // "08.00"
  end?: string // "12.00"
  endNext?: boolean // end jatuh di hari berikutnya (+1)
  kind: Kind
  title: string
  desc?: string
  note?: string // catatan penting (mis. koper)
  tentatif?: boolean
  split?: { who: string; text: string }[] // ikhwan / akhwat
  tz?: [Zone, Zone] // zona waktu [mulai, selesai]; default AST
}

export type Zone = 'WIB' | 'AST'

export interface Prayer {
  city: 'Madinah' | 'Makkah'
  subuh: string; syuruq: string; dzuhur: string; ashar: string; maghrib: string; isya: string
}

export interface Day {
  date: string // ISO yyyy-mm-dd
  n: number
  hari: string
  label: string // "Rabu, 11 Nov"
  hijri: string
  city: string
  prayers: Prayer[]
  items: Item[]
}

export const FLIGHTS = [
  { dir: 'Berangkat', date: 'Rabu, 11 Nov 2026', from: 'CGK', fromName: 'Jakarta', dep: '12.00', to: 'MED', toName: 'Madinah', arr: '18.15', no: 'SV 821' },
  { dir: 'Pulang', date: 'Kamis, 19 Nov 2026', from: 'JED', fromName: 'Jeddah', dep: '02.20', to: 'CGK', toName: 'Jakarta', arr: '16.00', no: 'SV 818' },
]

export const NOTES = [
  'Waktu makan: sarapan mulai pukul 06.00, makan siang setelah Sholat Dzuhur, dan makan malam setelah Sholat Maghrib.',
  'Akses masuk masjid akan ditutup 30 – 60 menit sebelum azan, tergantung kepadatan masjid.',
  'Itinerary ini hanya bersifat rencana perjalanan. Dalam praktiknya, ketidaksesuaian jam sangat mungkin terjadi.',
  'Hal-hal yang menjadi perjalanan di luar yang telah jejak imani rancang, biayanya menjadi tanggungan pribadi jamaah.',
  'Kondisi di Masjid Nabawi dan Masjidil Haram sangat penuh sehingga jadwal Raudhah belum tentu bisa didapatkan. jejak imani akan tetap berikhtiar untuk bisa mendapatkan jadwal Raudhah.',
  'Semua agenda perjalanan ini adalah fasilitas jejak imani. Apabila jamaah tidak ingin mengikuti agenda tersebut maka diperbolehkan.',
  'Khusus Hotel Anjum Makkah (peraturan terbaru Ministry of Tourism Saudi): check out jam 12.00 dan check in mulai jam 14.00. Check out lewat dari jam 12.00 dihitung late check out dan dikenakan biaya.',
]

const MED = (d: Omit<Prayer, 'city'>): Prayer => ({ city: 'Madinah', ...d })
const MAK = (d: Omit<Prayer, 'city'>): Prayer => ({ city: 'Makkah', ...d })
const SARWAT = 'Ust. Dr. KH. Ahmad Sarwat, Lc., M.A.'
const AINI = 'Usth. Hj. Aini Aryani, Lc.'
const RAUDHAH_NOTE = 'Tentatif — jika mendapatkan izin masuk Raudhah melalui akun Nusuk pribadi. Cek jadwal secara berkala; akan dikoordinir pembimbing agar dapat masuk bersamaan.'
const ISYA_NOTE = 'Jika waktunya memungkinkan, jamaah dapat kembali ke hotel dulu untuk makan malam, lalu kembali ke masjid untuk Sholat Isya berjamaah.'

export const DAYS: Day[] = [
  {
    date: '2026-11-11', n: 1, hari: 'Rabu', label: 'Rabu, 11 Nov', hijri: '1 Jumādá al-Akhirah 1448H', city: 'Jakarta → Madinah',
    prayers: [MED({ subuh: '05:13', syuruq: '06:34', dzuhur: '12:09', ashar: '15:16', maghrib: '17:38', isya: '19:08' })],
    items: [
      { start: '08.00', kind: 'persiapan', tz: ['WIB', 'WIB'], title: 'Kumpul di bandara', desc: 'Jamaah mulai berkumpul di Terminal 2F Soekarno-Hatta International Airport Jakarta.' },
      { start: '08.00', end: '12.00', kind: 'persiapan', tz: ['WIB', 'WIB'], title: 'Check-in, imigrasi & boarding' },
      { start: '12.00', end: '18.15', kind: 'perjalanan', tz: ['WIB', 'AST'], title: 'Terbang ke Madinah (SV 821)', desc: 'Take off dari Soekarno-Hatta menuju Prince Mohammad bin Abdulaziz International Airport Madinah.' },
      { start: '18.15', end: '19.30', kind: 'perjalanan', title: 'Tiba di Madinah', desc: 'Proses imigrasi dan bagasi di bandara Madinah.' },
      { start: '19.30', end: '20.15', kind: 'perjalanan', title: 'Perjalanan ke hotel Madinah' },
      { start: '20.15', end: '21.15', kind: 'makan', title: 'Check in hotel & makan malam' },
      { start: '21.15', end: '22.30', kind: 'sholat', title: 'Sholat Isya + jamak takhir Maghrib', desc: 'Di pelataran Masjid Nabawi.' },
      { start: '22.30', kind: 'istirahat', title: 'Kembali ke hotel, istirahat malam' },
    ],
  },
  {
    date: '2026-11-12', n: 2, hari: 'Kamis', label: 'Kamis, 12 Nov', hijri: '2 Jumādá al-Akhirah 1448H', city: 'Madinah',
    prayers: [MED({ subuh: '05:14', syuruq: '06:35', dzuhur: '12:09', ashar: '15:16', maghrib: '17:38', isya: '19:08' })],
    items: [
      { start: '04.15', end: '06.00', kind: 'sholat', title: 'Sholat Subuh berjamaah', desc: 'Di Masjid Nabawi.' },
      { start: '06.00', end: '07.00', kind: 'makan', title: 'Sarapan di hotel' },
      { start: '07.00', end: '11.00', kind: 'ziarah', title: 'City tour Madinah', desc: 'Mengunjungi Masjid Quba, Jabal Uhud – Syuhada Uhud, dan Kebun Kurma, kemudian melewati Masjid Khandaq dan Masjid Qiblatain.', note: 'Bawa radiophone' },
      { start: '11.00', end: '11.30', kind: 'persiapan', title: 'Persiapan Sholat Dzuhur', desc: 'Di Masjid Nabawi.' },
      { start: '11.30', end: '13.00', kind: 'sholat', title: 'Sholat Dzuhur', desc: 'Di Masjid Nabawi.' },
      { start: '13.00', end: '14.00', kind: 'makan', title: 'Makan siang di hotel' },
      { start: '14.00', end: '14.45', kind: 'bebas', title: 'Waktu bebas', desc: 'Istirahat / memperbanyak ibadah di Masjid Nabawi.' },
      { start: '14.45', end: '16.00', kind: 'sholat', title: 'Sholat Ashar', desc: 'Di Masjid Nabawi.' },
      { start: '16.00', end: '17.10', kind: 'kajian', title: 'Kajian keluarga (sesi couple)', desc: `“Keluarga Sakinah | Memahami Konsep Nafkah dan Kewajiban Finansial Suami-Istri” bersama ${SARWAT}` },
      { start: '17.10', end: '18.30', kind: 'sholat', title: 'Sholat Maghrib', desc: 'Di Masjid Nabawi.' },
      { start: '18.30', end: '18.45', kind: 'bebas', title: 'Zikir & amalan sunah', desc: 'Di Masjid Nabawi.', note: ISYA_NOTE },
      { start: '18.45', end: '19.45', kind: 'sholat', title: 'Sholat Isya', desc: 'Di Masjid Nabawi.' },
      { start: '19.45', end: '20.30', kind: 'makan', title: 'Makan malam di hotel' },
      {
        start: '20.30', end: '22.00', kind: 'ziarah', title: 'Ziarah Raudhah (akhwat)', tentatif: true,
        split: [
          { who: 'Akhwat', text: 'Persiapan ziarah ke Raudhah dan memperbanyak ibadah.' },
          { who: 'Ikhwan', text: 'Kembali ke hotel untuk istirahat malam.' },
        ],
        note: RAUDHAH_NOTE,
      },
      { start: '22.00', kind: 'istirahat', title: 'Akhwat kembali ke hotel, istirahat malam' },
    ],
  },
  {
    date: '2026-11-13', n: 3, hari: 'Jumat', label: 'Jumat, 13 Nov', hijri: '3 Jumādá al-Akhirah 1448H', city: 'Madinah',
    prayers: [MED({ subuh: '05:14', syuruq: '06:35', dzuhur: '12:09', ashar: '15:15', maghrib: '17:37', isya: '19:07' })],
    items: [
      { start: '03.45', end: '06.00', kind: 'sholat', title: 'Tahajud berjamaah & Sholat Subuh', desc: 'Di Masjid Nabawi.' },
      {
        start: '06.00', end: '08.00', kind: 'ziarah', title: 'Ziarah sekitar Masjid Nabawi + kajian',
        desc: `Menelusuri kisah wafatnya Nabi Muhammad ﷺ, ziarah ke Masjid Ghamamah, Masjid Abu Bakar, Masjid Ali dan Tsaqifah Bani Saidah. Dilanjutkan kajian “Cinta & Kedekatan | Privasi dan Intimasi” bersama ${SARWAT} & ${AINI} (sesi ikhwan-akhwat terpisah).`,
        note: 'Bawa radiophone',
      },
      { start: '08.00', end: '09.00', kind: 'makan', title: 'Sarapan di hotel' },
      { start: '09.00', end: '09.30', kind: 'bebas', title: 'Waktu bebas', desc: 'Istirahat / memperbanyak ibadah di Masjid Nabawi.' },
      { start: '09.30', end: '10.30', kind: 'persiapan', title: 'Persiapan Sholat Jumat', desc: 'Di Masjid Nabawi.' },
      { start: '10.30', end: '13.30', kind: 'sholat', title: 'Sholat Jumat', desc: 'Di Masjid Nabawi.' },
      { start: '13.30', end: '14.00', kind: 'makan', title: 'Makan siang di hotel' },
      { start: '14.00', end: '14.30', kind: 'persiapan', title: 'Persiapan Raudhah ikhwan & Sholat Ashar', desc: 'Di Masjid Nabawi.' },
      {
        start: '14.30', end: '16.00', kind: 'ziarah', title: 'Ziarah Raudhah (ikhwan) & Sholat Ashar', tentatif: true,
        split: [
          { who: 'Ikhwan', text: 'Ziarah ke Raudhah, memperbanyak ibadah, dan Sholat Ashar di Masjid Nabawi.' },
          { who: 'Akhwat', text: 'Sholat Ashar di Masjid Nabawi.' },
        ],
        note: RAUDHAH_NOTE,
      },
      { start: '16.00', end: '17.10', kind: 'kajian', title: 'Pemantapan manasik umrah' },
      { start: '17.10', end: '18.30', kind: 'sholat', title: 'Sholat Maghrib', desc: 'Di Masjid Nabawi.' },
      { start: '18.30', end: '18.45', kind: 'bebas', title: 'Zikir & amalan sunah', desc: 'Di Masjid Nabawi.', note: ISYA_NOTE },
      { start: '18.45', end: '19.45', kind: 'sholat', title: 'Sholat Isya', desc: 'Di Masjid Nabawi.' },
      { start: '19.45', kind: 'makan', title: 'Kembali ke hotel, makan & istirahat malam' },
    ],
  },
  {
    date: '2026-11-14', n: 4, hari: 'Sabtu', label: 'Sabtu, 14 Nov', hijri: '4 Jumādá al-Akhirah 1448H', city: 'Madinah → Makkah',
    prayers: [
      MED({ subuh: '05:15', syuruq: '06:36', dzuhur: '12:09', ashar: '15:15', maghrib: '17:37', isya: '19:07' }),
      MAK({ subuh: '05:11', syuruq: '06:30', dzuhur: '12:09', ashar: '15:18', maghrib: '17:41', isya: '19:11' }),
    ],
    items: [
      {
        start: '03.45', end: '07.00', kind: 'kajian', title: 'Tahajud, Subuh & kajian syuruq (sesi couple)',
        desc: `Tahajud berjamaah, Sholat Subuh, kajian “Konflik & Perbedaan | Ketika Pasangan Berbuat Salah: Bagaimana Sikap Yang Dibenarkan Syariat?” bersama ${SARWAT}, lalu Sholat Syuruq di Masjid Nabawi.`,
      },
      { start: '07.00', end: '11.00', kind: 'makan', title: 'Sarapan & persiapan check out', note: 'Koper diletakkan di depan kamar masing-masing pukul 07.00' },
      { start: '11.00', end: '11.30', kind: 'persiapan', title: 'Persiapan Dzuhur + jamak taqdim Ashar', note: 'Jamaah sudah mengenakan pakaian ihram' },
      { start: '11.30', end: '13.30', kind: 'sholat', title: 'Sholat Dzuhur + jamak taqdim Ashar', desc: 'Di Masjid Nabawi.' },
      { start: '13.30', end: '14.30', kind: 'makan', title: 'Makan siang di hotel' },
      { start: '14.30', end: '15.15', kind: 'perjalanan', title: 'Perjalanan ke Stasiun Madinah' },
      { start: '15.15', end: '16.30', kind: 'perjalanan', title: 'Menunggu kereta di Stasiun Madinah' },
      { start: '16.30', end: '18.45', kind: 'perjalanan', title: 'Kereta cepat Madinah → Makkah', desc: 'Haramain High Speed Railway.' },
      { start: '18.45', end: '20.00', kind: 'perjalanan', title: 'Menuju & check-in hotel Makkah' },
      { start: '20.00', end: '21.00', kind: 'makan', title: 'Makan malam di hotel' },
      { start: '21.00', end: '01.00', endNext: true, kind: 'umrah', title: 'Prosesi ibadah umrah', desc: 'Kondisional mengikuti situasi di Masjidil Haram.', note: 'Bawa radiophone' },
      { start: '01.00', kind: 'istirahat', title: 'Umrah selesai, kembali ke hotel', desc: 'Dini hari (+1). Istirahat malam.' },
    ],
  },
  {
    date: '2026-11-15', n: 5, hari: 'Ahad', label: 'Ahad, 15 Nov', hijri: '5 Jumādá al-Akhirah 1448H', city: 'Makkah',
    prayers: [MAK({ subuh: '05:12', syuruq: '06:31', dzuhur: '12:09', ashar: '15:18', maghrib: '17:40', isya: '19:10' })],
    items: [
      { start: '04.15', end: '07.00', kind: 'sholat', title: 'Sholat Subuh & Syuruq', desc: 'Di Masjidil Haram.' },
      { start: '07.00', end: '08.00', kind: 'makan', title: 'Sarapan di hotel' },
      { start: '08.00', end: '11.30', kind: 'bebas', title: 'Waktu bebas', desc: 'Istirahat / memperbanyak ibadah di Masjidil Haram.' },
      { start: '11.30', end: '13.00', kind: 'sholat', title: 'Sholat Dzuhur', desc: 'Di Masjidil Haram.' },
      { start: '13.00', end: '14.00', kind: 'makan', title: 'Makan siang di hotel' },
      { start: '14.00', end: '14.45', kind: 'bebas', title: 'Waktu bebas', desc: 'Istirahat / memperbanyak ibadah di Masjidil Haram.' },
      { start: '14.45', end: '16.15', kind: 'sholat', title: 'Sholat Ashar', desc: 'Di Masjidil Haram.' },
      { start: '16.15', end: '17.15', kind: 'kajian', title: 'Kajian Fiqih Waris 1 (ikhwan-akhwat terpisah)', desc: `“Fiqih Waris Islam 1 | Menjaga Kedamaian Keluarga dan Mencegah Sengketa Harta (part 1)” bersama ${SARWAT} & ${AINI}` },
      { start: '17.15', end: '18.15', kind: 'sholat', title: 'Sholat Maghrib', desc: 'Di Masjidil Haram.' },
      { start: '18.15', end: '18.45', kind: 'bebas', title: 'Ibadah & amalan sunah', desc: 'Di Masjidil Haram.' },
      { start: '18.45', end: '20.00', kind: 'sholat', title: 'Sholat Isya', desc: 'Di Masjidil Haram.' },
      { start: '20.00', kind: 'makan', title: 'Kembali ke hotel, makan & istirahat malam' },
    ],
  },
  {
    date: '2026-11-16', n: 6, hari: 'Senin', label: 'Senin, 16 Nov', hijri: '6 Jumādá al-Akhirah 1448H', city: 'Makkah',
    prayers: [MAK({ subuh: '05:12', syuruq: '06:32', dzuhur: '12:09', ashar: '15:18', maghrib: '17:40', isya: '19:10' })],
    items: [
      { start: '04.00', end: '06.00', kind: 'sholat', title: 'Tahajud berjamaah & Sholat Subuh', desc: 'Di Masjidil Haram.' },
      { start: '06.00', end: '07.00', kind: 'makan', title: 'Sarapan di hotel' },
      {
        start: '07.00', end: '11.50', kind: 'ziarah', title: 'City tour Makkah + kajian di Arafah',
        desc: `Melihat Jabal Tsur, Arafah, Jabal Rahmah, Muzdalifah, Mina, Jamarat, dan ambil miqat bagi yang ingin umrah kedua/badal keluarga (opsional). Kembali ke hotel melewati Jabal Nur. Kajian di Arafah: “Fiqih Waris Islam 2 | Menjaga Kedamaian Keluarga dan Mencegah Sengketa Harta (part 2)” bersama ${SARWAT} & ${AINI} (sesi ikhwan-akhwat terpisah).`,
        note: 'Bawa radiophone. Yang ingin umrah kedua: siapkan pakaian ihram.',
      },
      { start: '11.50', end: '13.00', kind: 'sholat', title: 'Sholat Dzuhur di hotel' },
      { start: '13.00', end: '13.30', kind: 'makan', title: 'Makan siang di hotel' },
      { start: '13.30', end: '17.00', kind: 'umrah', title: 'Umrah kedua (opsional)', desc: 'Kondisional mengikuti situasi Masjidil Haram.' },
      { start: '17.00', end: '18.15', kind: 'sholat', title: 'Sholat Maghrib', desc: 'Di Masjidil Haram.' },
      { start: '18.15', end: '18.45', kind: 'bebas', title: 'Zikir & amalan sunah', desc: 'Di Masjidil Haram.' },
      { start: '18.45', end: '20.00', kind: 'sholat', title: 'Sholat Isya', desc: 'Di Masjidil Haram.' },
      { start: '20.00', kind: 'makan', title: 'Kembali ke hotel, makan & istirahat malam' },
    ],
  },
  {
    date: '2026-11-17', n: 7, hari: 'Selasa', label: 'Selasa, 17 Nov', hijri: '7 Jumādá al-Akhirah 1448H', city: 'Makkah',
    prayers: [MAK({ subuh: '05:13', syuruq: '06:32', dzuhur: '12:09', ashar: '15:17', maghrib: '17:40', isya: '19:10' })],
    items: [
      { start: '03.45', end: '07.00', kind: 'sholat', title: 'Tahajud, Subuh & Syuruq', desc: 'Di Masjidil Haram.' },
      { start: '07.00', end: '08.00', kind: 'makan', title: 'Sarapan di hotel' },
      { start: '08.00', end: '11.30', kind: 'kajian', title: 'Kajian via Zoom (sesi couple)', tentatif: true, desc: `“Kewajiban Birrul Walidain | Setelah Menikah, Sampai Mana Bakti Kita Kepada Orangtua?” bersama ${SARWAT}. Tentatif dan kondisional.` },
      { start: '11.30', end: '13.00', kind: 'sholat', title: 'Sholat Dzuhur', desc: 'Di Masjidil Haram.' },
      { start: '13.00', end: '14.00', kind: 'makan', title: 'Makan siang di hotel' },
      { start: '14.00', end: '14.45', kind: 'bebas', title: 'Waktu bebas', desc: 'Istirahat / memperbanyak ibadah di Masjidil Haram.' },
      { start: '14.45', end: '16.15', kind: 'sholat', title: 'Sholat Ashar', desc: 'Di Masjidil Haram.' },
      { start: '16.15', end: '17.15', kind: 'bebas', title: 'Waktu bebas', desc: 'Istirahat / memperbanyak ibadah di Masjidil Haram.' },
      { start: '17.15', end: '18.15', kind: 'sholat', title: 'Sholat Maghrib', desc: 'Di Masjidil Haram.' },
      { start: '18.15', end: '18.45', kind: 'bebas', title: 'Ibadah & amalan sunah', desc: 'Di Masjidil Haram.' },
      { start: '18.45', end: '20.00', kind: 'sholat', title: 'Sholat Isya', desc: 'Di Masjidil Haram.' },
      { start: '20.00', kind: 'makan', title: 'Kembali ke hotel, makan & istirahat malam' },
    ],
  },
  {
    date: '2026-11-18', n: 8, hari: 'Rabu', label: 'Rabu, 18 Nov', hijri: '8 Jumādá al-Akhirah 1448H', city: 'Makkah → Jeddah',
    prayers: [MAK({ subuh: '05:13', syuruq: '06:33', dzuhur: '12:09', ashar: '15:17', maghrib: '17:40', isya: '19:10' })],
    items: [
      { start: '02.45', end: '03.00', kind: 'persiapan', title: 'Persiapan tawaf sunah terakhir' },
      { start: '03.00', end: '07.00', kind: 'umrah', title: 'Tawaf sunah terakhir, Subuh & Syuruq', desc: 'Di Masjidil Haram.' },
      { start: '07.00', end: '08.00', kind: 'makan', title: 'Sarapan di hotel' },
      { start: '08.00', end: '10.30', kind: 'persiapan', title: 'Persiapan check out hotel', note: 'Koper diletakkan di depan kamar masing-masing pukul 09.00' },
      { start: '10.30', end: '11.30', kind: 'persiapan', title: 'Persiapan Dzuhur + jamak taqdim Ashar', desc: 'Di Masjidil Haram.' },
      { start: '11.30', end: '13.30', kind: 'sholat', title: 'Sholat Dzuhur + jamak taqdim Ashar', desc: 'Di Masjidil Haram.' },
      { start: '13.30', end: '14.30', kind: 'makan', title: 'Makan siang di hotel' },
      { start: '14.30', end: '18.15', kind: 'ziarah', title: 'Museum Wahyu Makkah', desc: 'Dilanjutkan Sholat Maghrib + jamak taqdim Isya.' },
      { start: '18.15', end: '20.00', kind: 'perjalanan', title: 'Perjalanan ke Romansiah Jeddah' },
      { start: '20.00', end: '21.00', kind: 'makan', title: 'Makan malam bersama di Romansiah Jeddah' },
      { start: '21.00', end: '21.45', kind: 'perjalanan', title: 'Perjalanan ke Bandara Jeddah' },
      { start: '21.45', end: '02.20', endNext: true, kind: 'persiapan', title: 'Imigrasi, bagasi & boarding', desc: 'King Abdulaziz International Airport Jeddah.' },
    ],
  },
  {
    date: '2026-11-19', n: 9, hari: 'Kamis', label: 'Kamis, 19 Nov', hijri: '9 Jumādá al-Akhirah 1448H', city: 'Jeddah → Jakarta',
    prayers: [],
    items: [
      { start: '02.20', end: '16.00', kind: 'perjalanan', tz: ['AST', 'WIB'], title: 'Terbang ke Jakarta (SV 818)', desc: 'Take off dari King Abdulaziz International Airport Jeddah menuju Soekarno-Hatta International Airport Jakarta.' },
      { start: '16.00', kind: 'istirahat', tz: ['WIB', 'WIB'], title: 'Tiba di Jakarta', desc: 'Proses bagasi, imigrasi, dan berkumpul kembali bersama keluarga.' },
    ],
  },
]

export const KIND_LABEL: Record<Kind, string> = {
  sholat: 'Sholat', makan: 'Makan', kajian: 'Kajian', perjalanan: 'Perjalanan', ziarah: 'Ziarah',
  umrah: 'Umrah', bebas: 'Ibadah bebas', persiapan: 'Persiapan', istirahat: 'Istirahat',
}

export const PRAYER_KEYS = [
  ['subuh', 'Subuh'], ['syuruq', 'Syuruq'], ['dzuhur', 'Dzuhur'], ['ashar', 'Ashar'], ['maghrib', 'Maghrib'], ['isya', 'Isya'],
] as const
