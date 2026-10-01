const movieTitle = document.getElementById("movieTitle");
const movieCount = document.getElementById("movieCount");
const pickButton = document.getElementById("pickButton");
const resetButton = document.getElementById("resetButton");
const genreSelect = document.getElementById("genreSelect");

const decadeButton = document.getElementById("decadeButton");
const decadeMenu = document.getElementById("decadeMenu");
const decadeLabel = document.getElementById("decadeLabel");
const decadeCheckboxes = document.querySelectorAll(
    ".decade-option input"
);

let remainingMovies = [];
let currentGenre = "all";
let selectedDecades = [];

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

function resetPool() {
    remainingMovies = [...getFilteredMovies()];
    shuffle(remainingMovies);
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));

        [array[i], array[j]] =
            [array[j], array[i]];
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

function changeGenre() {
    currentGenre = genreSelect.value;

    resetPool();

    movieTitle.textContent = "???";
    movieCount.textContent =
        `${getFilteredMovies().length} movies available`;
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
        decadeLabel.textContent =
            `${selectedDecades[0]}s`;
        return;
    }

    decadeLabel.textContent =
        `${selectedDecades.length} Decades Selected`;
}

function toggleDecadeMenu() {
    const isOpen = decadeMenu.classList.toggle("open");

    decadeButton.setAttribute(
        "aria-expanded",
        isOpen
    );
}

function closeDecadeMenu() {
    decadeMenu.classList.remove("open");

    decadeButton.setAttribute(
        "aria-expanded",
        "false"
    );
}

genreSelect.addEventListener(
    "change",
    changeGenre
);

decadeButton.addEventListener(
    "click",
    toggleDecadeMenu
);

decadeCheckboxes.forEach(checkbox => {
    checkbox.addEventListener(
        "change",
        updateDecadeFilter
    );
});

document.addEventListener("click", event => {
    if (!event.target.closest(".decade-dropdown")) {
        closeDecadeMenu();
    }
});

pickButton.addEventListener(
    "click",
    pickMovie
);

resetButton.addEventListener("click", () => {
    resetPool();

    movieTitle.textContent = "???";

    movieCount.textContent =
        `${getFilteredMovies().length} movies available`;
});

resetPool();

movieCount.textContent =
    `${getFilteredMovies().length} movies available`;