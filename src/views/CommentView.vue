<template>
  <section class="detail">
    <p v-if="loading" class="status">Chargement…</p>
    <p v-else-if="error" class="status error">{{ error }}</p>

    <div v-else class="card">
      <!-- Book info -->
      <header class="header">
        <h1 class="title">{{ book.title }}</h1>
        <p class="subtitle">
          <span v-if="book.editionYear">({{ book.editionYear }})</span>
          <span v-if="book.editor"> — {{ book.editor }}</span>
        </p>

        <div class="chips">
          <span class="chip">{{ book.categoryLabel }}</span>
          <span class="chip chip-soft" v-if="book.writerName">{{
            book.writerName
          }}</span>
          <span class="chip chip-soft" v-if="book.userName"
            >Ajouté par: {{ book.userName }}</span
          >
        </div>
      </header>

      <div class="body">
        <p class="abstract" v-if="book.abstract">{{ book.abstract }}</p>
      </div>

      <hr class="sep" />

      <!--  Moyenne basée sur la table evaluations (GET /books/:id/evaluations) -->
      <p class="book-rating">
        <span v-if="averageRating">{{ averageRating }}/5</span>
        <span v-else>- /5</span>
      </p>

      <!-- Comment + rating -->
      <section v-if="isLoggedIn" class="comment">
        <h2 class="h2">Commenter & noter</h2>

        <label class="field">
          <span class="label">Note (/5)</span>
          <select v-model.number="rating" class="input">
            <option :value="5">5</option>
            <option :value="4">4</option>
            <option :value="3">3</option>
            <option :value="2">2</option>
            <option :value="1">1</option>
          </select>
        </label>

        <label class="field">
          <span class="label">Commentaire</span>
          <textarea
            v-model.trim="comment"
            class="textarea"
            placeholder="Écris ton avis…"
            rows="4"
          />
        </label>

        <p v-if="saveError" class="status error">{{ saveError }}</p>
        <p v-if="saveSuccess" class="status ok">{{ saveSuccess }}</p>

        <div class="actions">
          <button
            class="btn"
            type="button"
            @click="handleSave"
            :disabled="saving"
          >
            {{ saving ? "Enregistrement…" : "Enregistrer" }}
          </button>
        </div>
      </section>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import apiClient from "@/services/apiClient";

const isLoggedIn = computed(() => !!localStorage.getItem("auth_token"));

const route = useRoute();
const router = useRouter();

const loading = ref(false);
const error = ref("");

const saving = ref(false);
const saveError = ref("");
const saveSuccess = ref("");

const book = ref({
  id: null,
  title: "",
  editor: "",
  editionYear: null,
  abstract: "",
  pdfLink: "",
  categoryLabel: "Uncategorized",
  writerName: "",
  userName: "",
  raw: null,
});

/**  Liste des évaluations venant de la table evaluations */
const evaluations = ref([]);

/** calcule la moyenne à partir d'un tableau d'évaluations { note } */
function averageNote(evals) {
  if (!Array.isArray(evals) || evals.length === 0) return null;
  const sum = evals.reduce((acc, e) => acc + (Number(e.note) || 0), 0);
  return (sum / evals.length).toFixed(1);
}

/**  moyenne réactive (évite d'appeler averageNote 2x dans le template) */
const averageRating = computed(() => averageNote(evaluations.value));

const rating = ref(5);
const comment = ref("");

function requireAuthOrRedirect() {
  const token = localStorage.getItem("auth_token");
  if (!token) {
    router.push({ name: "login" });
    return false;
  }
  return true;
}

function normalizeBook(raw) {
  return {
    id: raw.id,
    title: raw.title ?? "—",
    editor: raw.editor ?? "",
    editionYear: raw.editionYear ?? raw.edition_year ?? null,
    abstract: raw.abstract ?? "",
    pdfLink: raw.pdfLink ?? raw.pdf_link ?? "",
    categoryLabel: raw.category?.label ?? raw.category ?? "Uncategorized",
    writerName: raw.writer
      ? `${raw.writer.firstname ?? ""} ${raw.writer.lastname ?? ""}`.trim()
      : "",
    userName: raw.user?.username ?? raw.user?.name ?? "",
    raw,
  };
}

