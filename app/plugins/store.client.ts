export default defineNuxtPlugin((nuxtApp) => {
  const s = useSettings()
  const apply = () => {
    const el = document.documentElement
    el.style.setProperty('--fs', String(s.value.fontScale))
    const dark = s.value.theme === 'dark' || (s.value.theme === 'auto' && matchMedia('(prefers-color-scheme: dark)').matches)
    el.dataset.theme = dark ? 'dark' : 'light'
    el.classList.toggle('hide-latin', !s.value.showLatin)
    el.classList.toggle('hide-arti', !s.value.showArti)
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? '#0b1714' : '#0e4f45')
  }
  // Muat state setelah hydration supaya HTML hasil prerender tidak bentrok
  nuxtApp.hook('app:mounted', () => {
    hydrateStore()
    apply()
    watch(s, apply, { deep: true })
    matchMedia('(prefers-color-scheme: dark)').addEventListener('change', apply)
  })
})
