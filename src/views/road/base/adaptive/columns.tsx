import type {
  LoadingConfig,
  AdaptiveConfig,
  PaginationProps
} from "@pureadmin/table";
import { ref, onMounted, reactive } from "vue";
import { delay } from "@pureadmin/utils";
import { getRoads } from "@/api/road";
import { message } from "@/utils/message";

export function useColumns() {
  const dataList = ref([]);
  const loading = ref(true);
  const columns: TableColumnList = [
    {
      label: "名称",
      prop: "name"
    },
    {
      label: "纬度",
      prop: "latitude"
    },
    {
      label: "经度",
      prop: "longitude"
    },
    {
      label: "长度",
      prop: "length"
    },
    {
      label: "类型",
      prop: "type"
    },
    {
      label: "路面材质",
      prop: "surfaceMaterial"
    },
    {
      label: "建成年份",
      prop: "constructionYear"
    }
  ];

  /** 分页配置 */
  const pagination = reactive<PaginationProps>({
    pageSize: 20,
    currentPage: 1,
    pageSizes: [20, 40, 60],
    total: 0,
    align: "right",
    background: true,
    small: false
  });

  /** 加载动画配置 */
  const loadingConfig = reactive<LoadingConfig>({
    text: "正在加载第一页...",
    viewBox: "-10, -10, 50, 50",
    spinner: `
        <path class="path" d="
          M 30 15
          L 28 17
          M 25.61 25.61
          A 15 15, 0, 0, 1, 15 30
          A 15 15, 0, 1, 1, 27.99 7.5
          L 15 15
        " style="stroke-width: 4px; fill: rgba(0, 0, 0, 0)"/>
      `
    // svg: "",
    // background: rgba()
  });

  /** 撑满内容区自适应高度相关配置 */
  const adaptiveConfig: AdaptiveConfig = {
    /** 表格距离页面底部的偏移量，默认值为 `96` */
    offsetBottom: 110
    /** 是否固定表头，默认值为 `true`（如果不想固定表头，fixHeader设置为false并且表格要设置table-layout="auto"） */
    // fixHeader: true
    /** 页面 `resize` 时的防抖时间，默认值为 `60` ms */
    // timeout: 60
    /** 表头的 `z-index`，默认值为 `100` */
    // zIndex: 100
  };

  function onSizeChange(val) {
    console.log("onSizeChange", val);
  }

  function onCurrentChange(val) {
    loadingConfig.text = `正在加载第${val}页...`;
    loading.value = true;
    delay(600).then(() => {
      loading.value = false;
    });
  }

  onMounted(() => {
    loading.value = true;
    getRoads()
      .then(response => {
        const roads = response;
        dataList.value = roads.map((road, index) => ({
          id: index,
          roadId: road.id,
          name: road.name,
          latitude: road.latitude,
          longitude: road.longitude,
          length: road.length,
          type: road.type,
          surfaceMaterial: road.surface_material,
          constructionYear: road.construction_year
        }));
        pagination.total = dataList.value.length;
        loading.value = false;
      })
      .catch(error => {
        console.error("Failed to load roads:", error);
        loading.value = false;
        message("数据加载失败", {
          type: "error"
        });
      });
  });

  return {
    loading,
    columns,
    dataList,
    pagination,
    loadingConfig,
    adaptiveConfig,
    onSizeChange,
    onCurrentChange
  };
}
