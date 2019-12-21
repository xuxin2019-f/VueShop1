<template>
  <div>
    <!--面包屑导航区域-->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item><a href="/">用户管理</a></el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!--卡片视图区域-->
    <el-card>
     <!--搜索与添加区域-->
      <el-row :gutter="20">
        <el-col :span="8"><el-input placeholder="请输入内容" v-model="userinfo.query" @clear="getUserslist" clearable><el-button slot="append" icon="el-icon-search" @click="getUserslist"></el-button></el-input></el-col>
        <el-col :span="4"><el-button type="primary" @click="dialogVisible= true">添加用户</el-button></el-col>
      </el-row>
      <el-table :data="userList" border stripe>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column prop="username" label="姓名"></el-table-column>
        <el-table-column prop="email" label="邮箱"></el-table-column>
        <el-table-column prop="mobile" label="电话"></el-table-column>
        <el-table-column prop="role_name" label="角色"></el-table-column>
        <el-table-column label="状态">
          <!--作用域插槽,里面的scope只是一个临时的定义，对应了element-ui在定义el-table-column这个组件的slot插槽，scope.row对应了这个组件用动态绑定的属性的值-->
          <template slot-scope="scope">
            <!--{{scope.row}}-->
            <el-switch v-model="scope.row.mg_state" @change="userstatechange(scope.row)"></el-switch>
          </template>
        </el-table-column>
        <el-table-column  label="操作">
          <template slot-scope="scope">
            <!--修改-->
            <el-button type="primary" icon="el-icon-edit" @click="showeditdialog(scope.row.id)"></el-button>
            <!--删除-->
            <el-button type="danger"  icon="el-icon-delete" @click="deleteuser(scope.row.id)"></el-button>
            <!--分配角色-->
            <el-tooltip content="分配角色" placement="top" :enterable="false">
              <el-button type="warning" icon="el-icon-setting" @click="showsetdialog(scope.row)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="userinfo.pagenum"
        :page-sizes="[1, 2, 3, 4]"
        :page-size="userinfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>
      <!--添加用户对话框-->
      <el-dialog
        title="添加用户"
        :visible.sync="dialogVisible"
        width="50%"
        @close="dialogclose">
        <el-form :model="addform" :rules="addformrules" ref="addformref" label-width="70px">
          <el-form-item label="用户名" prop="username">
            <el-input v-model="addform.username"></el-input>
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input v-model="addform.password"></el-input>
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="addform.email"></el-input>
          </el-form-item>
          <el-form-item label="手机" prop="mobile">
            <el-input v-model="addform.mobile"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
           <el-button @click="dialogVisible = false">取 消</el-button>
           <el-button type="primary" @click="adduser">确 定</el-button>
         </span>
      </el-dialog>
      <!--修改用户对话框-->
      <el-dialog
        title="提示"
        :visible.sync="editdialogvisible"
        width="50%" @close="editdialogclosed">
        <el-form :model="editform" :rules="editformrules" ref="editformref" label-width="70px">
          <el-form-item label="用户名" >
            <el-input v-model="editform.username" disabled></el-input>
          </el-form-item>
          <el-form-item label="邮箱" prop="email" >
            <el-input v-model="editform.email" ></el-input>
          </el-form-item>
          <el-form-item label="手机号" prop="mobile" >
            <el-input v-model="editform.mobile" ></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
    <el-button @click="editdialogvisible = false">取 消</el-button>
    <el-button type="primary" @click="edituser">确 定</el-button>
  </span>
      </el-dialog>
      <!-- 分配角色对话框 -->
      <el-dialog title="分配角色" :visible.sync="setRoleDialogVisible" width="50%" @close="setRoleDialogClosed">
        <div>
          <p>当前的用户:{{userInfo.username}}</p>
          <p>当前的角色:{{userInfo.role_name}}</p>
          <p>分配新角色:</p>
          <el-select v-model="selectedRoleId" placeholder="请选择">
            <el-option
              v-for="item in roleslist"
              :key="item.id"
              :label="item.roleName"
              :value="item.id">
            </el-option>
          </el-select>
        </div>
        <span slot="footer" class="dialog-footer">
    <el-button @click="setRoleDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="saveRoleInfo">确 定</el-button>
    </span>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    // 验证邮箱的规则
    var checkEmail = (rule, value, cb) => {
      const regEmail = /^\w+@\w+(\.\w+)+$/
      if (regEmail.test(value)) {
        return cb()
      }
      // 返回一个错误提示
      cb(new Error('请输入合法的邮箱'))
    }
    // 验证手机号码的规则
    var checkMobile = (rule, value, cb) => {
      const regMobile = /^1[34578]\d{9}$/
      if (regMobile.test(value)) {
        return cb()
      }
      // 返回一个错误提示
      cb(new Error('请输入合法的手机号码'))
    }
    return {
      userinfo: {
        // 用户名
        query: '',
        // 当前的页数
        pagenum: 1,
        // 当前每页显示多少条数据
        pagesize: 2
      },
      userInfo: {},
      userList: [],
      total: 0,
      dialogVisible: false,
      editdialogvisible: false,
      setRoleDialogVisible: false,
      addform: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      editform: {},
      // 添加表单规则
      addformrules: {
        username: [
          { required: true, message: '请输入用户名称', trigger: 'blur' },
          {
            min: 3,
            max: 10,
            message: '用户名在3~10个字符之间',
            trigger: 'blur'
          }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          {
            min: 6,
            max: 15,
            message: '用户名在6~15个字符之间',
            trigger: 'blur'
          }
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEmail, message: '邮箱格式不正确，请正确输入', trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入手机号码', trigger: 'blur' },
          { validator: checkMobile, message: '手机格式不正确，请正确输入', trigger: 'blur' }
        ]
      },
      // 编辑表单规则
      editformrules: {
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          {
            validator: checkEmail,
            message: '邮箱格式不正确，请重新输入',
            trigger: 'blur'
          }
        ],
        mobile: [
          { required: true, message: '请输入手机号码', trigger: 'blur' },
          {
            validator: checkMobile,
            message: '手机号码不正确，请重新输入',
            trigger: 'blur'
          }
        ]
      },
      // 获取角色列表
      roleslist: {},
      // 分配新角色的角色id
      selectedRoleId: ''
    }
  },
  created() {
    this.getUserslist()
  },
  methods: {
    async getUserslist() {
      const { data } = await this.$http.get('/users', { params: this.userinfo })
      // 如果返回状态为异常状态则报错并返回
      if (data.meta.status !== 200) return this.$message.error('获取用户列表失败')
      // 如果返回状态正常，将请求的数据保存在data中
      this.userList = data.data.users
      this.total = data.data.total
      console.log(data)
    },
    handleSizeChange(newsize) {
      // console.log(newsize)
      this.userinfo.pagesize = newsize
      this.getUserslist()
      console.log(this.total)
    },
    handleCurrentChange(newpage) {
      // console.log(newpage)
      this.userinfo.pagenum = newpage
      this.getUserslist()
    },
    async userstatechange(userinfo) {
      // console.log(userinfo)
      const { data } = await this.$http.put(`users/${userinfo.id}/state/${userinfo.mg_state}`)
      if (data.meta.status !== 200) {
        userinfo.mg_state = !userinfo.mg_state
        return this.$message.error('修改状态失败')
      }
      return this.$message.success('修改状态成功')
    },
    dialogclose() {
      this.$refs.addformref.resetFields()
    },
    adduser() {
      this.$refs.addformref.validate(async valid => {
        if (!valid) return this.$message.error('请填写完整用户信息')
        // console.log(valid)
        // 发送请求完成添加用户的操作
        const { data: res } = await this.$http.post('/users', this.addform)
        // 判断如果添加失败，就做提示
        if (res.meta.status !== 201) return this.$message.error('添加用户失败')
        // 添加成功的提示
        this.$message.success('添加用户成功')
        // 关闭对话框
        this.dialogVisible = false
        // 重新请求最新的数据
        this.getUserslist()
      })
    },
    async showeditdialog(id) {
      this.id = id
      const { data } = await this.$http.get('users/' + id)
      if (data.meta.status !== 200) return this.$message.error('查询用户失败')
      this.editform = data.data
      // console.log(this.editform)
      this.editdialogvisible = true
    },
    editdialogclosed() {
      this.$refs.editformref.resetFields()
    },
    edituser() {
      this.$refs.editformref.validate(async valid => {
        if (!valid) return this.$message.error('请填写完整用户信息')
        // console.log(valid)
        const { data: res } = await this.$http.put('users/' + this.editform.id, this.editform)
        // 判断如果添加失败，就做提示
        if (res.meta.status !== 200) return this.$message.error('修改用户失败')
        // 添加成功的提示
        this.$message.success('修改用户成功')
        // 关闭对话框
        this.editdialogvisible = false
        // 重新请求最新的数据
        this.getUserslist()
      })
    },
    async deleteuser(id) {
      const confirmresult = await this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch((err) => err)
      if (confirmresult !== 'confirm') {
        return this.$message.info('已经取消删除')
      }
      // 发送请求根据id完成删除操作
      const { data: res } = await this.$http.delete('users/' + id)
      // 判断如果删除失败，就做提示
      if (res.meta.status !== 200) return this.$message.error('删除用户失败')
      // 修改成功的提示
      this.$message.success('删除用户成功')
      // 重新请求最新的数据
      this.getUserslist()
    },
    // 展示分配角色对话框
    async showsetdialog(userInfo) {
      this.userInfo = userInfo
      const { data } = await this.$http.get('roles')
      if (data.meta.status !== 200) {
        return this.$message.error('获取角色失败')
      }
      this.roleslist = data.data
      console.log(this.roleslist)
      this.setRoleDialogVisible = true
    },
    async saveRoleInfo() {
      // 当用户点击确定按钮之后
      // 判断用户是否选择了需要分配的角色
      if (!this.selectedRoleId) {
        return this.$message.error('请选择需要分配的角色')
      }
      // 发送请求完成分配角色的操作
      const { data: res } = await this.$http.put(`users/${this.userInfo.id}/role`, { rid: this.selectedRoleId })
      // console.log(res)
      // 判断如果删除失败，就做提示
      if (res.meta.status !== 200) return this.$message.error('分配角色失败')

      this.$message.success('分配角色成功')
      this.getUserslist()
      // 关闭对话框
      this.setRoleDialogVisible = false
    },
    setRoleDialogClosed() {
      // 当关闭对话框的时候，重置下拉框中的内容
      this.selectedRoleId = ''
      this.userInfo = {}
    }
  }
}

</script>

<style lang="less" scoped>

</style>
