<template>
  <el-card class="box-card">
    <div slot="header" class="clearfix">
      <span>修改文章</span>
    </div>
    <el-form ref="editFormRef" :model="editForm" label-width="100px" :rules="editFormRules">
      <el-form-item label="标题" prop="title">
        <el-input v-model="editForm.title"></el-input>
      </el-form-item>
      <el-form-item label="内容" prop="content">
        <!-- quill-editor最后编译变成许多html标签，它们身上没有data-v-xx的属性 -->
        <quill-editor v-model="editForm.content"></quill-editor>
      </el-form-item>
      <el-form-item label="封面">
        <!-- el-radio-group是el-radio单选按钮的父标签，可以统一设置v-model或change事件等 -->
        <el-radio-group v-model="editForm.cover.type">
          <el-radio :label="1">单图</el-radio>
          <el-radio :label="3">三图</el-radio>
          <el-radio :label="0">无图</el-radio>
          <el-radio :label="-1">自动</el-radio>
        </el-radio-group>
      </el-form-item>
     <el-form-item label="频道：" prop="channel_id">
        <Channel  @slt="selectHandler"  :chid="editForm.channel_id"></Channel>
        <!-- <Channel  @slt="selectHandler"  ></Channel> -->
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="editarticle(false)">修改</el-button>
        <el-button @click="editarticle(true)">存入草稿</el-button>
      </el-form-item>
    </el-form>
  </el-card>
</template>

<script>
import Channel from '@/components/channel.vue'
// 导入富文本编辑器的css样式文件
// vue-quill-editor 是构建在quill基础之上的(是进一步的封装)
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'
// 导入富文本编辑器的组件模块
import { quillEditor } from 'vue-quill-editor'

export default {
  name: 'ArticleEdit',
  components: {
    // 富文本编辑器的组件模块做注册
    quillEditor,
    Channel
  },
  data () {
    return {

      // 修改文章表单数据对象
      editForm: {
        title: '', // 文章标题
        content: '', // 文章内容
        // 文章封面
        cover: {
          type: 0, // 封面类型 -1:自动，0-无图，1-1张，3-3张
          images: [] // 封面图片 路径名集合
        },
        channel_id: '' // 频道
      },
      // 表单校验规则
      editFormRules: {
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
  computed: {
    // 被修改文章id
    aid () {
      return this.$route.params.aid
    }
  },
  created () {
    // 获得频道

    this.getArticleById() // 获得指定文章
  },
  methods: {
    // 获取被修改的id的信息
    getArticleById () {
      // axios带着id请求服务器端
      let pro = this.$http({
        url: '/mp/v1_0/articles/' + this.aid,
        method: 'get'
      })
      pro
        .then(result => {
          // console.log(result)
          // editForm表单对象接收修改文章信息
          this.editForm = result.data.data
        })
        .catch(err => {
          return this.$message.error('获取文章失败：' + err)
        })
    },

    // 修改文章
    // @flag: false修改   true草稿
    editarticle (flag) {
      // 表单整体校验
      this.$refs.editFormRef.validate(valid => {
        // 校验失败停止后续执行
        if (!valid) { return false }

        // 继续
        // axios
        let pro = this.$http({
          url: '/mp/v1_0/articles/' + this.aid,
          method: 'put',
          data: this.editForm, // 表单数据
          params: { draft: flag } // 请求字符串数据
        })
        pro
          .then(result => {
            this.$message.success('修改文章成功！')
            // console.log(result)
            // 跳转到列表页面
            this.$router.push({ name: 'article' })
          })
          .catch(err => {
            return this.$message.error('修改文章失败：' + err)
          })
      })
    },
    selectHandler (val) {
      this.editForm.channel_id = val
    }
  }
}
</script>

<style lang="less" scoped>
/*控制富文本编辑器的高度样式*/
// .ql-editor{height:200px;}  // 编译变为.ql-editor[data-v-494db270] { height: 200px; } 失效的

/*使用深度作用选择器
  /deep/深度作用选择器作用： 前边的会关联data-v-xx属性，而后边的不会关联
*/
.quill-editor /deep/ .ql-editor {
  height: 200px;
}
// 上述样式解析完毕：.quill-editor[data-v-494db270] .ql-editor{height:200px;}
</style>
