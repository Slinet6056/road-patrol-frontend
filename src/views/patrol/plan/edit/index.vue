<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { ElConfigProvider, ElMessageBox } from "element-plus";
import zhCn from "element-plus/es/locale/lang/zh-cn";
import plusZhCn from "plus-pro-components/es/locale/lang/zh-cn";
import "plus-pro-components/es/components/search/style/css";
import { PlusColumn, PlusSearch, PlusDialogForm } from "plus-pro-components";
import { Plan, getPlans, addPlan, updatePlan, deletePlan } from "@/api/patrol";
import { getUsers } from "@/api/user";
import { getRoads } from "@/api/road";
import { message } from "@/utils/message";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import AddFill from "@iconify-icons/ep/plus";
import Empty from "./empty.svg?component";

const state = ref({
  road_id: [],
  inspector_id: null,
  date: null,
  status: ""
});

const statusOptions = ref([
  {
    label: "未开始",
    value: "not_started"
  },
  {
    label: "进行中",
    value: "in_progress"
  },
  {
    label: "已完成",
    value: "completed"
  }
]);

const roadOptions = ref([]);
const inspectorOptions = ref([]);
const formVisible = ref(false);
const formValues = ref({});
const dataList = ref([]);
const allPlans = ref([]);
const roadMap = ref(new Map());
const inspectorMap = ref(new Map());

const baseColumns = [
  {
    label: "巡检路段",
    prop: "road_id",
    valueType: "select",
    fieldProps: {
      multiple: true,
      placeholder: "请选择路段"
    },
    options: roadOptions
  },
  {
    label: "巡检员",
    prop: "inspector_id",
    valueType: "select",
    options: inspectorOptions
  },
  {
    label: "日期",
    prop: "date",
    valueType: "date-picker",
    formatter: (row, column, value) => {
      return value.slice(0, 10);
    }
  },
  {
    label: "状态",
    prop: "status",
    valueType: "select",
    options: statusOptions,
    formatter: (row, column, value) => {
      const option = statusOptions.value.find(item => item.value === value);
      return option ? option.label : value;
    }
  }
];

const formColumns = computed(() => baseColumns);
const columns = computed(() => [
  ...baseColumns,
  {
    label: "操作",
    fixed: "right",
    slot: "operation"
  }
]);

onMounted(async () => {
  try {
    const [planResponse, roadResponse, inspectorResponse] = await Promise.all([
      getPlans(),
      getRoads(),
      getUsers()
    ]);
    roadMap.value = new Map(roadResponse.map(road => [road.id, road.name]));
    inspectorMap.value = new Map(
      inspectorResponse.map(inspector => [inspector.id, inspector.username])
    );

    allPlans.value = planResponse.map(plan => ({
      ...plan,
      road_id: plan.road_ids.map(id => roadMap.value.get(id) || id),
      inspector_id:
        inspectorMap.value.get(plan.inspector_id) || plan.inspector_id
    }));
    dataList.value = allPlans.value;

    roadOptions.value = roadResponse.map(road => ({
      label: road.name,
      value: road.id
    }));
    inspectorOptions.value = inspectorResponse.map(inspector => ({
      label: inspector.username,
      value: inspector.id
    }));
  } catch (error) {
    console.error("Failed to load data:", error);
    message("数据加载失败", { type: "error" });
  }
});

const filteredPlans = computed(() => {
  return allPlans.value.filter(plan => {
    const selectedRoadNames = state.value.road_id.map(id =>
      roadMap.value.get(id)
    );
    const roadMatch =
      state.value.road_id.length === 0 ||
      selectedRoadNames.every(name => plan.road_id.includes(name));
    const selectedInspectorName = state.value.inspector_id
      ? inspectorMap.value.get(state.value.inspector_id)
      : null;
    const inspectorMatch =
      !selectedInspectorName || selectedInspectorName === plan.inspector_id;
    const dateMatch =
      !state.value.date ||
      new Date(plan.date).toLocaleDateString() ===
        state.value.date.toLocaleDateString();
    const statusMatch =
      state.value.status === "" || state.value.status === plan.status;
    return roadMatch && inspectorMatch && dateMatch && statusMatch;
  });
});

