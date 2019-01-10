<template>
  <div class="mostSoldProducts" :style="totalHeight">
    <h3 class="chart-title">Most Sold Products</h3>
    <div>
      <HorizontalBarChart
        :data="data"
        :margin="margin"
        :resized="passResize"
        :getValue="getValue"
        :formatter="formatter"
        v-bind:rowCount.sync="rows"
      />
    </div>
  </div>
</template>

<style scoped>
  h3.chart-title {
    text-align: center;
    height: 1.5em;
    margin-top: 0.25em;
    margin-bottom: 0.25em;
  }
  .mostSoldProducts {
    width: 100%;
  }
  .mostSoldProducts div {
    height: calc(100% - 2em);
  }
</style>

<style>
  .chart-center {
    text-align: center;
  }
</style>

<script>
import HorizontalBarChart from './components/d3/HorizontalBarChart.vue'

const formatter = {
  value(value){
    return typeof(value) === "object" && typeof(value.qtySold) === "number" ? value.qtySold : 0;
  },
  tooltip(data) {
    if (typeof(data) !== "object" || data === null)
    {
      return "Unknown";
    }

    let productName = typeof(data.name) === "string" ? data.name : "Unknown Product";
    let qtySold = "Unknown Amount";
    let sku = "Unknown";
    let orderCount = "?";
    let rank = "?";
    let repPrice = "Unknown";
    let retailPrice = "Unknown";
    let lookbackMonths = "?";

    if (typeof(data.value) !== "undefined" && data.value !== null) {
      sku = typeof(data.value.sku) === "string" ? data.value.sku : sku;
      qtySold = typeof(data.value.qtySold) === "number" ? data.value.qtySold.toString() : qtySold;
      orderCount = typeof(data.value.orderCount) === "number" ? data.value.orderCount.toString() : orderCount;
      rank = typeof(data.value.rank) === "number" ? data.value.rank.toString() : rank;
      repPrice = typeof(data.value.repPrice) === "number" ? data.value.repPrice.toLocaleString('en-US', {style: 'currency', currency: 'USD'}) : repPrice;
      retailPrice = typeof(data.value.retailPrice) === "number" ? data.value.retailPrice.toLocaleString('en-US', {style: 'currency', currency: 'USD'}) : retailPrice;
      lookbackMonths = typeof(data.value.lookbackMonths) === "number" ? data.value.lookbackMonths.toString() : lookbackMonths;
    }

    return `<span class="chart-center">
      <h3>${productName}</h3>
      <p>SKU: ${sku}</p>
      <p>&nbsp;</p>
      <p>Your #${rank} Product by Volume</p>
    </span>
    <p><b>${qtySold}</b> Units Sold Across ${orderCount} Orders</p>
    <p>&nbsp;</p>
    <p>Wholesale Price: ${repPrice}</p>
    <p>Retail Price: ${retailPrice}</p>
    <p>&nbsp;</p>
    <p class="chart-center">(Over The Past ${lookbackMonths} Months)</p>`;
  }
};

const getValue = function(row){
  return typeof(row.value) === "object" && typeof(row.value.qtySold) === "number" ? row.value.qtySold : 0;
};

export default {
  name: 'MostSoldProducts',
  components: {
    HorizontalBarChart
  },
  computed: {
    margin(){
      return {
        left: 260,
        right: 50,
        top: 15,
        bottom: 15
      };
    },
    totalHeight(){
      return {
        height: "calc(" +
          Math.round(this.rows * 1.3).toString() + "em + 2em + " + 
          (this.margin.top + this.margin.bottom).toString() + "px)"
      }
    }
  },
  watch: {
    rows(){
      this.$forceUpdate();
      this.passResize = !this.passResize;
    },
    resized(){
      //when the parent component changes the resized value, pass it along to the bar chart
      this.passResize = !this.passResize;
    }
  },
  data() {
    return {
      rows: 20,
      passResize: this.resized,
      formatter,
      getValue
    }
  },
  props: {
    data: {
      type: Array,
      default(){
        return [];
      }
    },
    resized: {
      type: Boolean,
      default: false
    }
  }
}
</script>
