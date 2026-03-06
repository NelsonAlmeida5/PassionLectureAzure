<template>
  <section class="edit-book">
    <div class="edit-book__card">
      <h1 class="edit-book__title">Modifier le livre</h1>

      <p v-if="loading" class="status-text">Chargement du livre…</p>
      <p v-else-if="error" class="status-text error-text">{{ error }}</p>

      <form v-else class="edit-book__form" @submit.prevent="handleSubmit">
        <!-- Title -->
        <label class="field">
          <span class="field__label">Titre</span>
          <input v-model.trim="form.title" class="field__input" required />
        </label>

        <!-- Writer (TEXT ONLY) -->
        <label class="field">
          <span class="field__label">Auteur</span>
          <input
            v-model.trim="form.writerName"
            class="field__input"
            placeholder="Ex: Victor Hugo"
          />
        </label>

        <!-- Editor -->
        <label class="field">
          <span class="field__label">Éditeur</span>
          <input v-model.trim="form.editor" class="field__input" />
        </label>

        <!-- Edition year -->
        <label class="field">
          <span class="field__label">Année d’édition</span>
          <input
            v-model.number="form.edition_year"
            type="number"
            class="field__input"
            min="0"
          />
        </label>

        <!-- Number of pages -->
        <label class="field">
          <span class="field__label">Nombre de pages</span>
          <input
            v-model.number="form.number_of_pages"
            type="number"
            class="field__input"
            min="1"
          />
        </label>

        <!-- PDF link -->
        <label class="field">
          <span class="field__label">Lien PDF</span>
          <input v-model.trim="form.pdf_link" class="field__input" />
        </label>

        <!-- Abstract -->
        <label class="field">
          <span class="field__label">Résumé</span>
          <textarea v-model.trim="form.abstract" class="field__textarea" />
        </label>

        <!-- Category dropdown -->
        <label class="field">
          <span class="field__label">Catégorie</span>
          <select
            v-model.number="form.category_id"
            class="field__input"
            :disabled="loadingCategories"
            required
          >
            <option disabled :value="null">
              {{
                loadingCategories ? "Chargement..." : "Choisir une catégorie"
              }}
            </option>
            <option v-for="c in categories" :key="c.id" :value="c.id">
              {{ c.label }}
            </option>
          </select>

          <span v-if="categoriesError" class="error-text">
            {{ categoriesError }}
          </span>
        </label>

        <div class="edit-book__actions">
          <button type="submit" class="btn btn--save" :disabled="saving">
            {{ saving ? "Enregistrement…" : "Enregistrer" }}
          </button>

          <RouterLink to="/mes-livres" class="btn btn--cancel">
            Annuler
          </RouterLink>
        </div>
      </form>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter, RouterLink } from "vue-router";
import apiClient from "@/services/apiClient";

const route = useRoute();
const router = useRouter();
const bookId = route.params.id;

const loading = ref(false);
const saving = ref(false);
const error = ref("");

// categories
const categories = ref([]);
const loadingCategories = ref(false);
const categoriesError = ref("");

const form = ref({
  title: "",
  editor: "",
  edition_year: null,
  number_of_pages: null,
  pdf_link: "",
  abstract: "",
  imagePath: "",
  category_id: null,
  writerName: "",
});

async function fetchCategories() {
  loadingCategories.value = true;
  categoriesError.value = "";

  try {
    const res = await apiClient.get("/categories");
    categories.value = res.data;
  } catch (e) {
    console.error("Erreur fetch categories:", e?.response?.data || e);
    categoriesError.value = "Impossible de charger les catégories.";
  } finally {
    loadingCategories.value = false;
  }
}

