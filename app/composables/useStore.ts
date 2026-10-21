export interface Settings {
  fontScale: number
  showLatin: boolean
  showArti: boolean
  theme: 'auto' | 'light' | 'dark'
}

export interface Mark {
  book: string
  ch: string
  sec: string
  title: string
  chapter: string
  at: number
}

const DEFAULTS: Settings = { fontScale: 1, showLatin: true, showArti: true, theme: 'auto' }

function read<T>(key: string, fallback: T): T {
  if (import.meta.server) return fallback
  try {
    const v = localStorage.getItem(key)
    return v ? { ...(fallback as any), ...JSON.parse(v) } : fallback
  } catch { return fallback }
}
function readArr<T>(key: string): T[] {
  if (import.meta.server) return []
  try { return JSON.parse(localStorage.getItem(key) || '[]') } catch { return [] }
}
function write(key: string, v: unknown) {
  try { localStorage.setItem(key, JSON.stringify(v)) } catch { /* private mode */ }
}

export const useSettings = () => useState<Settings>('settings', () => ({ ...DEFAULTS }))
export const useBookmarks = () => useState<Mark[]>('bookmarks', () => [])
export const useLastRead = () => useState<Mark | null>('lastRead', () => null)
export const useUi = () => useState('ui', () => ({ settingsOpen: false, lightbox: null as null | { src: string; w: number; h: number; dark?: boolean } }))

/** Dipanggil sekali di plugin client: muat dari localStorage & simpan otomatis. */
export function hydrateStore() {
  const s = useSettings()
  const b = useBookmarks()
  const l = useLastRead()
  s.value = read('au.settings', { ...DEFAULTS })
  b.value = readArr<Mark>('au.bookmarks')
  l.value = read<Mark | null>('au.last', null as any)
  watch(s, v => write('au.settings', v), { deep: true })
  watch(b, v => write('au.bookmarks', v), { deep: true })
  watch(l, v => write('au.last', v), { deep: true })
}

export function useBookmarkToggle() {
  const marks = useBookmarks()
  const has = (book: string, ch: string, sec: string) => marks.value.some(m => m.book === book && m.ch === ch && m.sec === sec)
  const toggle = (m: Omit<Mark, 'at'>) => {
    if (has(m.book, m.ch, m.sec)) marks.value = marks.value.filter(x => !(x.book === m.book && x.ch === m.ch && x.sec === m.sec))
    else marks.value = [{ ...m, at: Date.now() }, ...marks.value]
  }
  return { has, toggle }
}
