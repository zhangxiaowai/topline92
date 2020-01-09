import Vue from 'vue'
import axios from 'axios'
axios.defaults.baseURL = 'http://ttapi.research.itcast.cn/'
Vue.prototype.$http = axios
// 配置请求拦截器
axios.interceptors.request.use(function (config) {
// 这里写发送请求的相关逻辑
// config:对象和defaults相当
  // 用config配置token
  // 现获取token信息
  let userinfo = window.sessionStorage.getItem('userinfo')
  // 判断token是否存在
  if (userinfo) {
    let token = JSON.parse(userinfo).token
    // 存在就把他放在请求头中
    config.headers.Authorization = 'Bearer ' + token
  }

  return config
}, function (error) {
  // Do something with request error
  return Promise.reject(error)
})
