const API_URL = "https://dummyjson.com/recipes";



const searchForm = document.getElementById("search-form");
const searchInput = document.getElementById("search-input");

const cuisineFilter = document.getElementById("cuisine-filter");
const difficultyFilter = document.getElementById("difficulty-filter");

const recipeGrid = document.getElementById("recipe-grid");
const recipeCount = document.getElementById("recipe-count");

const loadingState = document.getElementById("loading-state");
const errorState = document.getElementById("error-state");
const emptyState = document.getElementById("empty-state");

const resetFilterButton = document.getElementById("reset-filter-button");

const favoriteButton = document.getElementById("favorite-button");
const favoriteCount = document.getElementById("favorite-count");

const recipeDialog = document.getElementById("recipe-dialog");
const closeDialog = document.getElementById("close-dialog");
const dialogContent = document.getElementById("dialog-content");



let recipes = [];
let filteredRecipes = [];
let favorites = [];
let cuisines = [];



async function getRecipes() {

    try {

        const response = await fetch(API_URL);

        const data = await response.json();

        recipes = data.recipes;

        loadCuisineOptions();

        renderRecipes(recipes);

        loadingState.hidden = true;
        errorState.hidden = true;

    } catch (error) {

        console.log(error);

        loadingState.hidden = true;
        errorState.hidden = false;

    }
}




function loadCuisineOptions() {

    cuisines = [];

    for (let i = 0; i < recipes.length; i++) {

        const cuisine = recipes[i].cuisine;

        if (!cuisines.includes(cuisine)) {

            cuisines.push(cuisine);
        }
    }

    for (let i = 0; i < cuisines.length; i++) {

        const option = document.createElement("option");

        option.value = cuisines[i];

        option.textContent = cuisines[i];

        cuisineFilter.appendChild(option);
    }
}




function renderRecipes(recipeList) {

    recipeGrid.innerHTML = "";

    for (let i = 0; i < recipeList.length; i++) {

        const recipe = recipeList[i];

        const card = document.createElement("article");

        card.className = "recipe-card";

        card.innerHTML = `
            <img
                src="${recipe.image}"
                alt="${recipe.name}"
                class="recipe-image"
            >

            <div class="recipe-body">

                <span class="recipe-cuisine">
                    ${recipe.cuisine}
                </span>

                <h3 class="recipe-title">
                    ${recipe.name}
                </h3>

                <div class="recipe-meta">
                    <span>⭐ ${recipe.rating}</span>
                    <span>⏱ ${recipe.cookTimeMinutes} min</span>
                    <span>${recipe.difficulty}</span>
                </div>

                <div class="recipe-actions">

                    <button
                        class="detail-button"
                        data-id="${recipe.id}"
                    >
                        Detail
                    </button>

                    <button
                        class="like-button"
                        data-id="${recipe.id}"
                    >
                        ❤️
                    </button>

                </div>

            </div>
        `;

        recipeGrid.appendChild(card);
    }

    recipeCount.textContent = `${recipeList.length} recipes`;

    updateRecipeState(recipeList);
}


function updateRecipeState(recipeList) {
    if (recipeList.length === 0) {
        recipeGrid.hidden = true;
        emptyState.hidden = false;
    } else {
        recipeGrid.hidden = false;
        emptyState.hidden = true;
    }
}




function applyFilters() {
const keyword = searchInput.value.toLowerCase();
 const cuisine = cuisineFilter.value; 
const difficulty = difficultyFilter.value;
    

filteredRecipes = [];

    for (let i = 0; i < recipes.length; i++) {
     const recipe = recipes[i];
       const matchesSearch =
        recipe.name.toLowerCase().includes(keyword);
        const matchesCuisine =
            cuisine === "" || recipe.cuisine === cuisine;
        const matchesDifficulty =
            difficulty === "" || recipe.difficulty === difficulty;
        if (
            matchesSearch &&
            matchesCuisine &&
            matchesDifficulty
        ) {

        filteredRecipes.push(recipe);
        }
    }
    renderRecipes(filteredRecipes);

    const hasFilter =
        keyword !== "" ||
        cuisine !== "" ||
        difficulty !== "";
    resetFilterButton.hidden = !hasFilter;
}




