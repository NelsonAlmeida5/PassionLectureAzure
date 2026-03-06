<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import apiClient from "@/services/apiClient";

const router = useRouter();

const username = ref("");
const password = ref("");
const loading = ref(false);
const error = ref("");

async function handleLogin() {
  loading.value = true;
  error.value = "";

  try {
    const res = await apiClient.post("/user/login", {
      username: username.value,
      password: password.value,
    });

    console.log("LOGIN RESPONSE", res.data);

    const payload = res?.data?.data ?? res?.data ?? {};

    //  Adonis: token est un objet { type, token }
    const token = payload?.token?.token ?? null;
    const userId = payload?.id ?? null;
    const user = payload.user ?? null;

    if (!token || !userId) {
      throw new Error("Réponse login incomplète (token/userId manquants).");
    }

    localStorage.setItem("auth_token", token);
    localStorage.setItem("auth_userId", String(userId));
    localStorage.setItem("auth_user", JSON.stringify(user));

    router.push("/mes-livres");
  } catch (e) {
    error.value =
      e?.response?.data?.message || e?.message || "Impossible de se connecter.";
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <section class="login">
    <div class="login__card">
      <h1 class="login__title">Login</h1>
      <p class="login__subtitle">
        Connecte-toi avec ton username et mot de passe.
      </p>

      <form class="login__form" @submit.prevent="handleLogin">
        <label class="field">
          <span class="field__label">Username</span>
          <input
            v-model.trim="username"
            class="field__input"
            type="text"
            autocomplete="username"
            placeholder="ex: alice"
            required
          />
        </label>

        <label class="field">
          <span class="field__label">Password</span>
          <input
            v-model="password"
            class="field__input"
            type="password"
            autocomplete="current-password"
            placeholder="••••••••"
            required
          />
        </label>

        <p v-if="error" class="login__error">{{ error }}</p>

        <button class="login__btn" type="submit" :disabled="loading">
          {{ loading ? "Connexion…" : "Se connecter" }}
        </button>
      </form>
    </div>
  </section>
</template>

<style scoped>
.login {
  min-height: calc(100vh - 120px);
  display: grid;
  place-items: center;
  padding: 2rem 1rem;
}

.login__card {
  width: 100%;
  max-width: 420px;
  background: #f2f2f2;
  border-radius: 1.2rem;
  padding: 1.5rem;
  box-shadow: 0 8px 22px rgba(0, 0, 0, 0.08);
}

.login__title {
  margin: 0 0 0.25rem;
  font-size: 1.3rem;
}

.login__subtitle {
  margin: 0 0 1.25rem;
  color: #555;
  font-size: 0.95rem;
}

.login__form {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.field__label {
  font-size: 0.9rem;
  color: #333;
}

.field__input {
  border: 1px solid #ddd;
  border-radius: 0.9rem;
  padding: 0.8rem 0.9rem;
  font-size: 0.95rem;
  outline: none;
  background: #b1b1b1;
}

.field__input:focus {
  border-color: #000;
}

.login__error {
  margin: 0;
  color: #b00020;
  font-size: 0.9rem;
}

.login__btn {
  padding: 0.8rem 1rem;
  border-radius: 999px;
  border: none;
  background: #000;
  color: #fff;
  font-weight: 600;
  cursor: pointer;
}

.login__btn:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.login__hint {
  margin-top: 1rem;
  color: #666;
}
</style>
