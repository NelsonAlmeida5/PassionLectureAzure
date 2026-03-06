<template>
  <div class="add-book-container">
    <h1 class="title-addbook">Ajouter un livre</h1>

    <!-- Erreur globale (si besoin) -->
    <p v-if="formError" class="error-banner">{{ formError }}</p>

    <!-- Titre -->
    <div class="form-group">
      <label>title</label>
      <input
        type="text"
        v-model.trim="form.title"
        :class="{ 'input-error': errors.title }"
        @input="clearFieldError('title')"
      />
      <p v-if="errors.title" class="error-text">{{ errors.title }}</p>
    </div>

    <!-- Nombre de pages -->
    <div class="form-group">
      <label>numberOfPages</label>
      <input
        type="number"
        v-model.number="form.numberOfPages"
        min="1"
        :class="{ 'input-error': errors.numberOfPages }"
        @input="clearFieldError('numberOfPages')"
      />
      <p v-if="errors.numberOfPages" class="error-text">
        {{ errors.numberOfPages }}
      </p>
    </div>

    <!-- Lien PDF -->
    <div class="form-group">
      <label>pdfLink</label>
      <input
        type="text"
        v-model.trim="form.pdfLink"
        :class="{ 'input-error': errors.pdfLink }"
        @input="clearFieldError('pdfLink')"
      />
      <p v-if="errors.pdfLink" class="error-text">{{ errors.pdfLink }}</p>
    </div>

    <div class="form-group">
      <label>abstract</label>
      <input
        type="text"
        v-model.trim="form.abstract"
        :class="{ 'input-error': errors.abstract }"
        @input="clearFieldError('abstract')"
      />
      <p v-if="errors.abstract" class="error-text">{{ errors.abstract }}</p>
    </div>

    <div class="form-group">
      <label>editor</label>
      <input
        type="text"
        v-model.trim="form.editor"
        :class="{ 'input-error': errors.editor }"
        @input="clearFieldError('editor')"
      />
      <p v-if="errors.editor" class="error-text">{{ errors.editor }}</p>
    </div>

    <!-- Année d'édition -->
    <div class="form-group">
      <label>editionYear</label>
      <input
        type="number"
        v-model.number="form.editionYear"
        min="0"
        max="2100"
        :class="{ 'input-error': errors.editionYear }"
        @input="clearFieldError('editionYear')"
      />
      <p v-if="errors.editionYear" class="error-text">
        {{ errors.editionYear }}
      </p>
    </div>

    <div class="form-group">
      <label>imagePath</label>
      <input
        type="text"
        v-model.trim="form.imagePath"
        :class="{ 'input-error': errors.imagePath }"
        @input="clearFieldError('imagePath')"
      />
      <p v-if="errors.imagePath" class="error-text">{{ errors.imagePath }}</p>
    </div>

    <!--  Auteur séparé -->
    <div class="form-group">
      <label>Auteur</label>

      <div class="author-grid">
        <div>
          <input
            type="text"
            v-model.trim="form.writerFirstname"
            placeholder="Prénom"
            :class="{ 'input-error': errors.writerFirstname }"
            @input="clearFieldError('writerFirstname')"
          />
          <p v-if="errors.writerFirstname" class="error-text">
            {{ errors.writerFirstname }}
          </p>
        </div>

        <div>
          <input
            type="text"
            v-model.trim="form.writerLastname"
            placeholder="Nom"
            :class="{ 'input-error': errors.writerLastname }"
            @input="clearFieldError('writerLastname')"
          />
          <p v-if="errors.writerLastname" class="error-text">
            {{ errors.writerLastname }}
          </p>
        </div>
      </div>

      <p v-if="errors.writerId" class="error-text">{{ errors.writerId }}</p>
    </div>

    <!-- Catégorie -->
    <div class="form-group">
      <label>category</label>
      <select
        v-model.number="form.categoryId"
        :disabled="loadingCategories"
        :class="{ 'input-error': errors.categoryId }"
        @change="clearFieldError('categoryId')"
      >
        <option disabled :value="null">
          {{ loadingCategories ? "Chargement..." : "Choisir une catégorie" }}
        </option>
        <option v-for="c in categories" :key="c.id" :value="c.id">
          {{ c.label }}
        </option>
      </select>

      <p v-if="errors.categoryId" class="error-text">{{ errors.categoryId }}</p>
      <p v-if="categoriesError" class="error-text">{{ categoriesError }}</p>
    </div>

    <div class="buttons">
      <button class="save" @click="saveBook">Enregistrer</button>
    </div>
  </div>
