<template>
    <span class="chart-select">
        <p class="chart-select-title" v-if="title">{{ title }}</p>
        <select v-model="selected" @change="onChange()">
            <option v-for="n in length" :key="n">{{ n }}</option>
        </select>
    </span>
</template>

<script>
export default {
    name: 'NumberSelect',
    props: {
        length: Number,
        title: String,
        initialSelection: {
            cast: Number,
            default: 0
        }
    },
    data: function(){
        return {
            selected: this.initialSelection
        }
    },
    methods: {
        onChange(){
            this.$emit('update:selected', parseInt(this.selected));
        }
    }
}
</script>

<style scoped>
.chart-select p, .chart-select select {
    display: inline;
}
.chart-select .chart-select-title {
    font-weight: bold;
    margin-right: 1em;
}
</style>
