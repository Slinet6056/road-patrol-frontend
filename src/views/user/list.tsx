import Edit from "./edit/index.vue";
import Excel from "./excel/index.vue";

export const list = [
  {
    key: "edit",
    content: "",
    title: "信息修改",
    component: Edit
  },
  {
    key: "excel",
    content: "",
    title: "导出excel",
    component: Excel
  }
];
