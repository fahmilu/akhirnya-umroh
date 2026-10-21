<script setup lang="ts">
import type { Block } from '~/composables/useBooks'

const props = defineProps<{ blocks: Block[] }>()
const ui = useUi()

type Item =
  | { kind: 'ar'; imgs: Extract<Block, { t: 'ar' }>[] }
  | { kind: 'latin'; h: string }
  | { kind: 'arti'; ps: Extract<Block, { t: 'p' }>[] }
  | { kind: 'list'; ordered: boolean; start: number; items: Extract<Block, { t: 'li' }>[] }
  | { kind: 'block'; b: Block }

const items = computed<Item[]>(() => {
  const out: Item[] = []
  let afterAr = false // baru saja melewati teks Arab / latin
  for (const b of props.blocks) {
    const last = out[out.length - 1]
    if (b.t === 'ar') {
      if (last?.kind === 'ar') last.imgs.push(b)
      else out.push({ kind: 'ar', imgs: [b] })
      afterAr = true
      continue
    }
    if (b.t === 'p' && b.k === 'latin' && afterAr) {
      if (last?.kind === 'latin') last.h += ' ' + b.h
      else out.push({ kind: 'latin', h: b.h })
      continue
    }
    if (b.t === 'p' && !b.k && afterAr) {
      out.push({ kind: 'arti', ps: [b] })
      afterAr = false
      continue
    }
    if (b.t === 'p' && last?.kind === 'arti' && /^[(\[]?\s*(?:<[bi]>)?\s*(\(|HR|QS|H\.R|Riwayat|Diriwayatkan|Dari|\[)/i.test(b.h) && b.h.length < 220) {
      last.ps.push(b)
      continue
    }
    afterAr = false
    if (b.t === 'li') {
      const n = b.n && /^\d+$/.test(b.n) ? Number(b.n) : 0
      if (last?.kind === 'list' && last.ordered === !!n) last.items.push(b)
      else out.push({ kind: 'list', ordered: !!n, start: n || 1, items: [b] })
      continue
    }
    out.push({ kind: 'block', b })
  }
  return out
})

function zoom(src: string, w: number, h: number) {
  ui.value.lightbox = { src, w, h }
}
</script>

<template>
  <template v-for="(it, i) in items" :key="i">
    <div v-if="it.kind === 'ar'" class="ar-wrap" dir="rtl">
      <img
        v-for="a in it.imgs" :key="a.src" class="ar" :src="a.src" :width="a.w" :height="a.h"
        :style="{ width: a.pct + '%' }" loading="lazy" decoding="async" alt="Teks Arab" @click="zoom(a.src, a.w, a.h)"
      >
    </div>
    <p v-else-if="it.kind === 'latin'" class="latin" v-html="it.h" />
    <div v-else-if="it.kind === 'arti'" class="arti-block">
      <p v-for="(p, j) in it.ps" :key="j" class="arti" v-html="p.h" />
    </div>
    <component :is="it.ordered ? 'ol' : 'ul'" v-else-if="it.kind === 'list'" :start="it.ordered ? it.start : undefined">
      <li v-for="(li, j) in it.items" :key="j" v-html="li.h" />
    </component>
    <template v-else-if="it.kind === 'block'">
      <h3 v-if="it.b.t === 'h' && it.b.l <= 2">{{ it.b.x }}</h3>
      <h4 v-else-if="it.b.t === 'h'">{{ it.b.x }}</h4>
      <p v-else-if="it.b.t === 'p'" :class="it.b.k === 'small' ? 'small' : it.b.k === 'or' ? 'or' : ''" v-html="it.b.h" />
      <figure v-else-if="it.b.t === 'img'" class="fig">
        <img :src="it.b.src" :width="it.b.w" :height="it.b.h" loading="lazy" decoding="async" alt="" @click="zoom(it.b.src, it.b.w, it.b.h)">
      </figure>
      <template v-else-if="it.b.t === 'page'">
        <div class="vpage">
          <img :src="it.b.src" :width="it.b.w" :height="it.b.h" loading="lazy" decoding="async" :alt="'Halaman ' + it.b.p" @click="zoom(it.b.src, it.b.w, it.b.h)">
          <span class="zoom-hint"><Icon name="zoom" /> Ketuk untuk perbesar</span>
        </div>
        <details v-if="it.b.txt && it.b.txt.length > 40" class="ptext">
          <summary>Tampilkan teks halaman {{ it.b.p }}</summary>
          <div>{{ it.b.txt }}</div>
        </details>
      </template>
      <div v-else-if="it.b.t === 'table'" class="tbl-wrap">
        <table class="tbl">
          <tbody>
            <tr v-for="(r, ri) in it.b.rows" :key="ri">
              <td v-for="(c, ci) in r" :key="ci" :colspan="c.span || 1" :dir="c.ar ? 'rtl' : undefined">
                <img v-if="c.ar" :src="c.ar" :width="c.w" :height="c.h" loading="lazy" alt="Teks Arab" :style="{ width: Math.min(140, (c.w || 0) / 4.2) + 'px' }">
                <template v-else>{{ c.x }}</template>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>
  </template>
</template>
