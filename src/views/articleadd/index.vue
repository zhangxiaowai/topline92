<template>
  <el-card class="box-card">
    <div slot="header" class="clearfix">
      <span>发表文章</span>
    </div>
    <el-form ref="addFormRef" :model="addForm" label-width="120px" :rules="addFormRules">
      <el-form-item label="标题：" prop="title">
        <el-input v-model="addForm.title"></el-input>
      </el-form-item>
      <el-form-item label="内容" prop="content">
        <quill-editor v-model="addForm.content"></quill-editor>
      </el-form-item>
      <el-form-item label="封面：">
        <!-- el-radio-group 是el-radio的父级把v-mo绑在他身上就不用了一一绑定 -->
        <el-radio-group v-model="addForm.cover.type">
          <el-radio :label="1">单图</el-radio>
          <el-radio :label="3">三图</el-radio>
          <el-radio :label="0">无图</el-radio>
          <el-radio :label="-1">自动</el-radio>
        </el-radio-group>
        <ul>
          <li class="uploadbox" v-for="item in covernum" :key="item" @click='showDialong()'>
            <span>点击图标选择图片</span>
            <div class="el-icon-picture-outline"></div>
          </li>
        </ul>
      </el-form-item>
      <el-form-item label="频道：" prop="channel_id">
        <Channel @slt="selectHandler"></Channel>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="addarticle(false)">发布</el-button>
        <el-button @click="addarticle(true)">存入草稿</el-button>
      </el-form-item>
    </el-form>
  <el-dialog title="提示" :visible.sync="dialogVisible" width="60%">
  <!-- 标签切换效果 -->
  <el-tabs v-model="activeName" type="card">
    <el-tab-pane label="素材库" name="first">
      <!-- 素材图片列表展示 -->
      <ul>
        <li class="image-box" v-for="item in imageList" :key="item.id">
          <img :src="item.url" alt="没有图片"  @click="clkImage">
        </li>
      </ul>
    </el-tab-pane>
    <el-tab-pane label="上传图片" name="second">
      <el-button type="primary">上传图片</el-button>
    </el-tab-pane>
  </el-tabs>

  <span slot="footer" class="dialog-footer">
    <el-button @click="dialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="dialogVisible = false">确 定</el-button>
  </span>
</el-dialog>

  </el-card>
</template>

<script>
// 引入频道相关的组件
import Channel from '@/components/channel.vue'
// 导入富文本编辑器的css样式
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'

// 导入富文本编辑器的组件部分
import { quillEditor } from 'vue-quill-editor'
export default {
  name: 'ArticleAdd',
  // 计算属性
  computed: {
    covernum () {
      // 设计选择框显示个数
      // type>0  ========= type值
      // type<=0 ==========0 值
      if (this.addForm.cover.type > 0) {
        return this.addForm.cover.type
      }
      return 0
    }
  },
  components: {
    // 简易成员赋值 quillEditor: quillEditor
    // 组件使用两种方式：<quillEditor></quillEditor> 或 <quill-editor></quill-editor>
    quillEditor,
    Channel
  },
  created () {
    this.getImageList()
  },

  data () {
    return {
      activeName: false,
      // 添加图片
      imageList: [], // 已有素材列表信息
      // 获得素材图片的条件信息
      querycdt: {
        collect: false,
        page: 1,
        per_page: 20
      },
      dialogVisible: false,
      // 表单效验
      // 表单校验规则
      addForm: {
        title: '', // 文章标题
        content: '', // 文章内容
        cover: {
          type: 0, // 封面类型 -1:自动，0-无图，1-1张，3-3张
          images: []
        },
        channel_id: '' // 频道
      },
      addFormRules: {
        title: [
          { required: true, message: '标题必填' },
          // 后端要求title长度介于5-30个字符
          {
            min: 5,
            max: 30,
            message: '标题长度介于5-30个字符'
          }
        ],
        content: [{ required: true, message: '内容必填' }],
        channel_id: [{ required: true, message: '频道必选' }]
      }
    }
  },
  //   生命周期第一时间调用

  methods: {
    // 图片被选中
    clkImage (evt) {
      // evt:事件对象
      // console.log(evt) // MouseEvent
      // evt.target: 目标被单击的dom的img对象
      // evt.target.parentNode // 获得父级li标签对象
      // 给li设置border边框效果

      // 全部项目的border都清除
      let lis = document.querySelectorAll('.image-box')
      for (var i = 0; i < lis.length; i++) {
        lis[i].style.border = ''
      }

      // 当前选中项目的border给设置好
      let nowli = evt.target.parentNode
      nowli.style.border = '5px solid green'
    },
    // 修改图片
    getImageList () {
      let pro = this.$http({
        url: '/mp/v1_0/user/images',
        method: 'get',
        params: this.querycdt
      })
      pro
        .then(result => {
          // console.log(result)
          // imageList接收素材图片
          this.imageList = result.data.data.results
        })
        .catch(err => {
          return this.$message.error('获得图片列表失败：' + err)
        })
    },
    // 点击弹出框
    showDialong () {
      this.dialogVisible = true
    },
    // 下拉列表的数据
    selectHandler (val) {
      this.addForm.channel_id = val
    },
    // 发表文章
    // @flag: false代表发布 true草稿
    addarticle (flag) {
      // 表单整体校验
      this.$refs.addFormRef.validate(valid => {
        // 校验失败停止后续执行
        if (!valid) {
          return false
        }

        // 继续
        // axios
        let pro = this.$http({
          url: '/mp/v1_0/articles',
          method: 'post',
          data: this.addForm, // 表单数据
          params: { draft: flag } // 请求字符串数据
        })
        pro
          .then(result => {
            this.$message.success('发布文章成功！')
            // console.log(result)
            // 跳转到列表页面
            this.$router.push({ name: 'article' })
          })
          .catch(err => {
            return this.$message.error('发布文章失败：' + err)
          })
      })
    }
  }
}
</script>

<style lang="less" scoped>
// 对话框素材图片列表相关css样式
.image-box {
  list-style: none;
  width: 200px;
  height: 140px;
  background-color: #fff;
  margin: 10px;
  float: left;
  border: 1px solid #eee;
  cursor:pointer;
  box-sizing:border-box;
  img {
    width: 100%;
    height: 100%;
  }
}
// 文章封面选择框样式
.uploadbox {
  list-style: none;
  width: 200px;
  height: 200px;
  margin: 10px;
  float: left;
  cursor: pointer;
  border: 1px solid #eee;
  span {
    width: 200px;
    height: 50px;
    line-height: 50px;
    display: block;
    text-align: center;
  }
  div {
    width: 200px;
    height: 150px;
    font-size: 100px;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #fff;
  }
  img{
    width: 200px;
    height: 150px;
  }
}
.quill-editor /deep/ .ql-editor {
  height: 200px;
}
// 上述样式解析完毕：.quill-editor[data-v-494db270] .ql-editor{height:200px;}
</style>
