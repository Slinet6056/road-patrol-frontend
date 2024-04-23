import { ref, onMounted } from "vue";
import { utils, writeFile } from "xlsx";
import { message } from "@/utils/message";
import { getRoads } from "@/api/road";

export function useColumns() {
  const dataList = ref([]);

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

  onMounted(() => {
    getRoads()
      .then(response => {
        dataList.value = response.map((road, index) => ({
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
      })
      .catch(error => {
        console.error("Failed to load roads:", error);
        message("数据加载失败", {
          type: "error"
        });
      });
  });

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
