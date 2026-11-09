<script setup lang="ts">
import { DAYS, FLIGHTS, NOTES, KIND_LABEL, PRAYER_KEYS, type Day, type Item, type Prayer } from '~/data/jadwal'

useHead({ title: 'Jadwal Umrah — Akhirnya Umroh' })

const route = useRoute()
const router = useRouter()
type Tab = 'itinerary' | 'sholat' | 'info'
const tabs: { key: Tab; label: string }[] = [
  { key: 'itinerary', label: 'Itinerary' },
  { key: 'sholat', label: 'Jadwal Sholat' },
  { key: 'info', label: 'Info' },
]
const tab = ref<Tab>((['itinerary', 'sholat', 'info'] as Tab[]).includes(route.query.tab as Tab) ? (route.query.tab as Tab) : 'itinerary')
const dayN = ref(Math.min(9, Math.max(1, Number(route.query.hari) || 1)))
const day = computed(() => DAYS[dayN.value - 1]!)

watch([tab, dayN], () => {
  const query: Record<string, string> = {}
  if (tab.value !== 'itinerary') query.tab = tab.value
  if (dayN.value !== 1) query.hari = String(dayN.value)
  router.replace({ query })
})

// ---------- waktu sekarang (hanya di client) ----------
const OFFSET = { AST: 3, WIB: 7 } as const
const now = ref<number | null>(null) // epoch ms
let timer: any
onMounted(() => {
  now.value = Date.now()
  timer = setInterval(() => (now.value = Date.now()), 30_000)
  // Saat perjalanan berlangsung & belum ada pilihan hari, buka hari ini
  if (!route.query.hari && todayN.value) dayN.value = todayN.value
  nextTick(scrollToNow)
})
onBeforeUnmount(() => clearInterval(timer))

const toMs = (date: string, hhmm: string, zone: keyof typeof OFFSET, addDay = false) => {
  const [y, m, d] = date.split('-').map(Number)
  const [h, mi] = hhmm.split(/[.:]/).map(Number)
  return Date.UTC(y!, m! - 1, d! + (addDay ? 1 : 0), h! - OFFSET[zone], mi!)
}
const astDate = computed(() => (now.value ? new Date(now.value + 3 * 3600_000).toISOString().slice(0, 10) : null))
const todayN = computed(() => DAYS.find(d => d.date === astDate.value)?.n ?? null)

function range(d: Day, i: number) {
  const it = d.items[i]!
  const [z1, z2] = it.tz ?? ['AST', 'AST']
  // jam 00.00–02.59 di akhir hari = dini hari berikutnya (mis. "01.00 (+1)")
  const lateStart = i > 0 && Number(it.start.slice(0, 2)) < 3 && Number(d.items[0]!.start.slice(0, 2)) >= 3
  const s = toMs(d.date, it.start, z1, lateStart)
  let e: number
  if (it.end) e = toMs(d.date, it.end, z2, it.endNext || lateStart)
  else {
    const nx = d.items[i + 1]
    e = nx ? Math.max(s, range(d, i + 1).s) : s + 60 * 60_000
  }
  return { s, e }
}
const nowIndex = computed(() => {
  if (!now.value) return -1
  const d = day.value
  for (let i = 0; i < d.items.length; i++) {
    const { s, e } = range(d, i)
    if (now.value >= s && now.value < Math.max(e, s + 60_000)) return i
  }
  return -1
})
function scrollToNow() {
  if (tab.value !== 'itinerary' || nowIndex.value < 0) return
  document.getElementById(`it-${nowIndex.value}`)?.scrollIntoView({ block: 'center', behavior: 'smooth' })
}

// sholat berikutnya (untuk hari ini)
function nextPrayer(d: Day, p: Prayer) {
  if (!now.value || d.n !== todayN.value) return null
  for (const [k] of PRAYER_KEYS) {
    if (k === 'syuruq') continue
    if (toMs(d.date, p[k], 'AST') > now.value) return k
  }
  return null
}
const countdown = (d: Day, p: Prayer, k: string) => {
  if (!now.value) return ''
  const m = Math.round((toMs(d.date, p[k as keyof Prayer] as string, 'AST') - now.value) / 60_000)
  return m >= 60 ? `${Math.floor(m / 60)} j ${m % 60} m lagi` : `${m} menit lagi`
}
const prayerName = (k: string) => PRAYER_KEYS.find(x => x[0] === k)![1]
const fmtTime = (t: string) => t.replace(':', '.')

