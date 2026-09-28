import gzip
import json
import re
import shutil
import urllib.request
from difflib import SequenceMatcher
from pathlib import Path

# ============================================================
# SETTINGS
# ============================================================

MOVIES_FILE = Path("movies.js")
OUTPUT_FILE = Path("movies-with-imdb.js")

BASICS_URL = "https://datasets.imdbws.com/title.basics.tsv.gz"
RATINGS_URL = "https://datasets.imdbws.com/title.ratings.tsv.gz"

BASICS_FILE = Path("title.basics.tsv.gz")
RATINGS_FILE = Path("title.ratings.tsv.gz")

# ============================================================
# HELPERS
# ============================================================

def normalize_title(title):
    """
    Normalize titles so small differences don't prevent matching.
    """
    title = title.lower().strip()

    replacements = {
        "&": "and",
        "’": "'",
        "‘": "'",
        "–": "-",
        "—": "-",
        ":": "",
        ",": "",
        ".": "",
        "!": "",
        "?": "",
        "'": "",
        '"': "",
    }

    for old, new in replacements.items():
        title = title.replace(old, new)

    title = re.sub(r"\s+", " ", title)

    return title.strip()


def download_file(url, destination):
    """
    Download a file if it doesn't already exist.
    """
    if destination.exists():
        print(f"[+] Already downloaded: {destination}")
        return

    print(f"[+] Downloading {url}")
    print("    This may take a while...")

    urllib.request.urlretrieve(url, destination)

    print(f"[+] Saved: {destination}")


def load_movies():
    """
    Read the user's existing movies.js file.
    """
    if not MOVIES_FILE.exists():
        raise FileNotFoundError(
            f"Could not find {MOVIES_FILE}. "
            f"Put this Python script in the same folder as movies.js."
        )

    text = MOVIES_FILE.read_text(encoding="utf-8")

    pattern = re.compile(
        r'\{\s*title:\s*"((?:\\.|[^"\\])*)"\s*,\s*genre:\s*"([^"]+)"\s*\}'
    )

    movies = []

    for match in pattern.finditer(text):
        title = bytes(match.group(1), "utf-8").decode("unicode_escape")
        genre = match.group(2)

        movies.append({
            "title": title,
            "genre": genre
        })

    if not movies:
        raise RuntimeError(
            "No movies were found in movies.js. "
            "Make sure it uses the format: "
            '{ title: "Movie Name", genre: "genre" }'
        )

    return movies


def load_imdb_titles(movie_titles):
    """
    Read IMDb's title.basics dataset and keep only titles
    that could potentially match our movies.
    """

    wanted = {
        normalize_title(title)
        for title in movie_titles
    }

    candidates = {}

    print("[+] Reading IMDb title database...")
    print("    This can take a few minutes.")

    with gzip.open(BASICS_FILE, "rt", encoding="utf-8") as f:

        header = f.readline().rstrip("\n").split("\t")

        indexes = {
            name: header.index(name)
            for name in [
                "tconst",
                "titleType",
                "primaryTitle",
                "originalTitle",
                "startYear"
            ]
        }

        for line_number, line in enumerate(f, start=2):

            parts = line.rstrip("\n").split("\t")

            if len(parts) <= max(indexes.values()):
                continue

            title_type = parts[indexes["titleType"]]

            # We only want actual movies.
            if title_type != "movie":
                continue

            tconst = parts[indexes["tconst"]]
            primary_title = parts[indexes["primaryTitle"]]
            original_title = parts[indexes["originalTitle"]]
            year = parts[indexes["startYear"]]

            normalized_primary = normalize_title(primary_title)
            normalized_original = normalize_title(original_title)

            if (
                normalized_primary not in wanted
                and normalized_original not in wanted
            ):
                continue

            candidate = {
                "tconst": tconst,
                "primaryTitle": primary_title,
                "originalTitle": original_title,
                "year": year
            }

            candidates.setdefault(normalized_primary, []).append(candidate)

            if normalized_original != normalized_primary:
                candidates.setdefault(normalized_original, []).append(candidate)

            if line_number % 500000 == 0:
                print(f"    Processed {line_number:,} IMDb titles...")

    print(f"[+] Found IMDb candidates for {len(candidates)} title names.")

    return candidates


def load_ratings(candidate_ids):
    """
    Load IMDb vote counts so that when multiple movies share
    the same title, we can choose the most established IMDb entry.
    """

    ratings = {}

    print("[+] Reading IMDb ratings database...")

    with gzip.open(RATINGS_FILE, "rt", encoding="utf-8") as f:

        header = f.readline().rstrip("\n").split("\t")

        tconst_index = header.index("tconst")
        votes_index = header.index("numVotes")

        for line in f:
            parts = line.rstrip("\n").split("\t")

            if len(parts) <= max(tconst_index, votes_index):
                continue

            tconst = parts[tconst_index]

            if tconst not in candidate_ids:
                continue

            try:
                votes = int(parts[votes_index])
            except ValueError:
                votes = 0

            ratings[tconst] = votes

    return ratings


