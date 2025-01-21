const home = document.querySelector(".home");
const search = document.querySelector(".search");
const right = document.querySelector(".right");
const left = document.querySelector(".left");
const searchBox = document.querySelector(".recipe-input");
const searchBtn = document.querySelector(".search-btn");
const cardContainer = document.querySelector(".card-container");
const recentContent = document.querySelector(".recent-content");
const head = document.querySelector(".right-heading");
const rightImage = document.querySelector(".recipe-image");
const tags = document.querySelector(".tags");
const ingre = document.querySelector(".ingredients-measurement");
const main = document.querySelector(".main-recipe");
const expand = document.querySelector(".showall");
const youtube = document.querySelector(".youtube");
const recipeBtn = document.querySelector(".recipe-btn");
const viewSearchBtn = document.getElementById("search-left");
const middleNav = document.getElementById("mid-nav");
const searchIcon = document.getElementById("search-icon");
const cross = document.getElementById("right-close");
const love = document.querySelector(".love");
const video = document.querySelector(".video");
const userFav = document.querySelector(".user-favourite");

let favList = [];

// Load favorites from local storage on page load
document.addEventListener("DOMContentLoaded", () => {
  const storedFavorites = localStorage.getItem("favList");
  favList = storedFavorites ? JSON.parse(storedFavorites) : [];
  updateFavourite(favList);
});

// ------------------------------------------------------------------

// default settings
home.classList.add("active");
middleNav.classList.add("hidden");

// now onclick active status logic

home.addEventListener("click", (event) => {
  if (search.classList.contains("active")) {
    search.classList.remove("active");
    home.classList.add("active");
  }
  fetchRecipes(" ");
});

search.addEventListener("click", (event) => {
  if (home.classList.contains("active")) {
    home.classList.remove("active");
    search.classList.add("active");
  }
  if (middleNav.classList.contains("hidden")) {
    middleNav.classList.remove("hidden");
    middleNav.classList.add("shown");
  } else {
    middleNav.classList.remove("shown");
    middleNav.classList.add("hidden");
  }
});

// -----------------------------------------------

// search button onclick function

searchBtn.addEventListener("click", (e) => {
  e.preventDefault();
  const searchInput = searchBox.value.trim(); // trim removes any extra spaces

  fetchRecipes(searchInput);
});

// right close onclick

cross.addEventListener("click", () => {
  right.style.display = "none";
});

// expand button onclick

let count4 = 0;

expand.addEventListener("click", () => {
  count4++;
  if (count4 % 2 == 1) {
    youtube.style.display = "flex";
    expand.style.color = "whiteSmoke";
  } else {
    youtube.style.display = "none";
    expand.style.color = "#1aa34a";
  }
});

// ---------------------------------------------------------------------------

// main api function
async function fetchRecipes(query) {
  cardContainer.innerHTML = "Fetching recipes...";
  const data = await fetch(
    `https://www.themealdb.com/api/json/v1/1/search.php?s=${query}`
  );

  const response = await data.json();
  console.log(response);

  cardContainer.innerHTML = "";

  // all function calls
  LoadItem(response);
  viewRecipe();
}

// =================functions

// loadItem function
function LoadItem(mealObj) {
  if (mealObj.meals == null) {
    cardContainer.innerHTML = "No Items found!";
    console.log("nothing found!!");
    return;
  }

  mealObj.meals.forEach((meal) => {
    // Escape quotes in JSON to prevent parsing errors
    const mealDataSafe = JSON.stringify(meal).replace(/"/g, "&quot;");

    cardContainer.innerHTML += `
        <div class="recipe">
          <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
          <div class="recipe-details">
            <h3 class="meal-name">${meal.strMeal}</h3>
            <p class="meal-type">${meal.strCategory}</p>
          </div>
          <button class="recipe-btn" data-meal="${mealDataSafe}">View Recipe</button>
        </div>
      `;
  });
}

//  view Recipe function
function viewRecipe() {
  cardContainer.addEventListener("click", (event) => {
    if (event.target.classList.contains("recipe-btn")) {
      try {
        // Retrieve meal data safely and unescape quotes
        const mealDataStr = event.target
          .getAttribute("data-meal")
          .replace(/&quot;/g, '"');
        const mealData = JSON.parse(mealDataStr);

        // Handle the YouTube link click dynamically
        const video = document.querySelector(".video");
        if (mealData.strYoutube) {
          video.onclick = function () {
            console.log(mealData.strMeal); 
            window.open(mealData.strYoutube, "_blank");
          };
        }

        // Display recipe details
        right.style.display = "flex";
        head.innerHTML = `
          <h3 class="right-meal-name">${mealData.strMeal}</h3>
          <p class="right-meal-type">${mealData.strCategory}</p>
        `;

        // Update recipe image
        rightImage.innerHTML = `
          <img src="${mealData.strMealThumb}" alt="${mealData.strMeal}">
        `;

        // Recipe tags
        tags.innerHTML = mealData.strTags
          ? mealData.strTags
              .split(",")
              .map((tag) => `<span class="tag-item">${tag.trim()}</span>`)
              .join("")
          : `<span class="tag-item">No tags</span>`;

        // Ingredients and measurements
        ingre.innerHTML = "";
        for (let index = 1; index <= 20; index++) {
          let ing = mealData[`strIngredient${index}`];
          let mes = mealData[`strMeasure${index}`];
          if (ing) {
            ingre.innerHTML += `<li class="ingredient-item">${ing} : ${mes}</li>`;
          } else {
            break;
          }
        }

        // Main recipe instructions
        main.innerHTML = "";
        if (mealData.strInstructions) {
          let steps = mealData.strInstructions.trim().split(".");
          steps.forEach((step, index) => {
            if (step.trim()) {
              main.innerHTML += `<li class="inst-item">${
                index + 1
              }. ${step.trim()}.</li>`;
            }
          });
        } else {
          main.innerHTML = `<li class="inst-item">No Instructions</li>`;
        }

        //  love and share

        love.onclick = () => {
          // Check if meal already exists in favorites
          const index = favList.findIndex(
            (fav) => fav.idMeal === mealData.idMeal
          );

          if (index === -1) {
            // Add to favorites if not found
            favList.push(mealData);
            console.log("Added to favorites:", favList);
          } else {
            // Remove from favorites if already exists
            favList.splice(index, 1);
            console.log("Removed from favorites:", favList);
          }

          // Update local storage
          localStorage.setItem("favList", JSON.stringify(favList));

          // Update favorite list UI
          updateFavourite(favList);
        };
      } catch (error) {
        console.error("Error parsing meal data:", error);
      }
    }
  });
}

function updateFavourite(favList) {
  userFav.innerHTML = "";
  favList.map((item) => {
    userFav.innerHTML += `
        <div class="fav-item">${item.strMeal}</div>
      `;
  });
}

userFav.addEventListener("click", (event) => {
  if (event.target.classList.contains("fav-item")) {
    const mealName = event.target.textContent;
    fetchRecipes(mealName);
  }
});

fetchRecipes(" ");
