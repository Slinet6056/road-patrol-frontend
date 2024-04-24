<script setup lang="ts">
import { ref } from "vue";
import Add from "./edit/index.vue";
defineOptions({
  name: "ViewRoad"
});

const selected = ref(0);

function tabClick({ index }) {
  selected.value = index;
}
</script>

<template>
  <el-card shadow="never">
    <template #header>
      <div class="card-header">
        <span class="font-medium"> 编辑系统中记录的道路信息 </span>
      </div>
    </template>

    <el-alert title="提示信息" type="info" :closable="false" />

    <el-tabs @tab-click="tabClick">
      <el-tab-pane :lazy="true">
        <component :is="Add" />
      </el-tab-pane>
    </el-tabs>
  </el-card>
</template>

<style scoped>
:deep(.el-tabs__nav-wrap) {
  display: none;
}

:deep(.el-alert__title) {
  font-size: 15px;
}
</style>
