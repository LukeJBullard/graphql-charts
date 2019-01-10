<template>
  <TextReport title="Average Number of Days Between Sales for Repeat Customers" :message="value.toFixed(1)" />
</template>

<script>
import TextReport from './generic/TextReport.vue'

export default {
  name: 'AvgDaysBetweenSales',
  components: {
    TextReport
  },
  props: {
    value: Number
  }
}
</script>
