import Vue from 'vue'
import Router from 'vue-router'
import Login from './components/Login.vue'
import Home from './components/Home.vue'
import Welcome from './components/Welcome'
import Users from './components/user/Users.vue'
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
        { path: '/users', component: Users }
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
