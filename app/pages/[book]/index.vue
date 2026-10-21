<script setup lang="ts">
const route = useRoute()
const key = route.params.book as string
const book = getBook(key)
if (!book) throw createError({ statusCode: 404, statusMessage: 'Buku tidak ditemukan' })
useHead({ title: `${book.title} — Akhirnya Umroh` })

const q = ref('')
const results = ref<Awaited<ReturnType<typeof search>>>([])
let t: any
watch(q, (v) => {
  clearTimeout(t)
  t = setTimeout(async () => { results.value = v.trim().length >= 2 ? await search(v, key) : [] }, 120)
})

const open = ref<Record<string, boolean>>({})
const groups = computed(() => {
  const out: { name: string | null; chapters: typeof book.chapters }[] = []
  for (const c of book.chapters) {
    const g = c.group ?? null
    const last = out[out.length - 1]
    if (last && last.name === g) last.chapters.push(c)
    else out.push({ name: g, chapters: [c] })
  }
  return out
})
const isDoa = key === 'doa'
</script>

<template>
  <div class="page">
    <TopBar :title="book.title" :sub="book.subtitle" back="/">
      <button class="icon-btn" aria-label="Pengaturan" @click="useUi().value.settingsOpen = true"><Icon name="type" /></button>
    </TopBar>
    <div class="wrap">
      <div class="search-box" style="margin-top:14px">
        <Icon name="search" />
        <input v-model="q" type="search" :placeholder="isDoa ? 'Cari doa… (mis. thawaf, masjid, tidur)' : 'Cari topik… (mis. miqat, wudhu, cuaca)'" enterkeyhint="search">
        <button v-if="q" class="icon-btn" style="width:32px;height:32px" aria-label="Hapus" @click="q = ''"><Icon name="x" /></button>
      </div>

      <template v-if="q.trim().length >= 2">
        <div class="label">{{ results.length }} hasil</div>
        <div v-if="results.length" class="list">
          <NuxtLink v-for="r in results" :key="r.id" :to="{ path: `/${r.book}/${r.ch}`, query: { q }, hash: '#' + r.sec }">
            <span class="row-main">
              <b v-html="highlightTitle(r.title, q)" />
              <small v-html="snippet(r.text, q, 110)" />
              <small class="src">{{ r.chapter }} · hal. {{ r.page }}</small>
            </span>
          </NuxtLink>
        </div>
        <div v-else class="empty"><Icon name="search" />Tidak ditemukan. Coba kata lain.</div>
      </template>

      <template v-else>
        <template v-for="g in groups" :key="g.name || 'x'">
          <div v-if="g.name" class="label">{{ g.name }}</div>
          <div v-else class="label">Daftar isi</div>
          <div class="list toc">
            <template v-for="c in g.chapters" :key="c.slug">
              <div class="row ch">
                <NuxtLink :to="`/${key}/${c.slug}`" class="row-main">
                  <b>{{ c.title }}</b>
                  <small>{{ c.sections.length }} {{ isDoa ? 'bacaan' : 'topik' }} · hal. {{ c.page }}</small>
                </NuxtLink>
                <button v-if="c.sections.length > 1" class="icon-btn" :aria-label="'Lihat isi ' + c.title" :aria-expanded="!!open[c.slug]" @click="open[c.slug] = !open[c.slug]">
                  <Icon name="down" :style="{ transform: open[c.slug] ? 'rotate(180deg)' : '', transition: 'transform .2s' }" />
                </button>
              </div>
              <div v-if="open[c.slug]" class="subs">
                <NuxtLink v-for="s in c.sections" :key="s.id" :to="`/${key}/${c.slug}#${s.id}`">
                  <span>{{ s.title }}</span><span class="pg">{{ s.page }}</span>
                </NuxtLink>
              </div>
            </template>
          </div>
        </template>
      </template>
    </div>
  </div>
</template>

<style scoped>
.toc .row.ch { padding: 6px 6px 6px 16px; }
.toc .row.ch .row-main { padding: 8px 0; }
.subs { background: var(--surface-2); border-top: 1px solid var(--line); padding: 4px 0; }
.subs a { display: flex; gap: 12px; justify-content: space-between; padding: 10px 16px 10px 28px; font-size: 15px; color: var(--ink-2); line-height: 1.4; }
.subs a:active { background: var(--line); }
.src { color: var(--gold-d) !important; font-weight: 600; font-size: 12px !important; }
</style>
