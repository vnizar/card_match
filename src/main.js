import Vue from 'vue'
import App from './App.vue'
import VueCountdown from '@chenfengyuan/vue-countdown';

Vue.config.productionTip = false
Vue.component(VueCountdown.name, VueCountdown);

new Vue({
  render: h => h(App),
}).$mount('#app')
