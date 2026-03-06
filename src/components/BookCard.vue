<template>
  <article class="book-card">
    <div class="book-body">
      <h3 class="book-title">{{ book.title }}</h3>
      <p class="book-author">
        {{ book.writer?.firstname || "" }} {{ book.writer?.lastname || "" }}
      </p>

      <p class="book-category">{{ book.category.label }}</p>

      <p class="book-excerpt">
        {{ book.abstract }}
      </p>

      <p class="book-rating">
        <span v-if="averageNote(book.evaluations)" class="book-rating-value">
          {{ averageNote(book.evaluations) }}/5</span
        >
        <span v-else>-/5</span>
      </p>
    </div>
  </article>
</template>

<script>
export default {
  props: {
    book: {
      type: Object,
      required: true,
    },
  },
  methods: {
    averageNote(evaluations) {
      if (!evaluations || evaluations.length === 0) return 0;
      const sum = evaluations.reduce((acc, e) => acc + e.note, 0);
      return (sum / evaluations.length).toFixed(1); // arrondi à 1 décimale
    },
  },
};
</script>

<style scoped>
.book-card {
  display: flex;
  gap: 0.75rem;
  padding: 0.9rem;
  border-radius: 0.9rem;
  background: #ffffff;
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.08);
  font-size: 0.85rem;
}

.book-cover {
  width: 60px;
  height: 90px;
  border-radius: 0.5rem;
  background: #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  color: #6b7280;
}

.book-body {
  flex: 1;
}

.book-title {
  margin: 0 0 0.15rem;
  font-size: 0.95rem;
  font-weight: 600;
}

.book-author {
  margin: 0 0 0.3rem;
  color: #4b5563;
}

.book-category {
  display: inline-block;
  padding: 0.1rem 0.5rem;
  border-radius: 999px;
  background: #e0f2fe;
  color: #0369a1;
  font-size: 0.75rem;
  margin-bottom: 0.3rem;
}

.book-excerpt {
  margin: 0 0 0.35rem;
  color: #4b5563;
}

.book-rating {
  margin: 0;
  font-size: 0.8rem;
}

.book-rating-value {
  margin-left: 0.25rem;
  color: #4b5563;
}
</style>
