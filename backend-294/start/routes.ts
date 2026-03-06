import router from '@adonisjs/core/services/router'
import { middleware } from './kernel.js'

import BooksController from '#controllers/books_controller'
import CategoriesController from '#controllers/categories_controller'
import WritersController from '#controllers/writers_controller'
import CommentsController from '#controllers/comments_controller'
import EvaluationsController from '#controllers/evaluations_controller'
import UsersController from '#controllers/users_controller'
import AuthController from '#controllers/auth_controller'

/*
|--------------------------------------------------------------------------
| PUBLIC ROUTES (NO LOGIN REQUIRED)
|--------------------------------------------------------------------------
*/

// Books (read-only)
router.get('books', [BooksController, 'index'])
router.get('books/:id', [BooksController, 'show'])

// Writers
router.get('writers', [WritersController, 'index'])
router.get('writers/:id', [WritersController, 'show'])

// Categories
router.get('categories', [CategoriesController, 'index'])
router.get('categories/:id', [CategoriesController, 'show'])

// Book comments & evaluations (read-only)
router.get('books/:book_id/comments', [CommentsController, 'index'])
router.get('books/:book_id/evaluations', [EvaluationsController, 'index'])

router.resource('users', UsersController).apiOnly()
/*
|--------------------------------------------------------------------------
| PROTECTED ROUTES (LOGIN REQUIRED)
|--------------------------------------------------------------------------
*/

router
  .group(() => {
    router.resource('books', BooksController).apiOnly().except(['index', 'show'])
    router.resource('writers', WritersController).apiOnly().except(['index', 'show'])
    router.resource('categories', CategoriesController).apiOnly().except(['index', 'show'])
    //router.resource('users', UsersController).apiOnly()

    router
      .group(() => {
        router.resource('comments', CommentsController).apiOnly().except(['index'])
        router.resource('evaluations', EvaluationsController).apiOnly().except(['index'])
      })
      .prefix('books/:book_id')
  })
  .use(middleware.auth())

/*
|--------------------------------------------------------------------------
| AUTH ROUTES
|--------------------------------------------------------------------------
*/

router
  .group(() => {
    router.post('register', [AuthController, 'register'])
    router.post('login', [AuthController, 'login'])
    router.post('logout', [AuthController, 'logout']).use(middleware.auth())
  })
  .prefix('user')
