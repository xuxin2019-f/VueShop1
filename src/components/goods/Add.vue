<template>
  <div>
    <h3>添加商品</h3>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>
    <!--卡片视图区-->
    <el-card>
      <el-alert
        title="添加商品信息"
        center
        type="info"
        show-icon :closable="false">
      </el-alert>
      <el-steps :space="200" :active="activeindex-0" finish-status="success" align-center>
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>
      <!--tab栏-->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px" label-position="top">
      <el-tabs :tab-position="'left'" v-model="activeindex" :before-leave="beforeTableave" @tab-click="tabclicked">
        <el-tab-pane label="基本信息" name="0">
          <el-form-item label="商品名称" prop="goods_name">
            <el-input v-model="addForm.goods_name"></el-input>
          </el-form-item>
          <el-form-item label="商品价格" prop="goods_price">
            <el-input v-model="addForm.goods_price" type="number"></el-input>
          </el-form-item>
          <el-form-item label="商品重量" prop="goods_weight">
            <el-input v-model="addForm.goods_weight" type="number"></el-input>
          </el-form-item>
          <el-form-item label="商品数量" prop="goods_number">
            <el-input v-model="addForm.goods_number" type="number"></el-input>
          </el-form-item>
          <el-form-item label="商品分类" prop="goods_cat">
            <!-- 选择商品分类的级联选择框 -->
            <el-cascader expandTrigger='hover' v-model="addForm.goods_cat" :options="cateList" :props="cateProps" @change="handleChange" clearable></el-cascader>
          </el-form-item>
        </el-tab-pane>
        <el-tab-pane label="商品参数" name="1">
          <!--渲染表单item项-->
          <el-form-item v-for="item in manyTableData" :label="item.attr_name" :key="item.attr_id">
            <!--复选框-->
            <el-checkbox-group v-model="item.attr_vals">
              <el-checkbox :label="cd" v-for="(cd, i) in item.attr_vals" :key="i" border></el-checkbox>
            </el-checkbox-group>
          </el-form-item>
        </el-tab-pane>
        <el-tab-pane label="商品属性" name="2">
          <!-- 循环生成静态属性 -->
          <el-form-item :label="item.attr_name" v-for="item in onlyTableData" :key="item.attr_id">
            <el-input v-model="item.attr_vals"></el-input>
          </el-form-item>
        </el-tab-pane>
        <el-tab-pane label="商品图片" name="3">
          <!--上传图片-->
          <!--action为图片上传的后台api接口，要写成绝对路径-->
          <el-upload
            :action="uploadURL"
            :on-preview="handlePreview"
            :on-remove="handleRemove"
            list-type="picture"
            :headers="headerObj"
            :on-success="handleSuccess">
            <el-button size="small" type="primary">点击上传</el-button>
          </el-upload>
        </el-tab-pane>
        <el-tab-pane label="商品内容" name="4">
          <!--富文本编辑器组件-->
          <quill-editor v-model="addForm.goods_introduce"></quill-editor>
          <!--添加商品的按钮-->
          <el-button type="primary" class="btnAdd" @click="add">添加商品</el-button>
        </el-tab-pane>
      </el-tabs>
      </el-form>
    </el-card>
    <!-- 预览图片对话框 -->
    <el-dialog title="图片预览" :visible.sync="previewVisible" width="50%">
      <img :src="previewPath" class="previewImg" />
    </el-dialog>
  </div>
</template>

<script>
  import _ from 'lodash'
