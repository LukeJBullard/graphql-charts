import OverviewStats from '../templates/OverviewStats.vue'
import Vue from 'vue'
import VueMq from 'vue-mq'

export default function createOverviewStats(authName, apiKey, provider, elementId="chart-overviewStats")
{
  //if the container element does not exist in the dom, just return
  if (!document.getElementById(elementId))
  {
    return;
  }

  Vue.use(VueMq);

  new Vue({
    el: '#' + elementId,
    provide: provider,
    components: {
      OverviewStats
    },
    render: h => h(
      OverviewStats,
      {
        props: {
          authName,
          apiKey
        }
      }
    )
  });
}