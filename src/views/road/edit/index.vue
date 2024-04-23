<script setup lang="ts">
import { useColumns } from "./columns";
import Empty from "./empty.svg?component";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import AddFill from "@iconify-icons/ep/plus";
// import Delete from "@iconify-icons/ep/delete";

const { columns, filterTableData, onAdd, onDel } = useColumns();
</script>

<template>
  <div class="flex">
    <pure-table
      row-key="id"
      align-whole="center"
      :header-cell-style="{
        background: 'var(--el-fill-color-light)',
        color: 'var(--el-text-color-primary)'
      }"
      :data="filterTableData"
      :columns="columns"
    >
      <template #append>
        <el-button
          plain
          class="w-full my-2"
          :icon="useRenderIcon(AddFill)"
          @click="onAdd"
        >
          添加一行数据
        </el-button>
      </template>
      <template #empty>
        <Empty fill="var(--el-svg-monochrome-grey)" class="m-auto" />
      </template>
    </pure-table>
  </div>
</template>

<style scoped>
:deep(.el-table__inner-wrapper::before) {
  height: 0;
}
</style>
