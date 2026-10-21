<script setup lang="ts">
const ui = useUi()
const scale = ref(1)
const lb = computed(() => ui.value.lightbox)
const vw = ref(360)
watch(lb, (v) => {
  scale.value = 1
  if (v) { vw.value = Math.min(window.innerWidth, 900); document.body.style.overflow = 'hidden' }
  else document.body.style.overflow = ''
})
const width = computed(() => Math.round(vw.value * scale.value))
function close() { ui.value.lightbox = null }
</script>

<template>
  <Transition name="fade">
    <div v-if="lb" class="lb" role="dialog" aria-label="Perbesar gambar">
      <div class="bar">
        <span style="font-size:13px;opacity:.7;padding-left:8px">Cubit atau pakai tombol untuk zoom</span>
        <button class="icon-btn" aria-label="Tutup" @click="close"><Icon name="x" /></button>
      </div>
      <div class="stage">
        <img :src="lb.src" :style="{ width: width + 'px' }" alt="">
      </div>
      <div class="zoomctl">
        <button @click="scale = Math.max(1, scale - 0.5)">−</button>
        <button @click="scale = 1">{{ Math.round(scale * 100) }}%</button>
        <button @click="scale = Math.min(4, scale + 0.5)">+</button>
      </div>
    </div>
  </Transition>
</template>
