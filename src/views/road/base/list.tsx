import Adaptive from "./adaptive/index.vue";
import Excel from "./excel/index.vue";

export const list = [
  {
    key: "adaptive",
    content: "",
    title: "表格视图",
    component: Adaptive
  },
  {
    key: "excel",
    content: "",
    title: "导出excel",
    component: Excel
  }
];
