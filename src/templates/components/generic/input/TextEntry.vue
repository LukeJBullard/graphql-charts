<template>
    <span class="chart-textinput">
        <p class="chart-textinput-title" v-if="title">{{ title }}</p>
        <input type="text" @change="onChange()" v-model="value" :placeholder="placeholder" />
    </span>
</template>

<script>
export default {
    name: 'TextEntry',
    props: {
        title: String,
        initialValue: {
            cast: String,
            default: ''
        },
        placeholder: {
            cast: String
        }
    },
    data: function(){
        return {
            value: this.initialValue
        }
    },
    methods: {
        onChange(){
            this.$emit('update:value', this.value);
        }
    }
}
</script>

<style scoped>
.chart-textinput p, .chart-textinput input[type=text] {
    display: inline;
}
.chart-textinput .chart-textinput-title {
    font-weight: bold;
    margin-right: 1em;
}
</style>
