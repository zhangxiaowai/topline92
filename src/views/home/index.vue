<template>
  <el-container>
    <el-aside :width=" isCollapse?'65px':'200px'">
      <el-menu

        background-color="#353B4E"
        text-color="#fff"
      active-text-color="#409EFF"
     :collapse="isCollapse"
     :collapse-transition="false"
     router
      >
         <el-menu-item index="/welcome" :style="{width:isCollapse?'65px':'200px'}">
        <i class="el-icon-location"></i>
        <span slot="title">首页</span>
      </el-menu-item>
      <el-submenu index="2" :style="{width:isCollapse?'65px':'200px'}">
        <template slot="title">
          <i class="el-icon-menu"></i>
          <span>内容管理</span>
        </template>
        <el-menu-item index="/articleadd">发布文章</el-menu-item>
        <el-menu-item index="/article">文章列表</el-menu-item>
        <el-menu-item index="2-3">评论列表</el-menu-item>
        <el-menu-item index="/material">素材管理</el-menu-item>
      </el-submenu>
      <el-menu-item index="3" :style="{width:isCollapse?'65px':'200px'}">
        <i class="el-icon-location"></i>
        <span slot="title">粉丝管理</span>
      </el-menu-item>
      <el-menu-item index="/account" :style="{width:isCollapse?'65px':'200px'}">
        <i class="el-icon-location"></i>
        <span slot="title">账户管理</span>
      </el-menu-item>
      </el-menu>
    </el-aside>
    <el-container>
      <el-header>
        <div class="lt">
          <i :class="isCollapse?'el-icon-s-unfold':'el-icon-s-fold'" @click="isCollapse=!isCollapse"></i>
          <span>江苏传智播客教育科技股份有限公司</span>
        </div>
        <div class="rt">
          <el-input style="width:180px" placeholder="请输入内容">
            <i slot="prefix" class="el-input__icon el-icon-search"></i>
          </el-input>
          <span style="margin:0 10px">消息</span>
          <!-- 下來彩帶 -->
          <el-dropdown>
            <span class="el-dropdown-link">
              <img :src=" photo" alt width="35px" height="35" />
              {{name}}
              <i class="el-icon-arrow-down el-icon--right"></i>
            </span>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item>个人信息</el-dropdown-item>
              <el-dropdown-item>git退出</el-dropdown-item>
              <el-dropdown-item @click.native="logout()">退出</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </div>
      </el-header>
      <el-main>
        <!-- 子组件显示占位符 -->
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>
<script>
import bus from '@/utils/bus.js'
export default {
  name: 'Home',
  // 计算属性
  computed: {
    // 获得账户名称
    name: function () {
      return this.tmpname || JSON.parse(window.sessionStorage.getItem('userinfo')).name
    },
    // 获得账户头像
    photo: function () {
      return this.tmpphoto || JSON.parse(window.sessionStorage.getItem('userinfo')).photo
    }
  },
  data () {
    return {
      // 名称临时成员用来解决响应
      tmpname: '',
      // 头像临时成员
      tmpphoto: '',
      // 为false就展开,为true就折叠
      isCollapse: true
    }
  },
  created () {
    // 总共更新两个 名称和头像
    // 1更新名称
    bus.$on('upAccountName', nm => {
      // 更新sessionStorage中name的信息
      let userinfo = JSON.parse(window.sessionStorage.getItem('userinfo'))
      userinfo.name = nm
      this.tmpname = nm
      window.sessionStorage.setItem('userinfo', JSON.stringify(userinfo))
    })
    // 更新头像
    bus.$on('upAccountPhoto', ph => {
    // 更新sessionStorage中photo的信息
      let userinfo = JSON.parse(window.sessionStorage.getItem('userinfo'))
      userinfo.photo = ph
      window.sessionStorage.setItem('userinfo', JSON.stringify(userinfo))
      // 更新临时成员tmpphoto
      this.tmpphoto = ph
    })
  },
  methods: {
    logout () {
      // 确认
      this.$confirm('确认要退出系统么?', '退出', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // 清空sessionStorage数据
        window.sessionStorage.clear()
        // 导航到登录页面
        this.$router.push({ name: 'login' })
      }).catch(() => {
      })
    }
  }
}
</script>
<style lang="less" scoped>
.el-container {
  height: 100%;
  .el-aside {
    background-color: #323745;
  }
  .el-header {
    background-color: orange;
    display: flex;
    justify-content: space-between;
    .lt {
      width: 40%;
      background: lightblue;
      display: flex;
      align-items: center;
      font-size: 19px;
      color: rgb(44, 62, 80);
      i {
        margin-right: 10px;
        font-size: 25px;
      }
    }
    .rt {
      width: 60%;
      background: white;
      display: flex;
      justify-content: flex-end;
      align-items: center;
      .el-dropdown {
        span {
          display: flex;
          align-items: center;
        }
        img {
          margin-right: 10px;
          border-radius: 50%;
        }
      }
    }
  }
  .el-main {
    background-color: #f2f3f5;
  }
}
</style>
