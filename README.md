# Red Dang – Portfolio

Static portfolio site for Red Dang (Product Owner / Product Manager), hosted on GitHub Pages at https://reddang.github.io.

## Run locally

The pages load `projects.json` with `fetch`, so they need a local server (opening `index.html` as a file will not work).

```bash
npm install && npm start          # live-server with auto reload, http://127.0.0.1:8080
```

Use `npm start` rather than `python3 -m http.server`: Python's server does not support range requests, so Safari will not play the videos.

## Structure

| Path | What it is |
|---|---|
| `index.html` | Home page: hero, key numbers, case studies, experience, independent products, how I work, design archive, contact |
| `project.html` | Case study / project page, rendered from `projects.json` by `?id=` |
| `projects.json` | All projects. `tier` is `featured` (case study), `shipped` (independent product) or `archive` (design work, with `group`: `product`, `3d`, `graphic`) |
| `script.js` | Renders the home lists and the project page |
| `style.css` | All styles (light and dark mode) |
| `assets/img/` | Optimized WebP images (generated) and `og.png` share image |
| `assets/media/` | Videos used on the site |
| `assets/CV_dangvuongquang@gmail.com_0946858455.pdf` | CV, built from `../CV/source` (`./build.sh`) |
| `tools/build_images.py` | Builds `assets/img/*.webp` from the source images in `tools/src/` |
| `tools/og.html` | Template for the share image |

## Editing a project

1. Edit the entry in `projects.json`. Case studies use `sections` (each with `html`, or `list` for decision cards), `metrics`, `gallery` and `media`.
2. Put the source image in `tools/src/` and reference it as `assets/img/<name>.webp` (same base name).
3. Run `python3 tools/build_images.py` to generate any new WebP files (and card thumbnails in `assets/img/card/`).

## Share image

```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --hide-scrollbars \
  --window-size=1200,630 --virtual-time-budget=5000 \
  --screenshot="$PWD/assets/img/og.png" "file://$PWD/tools/og.html"
```

## Deploy

Push to the default branch; GitHub Pages publishes within a few minutes.
