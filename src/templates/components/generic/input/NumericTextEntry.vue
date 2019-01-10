<template>
    <span class="chart-num-textinput">
        <p class="chart-num-textinput-title" v-if="title">{{ title }}</p>
        <input type="number" @change="onChange()" v-model="value" :min="min" :max="max" />
    </span>
</template>

<script>
export default {
    name: 'NumericTextEntry',
    props: {
        title: String,
        initialValue: {
            cast: Number
        },
        max: {
            cast: Number
        },
        min: {
            cast: Number
        }
    },
    data: function(){
        return {
            value:
            //initial value is set
            (typeof(this.initialValue) === "number"
             && this.initialValue !== null
              && //if min value is set make sure initial value is in range
              (
                (
                  //min value is set and initial value is in range
                  typeof(this.min) === "number"
                  && this.min !== null
                  && this.initialValue >= this.min
                )
                || //min value is not set
                (
                  typeof(this.min) !== "number"
                  || this.min === null
                )
              )
              && //if max value is set make sure initial value is in range
              (
                (
                  //max value is set and initial value is in range
                  typeof(this.max) === "number"
                  && this.max !== null
                  && this.initialValue <= this.max
                )
                || //max value not set
                (
                  typeof(this.max) !== "number"
                  || this.max === null
                )
              )
            ) ? this.initialValue : 0
        }
    },
    methods: {
        onChange(){
            this.$emit('update:value', parseInt(this.value));
        }
    }
}
</script>

<style scoped>
.chart-num-textinput p, .chart-num-textinput input[type=text] {
    display: inline;
}
.chart-num-textinput .chart-num-textinput-title {
    font-weight: bold;
    margin-right: 1em;
}
</style>
