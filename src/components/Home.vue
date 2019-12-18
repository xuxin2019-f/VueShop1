<template>
  <el-container class="home-container">
    <!--头部区域-->
    <el-header>
      <div>
        <img src="../assets/heima.png" alt="">
        <span>小许的后台管理系统</span>
      </div>
      <el-button type="info" @click="logout">退出</el-button></el-header>
    <!--页面主题区域-->
    <el-container>
      <!--侧边栏-->
      <el-aside width="200px">
        <div class="toggle-button" @click="toggleCollapse">|||</div>
        <el-menu
          background-color="#333744"
          text-color="#fff"
          active-text-color="#409EFF"
          unique-opened
          :collapse="isCollapse"
          :collapse-transition="false"
          router
          :default-active="activePath"
        >
          <el-submenu :index="item.id + ''" v-for="item in menulist" :key="item.id">
            <template slot="title">
              <i :class="iconsObj[item.id]"></i>
              <span>{{item.authName}}</span>
            </template>
            <el-menu-item :index="'/'+subItem.path +''" v-for="subItem in item.children" :key="subItem.id" @click="saveNavState('/'+subItem.path)">
               <template slot="title">
                <i class="el-icon-menu"></i>
                <span>{{subItem.authName}}</span>
               </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <!--左边主题区域-->
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  data() {
    return {
      menulist: [],
      iconsObj: {
        '125': 'iconfont icon-user',
        '103': 'iconfont icon-tijikongjian',
        '101': 'iconfont icon-shangpin',
        '102': 'iconfont icon-danju',
        '145': 'iconfont icon-baobiao'
      },
      isCollapse: true,
      activePath: ''
    }
  },
  // 生命周期
  created () {
    // 获取后台的侧边栏的表单数据
    this.getmenulist()
    this.activePath = window.sessionStorage.getItem('activePath')
  },
  methods: {
    logout () {
      window.sessionStorage.clear()
      this.$router.push('/login')
    },
    async getmenulist () {
      const { data } = await this.$http.get('/menus')
      if (data.meta.status !== 200) return console.log(data.meta.msg)
      this.menulist = data.data
      console.log(this.menulist)
    },
    toggleCollapse () {
      this.isCollapse = !this.isCollapse
    },
    saveNavState(path) {
      this.activePath = path
      window.sessionStorage.setItem('activePath', path)
    }
  }
}
</script>

<style lang="less" scoped>
  .home-container {
    height: 100%;
  }
  .el-header {
    background-color: #373d41;
    display: flex;
    justify-content: space-between;
    padding-left: 0;
    align-items: center;
    color: #fff;
    font-size: 20px;
  > div {
    display: flex;
    align-items: center;
  span {
    margin-left: 15px;
  }
  }
  }
  .el-aside{
    background-color:#333744;
    .el-menu{
      border-right: 0px;
    }
  }
  .el-main{
    background-color:#eaedf1;
  }
  .iconfont {
    margin-right: 10px;
  }
  .toggle-button {
    background-color: #4a5064;
    font-size: 10px;
    line-height: 24px;
    color: #fff;
    text-align: center;
    letter-spacing: 0.2em;
    cursor: pointer;
  }
</style>
