import Vue from 'vue'
import Router from 'vue-router'
import Login from './components/Login.vue'
import Home from './components/Home.vue'
import Welcome from './components/Welcome'
import Users from './components/user/Users.vue'
import Rights from './components/power/Rights.vue'
import Roles from './components/power/Roles.vue'
import Cate from './components/goods/Cate.vue'
import Params from './components/goods/Param.vue'
import GoodsList from './components/goods/List.vue'
import GoodsAdd from './components/goods/Add.vue'
import Orders from './components/order/Orders.vue'
import Report from './components/report/Report.vue'
Vue.use(Router)

// export default new Router({
//   routes:[
//     { path:'/',redirect:'/login'},
//     { path:'/login',component: Login }
//   ]
// })
const router = new Router({
  routes: [
    { path: '/', redirect: '/login' },
    { path: '/login', component: Login },
    { path: '/home',
      component: Home,
      redirect: '/welcome',
      children: [
        { path: '/welcome', component: Welcome },
        { path: '/users', component: Users },
        { path: '/rights', component: Rights },
        { path: '/roles', component: Roles },
        { path: '/categories', component: Cate },
        { path: '/params', component: Params },
        { path: '/goods', component: GoodsList },
        { path: '/goods/add', component: GoodsAdd },
        { path: '/orders', component: Orders },
        { path: '/reports', component: Report }
      ] }
  ]
})
router.beforeEach((to, from, next) => {
  if (to.path === '/login') return next()
  const tokenresult = window.sessionStorage.getItem('token')
  if (!tokenresult) return next('/login')
  next()
})
export default router
