<template>
    <div class="chartContainer" v-if="data.length > 0">
        <svg :width="width" :height="height" preserveAspectRatio="none">
            <g :style="{transform: `translate(${margin.left}px, ${margin.top}px)`}">
                <g class="y axis" v-axis:y="scaled"></g>
                <g
                    v-for="(d, index) in uniqueData"
                    :key="index"
                    v-tooltip="typeof(formatter.tooltip) === 'function' ?
                                    formatter.tooltip(d)
                                    : defaultFormatter.tooltip(d)">
                    <rect
                        class="bar"
                        :y="scaled.y ?
                                scaled.y(
                                    typeof(formatter.label) === 'function' ?
                                        formatter.label(d.name)
                                        : defaultFormatter.label(d.name)
                                )
                            : 0"
                        :height="scaled.y ? scaled.y.bandwidth() : 0"
                        x="0"
                        :width="Math.max(0,scaled.x(getValue(d)))">
                    </rect>
                    <text
                        class="label"
                        :y="scaled.y ?
                                scaled.y(
                                    typeof(formatter.label) === 'function' ?
                                        formatter.label(d.name)
                                        : defaultFormatter.label(d.name)
                                ) + scaled.y.bandwidth() / 2 + 4
                            : 0"
                        :x="scaled.x ? scaled.x(getValue(d)) + 3 : 0">
                        {{ typeof(formatter.value) === "function" ? formatter.value(d.value) : defaultFormatter.value(d.value) }}
                    </text>
                </g>
            </g>
        </svg>
    </div>
    <div class="noData" v-else>
        <h2>No Data</h2>
    </div>
</template>

<script>
import * as d3 from 'd3';
import { VTooltip } from 'v-tooltip';

VTooltip.options.disposeTimeout = 100;
VTooltip.options.trigger = "hover";
VTooltip.options.defaultTemplate = `<div class="vue-tooltip" role="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>`;

const defaultFormatter = {
    value: (value) => value,
    tooltip: (row) => row.value.toString(),
    label: (name) => name
};

const props = {
  //the data to present in the chart
  data: {
    type: Array,
    default: () => [
        {name: "Aa", value: 95}
    ],
  },

  //formatter
  //    .value(value) takes an input row's value and returns (string) the value to show on the right side of the bar
  //    .tooltip(row) takes an input row object and returns (string) the html to put in the tooltip
  //    .label(name) takes an input row's name value and returns (string) the label to put on the left side of the bar
  formatter: {
      type: Object,
      default: () => defaultFormatter
  },

  //returns the numeric value for the row that is used to calculate the bar size
  getValue: {
      type: Function,
      default: (row) => parseInt(row.value)
  },

  //the margin in pixels surrounding the chart
  margin: {
    type: Object,
    default: () => ({
        left: 60,
        right: 25,
        top: 15,
        bottom: 15,
    }),
  },

  //a flag passed from parent components. the value will be changed when the graph should reinitialize
  resized: {
    type: Boolean,
    default: false
  }
};

export default {
    name: 'HorizontalBarChart',
    props,
    data() {
        return {
            //width and height of the graph.
            //this will be calculated dynamically and these are placeholder values
            width: 0,
            height: 100,
            defaultFormatter
        };
    },
    computed: {
        //the dimensions of the chart excluding the padding
        padded() {
            const width = this.width - this.margin.left - this.margin.right;
            const height = this.height - this.margin.top - this.margin.bottom;
            return { width, height };
        },

        //adds a number to the end of duplicate names
        uniqueData() {
            if (typeof(this.data) !== "object" || this.data.length < 1)
            {
                return [];
            }

            var occurrances = {};
            var uniqueOutput = [];
            this.data.forEach(function(value, index){
                if (typeof(occurrances[value.name]) === "number")
                {
                    value.name += " " + (occurrances[value.name]++).toString();
                    uniqueOutput.push(value);
                    return;
                }

                occurrances[value.name] = 1;
                uniqueOutput.push(value);
            });

            return uniqueOutput;
        },

        //the d3 scales defining the x and y axises on the chart
        scaled: (function(d3){
            return function() {
                return {
                    x: d3.scaleLinear()
                        .range([0, this.padded.width])
                        .domain([0, d3.max(this.uniqueData,
                            (function(self) {
                                return function(d){
                                    return self.getValue(d);
                                }
                            })(this)
                        )]),

                    y: d3.scaleBand()
                        .range([0, this.padded.height])
                        .padding(0.1)
                        .domain(this.uniqueData.map(
                            (function(self){
                                return function(d){
                                    return typeof(self.formatter.label) === "function" ? self.formatter.label(d.name) : defaultFormatter.label(d.name);
                                }
                            })(this)
                        ))
                };
            };
        })(d3)
    },

    mounted() {
        setTimeout(()=>{
            window.addEventListener('resize', this.onResize);
            this.onResize();
            this.initialize();
        },400);
    },

    beforeDestroy() {
        window.removeEventListener('resize', this.onResize);
    },

    //when the width and height change, reinitialize
    //when the page is resized or the resized flag is changed, call onResize (which then calls initialize)
    watch: {
        width() {
            this.initialize();
        },
        height() {
            this.initialize();
        },
        resized() {
            this.onResize();
        },
        data() {
            this.initialize();
        }
    },

    methods: {
        initialize() {
            d3.axisLeft().scale(this.scaled.y).tickSize(0);
            d3.axisBottom().scale(this.scaled.x);

            //push the number of rows in the chart to the parent
            this.$emit('update:rowCount', this.uniqueData.length);
        },

        onResize() {
            this.width = this.$el.offsetWidth;
            this.height = this.$el.offsetHeight;
        }
    },

    directives: {
        //v-axis
        axis(el, binding) {
            const axis = binding.arg;
            const axisMethod = { x: "axisBottom", y: "axisLeft" }[axis];
            const methodArg = binding.value[axis];

            d3.select(el).call(d3[axisMethod](methodArg));
        },
        //v-tooltip
        tooltip: VTooltip
    }
};
</script>

<style scoped>
    .chartContainer {
        overflow: hidden;
        width: 100%;
        height: 100%;
    }

    .chartContainer svg {
        height: 100%;
        width: 100%;
    }

    .bar {
        fill: #5f89ad;
    }
    
    .axis {
        font-size: 13px;
    }
    
    .axis path,
    .axis line {
        fill: none;
        display: none;
    }
    
    .label {
        font-size: 13px;
    }

    .noData {
        text-align: center;
        font-weight: bold;
    }
</style>