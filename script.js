const movieTitle = document.getElementById("movieTitle");
const movieCount = document.getElementById("movieCount");
const pickButton = document.getElementById("pickButton");
const resetButton = document.getElementById("resetButton");

// Genre filter elements
const genreButton = document.getElementById("genreButton");
const genreMenu = document.getElementById("genreMenu");
const genreLabel = document.getElementById("genreLabel");

// Decade filter elements
const decadeButton = document.getElementById("decadeButton");
const decadeMenu = document.getElementById("decadeMenu");
const decadeLabel = document.getElementById("decadeLabel");
const decadeCheckboxes = document.querySelectorAll(".decade-option input");

let remainingMovies = [];
let currentGenre = "all";
let selectedDecades = [];

// Return movies matching BOTH the selected genre and selected decades.
function getFilteredMovies() {
    return horrorMovies.filter(movie => {
        const genreMatch =
            currentGenre === "all" ||
            movie.genre === currentGenre;

        const decadeMatch =
            selectedDecades.length === 0 ||
            selectedDecades.includes(
                Math.floor(movie.year / 10) * 10
            );

        return genreMatch && decadeMatch;
    });
}

// Rebuild and shuffle the pool using the current filters.
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

    const selectedMovie = remainingMovies.pop();

    movieTitle.classList.remove("reveal");
    void movieTitle.offsetWidth;
    movieTitle.classList.add("reveal");

    const movieLink = document.createElement("a");

    movieLink.id = "movieLink";
    movieLink.target = "_blank";
    movieLink.rel = "noopener noreferrer";
    movieLink.textContent = selectedMovie.title;

    movieLink.setAttribute(
        "aria-label",
        `Open ${selectedMovie.title} on IMDb`
    );

    if (selectedMovie.imdbId) {
        movieLink.href =
            `https://www.imdb.com/title/${selectedMovie.imdbId}/`;
    } else {
        movieLink.href =
            `https://www.imdb.com/find/?q=${encodeURIComponent(
                selectedMovie.title
            )}`;
    }

    movieTitle.innerHTML = "";
    movieTitle.appendChild(movieLink);

    movieCount.textContent =
        `${remainingMovies.length} movies remaining in this pool`;
}

function changeGenre(genre, label) {
    currentGenre = genre;
    genreLabel.textContent = label;

    resetPool();

    movieTitle.textContent = "???";
    movieCount.textContent =
        `${getFilteredMovies().length} movies available`;

    closeAllDropdowns();
}

function updateDecadeFilter() {
    selectedDecades = Array.from(decadeCheckboxes)
        .filter(checkbox => checkbox.checked)
        .map(checkbox => Number(checkbox.value));

    updateDecadeLabel();

    resetPool();

    movieTitle.textContent = "???";
    movieCount.textContent =
        `${getFilteredMovies().length} movies available`;
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

    decadeLabel.textContent =
        `${selectedDecades.length} Decades Selected`;
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

    genreButton.setAttribute("aria-expanded", "false");
    decadeButton.setAttribute("aria-expanded", "false");
}

// Genre dropdown
genreButton.addEventListener("click", event => {
    event.stopPropagation();
    toggleDropdown(genreButton, genreMenu);
});

genreMenu.querySelectorAll("button").forEach(button => {
    button.addEventListener("click", () => {
        changeGenre(
            button.dataset.value,
            button.textContent.trim()
        );
    });
});

// Decade dropdown
decadeButton.addEventListener("click", event => {
    event.stopPropagation();
    toggleDropdown(decadeButton, decadeMenu);
});

decadeCheckboxes.forEach(checkbox => {
    checkbox.addEventListener("change", updateDecadeFilter);
});

// Keep dropdowns open while selecting multiple decades,
// but close them when clicking elsewhere.
document.addEventListener("click", event => {
    if (
        !event.target.closest(".custom-dropdown") &&
        !event.target.closest(".decade-dropdown")
    ) {
        closeAllDropdowns();
    }
});

pickButton.addEventListener("click", pickMovie);

resetButton.addEventListener("click", () => {
    resetPool();

    movieTitle.textContent = "???";
    movieCount.textContent =
        `${getFilteredMovies().length} movies available`;
});

// Initial setup
resetPool();

movieCount.textContent =
    `${getFilteredMovies().length} movies available`;