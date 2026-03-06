<template>
  <section class="last-books">
    <header class="last-books-header">
      <h2>Derniers ouvrages</h2>
    </header>

    <div class="last-books-grid">
      <!-- 4 cartes de livres -->
      <BookCard v-for="n in 5" :key="n" />

      <!-- Carte "Voir plus" très simplifiée -->
      <article class="see-more-card">
        <h3>Voir plus !</h3>
        <p>Découvrez les livres et les critiques de la communauté.</p>
        <button type="button" class="see-more-btn">→</button>
      </article>
    </div>
  </section>
</template>

<script setup>
import BookCard from "./BookCard.vue";
</script>

<style scoped>
.last-books-header h2 {
  margin: 0 0 0.8rem;
  font-size: 1.1rem;
}

.last-books-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
}

/* carte "voir plus" */
.see-more-card {
  border-radius: 0.9rem;
  border: 2px solid #111827;
  background: #f9fafb;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  font-size: 0.9rem;
}

.see-more-card h3 {
  margin: 0 0 0.4rem;
}

.see-more-card p {
  margin: 0 0 0.7rem;
  color: #4b5563;
}

.see-more-btn {
  align-self: flex-end;
  width: 32px;
  height: 32px;
  border-radius: 999px;
  border: 1px solid #111827;
  background: #ffffff;
  cursor: pointer;
}
@media (max-width: 900px) {
  .last-books-grid {
    grid-template-columns: 1fr;
  }
}
</style>
