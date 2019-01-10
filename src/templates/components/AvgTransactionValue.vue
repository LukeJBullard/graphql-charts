<template>
  <TextReport title="Average Spend Per Order" :message="value.toLocaleString('en-US', {style: 'currency', currency: 'USD'})" />
</template>

<script>
import TextReport from './generic/TextReport.vue'

export default {
  name: 'AvgTransactionValue',
  components: {
    TextReport
  },
  props: {
    value: Number
  }
}
</script>
