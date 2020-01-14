
<template>
  <div class="login-container">
      <div class="login-box">
          <el-form ref="loginFormRef" :model="loginForm" :rules="loginFormRules" status-icon>
              <img src="./logo_index.png" >
          <el-form-item prop="mobile">
            <el-input v-model="loginForm.mobile" placeholder="请输入手机号码">   <i slot="prefix" class="iconfont icon-iconfontshouji"></i></el-input>
          </el-form-item>
          <el-form-item prop="code">
            <el-input v-model="loginForm.code"  placeholder="请输入校验码"> <i slot="prefix" class="iconfont icon-yanzhengma"></i></el-input>
          </el-form-item>
          <el-form-item style="text-align: left;" prop="xieyi">
            <el-checkbox v-model="loginForm.xieyi"></el-checkbox>
            <span>我已阅读并同意<a href="#">用户协议</a>和<a href="#">隐私条款</a></span>
          </el-form-item>
          <el-form-item>
            <el-button style="width:100%;" :loading="isActive" :disabled="isActive"  type="primary" @click="login()">进入游戏</el-button>
          </el-form-item>
        </el-form>
      </div>
  </div>
</template>

<script>
import './gt'
// 导入小图标
import '@/assets/iconfont/iconfont.css'
export default {
  name: 'Login',
  data () {
    var xieyiTest = function (rule, value, callback) {
      value ? callback() : callback(new Error('请无条件遵守规矩'))
    }

    return {
      ctaObj: null,
      isActive: false,

      loginForm: {

        mobile: '',
        code: '',
        xieyi: ''
      },
      loginFormRules: {
        mobile: [
          { required: true, message: '手机号码必填' },
          { pattern: /^1[35789]\d{9}$/, message: '手机号码格式不对' }
        ],
        code: [
          { required: true, message: '验证码必填' }
        ],
        xieyi: [
          { validator: xieyiTest }
        ]
      }
    }
  },
  methods: {
    login () {
      // 表单要做校验
      // el-form表单对象.validate()
      // console.log(this)
      // this.$refs.loginFormRef // 获得el-form的组件对象
      // this.$refs.loginFormRef.validate(回调函数)
      this.$refs.loginFormRef.validate(valid => {
        // valid:true 校验通过
        // valid:false 校验失败
        // 校验失败，代码停止
        if (!valid) { return false }
        this.isActive = true

        // A. 人机交互验证
        // axios获得极验的秘钥信息
        let pro = this.$http({
          url: '/mp/v1_0/captchas/' + this.loginForm.mobile,
          method: 'get'
        })
        pro
          .then(result => {
            // console.log(result) // 极验的秘钥信息

            // 从result里边解构下述的data对象出来(对象结构赋值)
            let { data } = result.data
            // 请检测data的数据结构， 保证data.gt, data.challenge, data.success有值
            window.initGeetest({
              // 以下配置参数来自服务端 SDK
              gt: data.gt,
              challenge: data.challenge,
              offline: !data.success,
              new_captcha: true,
              product: 'bind' // 设置验证窗口样式的
            }, captchaObj => {
              // 这里可以调用验证实例 captchaObj 的实例方法
              captchaObj.onReady(() => {
                // 验证码ready之后才能调用verify方法显示验证码(可以显示窗口了)
                captchaObj.verify() // 显示验证码窗口
                this.isActive = false
                this.ctaObj = captchaObj
              }).onSuccess(() => {
                // 行为校验正确的处理
                // B. 验证账号，登录系统
                this.loginAct()
                this.isActive = false
              }).onError(() => {
                // 行为校验错误的处理
              })
            })
          })
          .catch(err => {
            return this.$message.error('获取极验秘钥失败：' + err)
          })
      })
    },

    // 账号真实性校验，并登录系统
    loginAct () {
      // 服务器端账号真实校验
      let pro = this.$http({
        url: '/mp/v1_0/authorizations',
        method: 'POST',
        data: this.loginForm
      })
      pro
        .then(result => {
          // console.log(result) // 【data】  status statusText headers config request
          // 客户端浏览器把服务器端返回的秘钥等相关信息通过 sessionStorage 做记录，表明是登录状态
          window.sessionStorage.setItem('userinfo', JSON.stringify(result.data.data))
          // 进入后台系统
          this.$router.push({ name: 'home' })
        })
        .catch(err => {
          // 通过弹出框把错误显示出来
          // console.log('手机号码或验证码错误:' + err)
          // this.$message({
          //   type: 'error',
          //   message: '手机号码或验证码错误:' + err,
          //   duration:1000
          // })
          // 上下效果一致
          this.$message.error('手机号码或验证码错误:' + err)
        })
    }
  }
}
</script>

<style lang="less" scoped>
.login-container{
    height: 100%;
    background-image: url('./login_bg.jpg');
    background-size: cover;
    display: flex;
    justify-content: center;
    align-items: center;
    .login-box{
        width: 410px;
        height: 345px;
        background-color: rgba(255, 255, 255, 1);
        display: flex;
        justify-content: center;
        align-items: center;
        .el-form{
            width: 70%;
            text-align: center;
            img{
                width: 60%;
            }
        }
    }
}
</style>
