<script setup lang="ts">
defineProps<{ name: string }>()
const P: Record<string, string> = {
  back: 'M15 18l-6-6 6-6',
  chev: 'M9 18l6-6-6-6',
  down: 'M6 9l6 6 6-6',
  search: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM21 21l-4.3-4.3',
  home: 'M3 10.5L12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z',
  book: 'M4 19.5V5a2 2 0 0 1 2-2h13v15H6.5A2.5 2.5 0 0 0 4 20.5 2.5 2.5 0 0 0 6.5 23H19M8 7h7M8 11h5',
  hands: 'M7 21v-5l-3-4.5V6a1.5 1.5 0 0 1 3 0v4.5M17 21v-5l3-4.5V6a1.5 1.5 0 0 0-3 0v4.5M7 10.5l2.4 2.3A2 2 0 0 1 10 14.2V21M17 10.5l-2.4 2.3a2 2 0 0 0-.6 1.4V21',
  mark: 'M6 3h12v18l-6-4-6 4z',
  markfill: 'M6 3h12v18l-6-4-6 4z',
  list: 'M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01',
  type: 'M4 7V5h11v2M9.5 5v14M7 19h5M14 13v-2h7v2M17.5 11v8M16 19h3',
  x: 'M18 6L6 18M6 6l12 12',
  zoom: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM21 21l-4.3-4.3M11 8v6M8 11h6',
  clock: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 7v5l3 2',
  download: 'M12 3v12M7 10l5 5 5-5M5 21h14',
  check: 'M20 6L9 17l-5-5',
  kaaba: 'M4 8l8-4 8 4v9l-8 4-8-4zM4 8l8 4 8-4M12 12v9M4 11l8 4 8-4',
  arrow: 'M5 12h14M13 6l6 6-6 6',
  moon: 'M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z',
}
</script>

<template>
  <svg class="icon" viewBox="0 0 24 24" :fill="name === 'markfill' ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path :d="P[name]" />
  </svg>
</template>
