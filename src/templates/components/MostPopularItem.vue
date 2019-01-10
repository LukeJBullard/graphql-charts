<template>
  <TextReport title="Most Popular Item" :message="value" />
</template>

<script>
import TextReport from './generic/TextReport.vue'

export default {
  name: 'MostPopularItem',
  components: {
    TextReport
  },
  props: {
    value: String
  }
}
</script>