const sholatGroups = computed(() => {
  const out: { city: string; rows: { day: Day; p: Prayer }[] }[] = []
  for (const city of ['Madinah', 'Makkah'] as const) {
    out.push({ city, rows: DAYS.flatMap(d => d.prayers.filter(p => p.city === city).map(p => ({ day: d, p }))) })
  }
  return out
})
const longDate = (d: Day) => `${d.hari}, ${Number(d.date.slice(8))} November 2026`

const chipsEl = ref<HTMLElement>()
watch(dayN, async () => {
  await nextTick()
  chipsEl.value?.querySelector('.on')?.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' })
  window.scrollTo({ top: 0 })
})
const tzLabel = (it: Item) => (it.tz && (it.tz[0] === 'WIB' || it.tz[1] === 'WIB') ? (it.tz[0] === it.tz[1] ? 'WIB' : `${it.tz[0]} → ${it.tz[1]}`) : '')
</script>

<template>
  <div class="page jadwal">
    <TopBar title="Jadwal Umrah" sub="11 – 19 November 2026 · Onyx & Best Deal" />

    <div class="wrap">
      <div class="seg tabs" role="tablist">
        <button v-for="t in tabs" :key="t.key" role="tab" :aria-selected="tab === t.key" :class="{ on: tab === t.key }" @click="tab = t.key">{{ t.label }}</button>
      </div>

      <!-- ================= ITINERARY ================= -->
      <template v-if="tab === 'itinerary'">
        <div ref="chipsEl" class="days chips">
          <button v-for="d in DAYS" :key="d.n" class="daychip" :class="{ on: d.n === dayN, today: d.n === todayN }" @click="dayN = d.n">
            <small>Hari {{ d.n }}</small>
            <b>{{ Number(d.date.slice(8)) }}</b>
            <small>{{ d.hari.slice(0, 3) }}</small>
          </button>
        </div>

        <section class="card dayhead">
          <div class="dh-top">
            <span class="badge">Hari ke-{{ day.n }}</span>
            <span v-if="day.n === todayN" class="badge now">Hari ini</span>
          </div>
          <h2>{{ longDate(day) }}</h2>
          <p class="hijri">{{ day.hijri }}</p>
          <p class="city"><Icon name="kaaba" /> {{ day.city }}</p>

          <div v-for="p in day.prayers" :key="p.city" class="pstrip">
            <div class="ps-head">
              <span>Waktu sholat {{ p.city }}</span>
              <span v-if="nextPrayer(day, p)" class="next">{{ prayerName(nextPrayer(day, p)!) }} · {{ countdown(day, p, nextPrayer(day, p)!) }}</span>
            </div>
            <div class="ps-grid">
              <div v-for="[k, n] in PRAYER_KEYS" :key="k" :class="{ next: nextPrayer(day, p) === k, dim: k === 'syuruq' }">
                <small>{{ n }}</small>
                <b>{{ fmtTime(p[k]) }}</b>
              </div>
            </div>
          </div>
          <p v-if="!day.prayers.length" class="noprayer">Hari kepulangan — dalam perjalanan pesawat.</p>
        </section>

        <ol class="timeline">
          <li v-for="(it, i) in day.items" :id="`it-${i}`" :key="i" :class="['k-' + it.kind, { live: i === nowIndex }]">
            <div class="tm">
              <b>{{ it.start }}</b>
              <small v-if="it.end">{{ it.end }}<template v-if="it.endNext"> (+1)</template></small>
              <small v-if="tzLabel(it)" class="tz">{{ tzLabel(it) }}</small>
            </div>
            <div class="rail"><span class="dot" /></div>
            <div class="body">
              <div class="tags">
                <span class="kind">{{ KIND_LABEL[it.kind] }}</span>
                <span v-if="it.tentatif" class="tent">Tentatif</span>
                <span v-if="i === nowIndex" class="livetag">Sedang berlangsung</span>
              </div>
              <b class="title">{{ it.title }}</b>
              <p v-if="it.desc" class="desc">{{ it.desc }}</p>
              <div v-if="it.split" class="split">
                <p v-for="s in it.split" :key="s.who"><b>{{ s.who }}:</b> {{ s.text }}</p>
              </div>
              <p v-if="it.note" class="note">{{ it.note }}</p>
            </div>
          </li>
        </ol>

        <div class="pager">
          <button v-if="dayN > 1" @click="dayN--"><small>‹ Sebelumnya</small><b>Hari {{ dayN - 1 }} · {{ DAYS[dayN - 2]!.label }}</b></button>
          <button v-if="dayN < 9" class="nx" @click="dayN++"><small>Berikutnya ›</small><b>Hari {{ dayN + 1 }} · {{ DAYS[dayN]!.label }}</b></button>
        </div>
        <p class="foot">Jam dalam Waktu Arab Saudi (AST, GMT+3) kecuali yang bertanda WIB. Itinerary bersifat rencana; jam bisa berubah di lapangan.</p>
      </template>

      <!-- ================= SHOLAT ================= -->
      <template v-else-if="tab === 'sholat'">
        <p class="intro">Waktu Standar Arab (AST, GMT+3). Akses masuk masjid bisa ditutup 30 – 60 menit sebelum azan.</p>
        <template v-for="g in sholatGroups" :key="g.city">
          <div class="label">Waktu sholat {{ g.city }}</div>
          <div class="plist">
            <article v-for="r in g.rows" :key="r.day.date" class="card prow" :class="{ today: r.day.n === todayN }">
              <div class="pr-head">
                <div>
                  <b>{{ longDate(r.day) }}</b>
                  <small>{{ r.day.hijri }}</small>
                </div>
                <span v-if="r.day.n === todayN" class="badge now">Hari ini</span>
              </div>
              <div class="ps-grid">
                <div v-for="[k, n] in PRAYER_KEYS" :key="k" :class="{ next: nextPrayer(r.day, r.p) === k, dim: k === 'syuruq' }">
                  <small>{{ n }}</small>
                  <b>{{ fmtTime(r.p[k]) }}</b>
                </div>
              </div>
            </article>
          </div>
        </template>
        <p class="foot">Sumber: dirarab.net (Madinah & Makkah, November 2026), sesuai jadwal dari jejak imani.</p>
      </template>

      <!-- ================= INFO ================= -->
      <template v-else>
        <div class="label">Penerbangan · Saudia Airlines</div>
        <div class="flights">
          <article v-for="f in FLIGHTS" :key="f.no" class="card flight">
            <div class="fl-top"><span class="badge">{{ f.dir }}</span><span class="fno">{{ f.no }}</span></div>
            <small class="fdate">{{ f.date }}</small>
            <div class="route">
              <div><b>{{ f.from }}</b><span>{{ f.dep }}</span><small>{{ f.fromName }}</small></div>
              <Icon name="arrow" />
              <div class="r"><b>{{ f.to }}</b><span>{{ f.arr }}</span><small>{{ f.toName }}</small></div>
            </div>
          </article>
        </div>
        <p class="intro">Jam penerbangan dalam waktu lokal masing-masing bandara.</p>

        <div class="label">Rute</div>
        <div class="card routecard">
          <div v-for="(c, i) in ['Jakarta', 'Madinah', 'Makkah', 'Jeddah', 'Jakarta']" :key="i" class="stop">
            <span class="dot" /><b>{{ c }}</b>
            <small>{{ ['11 Nov', '11 – 14 Nov', '14 – 18 Nov', '18 Nov', '19 Nov'][i] }}</small>
          </div>
        </div>

        <div class="label">Catatan penting</div>
        <ol class="card notes">
          <li v-for="n in NOTES" :key="n">{{ n }}</li>
        </ol>
        <p class="foot">Semoga Allah ﷻ memudahkan semua niat mulia kita. Aamiin.</p>
      </template>
    </div>
  </div>
