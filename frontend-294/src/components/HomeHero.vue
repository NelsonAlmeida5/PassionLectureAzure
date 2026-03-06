<template>
  <section class="hero">
    <div class="hero-content">
      <h1 class="hero-title">
        partagez votre <span class="accent">Passion</span><br />
        <span class="accent">Lecture!</span>
      </h1>
      <p class="hero-text">
        Rejoignez notre communauté de passionnés de lecture et découvrez des
        critiques honnêtes et perspicaces de lecteurs comme vous.
      </p>
      <p class="hero-text">
        Trouvez votre prochain livre favori dès aujourd’hui.
      </p>
    </div>
  </section>
</template>

<script setup></script>

<style scoped>
.hero {
  border-radius: 1rem;
  padding: 1.75rem 2rem;
  background: linear-gradient(135deg, #e0f2fe, #f9fafb);
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.1);
  margin-bottom: 2rem;
}

.hero-title {
  font-size: 1.8rem;
  margin: 0 0 0.75rem;
}

.accent {
  font-weight: 700;
}

.hero-text {
  margin: 0.2rem 0;
  max-width: 520px;
  line-height: 1.5;
  color: #374151;
}
</style>
