import MiniSearch from 'minisearch'

export interface Doc { id: string; book: string; ch: string; sec: string; title: string; chapter: string; page: number; text: string }

// Variasi ejaan yang umum dipakai jamaah -> satu bentuk baku
const VARIANTS: Record<string, string> = {
  umroh: 'umrah', umrohnya: 'umrahnya', tawaf: 'thawaf', towaf: 'thawaf', thowaf: 'thawaf',
  salat: 'shalat', sholat: 'shalat', solat: 'shalat', zikir: 'dzikir', dikir: 'dzikir', zikr: 'dzikir',
  raudhah: 'raudah', rawdah: 'raudah', roudhoh: 'raudah', shofa: 'shafa', safa: 'shafa', marwah: 'marwa',
  miqot: 'miqat', ihrom: 'ihram', tahalul: 'tahallul', talbiah: 'talbiyah', kabah: 'kabah', zamzam: 'zamzam',
  makah: 'makkah', mekah: 'makkah', mekkah: 'makkah', madinah: 'madinah', medina: 'madinah', nabawi: 'nabawi',
  sai: 'sai', wudu: 'wudhu', wudlu: 'wudhu', jenazah: 'jenazah', janazah: 'jenazah', subuh: 'subuh', shubuh: 'subuh',
  hajar: 'hajar', aswad: 'aswad', doa: 'doa', dua: 'doa', niyat: 'niat', istighfar: 'istighfar',
}

export function normTerm(t: string) {
  const n = t.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/['’‘`ʼ]/g, '').toLowerCase()
  return VARIANTS[n] ?? n
}

export const tokenize = (s: string) => s.split(/[^\p{L}\p{N}'’‘`ʼ]+/u).filter(Boolean)

let mini: MiniSearch<Doc> | null = null
let loading: Promise<MiniSearch<Doc>> | null = null

export function getIndex() {
  if (mini) return Promise.resolve(mini)
  if (!loading) {
    loading = import('~/data/search.json').then((m) => {
      const docs = m.default as Doc[]
      const ms = new MiniSearch<Doc>({
        fields: ['title', 'chapter', 'text'],
        storeFields: ['book', 'ch', 'sec', 'title', 'chapter', 'page', 'text'],
        tokenize,
        processTerm: (t) => normTerm(t) || null,
        searchOptions: { boost: { title: 4, chapter: 1.5 }, prefix: true, fuzzy: (t) => (t.length > 4 ? 0.2 : 0), combineWith: 'AND' },
      })
      ms.addAll(docs)
      mini = ms
      return ms
    })
  }
  return loading
}

export async function search(q: string, book?: string) {
  const ms = await getIndex()
  if (!q.trim()) return []
  const filter = book ? (r: any) => r.book === book : undefined
  let res = ms.search(q, { filter })
  if (!res.length) res = ms.search(q, { filter, combineWith: 'OR' })
  return res.slice(0, 60) as unknown as (Doc & { score: number })[]
}

const esc = (s: string) => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]!))

export function queryTerms(q: string) {
  return tokenize(q).map(normTerm).filter(t => t.length >= 2)
}

export function wordMatches(word: string, terms: string[]) {
  const n = normTerm(word)
  return n.length > 0 && terms.some(t => n.startsWith(t))
}

/** Potongan teks di sekitar kata yang cocok, sudah di-escape dan diberi <mark>. */
export function snippet(text: string, q: string, len = 150) {
  const terms = queryTerms(q)
  const re = /[\p{L}\p{N}'’‘`ʼ]+/gu
  let first = -1
  let m: RegExpExecArray | null
  while ((m = re.exec(text))) {
    if (wordMatches(m[0], terms)) { first = m.index; break }
  }
  let start = Math.max(0, first - 50)
  if (first < 0) start = 0
  if (start > 0) { const sp = text.indexOf(' ', start); if (sp > 0 && sp < first) start = sp + 1 }
  const part = text.slice(start, start + len)
  const out = part.replace(/[\p{L}\p{N}'’‘`ʼ]+|[^\p{L}\p{N}'’‘`ʼ]+/gu, (w) => (wordMatches(w, terms) ? `<mark>${esc(w)}</mark>` : esc(w)))
  return (start > 0 ? '… ' : '') + out + (start + len < text.length ? ' …' : '')
}

export function highlightTitle(title: string, q: string) {
  const terms = queryTerms(q)
  return title.replace(/[\p{L}\p{N}'’‘`ʼ]+|[^\p{L}\p{N}'’‘`ʼ]+/gu, (w) => (wordMatches(w, terms) ? `<mark>${esc(w)}</mark>` : esc(w)))
}

/** Tandai kata yang cocok di dalam elemen (dipakai di halaman baca). */
export function markInElement(root: HTMLElement, q: string) {
  const terms = queryTerms(q)
  if (!terms.length) return null
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
  const nodes: Text[] = []
  while (walker.nextNode()) nodes.push(walker.currentNode as Text)
  let first: HTMLElement | null = null
  for (const node of nodes) {
    const txt = node.nodeValue || ''
    if (!txt.trim() || node.parentElement?.closest('mark,button,.no-mark')) continue
    const parts = txt.split(/([\p{L}\p{N}'’‘`ʼ]+)/u)
    if (!parts.some(p => wordMatches(p, terms))) continue
    const frag = document.createDocumentFragment()
    for (const p of parts) {
      if (p && wordMatches(p, terms)) {
        const mk = document.createElement('mark')
        mk.textContent = p
        frag.appendChild(mk)
        if (!first) first = mk
      } else if (p) frag.appendChild(document.createTextNode(p))
    }
    node.replaceWith(frag)
  }
  return first
}
