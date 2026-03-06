<template>
  <footer class="pl-footer">
    <div class="pl-footer-inner">
      <!-- Colonne gauche -->
      <div class="pl-footer-col pl-footer-left">
        <h2 class="pl-footer-title">Passion Lecture</h2>
        <p class="pl-footer-text">
          Votre source de confiance pour des critiques de livres honnêtes et des
          discussions littéraires.
        </p>
      </div>

      <!-- Colonne centrale -->
      <div class="pl-footer-col pl-footer-center">
        <div class="pl-footer-logo">
          <!-- <span class="pl-footer-logo-icon">🪶</span> -->
          <span class="pl-footer-logo-text">Passion Lecture</span>
        </div>
        <div class="pl-footer-divider"></div>
        <p class="pl-footer-copy">
          © 2025 Passion Lecture. Tous droits réservés.
          <br />
          Meron Essayas, Christopher Ristic &amp; Nelson Almeida
        </p>
      </div>

      <!-- Colonne droite -->
      <div class="pl-footer-col pl-footer-right">
        <h2 class="pl-footer-contact-title">contactez nous:</h2>
        <p class="pl-footer-text">
          pour tout problème remarque ou commentaire, écrivez nous:
          <br />
          <span class="pl-footer-email">meron.essayas@eduvaud.ch</span>
        </p>
      </div>
    </div>
  </footer>
</template>

<script setup></script>

<style scoped>
.pl-footer {
  border-top: 1px solid #111111;
  background: #edf3f7;
  color: #111827;
}

.pl-footer-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2.25rem 3rem 1.75rem;
  display: grid;
  grid-template-columns: 1.3fr 1.4fr 1.3fr;
  gap: 2.5rem;
  align-items: flex-start;
  font-size: 0.9rem;
}

/* Colonnes */
.pl-footer-col {
  line-height: 1.5;
}

.pl-footer-left,
.pl-footer-right {
  align-self: center;
}

/* Titres */
.pl-footer-title,
.pl-footer-contact-title {
  font-size: 0.95rem;
  font-weight: 600;
  margin: 0 0 0.6rem;
}

/* Texte */
.pl-footer-text {
  margin: 0;
  max-width: 260px;
}

/* Logo centre */
.pl-footer-center {
  text-align: center;
}

.pl-footer-logo {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  margin-bottom: 1.2rem;
}

.pl-footer-logo-icon {
  font-size: 1.8rem;
}

.pl-footer-logo-text {
  font-family: "Playfair Display", "Times New Roman", serif;
  font-size: 1.7rem;
  font-weight: 600;
}

/* Ligne de séparation */
.pl-footer-divider {
  height: 1px;
  max-width: 420px;
  margin: 0 auto 1.2rem;
  background: #9ca3af;
}

/* Copyright */
.pl-footer-copy {
  margin: 0;
  font-size: 0.85rem;
}

/* Email */
.pl-footer-email {
  font-weight: 600;
}

/* Responsive */
@media (max-width: 900px) {
  .pl-footer-inner {
    grid-template-columns: 1fr;
    text-align: left;
    padding: 1.75rem 1.5rem 1.5rem;
  }

  .pl-footer-center {
    text-align: left;
  }

  .pl-footer-divider {
    margin-left: 0;
  }
}
</style>
