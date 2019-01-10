<template>
    <div class="chart-text" v-if="titleFirst">
        <p class="chart-text-title chart-text-first">{{ title }}</p>
        <p class="chart-text-message">{{ message }}</p>
    </div>
    <div class="chart-text" v-else>
        <p class="chart-text-message chart-text-first">{{ message }}</p>
        <p class="chart-text-title">{{ title }}</p>
    </div>
</template>

<script>
import VueCastProps from 'vue-cast-props'
export default {
    name: 'TextReport',
    props: {
        title: String,
        message: {
            cast: String
        },
        titleFirst: {
            type: Boolean,
            default: true
        }
    },
    components: {
        VueCastProps
    }
}
</script>

<style scoped>
p {
    display: inline;
    word-wrap: break-word;
}

.chart-text-first {
    display: inline-block;
    font-weight: bold;
    margin-bottom: 0.25em;
}

p:not(.chart-text-first) {
    margin-top: 0;
    padding-left: 2em;
}
</style>
