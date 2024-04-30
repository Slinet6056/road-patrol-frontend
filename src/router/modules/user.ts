export default {
  path: "/user",
  redirect: "/user/index",
  meta: {
    icon: "icon-park-outline:user",
    title: "用户管理",
    rank: 4
  },
  children: [
    {
      path: "/user/index",
      name: "ViewUser",
      component: () => import("@/views/user/index.vue"),
      meta: {
        title: "用户管理",
        roles: ["admin"]
      }
    }
  ]
} satisfies RouteConfigsTable;
