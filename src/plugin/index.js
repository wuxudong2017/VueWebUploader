import WebUpload from './components/index.vue'
import { Message, Progress, Button, Upload } from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
const install = (Vue) => {
    Vue.component(WebUpload.name, WebUpload);
    Vue.prototype.$message = Message;
    Vue.use(Progress)
    Vue.use(Button)
    Vue.use(Upload)
}
if (typeof window !== "undefined" && window.Vue) {
    window.Vue.use(install)
}

export default install