async function fetchBook() {
  loading.value = true;
  error.value = "";

  try {
    const res = await apiClient.get(`/books/${bookId}`);
    const book = res.data;

    const userId = localStorage.getItem("auth_userId");
    const ownerId = book.user_id ?? book.userId ?? book.user?.id ?? null;

    if (ownerId !== null && String(ownerId) !== String(userId)) {
      throw new Error("Accès interdit à ce livre.");
    }

    // construire un writerName lisible si possible
    const writerName =
      book.writer?.firstname && book.writer?.lastname
        ? `${book.writer.firstname} ${book.writer.lastname}`
        : book.writer?.name ?? "";

    form.value = {
      title: book.title ?? "",
      editor: book.editor ?? "",
      edition_year: book.edition_year ?? book.editionYear ?? null,
      number_of_pages: book.number_of_pages ?? book.numberOfPages ?? null,
      pdf_link: book.pdf_link ?? book.pdfLink ?? "",
      abstract: book.abstract ?? "",
      imagePath: book.imagePath ?? "",
      category_id:
        book.category_id ?? book.categoryId ?? book.category?.id ?? null,
      writerName,
    };

    if (!form.value.category_id && categories.value.length > 0) {
      form.value.category_id = categories.value[0].id;
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

function splitWriterName(fullName) {
  const cleaned = String(fullName || "")
    .trim()
    .replace(/\s+/g, " ");
  if (!cleaned) return null;

  const parts = cleaned.split(" ");
  if (parts.length === 1) {
    return { firstname: "", lastname: parts[0] };
  }

  const firstname = parts.slice(0, -1).join(" ");
  const lastname = parts[parts.length - 1];
  return { firstname, lastname };
}

//  trouve ou crée l’auteur et retourne son id
async function resolveWriterIdFromText(fullName) {
  const parsed = splitWriterName(fullName);
  if (!parsed) return undefined; // pas d’auteur fourni → on n’envoie rien

  // 1) fetch writers
  const res = await apiClient.get("/writers");
  const writers = Array.isArray(res.data) ? res.data : [];

  const targetFirst = parsed.firstname.toLowerCase();
  const targetLast = parsed.lastname.toLowerCase();

  // match simple
  const existing = writers.find((w) => {
    const fn = String(w.firstname ?? "")
      .toLowerCase()
      .trim();
    const ln = String(w.lastname ?? "")
      .toLowerCase()
      .trim();
    const name = String(w.name ?? "")
      .toLowerCase()
      .trim();

    if (fn && ln) return fn === targetFirst && ln === targetLast;
    if (name) return name === `${targetFirst} ${targetLast}`.trim();
    return false;
  });

  if (existing?.id) return existing.id;

  // 2) create writer
  // adapte si ton backend attend d’autres champs
  const created = await apiClient.post("/writers", {
    firstname: parsed.firstname,
    lastname: parsed.lastname,
  });

  return created.data?.id;
}

async function handleSubmit() {
  saving.value = true;
  error.value = "";

  try {
    if (!form.value.category_id) {
      error.value = "Choisis une catégorie avant d’enregistrer.";
      return;
    }

    //  writerId depuis le texte (find-or-create)
    const writerId = await resolveWriterIdFromText(form.value.writerName);

    const payload = {
      title: form.value.title,
      editor: form.value.editor,
      abstract: form.value.abstract,

      editionYear: form.value.edition_year,
      numberOfPages: form.value.number_of_pages,
      pdfLink: form.value.pdf_link,

      imagePath: form.value.imagePath,
      categoryId: form.value.category_id,

      //  on n’envoie que si on a un id
      ...(writerId ? { writerId } : {}),
    };

    await apiClient.put(`/books/${bookId}`, payload);
    router.push("/mes-livres");
  } catch (e) {
    console.log("VALIDATION ERROR:", e?.response?.data);

    error.value =
      e?.response?.data?.message ||
      e?.response?.data?.errors?.[0]?.message ||
      e?.message ||
      "Impossible d’enregistrer.";
  } finally {
    saving.value = false;
  }
}

onMounted(async () => {
  await fetchCategories();
  await fetchBook();
});
</script>

<style scoped>
.edit-book {
  min-height: calc(100vh - 120px);
  display: grid;
  place-items: center;
  padding: 2rem 1rem;
}

.edit-book__card {
  width: 100%;
  max-width: 520px;
  background: #f2f2f2;
  border-radius: 1.2rem;
  padding: 1.5rem;
  box-shadow: 0 8px 22px rgba(0, 0, 0, 0.08);
}

.edit-book__title {
  margin-bottom: 1rem;
  font-size: 1.3rem;
}

.status-text {
  margin: 0.5rem 0;
  color: #444;
}
.error-text {
  color: #b00020;
}

.edit-book__form {
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
}

.field__input,
.field__textarea {
  border: 1px solid #ddd;
  border-radius: 0.9rem;
  padding: 0.8rem 0.9rem;
  font-size: 0.95rem;
  background: #b1b1b1;
}

.field__textarea {
  min-height: 90px;
  resize: vertical;
}

.edit-book__actions {
  display: flex;
  gap: 0.6rem;
  margin-top: 1rem;
}

.btn {
  flex: 1;
  padding: 0.75rem;
  border-radius: 999px;
  border: none;
  cursor: pointer;
  text-decoration: none;
  text-align: center;
}

.btn--save {
  background: #000;
  color: #fff;
}

.btn--cancel {
  background: #e0e0e0;
  color: #000;
}
</style>
