import { ref, onMounted } from "vue";
import { utils, writeFile } from "xlsx";
import { message } from "@/utils/message";
import { getUsers } from "@/api/user";

export function useColumns() {
  const dataList = ref([]);

  const columns: TableColumnList = [
    {
      label: "编号",
      prop: "userID"
    },
    {
      label: "用户名",
      prop: "username"
    },
    {
      label: "密码",
      prop: "password",
      formatter: row => {
        return "●".repeat(row.password.length);
      }
    },
    {
      label: "角色",
      prop: "role"
    }
  ];

  onMounted(() => {
    getUsers()
      .then(response => {
        dataList.value = response.map((user, index) => ({
          id: index,
          userID: user.id,
          username: user.username,
          password: user.password,
          role: user.role
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
