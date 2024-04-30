export default {
  path: "/patrol",
  redirect: "/patrol/plan",
  meta: {
    icon: "icon-park-outline:schedule",
    title: "巡检管理",
    rank: 2
  },
  children: [
    {
      path: "/patrol/plan",
      name: "PatrolPlan",
      component: () => import("@/views/patrol/plan.vue"),
      meta: {
        title: "巡检计划",
        roles: ["inspector", "admin"]
      }
    },
    {
      path: "/patrol/report",
      name: "PatrolReport",
      component: () => import("@/views/patrol/report.vue"),
      meta: {
        title: "巡检报告",
        roles: ["inspector", "admin"]
      }
    }
  ]
} satisfies RouteConfigsTable;
