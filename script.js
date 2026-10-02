const movieTitle = document.getElementById("movieTitle");
const movieCount = document.getElementById("movieCount");
const pickButton = document.getElementById("pickButton");
const resetButton = document.getElementById("resetButton");

const movieMeta = document.getElementById("movieMeta");
const movieYear = document.getElementById("movieYear");
const imdbRating = document.getElementById("imdbRating");
const rtRating = document.getElementById("rtRating");

const filtersButton = document.getElementById("filtersButton");
const filtersPanel = document.getElementById("filtersPanel");
const filtersArrow = document.getElementById("filtersArrow");

const genreButton = document.getElementById("genreButton");
const genreMenu = document.getElementById("genreMenu");
const genreLabel = document.getElementById("genreLabel");

const decadeButton = document.getElementById("decadeButton");
const decadeMenu = document.getElementById("decadeMenu");
const decadeLabel = document.getElementById("decadeLabel");
const decadeCheckboxes = document.querySelectorAll(".decade-option input");

const imdbButton = document.getElementById("imdbButton");
const imdbMenu = document.getElementById("imdbMenu");
const imdbLabel = document.getElementById("imdbLabel");

const rtButton = document.getElementById("rtButton");
const rtMenu = document.getElementById("rtMenu");
const rtLabel = document.getElementById("rtLabel");

let remainingMovies = [];
let currentGenre = "all";
let selectedDecades = [];
let selectedImdbRating = null;
let selectedRtRating = null;

function getFilteredMovies() {
  return horrorMovies.filter((movie) => {
    const genreMatch = currentGenre === "all" || movie.genre === currentGenre;

    const decadeMatch =
      selectedDecades.length === 0 ||
      selectedDecades.includes(Math.floor(movie.year / 10) * 10);

    const imdbMatch =
      selectedImdbRating === null ||
      (movie.imdbRating !== null &&
        movie.imdbRating !== undefined &&
        Number(movie.imdbRating) >= selectedImdbRating);

    const rtMatch =
      selectedRtRating === null ||
      (movie.rottenTomatoes !== null &&
        movie.rottenTomatoes !== undefined &&
        Number(movie.rottenTomatoes) >= selectedRtRating);

    return genreMatch && decadeMatch && imdbMatch && rtMatch;
  });
}

