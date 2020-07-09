import Upload from './components/index.vue'
import {Message,Progress} from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
const install  = (Vue)=>{
    Vue.component(Upload.name,Upload);
    Vue.prototype.$message = Message;
    Vue.use(Progress)
}
if(typeof window!=="undefined"&&window.Vue){
    window.Vue.use(install)
}

export default install

