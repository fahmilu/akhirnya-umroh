<script setup lang="ts">
const ui = useUi()
const s = useSettings()
const sizes = [0.9, 1, 1.12, 1.25, 1.4]
const dl = ref<{ done: number; total: number; state: 'idle' | 'run' | 'ok' | 'err' }>({ done: 0, total: 0, state: 'idle' })

async function downloadAll() {
  if (dl.value.state === 'run') return
  dl.value = { done: 0, total: 0, state: 'run' }
  try {
    const urls = new Set<string>()
    for (const b of BOOKS) {
      for (const c of b.chapters) {
        const ch = await loadChapter(b.key, c.slug)
        ch?.sections.forEach(sec => sec.blocks.forEach((bl: any) => {
          if (bl.src) urls.add(bl.src)
          if (bl.t === 'table') bl.rows.forEach((r: any[]) => r.forEach(cell => cell.ar && urls.add(cell.ar)))
        }))
        urls.add(`/${b.key}/${c.slug}`)
      }
      urls.add(`/${b.key}`)
    }
    await getIndex()
    const list = [...urls]
    dl.value.total = list.length
    let i = 0
    const worker = async () => {
      while (i < list.length) {
        const u = list[i++]!
        try { await fetch(u, { cache: 'reload' }) } catch { /* lanjut */ }
        dl.value.done++
      }
    }
    await Promise.all(Array.from({ length: 6 }, worker))
    dl.value.state = 'ok'
  } catch {
    dl.value.state = 'err'
  }
}
</script>

<template>
  <Transition name="fade"><div v-if="ui.settingsOpen" class="scrim" @click="ui.settingsOpen = false" /></Transition>
  <Transition name="sheet">
    <div v-if="ui.settingsOpen" class="sheet" role="dialog" aria-label="Pengaturan tampilan">
      <div class="grab" />
      <h3>Tampilan</h3>
      <div class="setting">
        <div class="row-main"><b>Ukuran huruf</b><small>Teks Indonesia & latin</small></div>
        <div class="seg">
          <button v-for="z in sizes" :key="z" :class="{ on: s.fontScale === z }" :style="{ fontSize: 11 + z * 5 + 'px' }" @click="s.fontScale = z">A</button>
        </div>
      </div>
      <div class="setting">
        <div class="row-main"><b>Bacaan latin</b><small>Transliterasi di bawah teks Arab</small></div>
        <button class="switch" :class="{ on: s.showLatin }" role="switch" :aria-checked="s.showLatin" @click="s.showLatin = !s.showLatin" />
      </div>
      <div class="setting">
        <div class="row-main"><b>Terjemahan</b><small>Arti doa & dalil</small></div>
        <button class="switch" :class="{ on: s.showArti }" role="switch" :aria-checked="s.showArti" @click="s.showArti = !s.showArti" />
      </div>
      <div class="setting">
        <div class="row-main"><b>Tema</b></div>
        <div class="seg">
          <button :class="{ on: s.theme === 'auto' }" @click="s.theme = 'auto'">Otomatis</button>
          <button :class="{ on: s.theme === 'light' }" @click="s.theme = 'light'">Terang</button>
          <button :class="{ on: s.theme === 'dark' }" @click="s.theme = 'dark'">Gelap</button>
        </div>
      </div>
      <div class="setting" style="display:block">
        <div class="row-main" style="margin-bottom:10px">
          <b>Simpan untuk offline</b>
          <small>Unduh semua isi buku (± 20 MB) supaya tetap bisa dibuka tanpa sinyal di Tanah Suci.</small>
        </div>
        <button class="btn" :class="{ ghost: dl.state === 'ok' }" @click="downloadAll">
          <Icon :name="dl.state === 'ok' ? 'check' : 'download'" />
          <span v-if="dl.state === 'run'">Mengunduh… {{ dl.done }}/{{ dl.total }}</span>
          <span v-else-if="dl.state === 'ok'">Tersimpan — unduh ulang</span>
          <span v-else-if="dl.state === 'err'">Gagal, coba lagi</span>
          <span v-else>Unduh semua</span>
        </button>
        <div v-if="dl.state === 'run'" class="progress"><div :style="{ width: (dl.total ? dl.done / dl.total * 100 : 0) + '%' }" /></div>
      </div>
    </div>
  </Transition>
</template>
