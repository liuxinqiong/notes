import Vue from 'vue'
import App from './App'
import config from './config'
import './utils/extend'

Vue.config.productionTip = false
App.mpType = 'app'

wx.cloud.init({
    env: config.cloudEnv
})

const app = new Vue(App)
app.$mount()
