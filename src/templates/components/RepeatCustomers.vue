<template>
  <TextReport title="Number of Repeat Customers" :message="value" />
</template>

<script>
import TextReport from './generic/TextReport.vue'

export default {
  name: 'RepeatCustomers',
  components: {
    TextReport
  },
  props: {
    value: Number
  }
}
</script>
