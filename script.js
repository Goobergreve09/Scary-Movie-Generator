const movieTitle = document.getElementById("movieTitle");
const movieCount = document.getElementById("movieCount");
const pickButton = document.getElementById("pickButton");
const resetButton = document.getElementById("resetButton");
const genreSelect = document.getElementById("genreSelect");

let remainingMovies = [];
let currentGenre = "all";

function getFilteredMovies() {
    if (currentGenre === "all") {
        return horrorMovies;
    }

    return horrorMovies.filter(movie => movie.genre === currentGenre);
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

    const selectedMovie = remainingMovies.pop();

    movieTitle.classList.remove("reveal");
    void movieTitle.offsetWidth;
    movieTitle.classList.add("reveal");

    // Create the IMDb link
    const movieLink = document.createElement("a");

    movieLink.id = "movieLink";
    movieLink.target = "_blank";
    movieLink.rel = "noopener noreferrer";
    movieLink.textContent = selectedMovie.title;
    movieLink.setAttribute(
        "aria-label",
        `Open ${selectedMovie.title} on IMDb`
    );

    // Use the IMDb ID when available.
    // Otherwise, fall back to an IMDb search.
    if (selectedMovie.imdbId) {
        movieLink.href = `https://www.imdb.com/title/${selectedMovie.imdbId}/`;
    } else {
        movieLink.href = `https://www.imdb.com/find/?q=${encodeURIComponent(
            selectedMovie.title
        )}`;
    }

    // Clear the old title and add the new link
    movieTitle.innerHTML = "";
    movieTitle.appendChild(movieLink);

    movieCount.textContent =
        `${remainingMovies.length} movies remaining in this pool`;
}

function changeGenre() {
    currentGenre = genreSelect.value;

    resetPool();

    const total = getFilteredMovies().length;

    movieCount.textContent = `${total} movies available`;
    movieTitle.textContent = "???";
}

pickButton.addEventListener("click", pickMovie);

genreSelect.addEventListener("change", changeGenre);

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