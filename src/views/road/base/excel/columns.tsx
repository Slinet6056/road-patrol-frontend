import { ref } from "vue";
import { utils, writeFile } from "xlsx";
import { tableDataDrag } from "../data";
import { clone } from "@pureadmin/utils";
import { message } from "@/utils/message";

export function useColumns() {
  const dataList = ref(clone(tableDataDrag, true));

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
      prop: "surface_material"
    },
    {
      label: "建成年份",
      prop: "construction_year"
    }
  ];

  const exportExcel = () => {
    const res = dataList.value.map(item => {
      const arr = [];
      columns.forEach(column => {
        arr.push(item[column.prop as string]);
      });
      return arr;
    });
    const titleList = [];
    columns.forEach(column => {
      titleList.push(column.label);
    });
    res.unshift(titleList);
    const workSheet = utils.aoa_to_sheet(res);
    const workBook = utils.book_new();
    utils.book_append_sheet(workBook, workSheet, "数据报表");
    writeFile(workBook, "pure-admin-table.xlsx");
    message("导出成功", {
      type: "success"
    });
  };

  return {
    columns,
    dataList,
    exportExcel
  };
}
