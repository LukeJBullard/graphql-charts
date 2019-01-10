<template>
  <div class="chart-overviewStats">
    <div class="inlineResponsive">
      <NumericTextEntry title="Number of Months to Look Back" :initialValue="lookbackMonths" v-bind:value.sync="mutableLookbackMonths" min="1" />
    </div>
    <div class="inlineResponsive">
      <NumericTextEntry title="Number of Results to Show" :initialValue="maxGraphResults" v-bind:value.sync="mutableMaxGraphResults" min="1" />
    </div>
    <transition name="fade">
      <h2 v-if="loading">
        Loading...
      </h2>
      <div v-else>
        <NumberOfSales        :value="stats.numberOfSales" />
        <TotalSales           :value="stats.totalSalesDollars" />
        <MostPopularItem      :value="stats.mostPopularItem" />
        <TotalCustomers       :value="stats.totalCustomers" />
        <RepeatCustomers      :value="stats.repeatCustomers" />
        <AvgDaysBetweenSales  :value="stats.averageDaysBetweenSales" />
        <AvgTransactionValue  :value="stats.averageTransactionValue" />
        <TopBuyers            :data="stats.topBuyers" :resized="chartResized" />
        <MostSoldProducts     :data="stats.mostSoldProducts" :resized="chartResized" />
      </div>
    </transition>
  </div>
</template>

<style>
  .inlineResponsive {
    vertical-align: middle;
    display: inline-block;
    margin-top: 0;
    margin-bottom: 0;
    padding-top: 2em;
    padding-top: 1.5em;
    padding-right: 1em;
    clear: none;
  }

  .chart-text-first {
    width: 18em;
  }

  .chart-text {
    border-bottom: 1px solid #ccc;
  }

  /* Tooltip styles for graphs */
  .vue-tooltip-theme {
    display: block !important;
    z-index: 10000;
    margin-bottom: 5px;
  }

  .vue-tooltip-theme .tooltip-inner {
    background: black;
    color: white;
    border-radius: 16px;
    padding: 5px 10px 4px;
  }

  .vue-tooltip-theme .tooltip-arrow {
    width: 0;
    height: 0;
    border-style: solid;
    position: absolute;
    margin: 5px;
    border-color: black;
    z-index: 1;
    border-width: 5px 5px 0 5px;
    border-left-color: transparent !important;
    border-right-color: transparent !important;
    border-bottom-color: transparent !important;
    bottom: -5px;
    left: calc(50% - 5px);
    margin-top: 0;
    margin-bottom: 0;
  }

  .vue-tooltip-theme [aria-hidden='true'] {
    visibility: hidden;
    opacity: 0;
    transition: opacity .15s, visibility .15s;
  }

  .vue-tooltip-theme [aria-hidden='false'] {
    visibility: visible;
    opacity: 1;
    transition: opacity .15s;
  }
</style>

<style scoped>
  .fade-enter-active, .fade-leave-active {
    transition: opacity .3s;
  }
  .fade-enter, .fade-leave-to {
    opacity: 0;
  }
</style>

<script>
import gql from 'graphql-tag'
import VueGridLayout from 'vue-grid-layout'
import NumericTextEntry from './components/generic/input/NumericTextEntry.vue'
import AvgDaysBetweenSales from './components/AvgDaysBetweenSales.vue'
import AvgTransactionValue from './components/AvgTransactionValue.vue'
import TotalCustomers from './components/TotalCustomers.vue'
import RepeatCustomers from './components/RepeatCustomers.vue'
import NumberOfSales from './components/NumberOfSales.vue'
import TotalSales from './components/TotalSales.vue'
import MostPopularItem from './components/MostPopularItem.vue'
import TopBuyers from './TopBuyers.vue'
import MostSoldProducts from './MostSoldProducts.vue'
import authThenRetry from '../auth'
import { setInterval } from 'timers';

