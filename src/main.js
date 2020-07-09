import Vue from 'vue'
import App from './App.vue'

Vue.config.productionTip = false

import WUpload from './plugin/index'
Vue.use(WUpload)



new Vue({
  render: h => h(App),
}).$mount('#app')
