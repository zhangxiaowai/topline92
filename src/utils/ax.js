import Vue from 'vue'
import axios from 'axios'
import router from '@/router'
import JSONbig from 'json-bigint'
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
// 配置响应拦截器
axios.interceptors.response.use(function (response) {
  // 正常响应处理
  return response
}, function (error) {
  // 非正常响应处理(包括401)
  // console.dir(error) // 对象： config request response isAxiosError toJSON
  if (error.response.status === 401) {
    // token不ok(token在服务器端已经失效了，2个小时时效)
    // 强制用户重新登录系统，以刷新服务器端的token时效
    router.push('/login')
    // 不要给做错误提示了
    return new Promise(function () {}) // 空的Promise对象，没有机会执行catch，进而不做错误提示了
  }
  // return new Promise((resolve,reject)=>{
  // reject('获得文章失败！')
  // })
  return Promise.reject(error)
})
// 真实信息id转换
axios.defaults.transformResponse = [function (data) {
  // data的返回形式有两种
  // 1. 实体字符串
  // 2. 空字符串(不能转的)
  // JSONbig.parse针对大整型进行处理，其他信息不给处理
  if (data) {
    return JSONbig.parse(data)
  }
  return data
}]
