<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { ElConfigProvider, ElMessageBox } from "element-plus";
import zhCn from "element-plus/es/locale/lang/zh-cn";
import plusZhCn from "plus-pro-components/es/locale/lang/zh-cn";
import "plus-pro-components/es/components/search/style/css";
import { PlusSearch, PlusDialogForm } from "plus-pro-components";
import {
  Plan,
  getPlans,
  updatePlan,
  Report,
  getReports,
  addReport,
  updateReport,
  deleteReport
} from "@/api/patrol";
import { getUsers } from "@/api/user";
import { getRoads } from "@/api/road";
import { message } from "@/utils/message";
import Empty from "./empty.svg?component";

const state = ref({
  road_id: [],
  inspector_id: null,
  date: null,
  status: ""
});

const reportForm = ref({
  content: "",
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
const dataList = ref([]);
const allPlans = ref([]);
const roadMap = ref(new Map());
const inspectorMap = ref(new Map());
const reportMap = ref<Map<number, Report>>(new Map());

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
    label: "报告",
    fixed: "right",
    slot: "report"
  }
]);

onMounted(async () => {
  try {
    const [planResponse, roadResponse, inspectorResponse, reportResponse] =
      await Promise.all([getPlans(), getRoads(), getUsers(), getReports()]);
    roadMap.value = new Map(roadResponse.map(road => [road.id, road.name]));
    inspectorMap.value = new Map(
      inspectorResponse.map(inspector => [inspector.id, inspector.username])
    );
    reportMap.value = new Map(
      reportResponse.map(report => [report.plan_id, report])
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

const reportVisible = ref(false);
const reportDialogVisible = ref(false);
const currentPlan = ref<Plan | null>(null);
const currentReport = ref<Report | null>(null);

const onViewReport = (row: Plan) => {
  currentPlan.value = row;
  currentReport.value = reportMap.value.get(row.id);
  reportDialogVisible.value = true;
};

const onAddReport = (row: Plan) => {
  currentPlan.value = row;
  currentReport.value = null;
  reportVisible.value = true;
};

const onEditReport = (row: Plan) => {
  currentPlan.value = row;
  currentReport.value = reportMap.value.get(row.id);
  reportForm.value = {
    content: currentReport.value.content,
    status: currentPlan.value.status
  };
  reportVisible.value = true;
};

const onDeleteReport = (row: Plan) => {
  ElMessageBox.confirm("确认删除该巡检报告吗?", "提示", {
    confirmButtonText: "确认",
    cancelButtonText: "取消",
    type: "warning"
  }).then(async () => {
    const report = reportMap.value.get(row.id);
    if (report) {
      try {
        await deleteReport(report.id);
        message("删除成功", { type: "success" });
        reportMap.value.delete(row.id);
      } catch (error) {
        console.error("删除失败:", error);
        message("删除失败", { type: "error" });
      }
    }
  });
};

const onReportSubmit = async (values: any) => {
  try {
    if (currentReport.value) {
      await updateReport(currentReport.value.id, values);
      await updatePlan(currentPlan.value!.id, {
        road_ids: currentPlan.value.road_ids,
        status: values.status
      });
      message("修改成功", { type: "success" });
      reportMap.value.set(currentPlan.value!.id, {
        ...currentReport.value,
        ...values
      });
    } else {
      const newReport = await addReport({
        plan_id: currentPlan.value!.id,
        ...values
      });
      await updatePlan(currentPlan.value!.id, { status: values.status });
      message("添加成功", { type: "success" });
      reportMap.value.set(currentPlan.value!.id, newReport as Report);
    }
    const planIndex = allPlans.value.findIndex(
      plan => plan.id === currentPlan.value!.id
    );
    if (planIndex !== -1) {
      allPlans.value[planIndex].status = values.status;
      dataList.value = allPlans.value;
    }
    reportVisible.value = false;
  } catch (error) {
    console.error("操作失败:", error);
    message("操作失败", { type: "error" });
  }
};

const formatDateTime = (dateTimeString: string | undefined): string => {
  if (!dateTimeString) return "";
  const dateTime = new Date(dateTimeString);
  return dateTime
    .toLocaleString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false
    })
    .replace(/\//g, "-");
};

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
        <template #empty>
          <Empty fill="var(--el-svg-monochrome-grey)" class="m-auto" />
        </template>
        <template #report="{ row }">
          <template v-if="reportMap.get(row.id)">
            <el-button size="small" @click="onViewReport(row)"
              >查看报告</el-button
            >
            <el-button size="small" @click="onEditReport(row)"
              >修改报告</el-button
            >
            <el-button size="small" type="danger" @click="onDeleteReport(row)"
              >删除报告</el-button
            >
          </template>
          <el-button v-else size="small" @click="onAddReport(row)"
            >添加报告</el-button
          >
        </template>
      </pure-table>
    </div>
    <PlusDialogForm
      v-model:visible="reportVisible"
      v-model="reportForm"
      title="巡检报告"
      width="80%"
      :form="{
        columns: [
          {
            label: '内容',
            prop: 'content',
            valueType: 'textarea',
            fieldProps: {
              rows: 30,
              placeholder: '请输入报告内容'
            }
          },
          {
            label: '状态',
            prop: 'status',
            valueType: 'select',
            options: statusOptions,
            fieldProps: {
              placeholder: '请选择状态'
            }
          }
        ]
      }"
      @confirm="onReportSubmit"
    />
  </el-config-provider>
  <el-dialog v-model="reportDialogVisible" title="巡检报告" width="80%">
    <el-descriptions :column="1" border>
      <el-descriptions-item label="巡检路段">{{
        currentPlan?.road_ids.map(id => roadMap.get(id)).join(", ")
      }}</el-descriptions-item>
      <el-descriptions-item label="巡检员">{{
        currentPlan?.inspector_id
      }}</el-descriptions-item>
      <el-descriptions-item label="巡检日期">{{
        currentPlan?.date.slice(0, 10)
      }}</el-descriptions-item>
      <el-descriptions-item label="报告内容">
        <pre style="white-space: pre-wrap">{{ currentReport?.content }}</pre>
      </el-descriptions-item>
      <el-descriptions-item label="创建时间">{{
        formatDateTime(currentReport?.created_at)
      }}</el-descriptions-item>
      <el-descriptions-item label="修改时间">{{
        formatDateTime(currentReport?.updated_at)
      }}</el-descriptions-item>
    </el-descriptions>
  </el-dialog>
</template>
