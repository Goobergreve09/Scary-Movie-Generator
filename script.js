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

    movieTitle.textContent = selectedMovie.title;

    const total = getFilteredMovies().length;
    const used = total - remainingMovies.length;

    movieCount.textContent = `${remainingMovies.length} movies remaining in this pool`;
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
    movieCount.textContent = `${getFilteredMovies().length} movies available`;
});

resetPool();
movieCount.textContent = `${getFilteredMovies().length} movies available`;
