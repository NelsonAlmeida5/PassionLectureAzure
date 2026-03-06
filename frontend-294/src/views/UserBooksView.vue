<template>
  <div class="page-books">
    <header class="books-header">
      <h1 class="books-title">Livres ajoutés par {{ username }}</h1>
      <button class="btn btn-view" @click="router.back()">Retour</button>
    </header>

    <p v-if="loading" class="status-text">Chargement…</p>
    <p v-else-if="error" class="status-text error-text">{{ error }}</p>

    <div v-else class="books-grid">
      <div v-for="book in userBooks" :key="book.id" class="book-card">
        <div class="book-title">
          <button type="button" class="btn btn-view" @click="viewBook(book)">
            {{ book.title }}
          </button>
        </div>

        <div class="book-meta">
          <span class="badge"
            ><strong>Catégorie:</strong> {{ book.category?.label ?? "—" }}</span
          >
          <span class="badge badge-cyan"
            ><strong>Auteur:</strong> {{ book.writer?.firstname ?? "" }}
            {{ book.writer?.lastname ?? "" }}</span
          >
          <span class="badge"
            ><strong>Éditeur:</strong> {{ book.editor ?? "—" }}</span
          >
          <span class="badge badge-cyan"
            ><strong>Année:</strong> {{ book.editionYear ?? "—" }}</span
          >
        </div>
      </div>

      <div v-if="userBooks.length === 0" class="book-card">
        <div class="book-title">Aucun livre trouvé pour cet utilisateur</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import apiClient from "@/services/apiClient";

const route = useRoute();
const router = useRouter();

const userId = computed(() => Number(route.params.userId));

const books = ref([]);
const loading = ref(false);
const error = ref("");

const username = computed(() => {
  const any = books.value.find((b) => b.user?.id === userId.value);
  return any?.user?.username ?? "—";
});

const userBooks = computed(() =>
  books.value.filter((b) => b.user?.id === userId.value)
);

function viewBook(book) {
  router.push({ name: "detail", params: { id: book.id } });
}

async function fetchBooks() {
  loading.value = true;
  error.value = "";
  try {
    const res = await apiClient.get("/books");
    books.value = res.data ?? [];
  } catch (e) {
    error.value =
      e?.response?.data?.message ||
      e?.message ||
      "Impossible de charger les livres.";
  } finally {
    loading.value = false;
  }
}

onMounted(fetchBooks);
</script>