function resetPool() {
  remainingMovies = [...getFilteredMovies()];
  shuffle(remainingMovies);
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function pickMovie() {
  if (remainingMovies.length === 0) {
    resetPool();
  }

  if (remainingMovies.length === 0) {
    movieTitle.textContent = "NO MOVIES FOUND";
    movieCount.textContent = "Try changing one or more filters";
    return;
  }

 const selectedMovie = remainingMovies.pop();

movieMeta.style.display = "flex";

movieYear.textContent = selectedMovie.year;

imdbRating.textContent =
    selectedMovie.imdbRating !== null &&
    selectedMovie.imdbRating !== undefined
        ? selectedMovie.imdbRating
        : "N/A";

rtRating.textContent =
    selectedMovie.rottenTomatoes !== null &&
    selectedMovie.rottenTomatoes !== undefined
        ? `${selectedMovie.rottenTomatoes}%`
        : "N/A";

  movieTitle.classList.remove("reveal");
  void movieTitle.offsetWidth;
  movieTitle.classList.add("reveal");

  const movieLink = document.createElement("a");

  movieLink.id = "movieLink";
  movieLink.target = "_blank";
  movieLink.rel = "noopener noreferrer";
  movieLink.textContent = selectedMovie.title;

  movieLink.setAttribute("aria-label", `Open ${selectedMovie.title} on IMDb`);

  if (selectedMovie.imdbId) {
    movieLink.href = `https://www.imdb.com/title/${selectedMovie.imdbId}/`;
  } else {
    movieLink.href = `https://www.imdb.com/find/?q=${encodeURIComponent(
      selectedMovie.title,
    )}`;
  }

  movieTitle.innerHTML = "";
  movieTitle.appendChild(movieLink);

  movieCount.textContent = `${remainingMovies.length} movies remaining in this pool`;
}

function updateMovieDisplay() {
    resetPool();

    movieTitle.textContent = "???";

    movieMeta.style.display = "none";

    movieYear.textContent = "";
    imdbRating.textContent = "";
    rtRating.textContent = "";

    movieCount.textContent =
        `${getFilteredMovies().length} movies available`;
}

function changeGenre(genre, label) {
  currentGenre = genre;
  genreLabel.textContent = label;

  updateMovieDisplay();
  closeAllDropdowns();
}

function updateDecadeFilter() {
  selectedDecades = Array.from(decadeCheckboxes)
    .filter((checkbox) => checkbox.checked)
    .map((checkbox) => Number(checkbox.value));

  updateDecadeLabel();
  updateMovieDisplay();
}

function updateDecadeLabel() {
  if (selectedDecades.length === 0) {
    decadeLabel.textContent = "All Decades";
    return;
  }

  if (selectedDecades.length === 1) {
    decadeLabel.textContent = `${selectedDecades[0]}s`;
    return;
  }

  decadeLabel.textContent = `${selectedDecades.length} Decades Selected`;
}

function changeImdbRating(rating, label) {
  selectedImdbRating = rating;
  imdbLabel.textContent = label;

  updateMovieDisplay();
  closeAllDropdowns();
}

function changeRtRating(rating, label) {
  selectedRtRating = rating;
  rtLabel.textContent = label;

  updateMovieDisplay();
  closeAllDropdowns();
}

function toggleDropdown(button, menu) {
  const isOpen = menu.classList.contains("open");

  closeAllDropdowns();

  if (!isOpen) {
    menu.classList.add("open");
    button.setAttribute("aria-expanded", "true");
  }
}

function closeAllDropdowns() {
  genreMenu.classList.remove("open");
  decadeMenu.classList.remove("open");
  imdbMenu.classList.remove("open");
  rtMenu.classList.remove("open");

  genreButton.setAttribute("aria-expanded", "false");
  decadeButton.setAttribute("aria-expanded", "false");
  imdbButton.setAttribute("aria-expanded", "false");
  rtButton.setAttribute("aria-expanded", "false");
}

function closeFilters() {
  closeAllDropdowns();

  filtersPanel.classList.remove("open");
  filtersButton.setAttribute("aria-expanded", "false");
  filtersArrow.style.transform = "rotate(0deg)";
}

filtersButton.addEventListener("click", (event) => {
  event.stopPropagation();

  const isOpen = filtersPanel.classList.contains("open");

  if (isOpen) {
    closeFilters();
  } else {
    filtersPanel.classList.add("open");
    filtersButton.setAttribute("aria-expanded", "true");
    filtersArrow.style.transform = "rotate(180deg)";
  }
});

genreButton.addEventListener("click", (event) => {
  event.stopPropagation();
  toggleDropdown(genreButton, genreMenu);
});

genreMenu.querySelectorAll("button").forEach((button) => {
  button.addEventListener("click", () => {
    changeGenre(button.dataset.value, button.textContent.trim());
  });
});

decadeButton.addEventListener("click", (event) => {
  event.stopPropagation();
  toggleDropdown(decadeButton, decadeMenu);
});

decadeCheckboxes.forEach((checkbox) => {
  checkbox.addEventListener("change", updateDecadeFilter);
});

imdbButton.addEventListener("click", (event) => {
  event.stopPropagation();
  toggleDropdown(imdbButton, imdbMenu);
});

imdbMenu.querySelectorAll("button").forEach((button) => {
  button.addEventListener("click", () => {
    const value = button.dataset.value;

    changeImdbRating(
      value === "all" ? null : Number(value),
      button.textContent.trim(),
    );
  });
});

rtButton.addEventListener("click", (event) => {
  event.stopPropagation();
  toggleDropdown(rtButton, rtMenu);
});

rtMenu.querySelectorAll("button").forEach((button) => {
  button.addEventListener("click", () => {
    const value = button.dataset.value;

    changeRtRating(
      value === "all" ? null : Number(value),
      button.textContent.trim(),
    );
  });
});

document.addEventListener("click", (event) => {
  if (!event.target.closest(".filter-container")) {
    closeFilters();
  }
});

pickButton.addEventListener("click", pickMovie);

resetButton.addEventListener("click", () => {
  currentGenre = "all";
  selectedDecades = [];
  selectedImdbRating = null;
  selectedRtRating = null;

  genreLabel.textContent = "All Horror Movies";
  decadeLabel.textContent = "All Decades";
  imdbLabel.textContent = "All IMDb Ratings";
  rtLabel.textContent = "All Rotten Tomatoes";

  decadeCheckboxes.forEach((checkbox) => {
    checkbox.checked = false;
  });

  closeAllDropdowns();
  updateMovieDisplay();
});

resetPool();

movieCount.textContent = `${getFilteredMovies().length} movies available`;