</template>

<style scoped>
.tabs { display: flex; width: 100%; margin-top: 14px; }
.tabs button { flex: 1; padding: 9px 4px; font-size: 14px; white-space: nowrap; }

.days { margin: 14px -16px 0; padding: 2px 16px 6px; gap: 8px; }
.daychip {
  flex: none; width: 58px; padding: 8px 0; border-radius: 14px; background: var(--surface); border: 1px solid var(--line);
  display: flex; flex-direction: column; align-items: center; line-height: 1.15; color: var(--ink-2);
}
.daychip b { font-size: 20px; color: var(--ink); margin: 2px 0; }
.daychip small { font-size: 11px; font-weight: 700; }
.daychip.today { border-color: var(--gold); }
.daychip.on { background: var(--green); border-color: var(--green); color: rgb(255 255 255 / 85%); }
.daychip.on b { color: #fff; }
:root[data-theme='dark'] .daychip.on, :root[data-theme='dark'] .daychip.on b { color: #06221c; }

.dayhead { padding: 16px; margin-top: 12px; }
.dh-top { display: flex; gap: 6px; }
.badge { font-size: 11px; font-weight: 800; letter-spacing: .04em; text-transform: uppercase; padding: 3px 9px; border-radius: 999px; background: var(--green-soft); color: var(--green); }
.badge.now { background: var(--gold-soft); color: var(--gold-d); }
.dayhead h2 { margin: 10px 0 0; font-size: 21px; line-height: 1.25; }
.hijri { margin: 2px 0 0; font-size: 13px; font-style: italic; color: var(--ink-3); }
.city { margin: 8px 0 0; display: flex; align-items: center; gap: 6px; font-weight: 700; color: var(--ink-2); font-size: 14px; }
.city .icon { width: 18px; height: 18px; color: var(--gold-d); }
.noprayer { margin: 14px 0 0; font-size: 13px; color: var(--ink-3); }

.pstrip { margin-top: 14px; padding-top: 12px; border-top: 1px solid var(--line); }
.ps-head { display: flex; justify-content: space-between; gap: 8px; font-size: 12px; font-weight: 800; letter-spacing: .04em; text-transform: uppercase; color: var(--ink-3); margin-bottom: 8px; }
.ps-head .next { color: var(--gold-d); text-transform: none; letter-spacing: 0; }
.ps-grid { display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 4px; }
.ps-grid > div { text-align: center; padding: 7px 0; border-radius: 10px; background: var(--surface-2); border: 1px solid var(--line); }
.ps-grid small { display: block; font-size: clamp(9.5px, 2.8vw, 11px); font-weight: 700; color: var(--ink-3); line-height: 1.2; }
.ps-grid b { display: block; font-size: clamp(13px, 3.9vw, 15px); font-variant-numeric: tabular-nums; line-height: 1.3; }
.ps-grid .dim b { color: var(--ink-3); font-weight: 600; }
.ps-grid .next { background: var(--green); border-color: var(--green); }
.ps-grid .next small, .ps-grid .next b { color: #fff; }
:root[data-theme='dark'] .ps-grid .next small, :root[data-theme='dark'] .ps-grid .next b { color: #06221c; }

/* timeline */
.timeline { list-style: none; margin: 18px 0 0; padding: 0; }
.timeline li { display: grid; grid-template-columns: 52px 18px 1fr; scroll-margin-top: 80px; }
.tm { text-align: right; padding-top: 12px; font-variant-numeric: tabular-nums; }
.tm b { display: block; font-size: 15px; line-height: 1.2; }
.tm small { display: block; font-size: 12px; color: var(--ink-3); line-height: 1.3; }
.tm .tz { font-size: 10px; font-weight: 800; color: var(--gold-d); margin-top: 2px; }
.rail { position: relative; }
.rail::before { content: ''; position: absolute; left: 50%; top: 0; bottom: 0; width: 2px; margin-left: -1px; background: var(--line); }
li:first-child .rail::before { top: 18px; }
li:last-child .rail::before { bottom: auto; height: 18px; }
.dot { position: absolute; left: 50%; top: 16px; width: 10px; height: 10px; margin-left: -5px; border-radius: 50%; background: var(--c); box-shadow: 0 0 0 3px var(--bg); }
.body { padding: 10px 0 14px 6px; min-width: 0; }
.tags { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 2px; }
.kind { font-size: 11px; font-weight: 800; letter-spacing: .05em; text-transform: uppercase; color: var(--c); }
.tent, .livetag { font-size: 10.5px; font-weight: 800; padding: 1px 7px; border-radius: 999px; }
.tent { background: var(--surface-2); border: 1px solid var(--line); color: var(--ink-3); }
.livetag { background: var(--gold); color: #3a2e05; }
.title { display: block; font-size: calc(16px * var(--fs)); line-height: 1.35; }
.desc { margin: 4px 0 0; font-size: calc(14px * var(--fs)); color: var(--ink-2); line-height: 1.5; }
.split { margin-top: 6px; display: grid; gap: 4px; }
.split p { margin: 0; font-size: calc(14px * var(--fs)); line-height: 1.5; padding: 6px 10px; border-radius: 10px; background: var(--surface); border: 1px solid var(--line); color: var(--ink-2); }
.split b { color: var(--ink); }
.note { margin: 8px 0 0; font-size: calc(13px * var(--fs)); line-height: 1.45; padding: 7px 10px; border-radius: 10px; background: var(--gold-soft); color: var(--ink); border-left: 3px solid var(--gold); }
li.live .body { background: var(--surface); border: 1px solid var(--gold); border-radius: 14px; padding: 10px 12px 12px; margin: 4px 0 8px 6px; box-shadow: var(--shadow); }
li.live .dot { width: 14px; height: 14px; margin-left: -7px; top: 14px; box-shadow: 0 0 0 4px color-mix(in srgb, var(--gold) 35%, transparent); background: var(--gold); }

.k-sholat { --c: #13806b; }
.k-umrah { --c: #b8921f; }
.k-kajian { --c: #7458b0; }
.k-perjalanan { --c: #2f72b3; }
.k-ziarah { --c: #b5612b; }
.k-makan { --c: #c0812f; }
.k-bebas, .k-persiapan, .k-istirahat { --c: #869390; }
:root[data-theme='dark'] .k-sholat { --c: #5fc2a9; }
:root[data-theme='dark'] .k-umrah { --c: #d9b64a; }
:root[data-theme='dark'] .k-kajian { --c: #a991e0; }
:root[data-theme='dark'] .k-perjalanan { --c: #79aee3; }
:root[data-theme='dark'] .k-ziarah { --c: #e0915c; }
:root[data-theme='dark'] .k-makan { --c: #e0a85e; }
.k-umrah .title { color: var(--gold-d); }

.pager button { padding: 14px; border-radius: 14px; background: var(--surface); border: 1px solid var(--line); min-height: 76px; text-align: left; }
.pager button.nx { text-align: right; grid-column: 2; }
.pager button small { display: block; font-size: 12px; color: var(--ink-3); }
.pager button b { display: block; font-size: 14px; line-height: 1.35; margin-top: 2px; }

/* sholat tab */
.intro { font-size: 13px; color: var(--ink-3); margin: 14px 4px 0; line-height: 1.5; }
.plist { display: grid; gap: 10px; }
.prow { padding: 12px; }
.prow.today { border-color: var(--gold); }
.pr-head { display: flex; justify-content: space-between; align-items: flex-start; gap: 8px; margin: 0 2px 10px; }
.pr-head b { display: block; font-size: 15px; line-height: 1.3; }
.pr-head small { display: block; font-size: 12px; font-style: italic; color: var(--ink-3); }

/* info tab */
.flights { display: grid; gap: 10px; }
.flight { padding: 14px 16px; }
.fl-top { display: flex; justify-content: space-between; align-items: center; }
.fno { font-weight: 800; font-size: 14px; color: var(--ink-2); }
.fdate { display: block; margin-top: 8px; font-size: 13px; color: var(--ink-3); font-weight: 700; }
.route { display: flex; align-items: center; gap: 10px; margin-top: 6px; }
.route > div { flex: 1; display: flex; flex-direction: column; }
.route .r { text-align: right; }
.route b { font-size: 24px; line-height: 1.1; letter-spacing: .02em; }
.route span { font-size: 17px; font-weight: 700; color: var(--green); font-variant-numeric: tabular-nums; }
.route small { font-size: 12px; color: var(--ink-3); }
.route .icon { color: var(--gold-d); flex: none; }
.routecard { padding: 14px 16px; display: grid; gap: 0; }
.stop { display: grid; grid-template-columns: 14px 1fr auto; align-items: center; gap: 10px; padding: 6px 0; position: relative; }
.stop .dot { position: static; margin: 0; width: 10px; height: 10px; background: var(--green); box-shadow: none; }
.stop:not(:last-child)::after { content: ''; position: absolute; left: 4px; top: 22px; height: calc(100% - 10px); width: 2px; background: var(--line); }
.stop small { color: var(--ink-3); font-size: 13px; }
.notes { margin: 0; padding: 14px 16px 14px 34px; font-size: 14px; line-height: 1.55; color: var(--ink-2); }
.notes li { margin: 4px 0 10px; }
.notes li:last-child { margin-bottom: 0; }
.notes li::marker { color: var(--gold-d); font-weight: 800; }
.foot { font-size: 12px; color: var(--ink-3); text-align: center; margin: 24px 12px 0; line-height: 1.5; }
</style>
