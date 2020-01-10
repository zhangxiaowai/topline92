import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [
  {
    path: '/login',

    name: 'login',
    component: () => import('@/views/login')
  },
  {
    path: '/home',
    name: 'home',
    component: () => import('@/views/home'),
    redirect: '/welcome', // 路由重定向
    children: [
      // 欢迎页面子路由配置
      { path: '/welcome', name: 'welcome', component: () => import('@/views/welcome') },
      { path: '/article', name: 'article', component: () => import('@/views/article') }
    ]
  }
]

const router = new VueRouter({
  routes

})
router.beforeEach((to, from, next) => {
  // 用户如果是"非登录"状态，并且其还要访问 非登录 页面，那么就强制登录去
  var userinfo = window.sessionStorage.getItem('userinfo')
  if (!userinfo && to.path !== '/login') {
    // 路由导航到登录页面
    return next('/login') // ok
  }
  next()
})
export default router