def find_best_match(movie, candidates, ratings):
    """
    Find the best IMDb match for a movie.

    Exact title matches are preferred.
    If there are multiple exact matches, the entry with
    the most IMDb votes is selected.

    A fuzzy fallback is also provided.
    """

    wanted = normalize_title(movie["title"])

    exact_matches = candidates.get(wanted, [])

    if exact_matches:

        # Remove duplicates.
        unique = {}

        for candidate in exact_matches:
            unique[candidate["tconst"]] = candidate

        exact_matches = list(unique.values())

        exact_matches.sort(
            key=lambda x: ratings.get(x["tconst"], 0),
            reverse=True
        )

        return exact_matches[0], "exact"

    # --------------------------------------------------------
    # Fuzzy fallback
    # --------------------------------------------------------

    best_candidate = None
    best_score = 0

    for candidate_list in candidates.values():

        for candidate in candidate_list:

            score = SequenceMatcher(
                None,
                wanted,
                normalize_title(candidate["primaryTitle"])
            ).ratio()

            if score > best_score:
                best_score = score
                best_candidate = candidate

    if best_candidate and best_score >= 0.90:
        return best_candidate, f"fuzzy ({best_score:.2%})"

    return None, None


def escape_js_string(value):
    return (
        value
        .replace("\\", "\\\\")
        .replace('"', '\\"')
        .replace("\n", "\\n")
        .replace("\r", "\\r")
    )


def write_output(movies):
    """
    Create movies-with-imdb.js
    """

    lines = []

    lines.append("const horrorMovies = [")

    for movie in movies:

        title = escape_js_string(movie["title"])
        genre = escape_js_string(movie["genre"])

        if movie.get("imdbId"):
            lines.append(
                f'    {{ title: "{title}", genre: "{genre}", '
                f'imdbId: "{movie["imdbId"]}" }},'
            )
        else:
            lines.append(
                f'    {{ title: "{title}", genre: "{genre}" }},'
            )

    lines.append("];")
    lines.append("")
    lines.append("")

    lines.append("// Make available to browser scripts")
    lines.append("if (typeof module !== 'undefined') {")
    lines.append("    module.exports = horrorMovies;")
    lines.append("}")

    OUTPUT_FILE.write_text(
        "\n".join(lines),
        encoding="utf-8"
    )


# ============================================================
# MAIN
# ============================================================

def main():

    print()
    print("=" * 60)
    print(" IMDb ID ADDER FOR YOUR HORROR MOVIE GENERATOR")
    print("=" * 60)
    print()

    # --------------------------------------------------------
    # Read existing movies.js
    # --------------------------------------------------------

    movies = load_movies()

    print(f"[+] Found {len(movies)} movies in movies.js")
    print()

    # --------------------------------------------------------
    # Download IMDb data
    # --------------------------------------------------------

    download_file(BASICS_URL, BASICS_FILE)
    download_file(RATINGS_URL, RATINGS_FILE)

    print()

    # --------------------------------------------------------
    # Find matching IMDb titles
    # --------------------------------------------------------

    candidates = load_imdb_titles(
        [movie["title"] for movie in movies]
    )

    candidate_ids = set()

    for candidate_list in candidates.values():
        for candidate in candidate_list:
            candidate_ids.add(candidate["tconst"])

    print(f"[+] Potential IMDb entries: {len(candidate_ids):,}")
    print()

    # --------------------------------------------------------
    # Load ratings
    # --------------------------------------------------------

    ratings = load_ratings(candidate_ids)

    print("[+] Matching your movies...")
    print()

    matched = 0
    unmatched = []
    fuzzy_matches = []

    for movie in movies:

        match, match_type = find_best_match(
            movie,
            candidates,
            ratings
        )

        if match:

            movie["imdbId"] = match["tconst"]
            matched += 1

            if match_type != "exact":
                fuzzy_matches.append({
                    "movie": movie["title"],
                    "matched": match["primaryTitle"],
                    "imdbId": match["tconst"],
                    "type": match_type
                })

        else:

            unmatched.append(movie["title"])

    # --------------------------------------------------------
    # Write output
    # --------------------------------------------------------

    write_output(movies)

    # --------------------------------------------------------
    # Report
    # --------------------------------------------------------

    print()
    print("=" * 60)
    print(" COMPLETE")
    print("=" * 60)
    print()

    print(f"Total movies:     {len(movies)}")
    print(f"IMDb matches:     {matched}")
    print(f"Unmatched:        {len(unmatched)}")
    print(f"Fuzzy matches:    {len(fuzzy_matches)}")
    print()

    print(f"Created: {OUTPUT_FILE}")
    print()

    if fuzzy_matches:

        print("=" * 60)
        print(" FUZZY MATCHES — CHECK THESE")
        print("=" * 60)

        for item in fuzzy_matches:
            print(
                f'\n{item["movie"]}'
                f'\n  -> {item["matched"]}'
                f'\n  -> {item["imdbId"]}'
                f'\n  -> {item["type"]}'
            )

    if unmatched:

        print()
        print("=" * 60)
        print(" UNMATCHED MOVIES")
        print("=" * 60)

        for title in unmatched:
            print(f" - {title}")

    print()
    print("Done.")


if __name__ == "__main__":
    main()