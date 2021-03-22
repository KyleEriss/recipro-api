const xss = require('xss')

const FavoritesService = {
    getRecipeById(db, id) {
        return db
            .from('recipro_favorites AS reclist')
            .select(
                'reclist.id',
                'reclist.recipeid',
                'reclist.recipeimage',
                'reclist.recipetitle'
            )
            .where('reclist.id', id)
            .first()
    },

    getFavoritesByUser(db, userId) {
        return db
            .from('recipro_favorites AS reclist')
            .select(
                'reclist.id',
                'reclist.recipeid',
                'reclist.recipeimage',
                'reclist.recipetitle'
            )
            .where('userid', userId)
    },

    deleteRecipe(db, id) {
        return db('recipro_favorites')
            .where({ id })
            .delete();
    },

    insertRecipe(db, newRecipe) {
        return db
            .insert(newRecipe)
            .into('recipro_favorites')
            .returning('*')
            .then(([recipe]) => recipe)
            .then(recipe =>
                FavoritesService.getRecipeById(db, recipe.id)
            )
    },

    serializeRecipe(recipe) {
        const { user } = recipe
        return {
            id: recipe.id,
            recipeid: xss(recipe.recipeid),
            recipeimage: xss(recipe.recipeimage),
            recipetitle: xss(recipe.recipetitle)
        }
    }
}

module.exports = FavoritesService