</template>

<script>
import apiClient from "@/services/apiClient";
import bookService from "@/services/bookService";

export default {
  name: "AddBookView",
  data() {
    return {
      form: {
        title: "",
        numberOfPages: null,
        pdfLink: "",
        abstract: "",
        editor: "",
        editionYear: null,
        imagePath: "",
        categoryId: null,
        writerFirstname: "",
        writerLastname: "",
      },
      categories: [],
      loadingCategories: false,
      categoriesError: "",
      errors: {},
      formError: "",
    };
  },

  async mounted() {
    await this.fetchCategories();
  },

  methods: {
    clearFieldError(field) {
      if (this.errors?.[field]) {
        // Vue 3: delete est OK (pas de this.$delete)
        delete this.errors[field];
      }
      if (this.formError) this.formError = "";
    },

    clearAllErrors() {
      this.errors = {};
      this.formError = "";
    },

    async fetchCategories() {
      this.loadingCategories = true;
      this.categoriesError = "";

      try {
        const res = await apiClient.get("/categories");
        this.categories = res.data;

        if (!this.form.categoryId && this.categories.length > 0) {
          this.form.categoryId = this.categories[0].id;
        }
      } catch (error) {
        console.error(
          "Erreur fetch categories:",
          error.response?.data || error
        );
        this.categoriesError =
          "Impossible de charger les catégories (backend down ou route bloquée).";
      } finally {
        this.loadingCategories = false;
      }
    },

    /**  Mappe les erreurs Vine (errors: [{ field, message, rule }]) sur tes champs */
    applyApiErrors(error) {
      const data = error?.response?.data || {};
      const status = error?.response?.status;

      // 1) Vine / validation: errors: [{ field, message, rule }]
      const apiErrors = Array.isArray(data.errors) ? data.errors : [];
      if (apiErrors.length > 0) {
        const mapped = {};

        for (const err of apiErrors) {
          const field = err.field || err?.pointer?.split("/").pop();
          const msg = err.message || "Valeur invalide.";

          if (!field) continue;

          // mapping backend -> frontend (writer inputs séparés)
          const writerMap =
            field === "firstname"
              ? "writerFirstname"
              : field === "lastname"
              ? "writerLastname"
              : field;

          // mapping snake_case -> camelCase (au cas où)
          const normalizedField =
            writerMap === "number_of_pages"
              ? "numberOfPages"
              : writerMap === "edition_year"
              ? "editionYear"
              : writerMap === "pdf_link"
              ? "pdfLink"
              : writerMap;

          mapped[normalizedField] = msg;
        }

        this.errors = { ...this.errors, ...mapped };
        return;
      }

      // 2) Message brut (DB unique) — on remplace par un message "humain"
      const rawMsg = String(data.message || "");
      const msg = rawMsg.toLowerCase();

      const isDuplicate =
        msg.includes("duplicate entry") ||
        msg.includes("er_dup_entry") ||
        msg.includes("unique constraint") ||
        msg.includes("duplicate key");

      if (isDuplicate) {
        //  MySQL/MariaDB: for key 'books.books_title_unique'
        const keyMatch = rawMsg.match(/for key '([^']+)'/i);
        const keyName = (keyMatch?.[1] || "").toLowerCase();

        //  Postgres (au cas où): unique constraint "books_books_title_unique"
        const pgMatch = rawMsg.match(/unique constraint "([^"]+)"/i);
        const pgKeyName = (pgMatch?.[1] || "").toLowerCase();

        const constraint = keyName || pgKeyName;

        // IMPORTANT: on se base UNIQUEMENT sur le nom de contrainte
        if (constraint.includes("pdf_link") || constraint.includes("pdflink")) {
          this.errors.pdfLink = "Un livre avec ce lien PDF existe déjà.";
          return;
        }

        if (constraint.includes("title")) {
          this.errors.title = "Un livre avec ce titre existe déjà.";
          return;
        }

        // fallback si on ne trouve pas le champ
        this.formError = "Une valeur existe déjà (contrainte d'unicité).";
        return;
      }

      // 3) fallback propre (pas d'alert)
      this.formError =
        data.message ||
        (status
          ? `Erreur ${status} : impossible d’enregistrer.`
          : "Impossible d’enregistrer.");
    },

    async resolveWriterIdFromInputs(firstname, lastname) {
      const fn = String(firstname || "").trim();
      const ln = String(lastname || "").trim();

      // pas d'auteur -> on n'envoie rien
      if (!fn && !ln) return undefined;

      // 1) chercher existant
      const res = await apiClient.get("/writers");
      const writers = Array.isArray(res.data) ? res.data : [];

      const targetFirst = fn.toLowerCase();
      const targetLast = ln.toLowerCase();

      const existing = writers.find((w) => {
        const wfn = String(w.firstname ?? "")
          .trim()
          .toLowerCase();
        const wln = String(w.lastname ?? "")
          .trim()
          .toLowerCase();
        return wfn === targetFirst && wln === targetLast;
      });

      if (existing?.id) return existing.id;

      // 2) sinon créer (si backend refuse, ça remontera et sera mappé)
      const created = await apiClient.post("/writers", {
        firstname: fn,
        lastname: ln,
      });

      return created.data?.id;
    },

    async saveBook() {
      this.clearAllErrors();

      try {
        // writerId depuis 2 champs (peut throw si backend writers refuse)
        const writerId = await this.resolveWriterIdFromInputs(
          this.form.writerFirstname,
          this.form.writerLastname
        );

        //  Construire payload en respectant le validator backend :
        // - imagePath optional -> ne pas envoyer si vide
        // - categoryId optional -> ne pas envoyer si null
        const payload = {
          title: this.form.title,
          numberOfPages: this.form.numberOfPages,
          pdfLink: this.form.pdfLink,
          abstract: this.form.abstract,
          editor: this.form.editor,
          editionYear: this.form.editionYear,
          ...(this.form.imagePath?.trim()
            ? { imagePath: this.form.imagePath }
            : {}),
          ...(this.form.categoryId != null
            ? { categoryId: this.form.categoryId }
            : {}),
          ...(writerId ? { writerId } : {}),
        };

        const res = await apiClient.post("/books", payload);

        bookService.createBook(payload);

        alert("Livre enregistré !");
        console.log("Réponse backend :", res.data);

        this.resetForm();
      } catch (error) {
        const status = error?.response?.status;

        if (status === 401) {
          alert("Vous devez être connecté pour enregistrer un livre.");
          return;
        }
        if (status === 403) {
          alert("Vous n'avez pas les droits pour effectuer cette action.");
          return;
        }

        console.error(
          "Erreur lors de l'enregistrement :",
          error?.response?.data || error
        );

        //  plus d'alert générique, on affiche sur les champs
        this.applyApiErrors(error);
      }
    },

    resetForm() {
      this.form = {
        title: "",
        numberOfPages: null,
        pdfLink: "",
        abstract: "",
        editor: "",
        editionYear: null,
        imagePath: "",
        categoryId: this.categories?.[0]?.id ?? null,
        writerFirstname: "",
        writerLastname: "",
      };
      this.clearAllErrors();
    },
  },
};
</script>

