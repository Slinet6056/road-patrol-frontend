import { message } from "@/utils/message";
import { ref, computed, onMounted } from "vue";
import { getRoads, addRoad, updateRoad, deleteRoad } from "@/api/road";

export function useColumns() {
  const search = ref("");
  const dataList = ref([]);

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

  const filterTableData = computed(() =>
    dataList.value.filter(
      data =>
        !search.value ||
        data.name === "" ||
        data.name.toLowerCase().includes(search.value.toLowerCase())
    )
  );

  const columns: TableColumnList = [
    {
      label: "名称",
      prop: "name",
      cellRenderer: ({ row }) => (
        <el-input v-model={row.name} clearable onBlur={() => onChange(row)} />
      )
    },
    {
      label: "纬度",
      prop: "latitude",
      cellRenderer: ({ row }) => (
        <el-input-number
          v-model={row.latitude}
          controls-position="right"
          step={0.0001}
          precision={4}
          onBlur={() => onChange(row)}
        />
      )
    },
    {
      label: "经度",
      prop: "longitude",
      cellRenderer: ({ row }) => (
        <el-input-number
          v-model={row.longitude}
          controls-position="right"
          step={0.0001}
          precision={4}
          onBlur={() => onChange(row)}
        />
      )
    },
    {
      label: "长度",
      prop: "length",
      cellRenderer: ({ row }) => (
        <el-input-number
          v-model={row.length}
          controls-position="right"
          step={0.001}
          precision={3}
          onBlur={() => onChange(row)}
        />
      )
    },
    {
      label: "类型",
      prop: "type",
      cellRenderer: ({ row }) => (
        <el-input v-model={row.type} clearable onBlur={() => onChange(row)} />
      )
    },
    {
      label: "路面材质",
      prop: "surfaceMaterial",
      cellRenderer: ({ row }) => (
        <el-input
          v-model={row.surfaceMaterial}
          clearable
          onBlur={() => onChange(row)}
        />
      )
    },
    {
      label: "建成年份",
      prop: "constructionYear",
      cellRenderer: ({ row }) => (
        <el-input-number
          v-model={row.constructionYear}
          controls-position="right"
          step={1}
          precision={0}
          onBlur={() => onChange(row)}
        />
      )
    },
    {
      align: "right",
      headerRenderer: () => (
        <el-input
          v-model={search.value}
          size="small"
          clearable
          placeholder="输入搜索内容"
        />
      ),
      cellRenderer: ({ row }) => (
        <>
          <el-button size="small" type="danger" onClick={() => onDel(row)}>
            删除
          </el-button>
        </>
      ),
      slot: "operation"
    }
  ];

  function onAdd() {
    const newRow = {
      name: "",
      latitude: 0,
      longitude: 0,
      length: 0,
      type: "",
      surfaceMaterial: "",
      constructionYear: 0
    };
    addRoad(newRow)
      .then((response: { id: number }) => {
        dataList.value.push({
          id: dataList.value.length,
          roadId: response.id,
          ...newRow
        });
      })
      .catch(error => {
        console.error("Failed to add road:", error);
        message("添加数据失败", {
          type: "error"
        });
      });
  }

  function onChange(row) {
    updateRoad(row.roadId, {
      name: row.name,
      latitude: row.latitude,
      longitude: row.longitude,
      length: row.length,
      type: row.type,
      surface_material: row.surfaceMaterial,
      construction_year: row.constructionYear
    }).catch(error => {
      console.error("Failed to update road:", error);
      message("修改失败", {
        type: "error"
      });
    });
  }

  function onDel(row) {
    const index = dataList.value.indexOf(row);
    deleteRoad(row.roadId)
      .then(() => {
        dataList.value.splice(index, 1);
      })
      .catch(error => {
        console.error("Failed to delete road:", error);
        message("删除失败", {
          type: "error"
        });
      });
  }

  return {
    columns,
    filterTableData,
    onAdd,
    onDel
  };
}
