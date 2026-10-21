<script setup lang="ts">
import type { BookMeta } from '~/composables/useBooks'
useHead({ title: 'Akhirnya Umroh — Pegangan & Doa' })
const last = useLastRead()
const marks = useBookmarks()
const q = ref('')
const router = useRouter()
function go() { router.push({ path: '/cari', query: q.value.trim() ? { q: q.value.trim() } : {} }) }

const quickDoa = [
  [/^Niat Umrah$/i, 'Niat Umrah'],
  [/Talbiyah/i, 'Talbiyah'],
  [/Doa Melihat Ka/i, 'Melihat Ka\'bah'],
  [/Thawaf Putaran 1/i, 'Doa Thawaf'],
  [/Memulai Sa/i, 'Doa Sa\'i'],
  [/Menggunting Rambut \(Tahallul/i, 'Tahallul'],
  [/Masuk Masjid Nabawi/i, 'Masuk Nabawi'],
  [/Zam-Zam/i, 'Minum Zamzam'],
  [/Memulai Perjalanan/i, 'Mulai Perjalanan'],
].map(([re, label]) => ({ label, s: findSection('doa', re as RegExp) })).filter(x => x.s)

const quickPeg = [
  [/Prosesi umrah/i, 'Prosesi Umrah'],
  [/Larangan-larangan/i, 'Larangan Ihram'],
  [/Mengambil miqat/i, 'Miqat'],
  [/Thawaf baitullah/i, 'Thawaf'],
  [/Raudah/i, 'Raudah'],
  [/Bahasa Arab/i, 'Bahasa Arab'],
  [/perlengkapan/i, 'Perlengkapan'],
  [/Informasi cuaca/i, 'Cuaca'],
].map(([re, label]) => ({ label, s: findSection('pegangan', re as RegExp) })).filter(x => x.s)

const link = (s: { book: string; ch: string; sec: string }) => `/${s.book}/${s.ch}#${s.sec}`
const peg = getBook('pegangan')!
const doa = getBook('doa')!
const count = (b: BookMeta) => b.chapters.reduce((n, c) => n + c.sections.length, 0)
const mounted = ref(false)
onMounted(() => (mounted.value = true))
</script>

<template>
  <div class="page home">
    <section class="hero">
      <div class="wrap">
        <div class="brand">
          <span class="logo"><Icon name="kaaba" /></span>
          <span>Akhirnya Umroh</span>
          <button class="icon-btn set" aria-label="Pengaturan" @click="useUi().value.settingsOpen = true"><Icon name="type" /></button>
        </div>
        <h1>Labbaik Allahumma ‘Umratan</h1>
        <p class="ar-hello" lang="ar" dir="rtl">لَبَّيْكَ اللّٰهُمَّ عُمْرَةً</p>
        <form class="search-box" role="search" @submit.prevent="go">
          <Icon name="search" />
          <input v-model="q" type="search" placeholder="Cari doa, manasik, tempat…" enterkeyhint="search" aria-label="Cari">
        </form>
      </div>
    </section>

    <div class="wrap">
      <NuxtLink v-if="mounted && last" :to="link(last)" class="card resume">
        <span class="ri"><Icon name="clock" /></span>
        <span class="row-main">
          <small>Lanjutkan membaca</small>
          <b>{{ last.title }}</b>
          <small>{{ last.book === 'doa' ? 'Buku Doa' : 'Buku Pegangan' }} · {{ last.chapter }}</small>
        </span>
        <Icon name="chev" class="chev" />
      </NuxtLink>

      <div class="books">
        <NuxtLink to="/pegangan" class="bookcard peg">
          <span class="bk-ic"><Icon name="book" /></span>
          <b>Buku Pegangan</b>
          <small>Manasik haji & umrah, fiqih, tempat ziarah, tips</small>
          <span class="meta">{{ peg.chapters.length }} bab · {{ count(peg) }} topik</span>
        </NuxtLink>
        <NuxtLink to="/doa" class="bookcard doa">
          <span class="bk-ic"><Icon name="hands" /></span>
          <b>Buku Doa</b>
          <small>Doa perjalanan, umrah, haji, dzikir & sehari-hari</small>
          <span class="meta">{{ doa.chapters.length }} bab · {{ count(doa) }} doa</span>
        </NuxtLink>
      </div>

      <div class="label">Doa saat umrah</div>
      <div class="chips wrapchips">
        <NuxtLink v-for="x in quickDoa" :key="x.label" class="chip" :to="link(x.s!)">{{ x.label }}</NuxtLink>
      </div>

      <div class="label">Panduan cepat</div>
      <div class="chips wrapchips">
        <NuxtLink v-for="x in quickPeg" :key="x.label" class="chip" :to="link(x.s!)">{{ x.label }}</NuxtLink>
      </div>

      <template v-if="mounted && marks.length">
        <div class="label">Ditandai</div>
        <div class="list">
          <NuxtLink v-for="m in marks.slice(0, 4)" :key="m.book + m.ch + m.sec" :to="link(m)">
            <span class="row-main"><b>{{ m.title }}</b><small>{{ m.chapter }}</small></span>
            <Icon name="chev" class="chev" />
          </NuxtLink>
          <NuxtLink v-if="marks.length > 4" to="/tanda"><span class="row-main"><small>Lihat semua ({{ marks.length }})</small></span></NuxtLink>
        </div>
      </template>

      <p class="foot">Isi diambil dari Buku Pegangan Manasik Haji & Umrah dan Buku Doa jejak imani (cetakan Maret 2026). Teks Arab ditampilkan persis seperti di buku.</p>
    </div>
  </div>
</template>

<style scoped>
.hero {
  background: radial-gradient(120% 90% at 100% 0%, #1d7a68 0%, transparent 60%), linear-gradient(160deg, #0e4f45, #0a3a33);
  color: #fff; padding: calc(env(safe-area-inset-top, 0px) + 10px) 0 28px; border-radius: 0 0 28px 28px;
  position: relative; overflow: hidden;
}
.hero::after {
  content: ''; position: absolute; right: -60px; top: -40px; width: 240px; height: 240px; border-radius: 50%;
  border: 1px solid rgb(201 162 39 / 35%); box-shadow: 0 0 0 26px rgb(201 162 39 / 6%), 0 0 0 54px rgb(201 162 39 / 4%);
  pointer-events: none;
}
:root[data-theme='dark'] .hero { background: linear-gradient(160deg, #103a33, #0b1714); }
.brand { display: flex; align-items: center; gap: 10px; font-weight: 800; height: 52px; position: relative; z-index: 1; }
.logo { width: 34px; height: 34px; border-radius: 10px; background: var(--gold); color: #0e4f45; display: grid; place-items: center; }
.logo .icon { width: 20px; height: 20px; }
.set { margin-left: auto; color: #fff; }
h1 { margin: 18px 0 2px; font-size: 26px; line-height: 1.2; letter-spacing: -.01em; position: relative; z-index: 1; }
.ar-hello { margin: 0 0 18px; font-size: 22px; color: #f0d77f; font-family: 'Noto Naskh Arabic', 'Geeza Pro', 'Traditional Arabic', serif; text-align: left; position: relative; z-index: 1; }
.hero .search-box { position: relative; z-index: 1; border: 0; color: var(--ink); }
.resume { display: flex; align-items: center; gap: 12px; padding: 14px 16px; margin-top: 16px; }
.resume .ri { width: 40px; height: 40px; border-radius: 12px; background: var(--gold-soft); color: var(--gold-d); display: grid; place-items: center; flex: none; }
.resume .row-main small:first-child { font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: .06em; color: var(--gold-d); margin: 0; }
.books { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 16px; }
.bookcard { display: flex; flex-direction: column; padding: 16px; border-radius: 20px; min-height: 196px; color: #fff; position: relative; overflow: hidden; box-shadow: var(--shadow); }
.bookcard.peg { background: linear-gradient(160deg, #16695b, #0e4f45); }
.bookcard.doa { background: linear-gradient(160deg, #b8921f, #8a6c10); }
.bookcard::after { content: ''; position: absolute; right: -30px; bottom: -30px; width: 110px; height: 110px; border-radius: 50%; border: 18px solid rgb(255 255 255 / 8%); }
.bk-ic { width: 44px; height: 44px; border-radius: 14px; background: rgb(255 255 255 / 16%); display: grid; place-items: center; margin-bottom: auto; }
.bk-ic .icon { width: 24px; height: 24px; }
.bookcard b { font-size: 18px; line-height: 1.2; margin-top: 14px; }
.bookcard small { font-size: 12.5px; line-height: 1.4; opacity: .88; margin-top: 4px; }
.bookcard .meta { font-size: 11px; font-weight: 700; margin-top: 10px; opacity: .8; }
.wrapchips { flex-wrap: wrap; overflow: visible; }
.foot { font-size: 12px; color: var(--ink-3); text-align: center; margin: 32px 12px 0; line-height: 1.5; }
</style>
