<template>
  <div class="topBuyers" :style="totalHeight">
    <h3 class="chart-title">Top Buyers</h3>
    <div>
      <HorizontalBarChart
        :data="data"
        :formatter="formatter"
        :getValue="getValue"
        :margin="margin"
        :resized="passResize"
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
  .topBuyers {
    width: 100%;
  }
  .topBuyers div {
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
import { formatError } from 'graphql';

const formatter = {
  value(value) {
    if (typeof(value) !== "object" || value === null ||
        typeof(value.sales) !== "number" || value.sales === null)
    {
      return "";
    }

    return value.sales.toLocaleString('en-US', {style: 'currency', currency: 'USD'});
  },
  tooltip(data) {
    if (typeof(data) !== "object" || data === null)
    {
      return "Unknown";
    }

    let name = typeof(data.name) === "string" ? data.name : "Unknown Customer";
    let sales = "Unknown Amount";
    let orderCount = "?";
    let rank = "?";
    let lookbackMonths = "?";
    let avgDaysBetweenSales = "?";
    let avgTransValue = "?";

    if (typeof(data.value) === "object" && data.value !== null)
    {
      sales = typeof(data.value.sales) === "number" ? formatter.value(data.value) : sales;
      orderCount = typeof(data.value.orderCount) === "number" ? data.value.orderCount.toString() : orderCount;
      rank = typeof(data.value.rank) === "number" ? data.value.rank.toString() : rank;
      lookbackMonths = typeof(data.value.lookbackMonths) === "number" ? data.value.lookbackMonths.toString() : lookbackMonths;
      avgDaysBetweenSales = typeof(data.value.avgDaysBetweenSales) === "number" ? data.value.avgDaysBetweenSales.toFixed(1).toString() : avgDaysBetweenSales;
      avgTransValue = typeof(data.value.avgTransactionValue) === "number" ? data.value.avgTransactionValue.toLocaleString('en-US', {style: 'currency', currency: 'USD'}).toString() : avgTransValue;
    }
    
    return `<span class="chart-center">
      <h3>${name}</h3>
      <p>Your #${rank} Customer</p>
    </span>
    <p><b>${sales}</b> in Sales Across ${orderCount} Orders</p>
    <p>&nbsp;</p>
    <p>Average Spend Per Order: <b>${avgTransValue}</b></p>
    ${avgDaysBetweenSales != "?" && parseFloat(avgDaysBetweenSales) > 0 ? `<p>Average # of Days Between Sales: <b>${avgDaysBetweenSales}</b></p>` : ``}
    <p>&nbsp;</p>
    <p class="chart-center">(Over The Past ${lookbackMonths} Months)</p>`;
  }
};

const getValue = function(row){
  return typeof(row.value) === "object" && typeof(row.value.sales) === "number" ? row.value.sales : 0;
};

export default {
  name: 'TopBuyers',
  components: {
    HorizontalBarChart
  },
  computed: {
    margin(){
      return {
        left: 130,
        right: 80,
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
  data() {
    return {
      rows: 20,
      formatter,
      getValue,
      passResize: this.resized
    }
  },
  watch: {
    rows(){
      this.$forceUpdate();
      this.passResize = !this.passResize;
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