export default {
  data() {
    return {
      // 保存步骤条激活项索引
      activeindex: '0',
      // 添加商品的表单数据对象
      addForm: {
        goods_name: '',
        goods_price: 0,
        goods_weight: 0,
        goods_number: 0,
        goods_cat: [],
        // 上传图片数组
        pics: [],
        //商品的详情描述
        goods_introduce: '',
        attrs: []
      },
      // 验证规则
      addFormRules: {
        goods_name: [
          { required: true, message: '请输入商品名称', trigger: 'blur' }
        ],
        goods_price: [
          { required: true, message: '请输入商品价格', trigger: 'blur' }
        ],
        goods_weight: [
          { required: true, message: '请输入商品重量', trigger: 'blur' }
        ],
        goods_number: [
          { required: true, message: '请输入商品数量', trigger: 'blur' }
        ],
        goods_cat: [
          { required: true, message: '请选择商品分类', trigger: 'blur' }
        ]
      },
      // 分类列表
      cateList: [],
      // 配置级联菜单中数据如何展示
      cateProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      // 动态参数列表
      manyTableData: [],
      // 静态参数列表
      onlyTableData: [],
      // 图片上传的后台接口路径
      uploadURL: 'http://127.0.0.1:8888/api/private/v1/upload',
      // 设置上传图片的请求头
      headerObj: {
        Authorization: window.sessionStorage.getItem('token')
      },
      // 图片预览路径
      previewPath: '',
      previewVisible: false
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    async getCateList() {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类列表失败')
      }
      this.cateList = res.data
      this.$message.success('获取商品分类列表成功')
    },
    handleChange() {
      // 如果用户选择的不是三级分类,该次选择无效，因为必须选择三级分类
      if (this.addForm.goods_cat.length !== 3) {
        this.addForm.goods_cat = []
      }
    },
    beforeTableave(activeName, oldactiveName) {
      if (oldactiveName === '0' && this.addForm.goods_cat.length !== 3) {
        this.$message.error('请先选择商品分类')
        return false
      }
    },
    async tabclicked() {
      if (this.activeindex === '1') {
        const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`,
          { params: { 'sel': 'many' } })
        if (res.meta.status !== 200) {
          return this.$message.error('获取动态参数失败')
        }
        this.$message.success('获取动态参数成功')
        res.data.forEach(item => {
          item.attr_vals = item.attr_vals.length === 0 ? item.attr_vals : item.attr_vals.split(',')
        })
        this.manyTableData = res.data
        console.log(res.data)
      } else if (this.activeindex === '2') {
        const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`,
          { params: { 'sel': 'only' } })
        if (res.meta.status !== 200) {
          return this.$message.error('获取静态参数失败')
        }
        this.$message.success('获取静态参数成功')
        this.onlyTableData = res.data
        console.log(res.data)
      }
    },
    // 处理图片预览操作
    handlePreview(file) {
      // 当用户点击图片进行预览时执行，处理图片预览
      // 形参file就是用户预览的那个文件
      this.previewPath = file.response.data.url
      // 显示预览图片对话框
      this.previewVisible = true
    },
    // 处理图片移除操作
    handleRemove(file) {
      // 当用户点击X号删除时执行
      // 形参file就是用户点击删除的文件
      // 获取用户点击删除的那个图片的临时路径
      const filePath = file.response.data.tmp_path
      // 使用findIndex来查找符合条件的索引
      const index = this.addForm.pics.findIndex(item => item.pic === filePath)
      // 移除索引对应的图片
      this.addForm.pics.splice(index, 1)
      console.log(this.addForm)
    },
    handleSuccess(response) {
      // 当上传成功时触发执行
      // 形参response就是上传成功之后服务器返回的结果
      // 将服务器返回的临时路径保存到addForm表单的pics数组中
      this.addForm.pics.push({ pic: response.data.tmp_path })
      console.log(this.addForm)
    },
    // 添加商品
    add() {
      this.$refs.addFormRef.validate(async valid=>{
        if(!valid) return this.$message.error("请填写必要的表单项!")
        // 执行添加的业务逻辑
        const form = _.cloneDeep(this.addForm)
        form.goods_cat = this.addForm.goods_cat.join(',')
        // 处理attrs数组，数组中需要包含商品的动态参数和静态属性
        // 将manyTableData（动态参数）
        console.log(this.manyTableData)
        this.manyTableData.forEach(item=>{
          form.attrs.push({ attr_id:item.attr_id, attr_value:item.attr_vals.join(',') })
        })
        // 将onlyTableData（静态属性）处理添加到attrs
        this.onlyTableData.forEach(item=>{
          form.attrs.push({ attr_id:item.attr_id, attr_value:item.attr_vals })
        })
        console.log(form)
        //发送请求完成商品的添加,商品名称必须是唯一的
        const {data:res} = await this.$http.post('goods',form)
        if(res.meta.status !== 201){
          return this.$message.error('添加商品失败')
        }
        this.$message.success('添加商品成功')
        //编程式导航跳转到商品列表
        this.$router.push('/goods')
      })
    }
  },
  computed: {
    // 添加 计算属性获取三级分类
    cateId() {
      if (this.addForm.goods_cat.length === 3) {
        return this.addForm.goods_cat[2]
      }
      return null
    }
  }
}
</script>

<style lang="less" scoped>
  .el-checkbox{
    margin: 0 10px 0 0 !important;
  }
  .previewImg{
    width: 100%;
  }
  .btnAdd{
    margin-top: 15px;
  }
</style>
