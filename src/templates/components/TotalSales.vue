<template>
  <TextReport title="Gross Sales" :message="value.toLocaleString('en-US', {style: 'currency', currency: 'USD'})" />
</template>

<script>
import TextReport from './generic/TextReport.vue'

export default {
  name: 'TotalSales',
  components: {
    TextReport
  },
  props: {
    value: Number
  }
}
</script>
