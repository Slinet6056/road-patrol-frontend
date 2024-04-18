export default {
  path: "/road",
  redirect: "/road/index",
  meta: {
    icon: "icon-park-outline:road",
    title: "道路管理",
    rank: 1
  },
  children: [
    {
      path: "/road/index",
      name: "ViewRoad",
      component: () => import("@/views/road/index.vue"),
      meta: {
        title: "道路查看"
      }
    },
    {
      path: "/road/edit",
      name: "EditRoad",
      component: () => import("@/views/road/edit.vue"),
      meta: {
        title: "道路编辑"
      }
    }
  ]
} satisfies RouteConfigsTable;