<style scoped>
.add-book-container {
  max-width: 720px;
  margin: 2rem auto;
  padding: 1.25rem;
  background: #f6f6f6;
  border: 1px solid #e6e6e6;
  border-radius: 14px;
}

.title-addbook {
  margin: 0 0 1rem;
  font-size: 1.4rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  margin-bottom: 0.9rem;
}

label {
  font-size: 0.9rem;
  color: #333;
}

input,
select {
  padding: 0.7rem 0.85rem;
  border-radius: 10px;
  border: 1px solid #d9d9d9;
  background: #fff;
  font-size: 0.95rem;
  outline: none;
}

input:focus,
select:focus {
  border-color: #111;
}

.input-error {
  border-color: #b00020 !important;
}

.error-text {
  margin: 0.25rem 0 0;
  font-size: 0.9rem;
  color: #b00020;
}

.error-banner {
  margin: 0 0 1rem;
  padding: 0.75rem 0.9rem;
  border-radius: 10px;
  border: 1px solid #b00020;
  background: #ffe9ee;
  color: #7a0013;
  font-size: 0.95rem;
}

.author-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.6rem;
}

.buttons {
  display: flex;
  justify-content: flex-end;
  margin-top: 1rem;
}

button.save {
  padding: 0.65rem 1.2rem;
  border-radius: 999px;
  border: none;
  background: #111;
  color: #fff;
  font-weight: 600;
  cursor: pointer;
}

button.save:hover {
  filter: brightness(1.05);
}

button.save:active {
  transform: translateY(1px);
}
</style>
