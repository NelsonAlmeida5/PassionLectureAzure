<template>
  <div class="home-page">
    <!-- Hero d'accueil -->
    <HomeHero />

    <!-- Derniers livres -->
    <section class="last-books">
      <h2 class="last-books-title">Derniers livres ajoutés</h2>

      <p v-if="loading" class="status-text">Chargement des livres...</p>
      <p v-else-if="error" class="status-text error-text">{{ error }}</p>

      <div v-else class="books-grid">
        <BookCard v-for="book in books" :key="book.id" :book="book" />
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import HomeHero from "../components/HomeHero.vue";
import BookCard from "../components/BookCard.vue";
import BookService from "../services/bookService";

const books = ref([]);
const loading = ref(true);
const error = ref(null);

function getCreatedTime(b) {
  // adapte selon ce que renvoie ton API
  const raw =
    b.created_at ?? b.createdAt ?? b.createdDate ?? b.creationDate ?? null;

  const t = raw ? new Date(raw).getTime() : NaN;
  return Number.isFinite(t) ? t : 0;
}

onMounted(async () => {
  try {
    const response = await BookService.getBooks();
    const all = Array.isArray(response.data) ? response.data : [];

    //  tri du plus récent au plus ancien, puis on garde 5
    books.value = all.slice(-5).reverse();
  } catch (err) {
    console.error(err);
    error.value = "Impossible de charger les livres.";
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.home-page {
  max-width: 1200px;
  margin: 1.5rem auto 2rem;
  padding: 0 1.5rem;
}

/* Section derniers livres */

.last-books {
  margin-top: 2.5rem;
}

.last-books-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1.2rem;
}

.status-text {
  margin: 0.5rem 0 1rem;
  font-size: 0.95rem;
}

.error-text {
  color: #c0392b;
}

/* Grille de livres */

.books-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
  gap: 1.5rem;
}
</style>
