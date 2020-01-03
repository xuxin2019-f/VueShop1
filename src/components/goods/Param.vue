<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>分类参数</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 警告区域 :closable="false"(是否展示“X”号) show-icon(显示图标) -->
      <el-alert title="注意：只允许为第三级分类设置相关参数" type="warning" :closable="false" show-icon>
      </el-alert>

      <!-- 选择商品分类区域 -->
      <el-row class="cat_opt">
        <el-col>
          <span>选择商品分类：</span>
          <!-- 选择商品分类的级联选择框 -->
          <el-cascader
            expandTrigger='hover'
            v-model="selectedKeys"
            :options="catelist"
            :props="cateProps"
            @change="handleChange"></el-cascader>
        </el-col>
        <el-col></el-col>
      </el-row>
      <el-tabs v-model="activeName" @tab-click="handleClick">
        <el-tab-pane label="动态参数" name="many">
          <el-button size="mini" type="primary" :disabled="isButtonDisabled" @click="dialogVisible=true">添加参数</el-button>
          <!--动态参数表格-->
          <el-table :data="manyTableData" border stripe>
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag v-for="(item, i) in scope.row.attr_vals" :key="i" closable @close="handleClose(i,scope.row)">
                  {{item}}
                </el-tag>
                <!-- 输入框 -->
                <el-input class="input-new-tag" v-if="scope.row.inputVisible" v-model="scope.row.inputValue" ref="saveTagInput"
                          size="small" @keyup.enter.native="handleInputConfirm(scope.row)" @blur="handleInputConfirm(scope.row)">
                </el-input>
                <!-- 添加按钮 -->
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index" label="#"></el-table-column>
            <el-table-column prop="attr_name" label="属性名称"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button type="primary" @click="showeditdialog(scope.row)">编辑</el-button>
                <el-button type="danger" @click="removeParams(scope.row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="静态属性" name="only">
          <el-button size="mini" type="primary"  :disabled="isButtonDisabled" @click="dialogVisible=true">添加属性</el-button>
          <!--静态参数表格-->
          <el-table :data="onlyTableData" border stripe>
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag v-for="(item, i) in scope.row.attr_vals" :key="i" closable @close="handleClose(i,scope.row)">
                  {{item}}
                </el-tag>
                <!-- 输入框 -->
                <el-input class="input-new-tag" v-if="scope.row.inputVisible" v-model="scope.row.inputValue" ref="saveTagInput"
                          size="small" @keyup.enter.native="handleInputConfirm(scope.row)" @blur="handleInputConfirm(scope.row)">
                </el-input>
                <!-- 添加按钮 -->
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index" label="#"></el-table-column>
            <el-table-column prop="attr_name" label="属性名称"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button type="primary" @click="showeditdialog(scope.row)">编辑</el-button>
                <el-button type="danger" @click="removeParams(scope.row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
    <!--添加参数/属性对话框-->
    <el-dialog
      :title="'添加'+titletext"
      :visible.sync="dialogVisible"
      width="60%"
      @close="closeDialog">
      <el-form :model="addform" :rules="addformrules" ref="addformref" label-width="100px">
      <el-form-item :label="titletext" prop="attr_name">
        <el-input v-model="addform.attr_name"></el-input>
      </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
    <el-button @click="dialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="addparams">确 定</el-button>
  </span>
    </el-dialog>
    <!-- 修改参数或属性对话框 -->
    <el-dialog :title="'修改'+titletext" :visible.sync="editDialogVisible" width="50%" @close="editDialogClosed">
      <!-- 添加表单 -->
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px">
        <el-form-item :label="titletext" prop="attr_name">
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
    <el-button @click="editDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="editParams">确 定</el-button>
  </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 商品分类列表
      catelist: [],
      // 配置级联菜单中数据如何展示
      cateProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        expandTrigger: 'hover'
      },
      // 用户在级联下拉菜单中选中的分类id
      selectedKeys: [],
      activeName: 'many',
      manyTableData: [],
      onlyTableData: [],
      dialogVisible: false,
      // 添加属性表单
      addform: {
        attr_name: ''
      },
      // 添加表单验证规则
      addformrules: {
        attr_name: [
          { required: true, message: '请输入要添加的参数', trigger: 'blur' }
        ] },
      // 编辑表单
      editForm: {
        attr_name: ''
      },
      editFormRules: {
        attr_name: [
          { required: true, message: '请输入要添加的参数', trigger: 'blur' }
        ] },
      editDialogVisible: false,
      inputVisible: false,
      inputValue: ''
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    async getCateList() {
      const { data } = await this.$http.get('categories')
      if (data.meta.status !== 200) return this.$message.error('获取分类列表失败')
      this.catelist = data.data
      // console.log(this.catelist)
    },
    // 当级联选择框发生改变是触发
    handleChange() {
      this.getParamsData()
    },
    // 切换标签页时触发
    handleClick() {
      this.getParamsData()
      // console.log(this.activeName)
    },
    // 获取分类参数列表
    async getParamsData() {
      if (this.selectedKeys.length !== 3) {
        this.selectedKeys = []
        this.manyTableData = []
        this.onlyTableData = []
        return
      }
      const { data } = await this.$http.get(`categories/${this.cateID}/attributes`, { params: { sel: this.activeName } })
      if (data.meta.status !== 200) return this.$message.error('获取分类参数列表失败')
      console.log(data.data)
      data.data.forEach(item => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(',') : []
        // 控制文本框的显示和隐藏
        item.inputVisible = false
        // 控制文本框的内容
        item.inputValue = ''
      })
      if (this.activeName === 'many') {
        this.manyTableData = data.data
      } else {
        this.onlyTableData = data.data
      }

      // console.log(this.selectedKeys)
    },
    // 关闭添加对话框
    closeDialog() {
      this.$refs.addformref.resetFields()
    },
    // 关闭修改对话框
    editDialogClosed() {
      this.$refs.editFormRef.resetFields()
    },
    // 提交属性参数
    addparams() {
      this.$refs.addformref.validate(async valid => {
        if (!valid) return
        const { data } = await this.$http.post(`categories/${this.cateID}/attributes`, {
          attr_name: this.addform.attr_name,
          attr_sel: this.activeName
        })
        if (data.meta.status !== 201) return this.$message.error('提交属性失败')
        this.$message.success('提交属性成功')
        this.dialogVisible = false
        this.getParamsData()
      })
    },
    // 显示编辑对话框
    async showeditdialog(row) {
      // console.log(row.attr_name)
      // this.editForm.attr_name = row.attr_name
      // this.editDialogVisible = true
      // 发起请求获取需要修改的那个参数数据
      const { data: res } = await this.$http.get(`categories/${this.cateID}/attributes/${row.attr_id}`,
        { params: { attr_sel: this.activeName } })
      if (res.meta.status !== 200) {
        return this.$message.error('获取参数数据失败')
      }
      this.editForm = res.data
      // 显示修改参数.属性对话框
      this.editDialogVisible = true
    },
    // 提交编辑的属性
    editParams() {
      // 验证表单
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return

        // 发送请求完成修改
        const { data: res } = await this.$http.put(`categories/${this.cateID}/attributes/${this.editForm.attr_id}`,
          { attr_name: this.editForm.attr_name, attr_sel: this.activeName })

        if (res.meta.status !== 200) {
          return this.$message.error('获取参数数据失败')
        }
        this.$message.success('修改' + this.titletext + '数据成功')
        this.editDialogVisible = false
        this.handleChange()
      })
    },
    // 删除该属性
    async removeParams(row) {
      // 根据id删除对应的参数或属性
      // 弹窗提示用户是否要删除
      const confirmResult = await this.$confirm(
        '请问是否要删除该' + this.titletext,
        '删除提示',
        {
          confirmButtonText: '确认删除',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)
      // 如果用户点击确认，则confirmResult 为'confirm'
      // 如果用户点击取消, 则confirmResult获取的就是catch的错误消息'cancel'
      if (confirmResult !== 'confirm') {
        return this.$message.info('已经取消删除')
      }

      // 没有取消就是要删除，发送请求完成删除
      const { data: res } = await this.$http.delete(`categories/${this.cateID}/attributes/${row.attr_id}`)

      if (res.meta.status !== 200) {
        return this.$message.error('删除参数数据失败')
      }
      this.$message.success('删除' + this.titletext + '数据成功')
      this.handleChange()
    },
    // 显示tag输入框
    showInput(row) {
      row.inputVisible = true
      // $nextTick:在页面上元素被重新渲染之后，调用回调函数的代码
      this.$nextTick(_ => {
        // 让文本框自动获得焦点
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    handleInputConfirm(row) {
      // 当用户在文本框中按下enter键或者焦点离开时都会触发执行
      // 判断用户在文本框中输入的内容是否合法
      if (row.inputValue.trim().length === 0) {
        row.inputValue = ''
        row.inputVisible = false
      }
      row.attr_vals.push(row.inputValue.trim())
      row.inputValue = ''
      row.inputVisible = false
      this.saveAttrVals(row)
    },
    handleClose(index, row) {
      // 删除对应索引的参数可选项
      row.attr_vals.splice(index, 1)
      // 调用函数，完成保存可选项的操作
      this.saveAttrVals(row)
    },
    async saveAttrVals(row) {
      // 封装函数，完成保存可选项的操作
      // 发起请求，保存参数细项
      const { data: res } = await this.$http.put(`categories/${this.cateID}/attributes/${row.attr_id}`,
        { attr_name: row.attr_name, attr_sel: row.attr_sel, attr_vals: row.attr_vals.join(',') })

      if (res.meta.status !== 200) {
        return this.$message.error('修改参数项失败')
      }

      this.$message.success('修改参数项成功')
    }
  },
  computed: {
    // 添加计算属性用来获取按钮禁用与否
    isButtonDisabled() {
      if (this.selectedKeys.length !== 3) {
        return true
      }
      return false
    },
    // 三级分类的id
    cateID() {
      if (this.selectedKeys.length === 3) {
        return this.selectedKeys[2]
      }
      return null
    },
    // 对话框的标题
    titletext() {
      if (this.activeName === 'many') return '动态参数'
      return '静态属性'
    }
  }
}
</script>

<style lang="less" scoped>
  .cat_opt{
    margin-top: 15px;
  }
  .el-cascader-panel{
    height: 150px;
  }
  .el-tag{
    margin: 10px;
  }
  .input-new-tag{
    width: 120px;
  }
</style>