function resetFilters() {

    searchInput.value = "";

    cuisineFilter.value = "";

    difficultyFilter.value = "";

    filteredRecipes = recipes;

    renderRecipes(filteredRecipes);

    resetFilterButton.hidden = true;
}



function createIngredientsHTML(ingredients) {
    let html = "";
    for (let i = 0; i < ingredients.length; i++) {
   html += `<li>${ingredients[i]}</li>`;
    }
    return html;
}




function createInstructionsHTML(instructions) {
    let html = "";
    for (let i = 0; i < instructions.length; i++) {
  html += `<li>${instructions[i]}</li>`;
    }


    return html;
}

function saveFavorites() {

    localStorage.setItem(
        "recipeFavorites",
        JSON.stringify(favorites)
    );
}


function loadFavorites() {

    const savedFavorites =
        localStorage.getItem("recipeFavorites");

    if (savedFavorites !== null) {

        favorites = JSON.parse(savedFavorites);

    } else {

        favorites = [];
    }

    updateFavoriteCount();
}


function updateFavoriteCount() {

    favoriteCount.textContent = favorites.length;
}


function toggleFavorite(recipeId) {

    let favoriteIndex = -1;

    for (let i = 0; i < favorites.length; i++) {

        if (favorites[i] === recipeId) {

            favoriteIndex = i;

            break;
        }
    }

    if (favoriteIndex === -1) {

        favorites.push(recipeId);

    } else {

        favorites.splice(favoriteIndex, 1);
    }

    saveFavorites();

    updateFavoriteCount();

    renderRecipes(
        filteredRecipes.length > 0
            ? filteredRecipes
            : recipes
    );
}


function showFavorites() {

    let favoriteRecipes = [];

    for (let i = 0; i < recipes.length; i++) {

        if (favorites.includes(recipes[i].id)) {

            favoriteRecipes.push(recipes[i]);
        }
    }

    renderRecipes(favoriteRecipes);

    resetFilterButton.hidden = true;
}


function showRecipeDetail(recipeId) {

    let selectedRecipe = null;

    for (let i = 0; i < recipes.length; i++) {

        if (recipes[i].id === recipeId) {

            selectedRecipe = recipes[i];

            break;
        }
    }

    if (selectedRecipe === null) {

        return;
    }

    dialogContent.innerHTML = `
        <img
            src="${selectedRecipe.image}"
            alt="${selectedRecipe.name}"
            class="recipe-image"
        >
        

        <h2>${selectedRecipe.name}</h2>

        <p>
            ${selectedRecipe.cuisine} •
            ${selectedRecipe.difficulty}
        </p>

        <p>
            ⭐ ${selectedRecipe.rating}
            • ⏱ ${selectedRecipe.cookTimeMinutes} minutes
        </p>

        <h3>Ingredients</h3>

        <ul>
            ${createIngredientsHTML(selectedRecipe.ingredients)}
        </ul>

        <h3>Instructions</h3>

        <ol>
            ${createInstructionsHTML(selectedRecipe.instructions)}
        </ol>
    `;

    recipeDialog.showModal();
}
searchForm.addEventListener("submit", function (event) {
    event.preventDefault();
    applyFilters();
});
cuisineFilter.addEventListener("change", function () {
    applyFilters();
});
difficultyFilter.addEventListener("change", function () {
    applyFilters();
});
resetFilterButton.addEventListener("click", function () {
    resetFilters();
});
recipeGrid.addEventListener("click", function (event) {
    if (event.target.classList.contains("detail-button")) {
const recipeId = Number(event.target.dataset.id);
        showRecipeDetail(recipeId);
    }
    if (event.target.classList.contains("like-button")) {
    const recipeId = Number(event.target.dataset.id);
    toggleFavorite(recipeId);
    }
});


favoriteButton.addEventListener("click", function () {

    showFavorites();

});

closeDialog.addEventListener("click", function () {

    recipeDialog.close();

});



loadFavorites();

getRecipes();