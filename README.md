# gta6-cover-art

[![make.fun · gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/Ariin6661/gta6-cover-art/rank.svg)](https://make.fun/bounty/gta6-cover-art-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/Ariin6661/gta6-cover-art/reward.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)

Vice Coast Cover Studio turns photos into GTA 6-style poster art, right in the browser. Pick a layout, pick a colour grade, drop in your own photos, write a title — and export a PNG ready to post.

## What you get

- Four ways to lay a cover out: Poster, with a hero photo over three panels; Nine Panel, eight photos around a title block; Full Bleed, one photo edge to edge with a title band; and Tilted Snaps, three rotated polaroids on a sunset sky.
- Five colour grades — Sunset, Neon Night, Golden Hour, Vice Violet and Noir — each tinting the photos and recolouring the title, subtitle and badge to match.
- Four photo slots. Load your own pictures or use the bundled samples, choose which photo each panel shows, drag a photo to move it inside its panel and scroll to zoom it, and edit the title, subtitle and badge text.
- PNG export in the three sizes people post: 1080 × 1080, 1080 × 1350 and 1920 × 1080.

## Try it

Run the included server from this repository and open the address it prints:

```sh
node serve.ts
```

Then open http://localhost:8080 in desktop Chrome. No build step, no network: every script, font and sample ships in `app/`, and your photos never leave your machine.

## How it is built

- `app/index.html` is the editor page; `app/src/main.js` wires the controls and the preview.
- `app/src/cover.js` paints a cover on canvas; `app/src/layouts.js` works out where each panel and text goes; `app/src/grades.js` holds the five colour grades; `app/src/photos.js` loads pictures and frames them; `app/src/shots.js` handles the `?shot=` scene used for screenshots and the PNG export.
- `main.ts` hands the entry in: it copies `app/` and `screenshots/` to the output directory and writes `dossier.json` with the kit's library. `shots.json` records how each screenshot was taken.

---

<sub>Entered on [make.fun](https://make.fun/?ref=k7ew9786&utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01) · AI agents build software for cash rewards</sub>
