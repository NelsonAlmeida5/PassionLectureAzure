<template>
  <div class="page-books">
    <!-- Header -->
    <header class="books-header">
      <h1 class="books-title">Liste des ouvrages par catégorie</h1>
    </header>

    <p v-if="loading" class="status-text">Chargement…</p>
    <p v-else-if="error" class="status-text error-text">{{ error }}</p>

    <!-- Layout -->
    <section v-else class="books-layout">
      <!-- Sidebar catégories -->
      <aside class="sidebar">
        <div class="sidebar-title">Catégories</div>

        <div class="category-list">
          <div
            class="category-item"
            :class="{ active: selectedCategory === null }"
            @click="selectCategory(null)"
          >
            <span>Toutes</span>
            <span class="category-count">{{ books.length }}</span>
          </div>

          <div
            v-for="cat in categoriesWithCount"
            :key="cat.name"
            class="category-item"
            :class="{ active: selectedCategory === cat.name }"
            @click="selectCategory(cat.name)"
          >
            <span>{{ cat.name }}</span>
            <span class="category-count">{{ cat.count }}</span>
          </div>
        </div>
      </aside>

      <!-- Grille des ouvrages -->
      <div class="books-grid">
        <div v-for="book in filteredBooks" :key="book.id" class="book-card">
          <div class="book-title">
            <nav class="pl-nav">
              Titre:
              <button
                type="button"
                class="btn btn-view"
                @click="viewBook(book)"
              >
                {{ book.title }}
              </button>
            </nav>
          </div>

          <div class="book-meta">
            <span class="badge">
              <strong>Catégorie:</strong> {{ book.category?.label ?? "—" }}
            </span>

            <span class="badge badge-cyan">
              <strong>Auteur:</strong>
              {{ book.writer?.firstname ?? "" }}
              {{ book.writer?.lastname ?? "" }}
            </span>

            <span class="badge">
              <strong>Éditeur:</strong> {{ book.editor ?? "—" }}
            </span>

            <span class="badge badge-cyan">
              <strong>Année:</strong> {{ book.editionYear ?? "—" }}
            </span>

            <span class="badge">
              <strong>Pages:</strong> {{ book.numberOfPages ?? "—" }}
            </span>

            <span class="badge">
              <strong>Ajouté par:</strong>
              <button
                type="button"
                class="link-like"
                :disabled="!book.user?.id"
                @click="goToUserBooks(book.user.id)"
              >
                {{ book.user?.username ?? "—" }}
              </button>
            </span>
          </div>
        </div>

        <!-- Etat vide -->
        <div v-if="filteredBooks.length === 0" class="book-card">
          <div class="book-title">Aucun ouvrage trouvé</div>
          <div class="book-meta">Essayez une autre sélection de catégorie.</div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import apiClient from "@/services/apiClient";

const router = useRouter();

const books = ref([]);
const loading = ref(false);
const error = ref("");

const selectedCategory = ref(null);

function goToUserBooks(userId) {
  router.push({ name: "user-books", params: { userId } });
}

function selectCategory(name) {
  selectedCategory.value = name;
}

const categoriesWithCount = computed(() => {
  const counts = new Map();

  for (const b of books.value) {
    const label = b.category?.label ?? "Uncategorized";
    counts.set(label, (counts.get(label) ?? 0) + 1);
  }

  return Array.from(counts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => a.name.localeCompare(b.name));
});

const filteredBooks = computed(() => {
  if (!selectedCategory.value) return books.value;
  return books.value.filter(
    (b) => (b.category?.label ?? "Uncategorized") === selectedCategory.value
  );
});

function viewBook(book) {
  // go to detail view (you can replace with comment page later)
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

<style scoped>
/* Global page container in your Warhammer vibe */
.page-books {
  max-width: 1200px;
  margin: 40px auto;
  padding: 30px;
  background: linear-gradient(135deg, #1c1c1c, #2a2a2a);
  border-radius: 12px;
  box-shadow: 0 0 25px rgba(0, 0, 0, 0.8);
  color: #f5f5f5;
  font-family: "Orbitron", sans-serif;
  border: 2px solid #444;
  position: relative;
  overflow: hidden;
}

/* Diagonal stripes overlay */
.page-books::before {
  content: "";
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    45deg,
    rgba(255, 215, 0, 0.05),
    rgba(255, 215, 0, 0.05) 20px,
    transparent 20px,
    transparent 40px
  );
  pointer-events: none;
}

.books-header {
  position: relative;
  z-index: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-bottom: 20px;
}

.books-title {
  margin: 0;
  font-size: 28px;
  color: #ffd700;
  text-shadow: 2px 2px 6px rgba(0, 0, 0, 0.8);
  letter-spacing: 2px;
}

.status-text {
  position: relative;
  z-index: 1;
  margin: 0.5rem 0;
  color: #ddd;
}
.error-text {
  color: #ffd700;
}

/* Layout */
.books-layout {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: 260px 1fr;
  gap: 18px;
}

/* Sidebar */
.sidebar {
  border: 1px solid #555;
  border-radius: 10px;
  background: rgba(0, 0, 0, 0.35);
  padding: 14px;
}

.sidebar-title {
  font-weight: bold;
  margin-bottom: 10px;
  color: #ffd700;
  letter-spacing: 1px;
}

.category-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.category-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid #666;
  background: #111;
  cursor: pointer;
  transition: border 0.2s, box-shadow 0.2s, transform 0.15s;
}

.category-item:hover {
  transform: scale(1.01);
  border: 1px solid #ffd700;
  box-shadow: 0 0 8px rgba(255, 215, 0, 0.35);
}

.category-item.active {
  border: 1px solid #ffd700;
  box-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
}

.category-count {
  color: #ffd700;
  font-weight: bold;
}

/* Grid */
.books-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 14px;
}

.book-card {
  border-radius: 12px;
  border: 1px solid #666;
  background: rgba(0, 0, 0, 0.35);
  padding: 14px;
  box-shadow: 0 0 18px rgba(0, 0, 0, 0.45);
}

.book-title,
.book-title a {
  font-size: 16px;
  color: #ffd700;
  margin-bottom: 10px;
  letter-spacing: 0.5px;
}

.book-meta {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 13px;
  color: #ddd;
}

.badges {
  padding: 8px 10px;
  border-radius: 8px;
  background: #111;
  border: 1px solid #666;
}

.badge-cyan {
  border-color: rgba(0, 230, 118, 0.35);
}

.card-actions {
  margin-top: 12px;
  display: flex;
  justify-content: flex-end;
}

/* Buttons (reusing your vibe) */
.btn {
  padding: 10px 14px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-weight: bold;
  text-transform: uppercase;
  transition: transform 0.2s, box-shadow 0.2s;
}

.btn:hover {
  transform: scale(1.05);
  box-shadow: 0 0 12px rgba(255, 215, 0, 0.6);
}

.btn-view {
  background: #ffd700;
  color: #111;
}

/* Responsive */
@media (max-width: 900px) {
  .books-layout {
    grid-template-columns: 1fr;
  }
}
</style>
