<template>
  <TextReport title="Total Number of Sales" :message="value" />
</template>

<script>
import TextReport from './generic/TextReport.vue'

export default {
  name: 'NumberOfSales',
  components: {
    TextReport
  },
  props: {
    value: Number
  }
}
</script>