const getDefaultStats = function(){
  return {
    averageDaysBetweenSales: 0,
    averageTransactionValue: 0,
    totalCustomers: 0,
    repeatCustomers: 0,
    numberOfSales: 0,
    totalSalesDollars: 0,
    mostPopularItem: "",
    topBuyers: [],
    mostSoldProducts: []
  };
};

export default {
  name: 'OverviewStats',
  components: {
    NumericTextEntry,
    AvgDaysBetweenSales,
    AvgTransactionValue,
    TotalCustomers,
    MostPopularItem,
    RepeatCustomers,
    NumberOfSales,
    TotalSales,
    TopBuyers,
    MostSoldProducts,
    VueGridLayout
  },
  props: {
    lookbackMonths: {
      type: Number,
      default: 12
    },
    maxGraphResults: {
      type: Number,
      default: 20
    },

    apiKey: String,
    authName: String,

    rowHeight: {
      type: Number,
      default: 20
    },
    layout: {
      type: Array,
      default: function(){
        //try to get from localstorage
        var localStorageLayout = localStorage.getItem("overviewStatsLayout");

        if (localStorageLayout !== null)
        {
          localStorageLayout = JSON.parse(localStorageLayout);

          //find the graphs and add extra properties to them
          Object.keys(localStorageLayout).forEach(function(key){
            let row = localStorageLayout[key];
            if (row.i == "TopBuyers" || row.i == "MostSoldProducts")
            {
              localStorageLayout[key].minW = 6;
              localStorageLayout[key].minH = 15;
              localStorageLayout[key].isResizable = true;
            }
          });

          return localStorageLayout;
        }

        //not found in local storage. use default.
        return [
          {x: 0, y: 0, w: 3, h: 2, i: "NumberOfSales"},
          {x: 0, y: 2, w: 3, h: 2, i: "TotalSales"},
          {x: 0, y: 4, w: 3, h: 2, i: "MostPopularItem"},
          {x: 0, y: 6, w: 3, h: 2, i: "TotalCustomers"},
          {x: 0, y: 8, w: 3, h: 2, i: "RepeatCustomers"},
          {x: 0, y: 10, w: 3, h: 2, i: "AvgDaysBetweenSales"},
          {x: 0, y: 12, w: 3, h: 2, i: "AvgTransactionValue"},

          {x: 0, y: 14, w: 6, h: 20, minW: 6, minH: 15, isResizable: true, i: "TopBuyers"},
          {x: 0, y: (14 + 20), w: 6, h: 20, minW: 6, minH: 15, isResizable: true, i: "MostSoldProducts"}
        ];
      }
    }
  },
  methods: {
    gridResized() {
      //give it a little delay for the container to take its new shape
      setInterval(() => {
        this.resizeCharts();
      },350);
    },
    resizeCharts(layout) {
      //flip the value around. this allows the watchers to pick it up. the value does not mean anything
      this.chartResized = !this.chartResized;

      //parse the layout and store in local storage
      var parsedLayout = [];

      Object.keys(layout).forEach(function(key){
        parsedLayout.push({
          x: layout[key].x,
          y: layout[key].y,
          w: layout[key].w,
          h: layout[key].h,
          i: layout[key].i
        });
      });

      localStorage.setItem("overviewStatsLayout", JSON.stringify(parsedLayout));
    }
  },
  watch: {
    mutableLookbackMonths() { this.loading = true; },
    mutableMaxGraphResults() { this.loading = true; }
  },
  data() {
    return {
      stats: getDefaultStats(),
      chartResized: false,
      loading: true,
      mutableLookbackMonths: this.lookbackMonths,
      mutableMaxGraphResults: this.maxGraphResults
    }
  },
  apollo: {
    stats: {
      fetchPolicy: 'no-cache',
      query: gql`
        query stats($userId:Int!, $lookbackMonths: Int!, $maxGraphResults: Int!) {
          getUser(id: $userId)
          {
            sellsTo(lookbackMonths: $lookbackMonths)
            {
              numberOfSales
              averageDaysBetweenSales
              averageTransactionValue
              totalSales
              buyer {
                fullName
              }
            }
            soldProducts(lookbackMonths: $lookbackMonths, parentProducts: true, first: $maxGraphResults)
            {
              quantity
              numberOfOrders
              product {
                name
                sku
                repPrice
                retailPrice
              }
            }
          }
        }
      `,
      variables() {
        return {
          userId: parseInt(this.authName),
          lookbackMonths: this.mutableLookbackMonths,
          maxGraphResults: this.mutableMaxGraphResults
        }
      },
      update(data) {
        this.loading = true;
        if (typeof(data.getUser) !== "object" || typeof(data.getUser.sellsTo) !== "object"
            || !Array.isArray(data.getUser.soldProducts))
        {
          //data not returned
          //console.log("update method data invalid. data: " + data);
          return getDefaultStats();
          //throw new Error("Unknown structure returned: " + data);
        }

        var rank = 1;

        //process data from soldProducts (ie. most popular product)
        var mostPopularItem = "N/A";
        var mostSoldProducts = [];
        if (data.getUser.soldProducts.length > 0 &&
            typeof(data.getUser.soldProducts[0].product.name) === "string")
        {
          mostPopularItem = data.getUser.soldProducts[0].product.name;

          Object.keys(data.getUser.soldProducts).forEach((function(self){
            return function(key){
              let product = data.getUser.soldProducts[key];

              mostSoldProducts.push({
                name: product.product.name,
                value: {
                  qtySold: product.quantity,
                  orderCount: product.numberOfOrders,
                  sku: product.product.sku,
                  rank,
                  repPrice: product.product.repPrice,
                  retailPrice: product.product.retailPrice,
                  lookbackMonths: self.mutableLookbackMonths
                }
              });

              rank++;
            };
          })(this))
        }

        //process data from sellsTo
        var customers = data.getUser.sellsTo;

        var avgDaysBetween = 0.0;
        var avgTransValue = 0.0;
        var totalCustomers = 0;
        var repeatCustomers = 0;
        var numberOfSales = 0;
        var totalSales = 0;
        var topBuyers = [];
        rank = 1;
        var maxGraphResults = this.mutableMaxGraphResults;

        Object.keys(customers).forEach((function(self){
          return function(key){
            let customer = customers[key];

            //top buyers
            if (totalCustomers < maxGraphResults)
            {
              topBuyers.push({
                name: customer.buyer.fullName,
                value: {
                  sales: customer.totalSales,
                  lookbackMonths: self.mutableLookbackMonths,
                  orderCount: customer.numberOfSales,
                  rank,
                  avgTransactionValue: customer.averageTransactionValue,
                  avgDaysBetweenSales: customer.averageDaysBetweenSales
                }
              });
              rank++;
            }

            //total and repeat customers
            totalCustomers++;
            if (customer.numberOfSales > 1)
            {
              repeatCustomers++;

              //average days between sales
              avgDaysBetween += customer.averageDaysBetweenSales;
            }

            //total number of sales
            numberOfSales += customer.numberOfSales;

            //total amount sold
            totalSales += customer.totalSales;
          };
        })(this));

        //divide to get averages
        if (repeatCustomers != 0)
        {
          avgDaysBetween /= repeatCustomers;
        } else {
          avgDaysBetween = 0;
        }

        //average transaction value
        if (numberOfSales > 0)
        {
          avgTransValue = totalSales / numberOfSales;
        }

        this.loading = false;

        return {
          averageDaysBetweenSales: avgDaysBetween,
          averageTransactionValue: avgTransValue,
          totalCustomers,
          repeatCustomers,
          numberOfSales,
          totalSalesDollars: totalSales,
          mostPopularItem,
          topBuyers,
          mostSoldProducts
        };
      },
      async error(errorObj) {
        await authThenRetry(errorObj, this.$apollo.queries.stats, this.$apollo, this.authName, this.apiKey);
      }
    }
  }
}
</script>
