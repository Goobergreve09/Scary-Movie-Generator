# October Horror Movie Generator

A vanilla HTML/CSS/JavaScript horror movie randomizer.

https://goobergreve09.github.io/Scary-Movie-Generator/

## Run it
Open `index.html` in a browser.

## Files
- `index.html` - page structure
- `style.css` - Halloween/horror styling
- `script.js` - randomizer, filters, and non-repeating selection
- `movies.js` - movie database

The generator removes each selected movie from the current pool until the pool is empty, so it will not repeat a movie during a run.

You can add more movies by adding objects to `movies.js`:
{ title: "Movie Name", genre: "slasher" }

Available genres:
classic, slasher, supernatural, psychological, creature, zombie, found-footage, comedy, sci-fi


## IMDb links

Movies with a verified `imdbId` open directly to their IMDb title page. Movies without an ID currently open IMDb's title search for that movie rather than using an unverified ID.
