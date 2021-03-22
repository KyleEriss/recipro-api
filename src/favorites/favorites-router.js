const path = require('path')
const express = require('express')
const xss = require('xss')
const FavoritesService = require('./favorites-service')
const { requireAuth } = require('../middleware/jwt-auth')

const favoritesRouter = express.Router()
const jsonParser = express.json()

favoritesRouter
    .route('/')
    .get(requireAuth, jsonParser, (req, res, next) => {
        const userId = req.user.id
        FavoritesService.getFavoritesByUser(
            req.app.get('db'),
            userId
        )
            .then(recipes => {
                res.json(recipes.map(FavoritesService.serializeRecipe))
            })
            .catch(next)
    })

    .post(requireAuth, jsonParser, (req, res, next) => {
        const { recipeid, recipeimage, recipetitle } = req.body
        const userId = req.user.id
        const newrecipe = { recipeid, recipeimage, recipetitle }

        for (const [key, value] of Object.entries(newrecipe))
            if (value == null)
                return res.status(400).json({
                    error: { message: `Missing '${key}' in request body` }
                })

        newrecipe.userid = req.user.id
        FavoritesService.insertRecipe(
            req.app.get('db'),
            newrecipe
        )
            .then(recipe => {
                res
                    .status(201)
                    .location(path.posix.join(req.originalUrl, `/${recipe.id}`))
                    .json(FavoritesService.serializeRecipe(recipe))
            })
            .catch(next)
    })

favoritesRouter
    .route('/:recipeId')
    .all(requireAuth, jsonParser, (req, res, next) => {
        FavoritesService.getRecipeById(
            req.app.get('db'),
            req.params.recipeId
        )
            .then(recipe => {
                if (!recipe) {
                    return res.status(404).json({
                        error: { message: `recipe doesn't exist` }
                    })
                }
                res.recipe = recipe
                next()
            })
            .catch(next)
    })

    .delete(requireAuth, jsonParser, (req, res, next) => {
        FavoritesService.deleteRecipe(
            req.app.get('db'),
            req.params.recipeId
        )
            .then(() => {
                res.status(204).end()
            })
            .catch(next)
    })

module.exports = favoritesRouter