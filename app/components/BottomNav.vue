<script setup lang="ts">
const route = useRoute()
const items = [
  { to: '/', label: 'Beranda', icon: 'home', exact: true },
  { to: '/pegangan', label: 'Pegangan', icon: 'book' },
  { to: '/doa', label: 'Doa', icon: 'hands' },
  { to: '/cari', label: 'Cari', icon: 'search' },
  { to: '/tanda', label: 'Ditandai', icon: 'mark' },
]
const isActive = (it: (typeof items)[number]) => (it.exact ? route.path === '/' : route.path.startsWith(it.to))
</script>

<template>
  <nav class="bnav" aria-label="Navigasi utama">
    <div class="in">
      <NuxtLink v-for="it in items" :key="it.to" :to="it.to" :class="{ active: isActive(it) }" active-class="" exact-active-class="">
        <Icon :name="it.icon" />
        <span>{{ it.label }}</span>
      </NuxtLink>
    </div>
  </nav>
</template>
