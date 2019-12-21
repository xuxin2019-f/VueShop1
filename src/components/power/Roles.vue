<template>
  <div>
  <!--面包屑导航区域-->
  <el-breadcrumb separator="/">
    <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
    <el-breadcrumb-item><a href="/">权限管理</a></el-breadcrumb-item>
    <el-breadcrumb-item>角色列表</el-breadcrumb-item>
  </el-breadcrumb>
   <el-row>
     <el-col>
       <el-button type="primary" @click="showaddform">添加角色</el-button>
     </el-col>
   </el-row>
  <!--卡片视图区域-->
  <el-card>
    <el-table :data="rolelist" border stripe>
      <el-table-column type="expand">
        <template slot-scope="scope">
            <!--{{scope.row}}-->
          <el-row :class="['dbbot',i1=== 0? 'dbtop':'','center']" v-for="(item1,i1) in scope.row.children" :key="item1.id">
            <!--一级权限-->
            <el-col :span="5">
              <el-tag closable @close="removerightbyid(scope.row, item1.id )">{{item1.authName}}</el-tag>
              <i class="el-icon-caret-right"></i>
            </el-col>
            <!--二级和三级权限-->
            <el-col :span="19">
              <!-- 通过for循环嵌套渲染二级权限  -->
              <el-row :class="[i2===0?'':'bdtop','center' ]" v-for="(item2,i2) in item1.children" :key="item2.id">
                <el-col :span="6">
                  <el-tag type="success" closable @close="removerightbyid(scope.row, item2.id )">{{item2.authName}}</el-tag>
                  <i class="el-icon-caret-right"></i>
                </el-col>
                <el-col :span="18">
                  <el-tag type="warning" v-for="(item3) in item2.children" :key="item3.id" closable @close="removerightbyid(scope.row, item3.id )">
                    {{item3.authName}}
                  </el-tag>
                </el-col>
              </el-row>
            </el-col>
          </el-row>
        </template>
      </el-table-column>
      <el-table-column type="index" label="#"></el-table-column>
      <el-table-column prop="roleName" label="角色名称"></el-table-column>
      <el-table-column prop="roleDesc" label="角色描述"></el-table-column>
      <el-table-column label="操作" width="300px">
        <template slot-scope="scope">
          <el-button size="mini" type="primary" icon="el-icon-edit" @click="showeditdialog(scope.row.id)">编辑</el-button>
          <el-button size="mini" type="danger" icon="el-icon-delete" @click="showdeletedialog(scope.row.id)">删除</el-button>
          <el-button size="mini" type="warning" icon="el-icon-setting" @click="showsetrightsdialog(scope.row)">分配权限</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!--添加角色对话框-->
    <el-dialog
      title="添加用户"
      :visible.sync="dialogVisible"
      width="50%"
      @close="dialogclose">
      <el-form :model="addform" :rules="addformrules" ref="addformref" label-width="80px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addform.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="addform.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
           <el-button @click="dialogVisible = false">取 消</el-button>
           <el-button type="primary" @click="addroles">确 定</el-button>
         </span>
    </el-dialog>
    <!--修改角色对话框-->
    <el-dialog
      title="提示"
      :visible.sync="editdialogvisible"
      width="50%" @close="editdialogclosed">
      <el-form :model="editform" :rules="editformrules" ref="editformref" label-width="70px">
        <el-form-item label="角色名称" prop="roleName" >
          <el-input v-model="editform.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc" >
          <el-input v-model="editform.roleDesc" ></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
    <el-button @click="editdialogvisible = false">取 消</el-button>
    <el-button type="primary" @click="editroles">确 定</el-button>
  </span>
    </el-dialog>
    <!--分配角色对话框-->
    <el-dialog
      title="分配权限"
      :visible.sync="setrightsdialogVisible"
      width="50%"
      @close="cleardefKeys">
      <el-tree :data="setform" :props="treeProps" show-checkbox node-key="id" default-expand-all :default-checked-keys="defKeys" ref="treeRef"></el-tree>
      <span slot="footer" class="dialog-footer">
    <el-button @click="setrightsdialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="allotRights">确 定</el-button>
  </span>
    </el-dialog>
  </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      rolelist: [],
      roleId: 0,
      dialogVisible: false,
      editdialogvisible: false,
      setrightsdialogVisible: false,
      // 设置树形控件中默认选中的内容
      defKeys: [],
      addform: {
        roleName: '',
        roleDesc: ''
      },
      editform: {},
      setform: {},
      addformrules: {
        roleName: [
          { required: true, message: '请输入用户名称', trigger: 'blur' },
          {
            min: 3,
            max: 10,
            message: '用户名在3~10个字符之间',
            trigger: 'blur'
          }
        ],
        roleDesc: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          {
            min: 6,
            max: 15,
            message: '用户名在6~15个字符之间',
            trigger: 'blur'
          }
        ]
      },
      editformrules: {
        roleName: [
          { required: true, message: '请输入用户名称', trigger: 'blur' },
          {
            min: 3,
            max: 10,
            message: '用户名在3~10个字符之间',
            trigger: 'blur'
          }
        ],
        roleDesc: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          {
            min: 6,
            max: 15,
            message: '用户名在6~15个字符之间',
            trigger: 'blur'
          }
        ]
      },
      treeProps: {
        // 通过label设置树形节点文本展示authName
        label: 'authName',
        // 设置通过children属性展示子节点信息
        children: 'children'
      }
    }
  },
  created() {
    this.getroleslist()
  },
  methods: {
    async getroleslist() {
      const { data } = await this.$http.get('roles')
      if (data.meta.status !== 200) return this.$message.error('获取角色列表失败')
      this.rolelist = data.data
      console.log(data.data)
    },
    // 显示添加对话框
    showaddform() {
      this.dialogVisible = true
    },
    // 显示编辑对话框
    async showeditdialog(id) {
      const { data } = await this.$http.get('roles/' + id)
      if (data.meta.status !== 200) return this.$message.error('查询角色失败')
      this.editform = data.data
      // console.log(this.editform)
      this.editdialogvisible = true
    },
    // 添加对话框关闭
    dialogclose() {
      this.$refs.addformref.resetFields()
    },
    // 编辑对话框关闭
    editdialogclosed() {
      this.$refs.editformref.resetFields()
    },
    addroles() {
      this.$refs.addformref.validate(async valid => {
        if (!valid) return this.$message.error('角色数据不合法')
        const { data } = await this.$http.post('roles', this.addform)
        // console.log(data)
        if (data.meta.status !== 201) return this.$message.error('添加角色失败')
        this.$message.success('添加角色成功')
        this.dialogVisible = false
        this.getroleslist()
      })
    },
    editroles() {
      this.$refs.editformref.validate(async valid => {
        if (!valid) return this.$message.error('请填写完整角色信息')
        // console.log(valid)
        const { data: res } = await this.$http.put('roles/' + this.editform.roleId, this.editform)
        // 判断如果添加失败，就做提示
        if (res.meta.status !== 200) return this.$message.error('修改角色失败')
        // 添加成功的提示
        this.$message.success('修改角色成功')
        // 关闭对话框
        this.editdialogvisible = false
        // 重新请求最新的数据
        this.getroleslist()
      })
    },
    async showdeletedialog(id) {
      const confirmresult = await this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch((err) => err)
      if (confirmresult !== 'confirm') return this.$message.info('已取消删除')
      const { data } = await this.$http.delete('roles/' + id)
      if (data.meta.status !== 200) return this.$message.error('删除角色失败')
      this.getroleslist()
      return this.$message.success('删除角色成功')
    },
    // 删除角色权限
    async removerightbyid(role, rightid) {
      // 弹窗提示用户是否要删除
      const confirmResult = await this.$confirm('请问是否要删除该权限', '删除提示', {
        confirmButtonText: '确认删除',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      // 如果用户点击确认，则confirmResult 为'confirm'
      // 如果用户点击取消, 则confirmResult获取的就是catch的错误消息'cancel'
      if (confirmResult !== 'confirm') {
        return this.$message.info('已经取消删除')
      }

      // 用户点击了确定表示真的要删除
      // 当发送delete请求之后，返回的数据就是最新的角色权限信息
      const { data: res } = await this.$http.delete(`roles/${role.id}/rights/${rightid}`)
      if (res.meta.status !== 200) return this.$message.error('删除角色权限失败')

      // 无需再重新加载所有权限
      // 只需要对现有的角色权限进行更新即可
      role.children = res.data
    },
    // 展示分配权限对话框
    async showsetrightsdialog(role) {
      this.roleId = role.id
      const { data } = await this.$http.get('rights/tree')
      if (data.meta.status !== 200) return this.$message.error('获取商品列表失败')
      this.setform = data.data
      // console.log(this.setform)
      // 获得三级权限id
      this.getleafkeys(role, this.defKeys)
      this.setrightsdialogVisible = true
    },
    // 通过递归的形式，获得角色下所有的三级权限的id，并保存到defKeys数组时钟
    getleafkeys(node, arr) {
      if (!node.children) return arr.push(node.id)
      node.children.forEach(item => {
        this.getleafkeys(item, arr)
      })
    },
    // 每次关闭对话框都清空keyDefs，避免keyDefs中数据的堆积
    cleardefKeys() {
      this.defKeys = []
    },
    // 点击确定分配权限
    async allotRights() {
      // 当用户在树形权限对话框中点击确定，将用户选择的
      // 权限发送请求进行更新

      // 获取所有选中及半选的内容
      // ...为展开运算符，将两个数组合并成了一个新数组
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]
      // 将数组转换为 , 拼接的字符串
      const idStr = keys.join(',')

      // 发送请求完成更新
      const { data: res } = await this.$http.post(
        `roles/${this.roleId}/rights`,
        { rids: idStr }
      )
      if (res.meta.status !== 200) return this.$message.error('分配权限失败')

      this.$message.success('分配权限成功')
      this.getroleslist()
      // 关闭对话框
      this.setrightsdialogVisible = false
    }
  }
}
</script>

<style lang="less" scoped>
.el-tag {
  margin: 7px;
}
  .dbbot {
    border-bottom: 1px solid lightgray;
  }
  .dbtop {
    border-top: 1px solid lightgray;
  }
  .center {
    display: flex;
    align-items: center;
  }
</style>
