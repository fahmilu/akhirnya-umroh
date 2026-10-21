import booksJson from '~/data/books.json'

export type Inline = string
export type Block =
  | { t: 'h'; l: number; x: string }
  | { t: 'p'; h: Inline; k?: 'latin' | 'small' | 'or' }
  | { t: 'li'; h: Inline; n?: string }
  | { t: 'ar'; src: string; w: number; h: number; pct: number; p: number }
  | { t: 'img'; src: string; w: number; h: number; p: number }
  | { t: 'page'; src: string; w: number; h: number; p: number; txt: string }
  | { t: 'table'; rows: ({ x?: string; ar?: string; w?: number; h?: number; span?: number })[][]; p: number }

export interface Section { id: string; title: string; page: number; blocks: Block[] }
export interface Chapter { slug: string; title: string; group?: string | null; sections: Section[] }
export interface ChapterMeta { slug: string; title: string; group?: string | null; page: number; sections: { id: string; title: string; page: number }[] }
export interface BookMeta { key: 'pegangan' | 'doa'; title: string; subtitle: string; chapters: ChapterMeta[] }

export const BOOKS = booksJson as unknown as BookMeta[]

export function getBook(key: string) {
  return BOOKS.find(b => b.key === key)
}

const loaders = import.meta.glob<{ default: Chapter }>('../data/*/*.json')

export async function loadChapter(book: string, slug: string): Promise<Chapter | null> {
  const l = loaders[`../data/${book}/${slug}.json`]
  if (!l) return null
  return (await l()).default
}

export function chapterNeighbors(book: string, slug: string) {
  const b = getBook(book)
  if (!b) return { prev: null, next: null }
  const i = b.chapters.findIndex(c => c.slug === slug)
  return { prev: b.chapters[i - 1] ?? null, next: b.chapters[i + 1] ?? null }
}

/** Cari section berdasarkan judul (dipakai untuk shortcut di beranda). */
export function findSection(book: string, re: RegExp) {
  const b = getBook(book)
  if (!b) return null
  for (const c of b.chapters) {
    for (const s of c.sections) {
      if (re.test(s.title)) return { book, ch: c.slug, sec: s.id, title: s.title, chapter: c.title }
    }
  }
  return null
}

export const BOOK_STYLE: Record<string, { icon: string; tint: string }> = {
  pegangan: { icon: 'book', tint: 'var(--green)' },
  doa: { icon: 'hands', tint: 'var(--gold-d)' },
}
