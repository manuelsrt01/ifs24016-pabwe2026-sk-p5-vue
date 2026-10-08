import { createRouter, createWebHistory } from "vue-router";
import AuthLayout from "./features/auth/layouts/AuthLayout.vue";
import LoginPage from "./features/auth/pages/LoginPage.vue";
import RegisterPage from "./features/auth/pages/RegisterPage.vue";
import { useAuthStore } from "./features/auth/states/authStore.js";
import NotFoundPage from "./features/common/pages/NotFoundPage.vue";
import AucationLayout from "./features/aucations/layouts/AucationLayout.vue";
import DetailPage from "./features/aucations/pages/DetailPage.vue";
import HomePage from "./features/aucations/pages/HomePage.vue";
import ProfilePage from "./features/users/pages/ProfilePage.vue";
import UsersPage from "./features/users/pages/UsersPage.vue";

export const routes = [
  {
    path: "/auth",
    component: AuthLayout,
    meta: { guestOnly: true },
    redirect: "/auth/login",
    children: [
      { path: "login", component: LoginPage },
      { path: "register", component: RegisterPage },
    ],
  },
  {
    path: "/",
    component: AucationLayout,
    meta: { requiresAuth: true },
    children: [
      { path: "", component: HomePage },
      { path: "aucations/:aucationId", component: DetailPage },
      { path: "users", component: UsersPage },
      { path: "profile", component: ProfilePage },
    ],
  },
  { path: "/:pathMatch(.*)*", component: NotFoundPage },
];

// Belum login -> /auth/login. Sudah login -> tidak perlu ke halaman auth.
export function authGuard(to) {
  const auth = useAuthStore();
  if (to.meta.requiresAuth && !auth.isAuthenticated) return "/auth/login";
  if (to.meta.guestOnly && auth.isAuthenticated) return "/";
  return true;
}

export function createAppRouter(history) {
  const router = createRouter({ history, routes });
  router.beforeEach(authGuard);
  return router;
}

export default createAppRouter(createWebHistory());
