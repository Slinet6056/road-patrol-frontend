import { message } from "@/utils/message";
import { ref, computed, onMounted } from "vue";
import { getUsers, addUser, updateUser, deleteUser } from "@/api/user";
import { ElMessageBox } from "element-plus";

export function useColumns() {
  const search = ref("");
  const dataList = ref([]);

  const REGEXP_PWD =
    /^(?![0-9]+$)(?![a-z]+$)(?![A-Z]+$)(?!([^(0-9a-zA-Z)]|[()])+$)(?!^.*[\u4E00-\u9FA5].*$)([^(0-9a-zA-Z)]|[()]|[a-z]|[A-Z]|[0-9]){8,18}$/;

  const roles = [
    {
      key: 0,
      value: "admin",
      label: "管理员"
    },
    {
      key: 1,
      value: "inspector",
      label: "巡检员"
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
          role: user.role,
          isEdited: false,
          originalData: null
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
        data.username === "" ||
        data.username.toLowerCase().includes(search.value.toLowerCase())
    )
  );

  const columns: TableColumnList = [
    {
      label: "编号",
      prop: "userID"
    },
    {
      label: "用户名",
      prop: "username",
      cellRenderer: ({ row }) => (
        <el-input
          v-model={row.username}
          clearable
          onBlur={() => onChange(row)}
        />
      )
    },
    {
      label: "密码",
      prop: "password",
      cellRenderer: ({ row }) => (
        <el-input
          v-model={row.password}
          clearable
          show-password
          onBlur={() => onChange(row)}
        />
      )
    },
    {
      label: "角色",
      prop: "role",
      cellRenderer: ({ row }) => (
        <el-select
          v-model={row.role}
          clearable
          placeholder="请选择角色"
          onChange={() => onChange(row)}
        >
          {roles.map(item => {
            return (
              <el-option key={item.key} label={item.label} value={item.value} />
            );
          })}
        </el-select>
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
          {row.isEdited && (
            <>
              <el-button size="small" onClick={() => onSave(row)}>
                保存
              </el-button>
              <el-button size="small" onClick={() => onCancel(row)}>
                取消
              </el-button>
            </>
          )}
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
      username: "",
      password: "",
      role: "inspector",
      isEdited: true,
      originalData: null
    };
    dataList.value.push({
      id: dataList.value.length,
      userID: null,
      ...newRow
    });
  }

  function onChange(row) {
    row.isEdited = true;
    row.originalData = { ...row };
  }

  function onSave(row) {
    if (!row.username) {
      message("用户名不能为空", { type: "error" });
      return;
    }
    if (!REGEXP_PWD.test(row.password)) {
      message("密码格式应为8-18位数字、字母、符号的任意两种组合", {
        type: "error"
      });
      return;
    }

    const duplicate = dataList.value.some(
      item => item.username === row.username && item.id !== row.id
    );
    if (duplicate) {
      message("用户名已存在", { type: "error" });
      return;
    }

    if (row.userID) {
      updateUser(row.userID, {
        username: row.username,
        password: row.password,
        role: row.role
      })
        .then(() => {
          row.isEdited = false;
          row.originalData = null;
          message("修改成功", {
            type: "success"
          });
        })
        .catch(error => {
          console.error("Failed to update user:", error);
          message("修改失败", {
            type: "error"
          });
        });
    } else {
      addUser({
        username: row.username,
        password: row.password,
        role: row.role
      })
        .then((response: { id: number }) => {
          row.userID = response.id;
          row.isEdited = false;
          row.originalData = null;
          message("添加成功", {
            type: "success"
          });
        })
        .catch(error => {
          console.error("Failed to add user:", error);
          message("添加失败", {
            type: "error"
          });
        });
    }
  }

  function onCancel(row) {
    if (row.userID) {
      Object.assign(row, row.originalData);
      row.isEdited = false;
      row.originalData = null;
    } else {
      const index = dataList.value.indexOf(row);
      dataList.value.splice(index, 1);
    }
  }

  function onDel(row) {
    ElMessageBox.confirm("确认删除该用户吗?", "提示", {
      confirmButtonText: "确认",
      cancelButtonText: "取消",
      type: "warning"
    }).then(() => {
      if (row.userID) {
        deleteUser(row.userID)
          .then(() => {
            const index = dataList.value.indexOf(row);
            dataList.value.splice(index, 1);
            message("删除成功", {
              type: "success"
            });
          })
          .catch(error => {
            console.error("Failed to delete user:", error);
            message("删除失败", {
              type: "error"
            });
          });
      } else {
        const index = dataList.value.indexOf(row);
        dataList.value.splice(index, 1);
      }
    });
  }

  return {
    columns,
    filterTableData,
    onAdd,
    onDel
  };
}