const handleChange = (values: any) => {
  console.log(values, "change");
};

const handleSearch = () => {
  dataList.value = filteredPlans.value;
};

const handleRest = () => {
  state.value = {
    road_id: [],
    inspector_id: null,
    date: null,
    status: ""
  };
  dataList.value = allPlans.value;
};

const onAdd = () => {
  formVisible.value = true;
};

const onEdit = (row: Plan) => {
  formValues.value = { ...row, date: new Date(row.date) };
  formVisible.value = true;
};

const onDelete = (row: Plan) => {
  ElMessageBox.confirm("确认删除该巡检计划吗?", "提示", {
    confirmButtonText: "确认",
    cancelButtonText: "取消",
    type: "warning"
  }).then(async () => {
    try {
      await deletePlan(row.id);
      message("删除成功", { type: "success" });
      const index = dataList.value.findIndex(item => item.id === row.id);
      dataList.value.splice(index, 1);
    } catch (error) {
      console.error("删除失败:", error);
      message("删除失败", { type: "error" });
    }
  });
};

const onFormSubmit = async values => {
  const road_ids = values.road_id.map(name => {
    for (const [id, roadName] of roadMap.value.entries()) {
      if (roadName === name) {
        return id;
      }
    }
    return name;
  });

  let inspector_id = values.inspector_id;
  for (const [id, inspectorName] of inspectorMap.value.entries()) {
    if (inspectorName === inspector_id) {
      inspector_id = id;
      break;
    }
  }

  const plan = {
    road_ids,
    inspector_id,
    date: formatDate(values.date),
    status: values.status
  };

  try {
    if (values.id) {
      await updatePlan(values.id, plan);
      message("修改成功", { type: "success" });
      const index = allPlans.value.findIndex(item => item.id === values.id);
      allPlans.value[index] = {
        id: values.id,
        ...plan,
        road_id: plan.road_ids.map(id => roadMap.value.get(id) || id),
        inspector_id:
          inspectorMap.value.get(plan.inspector_id) || plan.inspector_id
      };
    } else {
      const newPlan = await addPlan(plan);
      message("添加成功", { type: "success" });
      allPlans.value.push({
        id: (newPlan as Plan).id,
        ...plan,
        road_id: plan.road_ids.map(id => roadMap.value.get(id) || id),
        inspector_id:
          inspectorMap.value.get(plan.inspector_id) || plan.inspector_id
      });
    }
    dataList.value = allPlans.value;
    formVisible.value = false;
  } catch (error) {
    console.error("操作失败:", error);
    message("操作失败", { type: "error" });
  }
};

function formatDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const locale = { ...zhCn, ...plusZhCn };
</script>

<template>
  <el-config-provider :locale="locale">
    <PlusSearch
      v-model="state"
      :columns="formColumns"
      :show-number="2"
      label-width="80"
      label-position="right"
      @change="handleChange"
      @search="handleSearch"
      @reset="handleRest"
    />
    <div class="flex">
      <pure-table
        row-key="id"
        align-whole="center"
        :header-cell-style="{
          background: 'var(--el-fill-color-light)',
          color: 'var(--el-text-color-primary)'
        }"
        :data="dataList"
        :columns="columns"
      >
        <template #append>
          <el-button
            plain
            class="w-full my-2"
            :icon="useRenderIcon(AddFill)"
            @click="onAdd"
          >
            添加数据
          </el-button>
        </template>
        <template #empty>
          <Empty fill="var(--el-svg-monochrome-grey)" class="m-auto" />
        </template>
        <template #operation="{ row }">
          <el-button size="small" @click="onEdit(row)">修改</el-button>
          <el-button size="small" type="danger" @click="onDelete(row)"
            >删除</el-button
          >
        </template>
      </pure-table>
    </div>
    <PlusDialogForm
      v-model:visible="formVisible"
      v-model="formValues"
      :form="{ columns: formColumns as PlusColumn[] }"
      @confirm="onFormSubmit"
    />
  </el-config-provider>
</template>
