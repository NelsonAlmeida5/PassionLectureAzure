<template>
  <header class="pl-header">
    <div class="pl-header-inner">
      <!-- Logo -->
      <RouterLink to="/" class="pl-logo">
        <span class="pl-logo-text">Passion Lecture</span>
      </RouterLink>

      <!-- Nav centre -->
      <nav class="pl-nav">
        <RouterLink to="/categories" class="pl-nav-link"
          >Liste des ouvrages par catégorie</RouterLink
        >
      </nav>

      <!-- Zone droite -->
      <div class="pl-right">
        <!-- CTA -->
        <RouterLink to="/mes-livres" class="pl-cta"> Mes livres </RouterLink>

        <!-- Avatar / Logout -->
        <template v-if="isLogged">
          <button
            class="pl-avatar"
            @click="handleLogout"
            aria-label="Logout"
            title="Se déconnecter"
          >
            <span class="pl-avatar-icon">🔓</span>
          </button>
        </template>
        <template v-else>
          <RouterLink to="/login" class="pl-avatar" aria-label="Login">
            <span class="pl-avatar-icon">👤</span>
          </RouterLink>
        </template>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import { RouterLink, useRouter } from "vue-router";

const router = useRouter();
const isLogged = ref(!!localStorage.getItem("auth_token"));

function handleLogout() {
  localStorage.removeItem("auth_token");
  localStorage.removeItem("auth_userId");
  localStorage.removeItem("auth_user");
  isLogged.value = false;
  router.push("/");
}

function storageHandler(e) {
  if (e.key === "auth_token") {
    isLogged.value = !!e.newValue;
  }
}

onMounted(() => {
  window.addEventListener("storage", storageHandler);
});

onBeforeUnmount(() => {
  window.removeEventListener("storage", storageHandler);
});
</script>

<style scoped>
.pl-header {
  position: sticky;
  top: 0;
  z-index: 20;
  background: #ffffff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.12);
  border-bottom: 1px solid #e5e5e5; /* petite ligne comme sur la maquette */
}

.pl-header-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0.75rem 1.5rem;
  min-height: 64px; /* hauteur proche de la maquette */
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
}

/* Logo */

.pl-logo {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  text-decoration: none;
  color: #111111;
}

.pl-logo-icon {
  font-size: 1.7rem;
}

.pl-logo-text {
  font-family: "Playfair Display", "Times New Roman", serif;
  font-size: 1.4rem;
  font-weight: 600;
}

/* Nav centre */

.pl-nav {
  display: flex;
  align-items: center;
  gap: 2rem;
  flex: 1;
  justify-content: center;
}

.pl-nav-link {
  text-decoration: none;
  color: #222222;
  font-size: 0.98rem;
  text-transform: lowercase;
  letter-spacing: 0.05em;
}

.pl-nav-link.router-link-active {
  font-weight: 600;
}

/* Zone droite */

.pl-right {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

/* Search */

.pl-search {
  display: flex;
  align-items: center;
  padding: 0.25rem 0.85rem;
  border-radius: 999px;
  min-width: 270px;
  background: linear-gradient(180deg, #e7e7e7 0%, #d2d2d2 100%);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.6);
}

.pl-search-icon {
  font-size: 0.9rem;
  margin-right: 0.4rem;
  color: #555555;
}

.pl-search input {
  border: none;
  outline: none;
  background: transparent;
  font-size: 0.9rem;
  width: 100%;
  color: #333333;
}

.pl-search input::placeholder {
  color: #7d7d7d;
}

/* CTA */

.pl-cta {
  text-decoration: none;
  padding: 0.45rem 1.15rem;
  border-radius: 999px;
  background: #000000;
  color: #ffffff;
  font-size: 0.9rem;
  font-weight: 500;
  white-space: nowrap;
}

.pl-cta:hover {
  filter: brightness(1.06);
}

/* Avatar */

.pl-avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  border: 1px solid #111111;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.pl-avatar-icon {
  font-size: 1.1rem;
}
</style>
