import { createRouter, createWebHistory } from "vue-router";

import HomeView from "../views/HomeView.vue";
import CategoryView from "../views/CategoryView.vue";
import AddBook from "../views/AddBookView.vue";
import DetailView from "../views/CommentView.vue";
import GetUserBooksView from "../views/GetUserBooksView.vue";
import ModifyBookView from "../views/ModifyBookView.vue";
import LoginView from "../views/LoginView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: "/", name: "home", component: HomeView },
    { path: "/categories", name: "categories", component: CategoryView },
    { path: "/login", name: "login", component: LoginView },

    {
      path: "/add-book",
      name: "addBook",
      component: AddBook,
    },
    { path: "/book/:id", name: "detail", component: DetailView },

    {
      path: "/mes-livres",
      name: "myBooks",
      component: GetUserBooksView,
      meta: { requiresAuth: true },
    },
    {
      path: "/modify/:id",
      name: "modify",
      component: ModifyBookView,
    },
    {
      path: "/users/:userId/books",
      name: "user-books",
      component: () => import("@/views/UserBooksView.vue"),
      props: true,
    },
  ],
});

//  Global guard
router.beforeEach((to) => {
  const token = localStorage.getItem("auth_token");

  // if route requires auth and no token -> go login
  if (to.meta.requiresAuth && !token) {
    return { name: "login" };
  }

  // if already logged in and tries to access login -> redirect
  if (to.name === "login" && token) {
    return { name: "myBooks" }; // or "home"
  }

  return true;
});

export default router;
