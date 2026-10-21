<script setup lang="ts">
useHead({ title: 'Cari — Akhirnya Umroh' })
const route = useRoute()
const router = useRouter()
const q = ref('')
const book = ref<string>('')
const results = ref<Awaited<ReturnType<typeof search>>>([])
const loading = ref(false)
const input = ref<HTMLInputElement>()

async function run() {
  router.replace({ query: { ...(q.value ? { q: q.value } : {}), ...(book.value ? { b: book.value } : {}) } })
  if (q.value.trim().length < 2) { results.value = []; return }
  loading.value = true
  results.value = await search(q.value, book.value || undefined)
  loading.value = false
}
let t: any
watch([q, book], () => { clearTimeout(t); t = setTimeout(run, 150) })
onMounted(() => {
  q.value = (route.query.q as string) || ''
  book.value = (route.query.b as string) || ''
  if (q.value) run()
  else input.value?.focus()
  getIndex()
})
const suggestions = ['niat umrah', 'thawaf', "sa'i", 'masuk masjid', 'raudah', 'miqat', 'larangan ihram', 'zamzam', 'tahallul', 'wudhu', 'jamak qashar', 'cuaca']
</script>

<template>
  <div class="page">
    <TopBar title="Cari" sub="Di Buku Pegangan & Buku Doa" />
    <div class="wrap">
      <form class="search-box" style="margin-top:14px" role="search" @submit.prevent="run(); input?.blur()">
        <Icon name="search" />
        <input ref="input" v-model="q" type="search" placeholder="Ketik kata kunci…" enterkeyhint="search" aria-label="Kata kunci">
        <button v-if="q" type="button" class="icon-btn" style="width:32px;height:32px" aria-label="Hapus" @click="q = ''; input?.focus()"><Icon name="x" /></button>
      </form>
      <div class="chips" style="margin-top:12px">
        <button class="chip" :class="{ on: !book }" @click="book = ''">Semua</button>
        <button class="chip" :class="{ on: book === 'doa' }" @click="book = 'doa'">Buku Doa</button>
        <button class="chip" :class="{ on: book === 'pegangan' }" @click="book = 'pegangan'">Buku Pegangan</button>
      </div>

      <template v-if="q.trim().length >= 2">
        <div class="label">{{ loading ? 'Mencari…' : `${results.length} hasil` }}</div>
        <div v-if="results.length" class="list">
          <NuxtLink v-for="r in results" :key="r.id" :to="{ path: `/${r.book}/${r.ch}`, query: { q }, hash: '#' + r.sec }">
            <span class="row-main">
              <span class="tag" :class="r.book">{{ r.book === 'doa' ? 'Doa' : 'Pegangan' }}</span>
              <b v-html="highlightTitle(r.title, q)" />
              <small v-html="snippet(r.text, q, 120)" />
              <small class="src">{{ r.chapter }} · hal. {{ r.page }}</small>
            </span>
          </NuxtLink>
        </div>
        <div v-else-if="!loading" class="empty"><Icon name="search" />Tidak ada hasil untuk “{{ q }}”.<br>Coba ejaan lain, mis. “umrah”/“umroh” sudah otomatis disamakan.</div>
      </template>
      <template v-else>
        <div class="label">Coba cari</div>
        <div class="chips" style="flex-wrap:wrap">
          <button v-for="s in suggestions" :key="s" class="chip" @click="q = s">{{ s }}</button>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.tag { display: inline-block; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: .06em; padding: 2px 8px; border-radius: 6px; margin-bottom: 4px; }
.tag.doa { background: var(--gold-soft); color: var(--gold-d); }
.tag.pegangan { background: var(--green-soft); color: var(--green); }
.src { color: var(--ink-3) !important; font-size: 12px !important; margin-top: 4px !important; }
</style>
