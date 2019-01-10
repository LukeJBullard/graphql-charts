<template>
  <TextReport title="Total Number of Customers" :message="value" />
</template>

<script>
import TextReport from './generic/TextReport.vue'

export default {
  name: 'TotalCustomers',
  components: {
    TextReport
  },
  props: {
    value: Number
  }
}
</script>
