// src/services/bookService.js
import apiClient from "./apiClient";

export default {
  // Récupérer tous les livres
  getBooks() {
    return apiClient.get("/books");
  },

  // Récupérer un livre par id
  getBook(id) {
    return apiClient.get(`/books/${id}`);
  },

  // Créer un nouveau livre
  createBook(payload) {
    // payload = { title, description, category_id, ... }
    return apiClient.post("/books", payload);
  },

  // Modifier un livre
  updateBook(id, payload) {
    return apiClient.put(`/books/${id}`, payload);
  },

  // Supprimer un livre
  deleteBook(id) {
    return apiClient.delete(`/books/${id}`);
  },
};
