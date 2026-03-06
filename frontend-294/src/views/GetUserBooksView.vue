<template>
  <section class="my-books">
    <header class="my-books__header">
      <RouterLink v-if="isLoggedIn" to="/add-book" class="my-books__add"
        >Ajouter</RouterLink
      >
    </header>

    <p v-if="loading" class="status-text">Chargement de tes livres…</p>
    <p v-else-if="error" class="status-text error-text">{{ error }}</p>

    <div v-else class="my-books__list">
      <p v-if="books.length === 0" class="status-text">
        Aucun livre pour l’instant.
      </p>

      <article v-for="book in books" :key="book.id" class="my-books__item">
        <div class="my-books__info">
          <div class="my-books__text">
            <h2 class="my-books__title">
              <em>{{ book.title }}</em>
              <span class="my-books__year" v-if="book.year"
                >({{ book.year }})</span
              >
            </h2>

            <p class="my-books__author">{{ book.editor || "—" }}</p>

            <span class="my-books__tag">{{
              book.categoryLabel || "Uncategorized"
            }}</span>
          </div>
        </div>

        <div class="my-books__actions">
          <RouterLink
            :to="{ name: 'modify', params: { id: book.id } }"
            class="btn btn--edit"
          >
            modifier
          </RouterLink>

          <button
            type="button"
            class="btn btn--delete"
            @click="handleDelete(book.id)"
          >
            supprimer
          </button>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { RouterLink, useRouter } from "vue-router";
import apiClient from "@/services/apiClient";

const isLoggedIn = computed(() => !!localStorage.getItem("auth_token"));

const router = useRouter();

const books = ref([]);
const loading = ref(false);
const error = ref("");

function normalizeBook(raw) {
  return {
    id: raw.id,
    title: raw.title ?? "—",
    year: raw.edition_year ?? raw.editionYear ?? raw.year ?? null,
    editor: raw.editor ?? null,
    categoryLabel: raw.category?.label ?? raw.category ?? null,
    userId: raw.user_id ?? raw.userId ?? null,
    raw,
  };
}

async function fetchMyBooks() {
  loading.value = true;
  error.value = "";

  try {
    const authUserId = localStorage.getItem("auth_userId");
    if (!authUserId) {
      router.push({ name: "login" });
      return;
    }

    // On demande au backend de filtrer (si supporté)...
    const res = await apiClient.get("/books", {
      params: { user_id: authUserId },
    });

    // ...et on filtre TOUJOURS côté front pour être sûr
    const normalized = (res.data ?? []).map(normalizeBook);

    books.value = normalized.filter(
      (b) => String(b.userId) === String(authUserId)
    );
  } catch (e) {
    error.value =
      e?.response?.data?.message ||
      e?.message ||
      "Impossible de charger tes livres.";
  } finally {
    loading.value = false;
  }
}

async function handleDelete(bookId) {
  const ok = confirm("Supprimer ce livre ?");
  if (!ok) return;

  try {
    await apiClient.delete(`/books/${bookId}`);
    books.value = books.value.filter((b) => b.id !== bookId);
  } catch (e) {
    error.value =
      e?.response?.data?.message ||
      e?.message ||
      "Impossible de supprimer ce livre.";
  }
}

onMounted(fetchMyBooks);
</script>

<style scoped>
.btn--delete {
  background: #ff2d2d;
  color: #ffffff;
}

.my-books {
  max-width: 1200px;
  margin: 1.5rem auto 3rem;
  padding: 0 1.5rem;
}
.my-books__header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1.25rem;
}
.my-books__add {
  padding: 0.45rem 1.6rem;
  border-radius: 999px;
  background: #00e676;
  color: #fff;
  text-decoration: none;
}
.status-text {
  margin: 0.5rem 0;
  color: #444;
}
.error-text {
  color: #b00020;
}

.my-books__list {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
}
.my-books__item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.1rem 1.8rem;
  border-radius: 1.2rem;
  background: #f2f2f2;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.06);
}
.my-books__title {
  margin: 0 0 0.25rem;
  font-size: 0.95rem;
}
.my-books__title em {
  font-style: italic;
}
.my-books__year {
  margin-left: 0.25rem;
  font-weight: 400;
}
.my-books__author {
  margin: 0 0 0.4rem;
  font-size: 0.85rem;
  color: #555;
}
.my-books__tag {
  display: inline-block;
  padding: 0.12rem 0.7rem;
  border-radius: 999px;
  background: #000;
  color: #fff;
  font-size: 0.75rem;
}
.btn {
  min-width: 130px;
  padding: 0.4rem 1.2rem;
  border-radius: 999px;
  text-decoration: none;
  display: inline-flex;
  justify-content: center;
  align-items: center;
}
.btn--edit {
  background: #000;
  color: #fff;
}
@media (max-width: 900px) {
  .my-books__item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }
}
</style>
