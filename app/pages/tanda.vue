<script setup lang="ts">
useHead({ title: 'Ditandai — Akhirnya Umroh' })
const marks = useBookmarks()
const mounted = ref(false)
onMounted(() => (mounted.value = true))
const remove = (i: number) => { marks.value = marks.value.filter((_, j) => j !== i) }
</script>

<template>
  <div class="page">
    <TopBar title="Ditandai" sub="Doa & topik yang kamu simpan" />
    <div class="wrap">
      <div v-if="mounted && marks.length" class="list" style="margin-top:16px">
        <div v-for="(m, i) in marks" :key="m.book + m.ch + m.sec" class="row">
          <NuxtLink :to="`/${m.book}/${m.ch}#${m.sec}`" class="row-main">
            <b>{{ m.title }}</b>
            <small>{{ m.book === 'doa' ? 'Buku Doa' : 'Buku Pegangan' }} · {{ m.chapter }}</small>
          </NuxtLink>
          <button class="icon-btn" aria-label="Hapus tanda" @click="remove(i)"><Icon name="x" /></button>
        </div>
      </div>
      <div v-else-if="mounted" class="empty" style="padding-top:80px">
        <Icon name="mark" />
        Belum ada yang ditandai.<br>Ketuk ikon <b>penanda</b> di samping judul doa atau topik untuk menyimpannya di sini.
      </div>
    </div>
  </div>
</template>
