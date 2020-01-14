<template>
  <div>
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span>全部图文</span>
      </div>
      <!-- 绘制fro表单 -->
      <el-form ref="searchFormRef" :model="searchForm" label-width="100px">
        <el-form-item label="文章状态：">
          <el-radio v-model="searchForm.status" label>全部</el-radio>
          <el-radio v-model="searchForm.status" :label="0">草稿</el-radio>
          <el-radio v-model="searchForm.status" :label="1">待审核</el-radio>
          <el-radio v-model="searchForm.status" :label="2">审核通过</el-radio>
          <el-radio v-model="searchForm.status" :label="3">审核失败</el-radio>
          <el-radio v-model="searchForm.status" :label="4">已删除</el-radio>
        </el-form-item>
        <el-form-item label="频道列表："  prop="channel_id">
           <Channel  @slt="selectHandler"></Channel>
        </el-form-item>
        <el-form-item label="时间选择：">
          <el-date-picker
            v-model="timetotime"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="yyyy-MM-dd"
          ></el-date-picker>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span>共找{{tot}}到符合的数据</span>
      </div>
      <el-table :data="articleList" style="width: 100%">
        <el-table-column label="图标">
          <img
            :src="stData.row.cover.images[0]"
            slot-scope="stData"
            alt="没有图标"
            width="150"
            height="100"
          />
        </el-table-column>
        <el-table-column prop="title" label="标题"></el-table-column>
        <el-table-column prop="status" label="状态">
          <!-- 获取文章当前的数据,来判断现在显示那个状态 -->

          <template slot-scope="stData">
            <el-tag v-if="stData.row.status===0">草稿</el-tag>
            <el-tag v-else-if="stData.row.status===1" type="success">待审核</el-tag>
            <el-tag v-else-if="stData.row.status===2" type="info">审核通过</el-tag>
            <el-tag v-else-if="stData.row.status===3" type="warning">审核失败</el-tag>
            <el-tag v-else type="danger">已删除</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="pubdate" label="发布时间"></el-table-column>
        <!-- 修改和删除 -->
        <el-table-column label="操作">
          <template slot-scope="stData">
            <el-button type="primary" size="mini" @click="$router.push(`/articleedit/${stData.row.id}`)">修改</el-button>
            <!-- 根据id进行删除 -->
          <el-button type="danger" size="mini"  @click="del(stData.row.id)">删除</el-button>
          </template>

        </el-table-column>
      </el-table>
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="searchForm.page"
        :page-sizes="[10, 20, 30, 40]"
        :page-size="searchForm.per_page"
        layout="total, sizes, prev, pager, next, jumper"
        :total="tot"
      ></el-pagination>
    </el-card>
  </div>
</template>

<script>
import Channel from '@/components/channel.vue'
export default {
  name: 'Article',
  watch: {
    searchForm: {
      handler: function (newV, oldV) {
        this.getArticleList()
      },
      deep: true
    },
    // 被检测的成员: function (newV, oldV) {
    //   // newV:数据变化后样子
    //   // oldV:数据变化前样子
    // }
    // 被检测成员一般就是data成员,它们的名称保持一致
    timetotime: function (newV) {
      // 把接收到的时间信息一分为二给到 begin_pubdate 和 end_pubdate
      if (newV) {
        this.searchForm.begin_pubdate = newV[0]
        this.searchForm.end_pubdate = newV[1]
      } else {
        // 清除时间信息
        this.searchForm.begin_pubdate = ''
        this.searchForm.end_pubdate = ''
      }
    }
  },
  components: {
    // 富文本编辑器的组件模块做注册

    Channel
  },
  data () {
    return {
      articleList: [], // 文章列表
      tot: 0, // 文章总条数

      // 搜索表单数据对象
      timetotime: '',
      searchForm: {
        page: 1,
        per_page: 10,
        begin_pubdate: '', // 文章发布开始时间
        end_pubdate: '',
        channel_id: '',
        status: ''
      }
    }
  },

  created () {
    // 获得频道信息

    // 获得文章列表信息
    this.getArticleList()
  },
  methods: {

    // 删除有关操作
    del (id) {
      // 确认事情
      this.$confirm('确认要删除该文章么?', '删除', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // axios请求服务器端实现删除
        let pro = this.$http({
          url: '/mp/v1_0/articles/' + id,
          method: 'delete'
        })
        pro
          .then(result => {
            // 删除成功
            // console.log(result)  // 返回空的data数据
            // 直接页面刷新即可
            this.getArticleList()
          })
          .catch(err => {
            return this.$message.error('删除文章失败：' + err)
          })
      }).catch(() => {
      })
    },
    // 分页相关功能
    handleSizeChange (val) {
      this.searchForm.per_page = val
    },
    handleCurrentChange (val) {
      // val变换后的页码
      this.searchForm.page = val
    },

    // 获得真实频道列表数据
    selectHandler (val) {
      this.searchForm.channel_id = val
    },
    // 获取密钥信息
    getArticleList () {
      let searchData = {}
      for (var i in this.searchForm) {
        // i:代表对象的成员属性名称, status、channel_id、begin_pudate等等
        if (this.searchForm[i] || this.searchForm[i] === 0) {
          // 成员值非空
          searchData[i] = this.searchForm[i]
        }
      }
      let pro = this.$http({
        url: '/mp/v1_0/articles',
        params: searchData,

        method: 'get'
      })
      pro
        .then(result => {
          console.log(result)
          // data接收频道数据
          this.articleList = result.data.data.results
          // 接受总条数
          this.tot = result.data.data.total_count
        })
        .catch(err => {
          return this.$message.error('获得文章失败：' + err)
        })
    }
  }
}
</script>

<style lang="less" scoped>
.box-card {
  margin-bottom: 15px;
}
.el-pagination {
  margin-top: 15px;
}
</style>
