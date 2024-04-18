export default {
  path: "/table",
  redirect: "/table/index",
  meta: {
    icon: "ri:table-line",
    title: "menus.pureTable",
    rank: 5
  },
  children: [
    {
      path: "/table/index",
      name: "PureTable",
      component: () => import("@/views/table/index.vue"),
      meta: {
        title: "menus.pureTableBase"
      }
    },
    {
      path: "/table/high",
      name: "PureTableHigh",
      component: () => import("@/views/table/high.vue"),
      meta: {
        title: "menus.pureTableHigh"
      }
    },
    {
      path: "/table/edit",
      name: "PureTableEdit",
      component: () => import("@/views/table/edit.vue"),
      meta: {
        title: "menus.pureTableEdit",
        extraIcon: "IF-pure-iconfont-new svg"
      }
    },
    {
      path: "/table/virtual",
      name: "VxeTable",
      component: () => import("@/views/table/virtual.vue"),
      meta: {
        title: "menus.pureVxeTable",
        extraIcon: "IF-pure-iconfont-new svg"
      }
    }
  ]
} satisfies RouteConfigsTable;
