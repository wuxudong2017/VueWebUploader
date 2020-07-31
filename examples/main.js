import Vue from 'vue'
import App from './App.vue'

Vue.config.productionTip = false

import VueWebUpload from '../packages/index'
Vue.use(VueWebUpload)



new Vue({
    render: h => h(App),
}).$mount('#app')