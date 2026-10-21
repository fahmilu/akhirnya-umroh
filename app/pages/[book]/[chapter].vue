<script setup lang="ts">
const route = useRoute()
const bookKey = route.params.book as string
const slug = route.params.chapter as string
const book = getBook(bookKey)
const { data: ch } = await useAsyncData(`ch-${bookKey}-${slug}`, () => loadChapter(bookKey, slug))
if (!book || !ch.value) throw createError({ statusCode: 404, statusMessage: 'Bab tidak ditemukan', fatal: true })
useHead({ title: `${ch.value.title} — ${book.title}` })

const { prev, next } = chapterNeighbors(bookKey, slug)
const ui = useUi()
const last = useLastRead()
const { has, toggle } = useBookmarkToggle()
const mounted = ref(false)
const tocOpen = ref(false)
const current = ref(ch.value.sections[0]?.id)
const currentTitle = computed(() => ch.value!.sections.find(s => s.id === current.value)?.title)
const readerEl = ref<HTMLElement>()

function mark(sec: { id: string; title: string }) {
  toggle({ book: bookKey, ch: slug, sec: sec.id, title: sec.title, chapter: ch.value!.title })
}

let io: IntersectionObserver | undefined
onMounted(async () => {
  mounted.value = true
  const visible = new Map<string, number>()
  io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.isIntersecting) visible.set(e.target.id, e.boundingClientRect.top)
      else visible.delete(e.target.id)
    }
    const first = ch.value!.sections.find(s => visible.has(s.id))
    if (first && first.id !== current.value) current.value = first.id
  }, { rootMargin: '-64px 0px -55% 0px' })
  readerEl.value?.querySelectorAll('section.sec').forEach(el => io!.observe(el))

  const q = route.query.q as string | undefined
  const target = route.hash ? document.getElementById(decodeURIComponent(route.hash.slice(1))) : null
  if (q && readerEl.value) {
    await nextTick()
    markInElement(readerEl.value, q)
    const m = (target ?? readerEl.value).querySelector('mark')
    if (m) setTimeout(() => m.scrollIntoView({ block: 'center' }), 60)
  } else if (target) {
    setTimeout(() => target.scrollIntoView(), 30)
  }
})
onBeforeUnmount(() => io?.disconnect())

watch(current, (id) => {
  const s = ch.value!.sections.find(x => x.id === id)
  if (s) last.value = { book: bookKey, ch: slug, sec: s.id, title: s.title, chapter: ch.value!.title, at: Date.now() }
}, { immediate: false })
onMounted(() => {
  if (!route.hash) {
    const s = ch.value!.sections[0]
    if (s) last.value = { book: bookKey, ch: slug, sec: s.id, title: s.title, chapter: ch.value!.title, at: Date.now() }
  }
})

function jump(id: string) {
  tocOpen.value = false
  history.replaceState(history.state, '', `#${id}`)
  document.getElementById(id)?.scrollIntoView()
}
</script>

<template>
  <div class="page">
    <TopBar :title="ch!.title" :sub="mounted && currentTitle && currentTitle !== ch!.title ? currentTitle : book!.title" :back="`/${bookKey}`">
      <button v-if="ch!.sections.length > 1" class="icon-btn" aria-label="Isi bab" @click="tocOpen = true"><Icon name="list" /></button>
      <button class="icon-btn" aria-label="Pengaturan tampilan" @click="ui.settingsOpen = true"><Icon name="type" /></button>
    </TopBar>

    <article ref="readerEl" class="wrap reader" :class="`book-${bookKey}`">
      <section v-for="s in ch!.sections" :id="s.id" :key="s.id" class="sec">
        <div class="sec-head">
          <h2>{{ s.title }}</h2>
          <button class="icon-btn no-mark" :class="{ on: mounted && has(bookKey, slug, s.id) }" :aria-label="mounted && has(bookKey, slug, s.id) ? 'Hapus tanda' : 'Tandai'" @click="mark(s)">
            <Icon :name="mounted && has(bookKey, slug, s.id) ? 'markfill' : 'mark'" />
          </button>
        </div>
        <div class="sec-meta no-mark">
          <span>{{ ch!.title }}</span><span class="dot" /><span>hal. {{ s.page }}</span>
        </div>
        <BlockList :blocks="s.blocks" />
      </section>

      <nav class="pager">
        <NuxtLink v-if="prev" :to="`/${bookKey}/${prev.slug}`"><small>← Sebelumnya</small><b>{{ prev.title }}</b></NuxtLink>
        <NuxtLink v-if="next" class="nx" :to="`/${bookKey}/${next.slug}`"><small>Berikutnya →</small><b>{{ next.title }}</b></NuxtLink>
      </nav>
    </article>

    <Transition name="fade"><div v-if="tocOpen" class="scrim" @click="tocOpen = false" /></Transition>
    <Transition name="sheet">
      <div v-if="tocOpen" class="sheet" role="dialog" aria-label="Isi bab">
        <div class="grab" />
        <h3>{{ ch!.title }}</h3>
        <div class="list">
          <a v-for="s in ch!.sections" :key="s.id" :href="`#${s.id}`" :class="{ cur: s.id === current }" @click.prevent="jump(s.id)">
            <span class="row-main"><b>{{ s.title }}</b></span><span class="pg">{{ s.page }}</span>
          </a>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.list a.cur { background: var(--green-soft); }
.list a.cur b { color: var(--green); }
.list a { padding: 11px 16px; min-height: 46px; }
.list a b { font-weight: 600; font-size: 15px; }
</style>
