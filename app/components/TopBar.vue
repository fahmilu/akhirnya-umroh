<script setup lang="ts">
const props = defineProps<{ title: string; sub?: string; back?: string | boolean }>()
const router = useRouter()
function goBack() {
  if (typeof props.back === 'string') {
    if (window.history.state?.back) router.back()
    else router.push(props.back)
  } else router.back()
}
</script>

<template>
  <header class="topbar">
    <div class="in">
      <button v-if="back" class="icon-btn" aria-label="Kembali" @click="goBack"><Icon name="back" /></button>
      <div class="ttl" :style="back ? '' : 'padding-left:10px'">
        <b>{{ title }}</b>
        <small v-if="sub">{{ sub }}</small>
      </div>
      <slot />
    </div>
  </header>
</template>
