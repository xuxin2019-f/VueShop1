<template>
  <div>
    <!--面包屑导航区域-->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item><a href="/">权限管理</a></el-breadcrumb-item>
      <el-breadcrumb-item>权限列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!--卡片视图区域-->
    <el-card>
      <el-table :data="rightlist" border stripe>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column prop="authName" label="权限名称"></el-table-column>
        <el-table-column label="路径" prop="path"></el-table-column>
        <el-table-column label="权限等级" prop="level">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.level === '0'">一级权限</el-tag>
            <el-tag v-if="scope.row.level === '1'" type="success">二级权限</el-tag>
            <el-tag v-if="scope.row.level === '2'" type="warning">三级权限</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      rightlist: []
    }
  },
  created() {
    this.getrightslist()
  },
  methods: {
    async getrightslist() {
      const { data } = await this.$http.get('rights/list')
      if (data.meta.status !== 200) return this.$message.error('获取权限列表失败')
      // this.$message.success('获取列表成功')
      this.rightlist = data.data
    }
  }
}
</script>

<style lang="less" scoped>

</style>
