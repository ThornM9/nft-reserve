import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import User from "@/views/User.vue";
import CreateReserve from "@/views/CreateReserve.vue";
import ManageReserve from "@/views/ManageReserve.vue";
import Home from "@/views/Home.vue";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "Home",
    component: Home,
  },
  {
    path: "/create",
    name: "Create Reserve",
    component: CreateReserve,
  },
  {
    path: "/manage",
    name: "Manage Reserve",
    component: ManageReserve,
  },
  {
    path: "/user",
    name: "User",
    component: User,
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
