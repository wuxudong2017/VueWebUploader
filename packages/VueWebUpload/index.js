// 单个组件
import VueWebUpload from './VueWebUpload'
VueWebUpload.install = function(Vue, options) {
    Vue.component(VueWebUpload.name, VueWebUpload)
}
export default VueWebUpload