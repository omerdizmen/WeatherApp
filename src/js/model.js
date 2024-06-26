import { API_URL, RES_PER_PAGE, KEY } from "./config";
import { getJSON, sendJSON } from "./helpers";

export const state = {
    recipe: {},
    search: {
        query: "",
        results: [],
        resultsPerPage: RES_PER_PAGE,
        page: 1
    },
    bookmarks: []
};

export const loadRecipe = async function(id){
    try{
        const data = await getJSON(`${API_URL}/${id}`);
        // state.recipe = createRecipeObject(data);
        
        const  {recipe} = data.data;
        state.recipe = {
            id: recipe.id,
            title: recipe.title,
            publisher: recipe.publisher,
            sourceUrl: recipe.source_url,
            image: recipe.image_url,
            servings: recipe.servings,
            cookingTime: recipe.cooking_time,
            ingredients: recipe.ingredients
        }

        if(state.bookmarks.some(bookmark => bookmark.id === id)){
            state.recipe.bookmarked = true;
        }
        else{
            state.recipe.bookmarked = false;
        }

        return data;
    }
    catch(err){
        //temp error handling
        console.log(err + " 🍔");
        throw err;
    }
}

export const loadSearchResults = async function(query){
    try{
        state.search.query = query;
        const data = await getJSON(`${API_URL}?search=${query}`);

        state.search.results = data.data.recipes.map(rec => {
            return {
                id: rec.id,
                title: rec.title,
                publisher: rec.publisher,
                image: rec.image_url,
            }
        });
        state.search.page = 1;

    }
    catch(err){
        console.log(err + " 🍔");
        throw err;
    }
}

// loadSearchResults("pizza");

export const getSearchResultPage = function(page = 1){
    state.search.page = page;
    const start = (page - 1) * state.search.resultsPerPage; //0;
    const end = start + state.search.resultsPerPage; //9;
    return state.search.results.slice(start, end);
}

export const updateServings = function(newServings){
    state.recipe.ingredients.forEach(ingredient => {
        ingredient.quantity = ingredient.quantity * newServings / state.recipe.servings;
    });

    state.recipe.servings = newServings;
}

const persistBookmarks = function(){
    localStorage.setItem("bookmarks", JSON.stringify(state.bookmarks));
}

export const addBookmark = function(recipe){    
    state.bookmarks.push(recipe);

    if(recipe.id === state.recipe.id){
        state.recipe.bookmarked = true;
    }

    persistBookmarks();
}

export const deleteBookmark = function(id){
    const index = state.bookmarks.findIndex(el => el.id === id);
    state.bookmarks.splice(index, 1);

    if(id === state.recipe.id){
        state.recipe.bookmarked = false;
    }

    persistBookmarks();
}

const init = function(){
    const storage = localStorage.getItem("bookmarks");
    if(storage){
        state.bookmarks = JSON.parse(storage);
    }

}

init();


const clearBookmarks = function(){
    localStorage.clear("bookmarks");
}

const createRecipeObject = function(data){
    const recipe = data.data;
    return {
        title: recipe.title,
        source_url: recipe.sourceUrl,
        image_url: recipe.image,
        publisher: recipe.publisher,
        cooking_time: +recipe.cookingTime,
        serving: +recipe.servings,
        ingredients: recipe.ingredients,
        ...(recipe.key && {key: recipe.key})
    }    
}

export const uploadRecipe = async function(newRecipe){
    try{
        const ingredients = Object.entries(newRecipe)
        .filter(entry => entry[0].startsWith("ingredient") && entry[1] !== "")
        .map( ing => {
            const ingredientsArray =  ing[1].replaceAll(" ", "").split(",");
            if(ingredientsArray.length !== 3) throw new Error("Wrong ingredient format!");
            const [quantity, unit, description] = ingredientsArray;
            return {quantity: quantity ? +quantity: null , unit, description};
        });        

        const recipe = {
            title: newRecipe.title,
            source_url: newRecipe.sourceUrl,
            image_url: newRecipe.image,
            publisher: newRecipe.publisher,
            cooking_time: +newRecipe.cookingTime,
            serving: +newRecipe.servings,
            ingredients
        }    
            
        const data = await sendJSON(`${API_URL}`, recipe);
        state.recipe = createRecipeObject(data);
        addBookmark(state.recipe);
        
    }
    catch(err){
        throw err;
    }
}

// clearBookmarks();