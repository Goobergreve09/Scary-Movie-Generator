# October Horror Movie Generator

A vanilla HTML/CSS/JavaScript horror movie randomizer.

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
