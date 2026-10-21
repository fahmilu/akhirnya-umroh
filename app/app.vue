<script setup lang="ts">
// Terapkan tema & ukuran huruf sedini mungkin (sebelum Vue jalan) supaya tidak berkedip
useHead({
  script: [{
    tagPosition: 'head',
    innerHTML: `try{var s=JSON.parse(localStorage.getItem('au.settings')||'{}'),e=document.documentElement,d=s.theme==='dark'||((!s.theme||s.theme==='auto')&&matchMedia('(prefers-color-scheme: dark)').matches);e.dataset.theme=d?'dark':'light';if(s.fontScale)e.style.setProperty('--fs',s.fontScale);if(s.showLatin===false)e.classList.add('hide-latin');if(s.showArti===false)e.classList.add('hide-arti')}catch(_){}`,
  }],
})
</script>

<template>
  <div>
    <NuxtPwaManifest />
    <NuxtPage />
    <BottomNav />
    <SettingsSheet />
    <Lightbox />
  </div>
</template>