/** aide: certains backends renvoient { data: [...] } */
function normalizeEvaluations(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
}

async function fetchBookAndEvaluations() {
  loading.value = true;
  error.value = "";

  const id = route.params.id;

  try {
    //  on récupère le livre + les évaluations liées au livre (book_id)
    // Endpoint attendu: GET /books/:id/evaluations
    const [bookRes, evalRes] = await Promise.allSettled([
      apiClient.get(`/books/${id}`),
      apiClient.get(`/books/${id}/evaluations`),
    ]);

    if (bookRes.status !== "fulfilled") {
      throw bookRes.reason;
    }

    book.value = normalizeBook(bookRes.value.data);

    if (evalRes.status === "fulfilled") {
      evaluations.value = normalizeEvaluations(evalRes.value.data);
    } else {
      evaluations.value = [];
    }
  } catch (e) {
    error.value =
      e?.response?.data?.message ||
      e?.message ||
      "Impossible de charger le livre.";
  } finally {
    loading.value = false;
  }
}

async function handleSave() {
  saveError.value = "";
  saveSuccess.value = "";

  if (!requireAuthOrRedirect()) return;

  const bookId = route.params.id;

  if (!rating.value || rating.value < 1 || rating.value > 5) {
    saveError.value = "La note doit être entre 1 et 5.";
    return;
  }
  if (!comment.value) {
    saveError.value = "Écris un commentaire (même court) 🙂";
    return;
  }

  saving.value = true;

  try {
    await apiClient.post(`/books/${bookId}/comments`, {
      comment: comment.value,
    });

    await apiClient.post(`/books/${bookId}/evaluations`, {
      note: rating.value,
      rating: rating.value, // fallback si ton backend attend "rating"
    });

    saveSuccess.value = "Commentaire + note enregistrés avec succès !";
    comment.value = "";
    rating.value = 5;

    await fetchBookAndEvaluations();
  } catch (e) {
    const apiMsg =
      e?.response?.data?.message ||
      e?.response?.data?.errors?.[0]?.message ||
      e?.message;

    saveError.value = apiMsg || "Impossible d’enregistrer.";
  } finally {
    saving.value = false;
  }
}

onMounted(() => {
  fetchBookAndEvaluations();
});
</script>

<style scoped>
.detail {
  max-width: 900px;
  margin: 1.5rem auto;
  padding: 0 1rem;
}

.status {
  margin: 0.6rem 0;
  color: #444;
}
.status.error {
  color: #b00020;
}
.status.ok {
  color: #0a7a2f;
}

.card {
  background: #f6f6f6;
  border: 1px solid #e6e6e6;
  border-radius: 14px;
  padding: 1rem;
}

.header {
  margin-bottom: 0.75rem;
}

.title {
  margin: 0;
  font-size: 1.4rem;
}

.subtitle {
  margin: 0.25rem 0 0;
  color: #666;
}

.chips {
  margin-top: 0.7rem;
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.chip {
  background: #000;
  color: #fff;
  padding: 0.15rem 0.6rem;
  border-radius: 999px;
  font-size: 0.8rem;
}
.chip-soft {
  background: #e3e3e3;
  color: #111;
}

.body {
  color: #333;
}

.abstract {
  margin: 0.5rem 0 0.75rem;
  line-height: 1.45;
}

.link {
  color: #111;
  font-weight: 600;
  text-decoration: none;
}
.link:hover {
  text-decoration: underline;
}

.sep {
  border: none;
  border-top: 1px solid #e2e2e2;
  margin: 1rem 0;
}

.h2 {
  margin: 0 0 0.75rem;
  font-size: 1.1rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  margin-bottom: 0.75rem;
}

.label {
  font-size: 0.9rem;
  color: #333;
}

.input,
.textarea {
  border: 1px solid #d9d9d9;
  border-radius: 10px;
  padding: 0.7rem 0.8rem;
  font-size: 0.95rem;
  background: #bebebe;
}

.textarea {
  resize: vertical;
}

.actions {
  display: flex;
  justify-content: flex-end;
}

.btn {
  padding: 0.65rem 1.1rem;
  border-radius: 999px;
  border: none;
  cursor: pointer;
  background: #000;
  color: #fff;
  font-weight: 600;
}
.btn:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}
</style>
