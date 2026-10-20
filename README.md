# Magnus Workspace

A single-page workspace for company links, organised in folders. No build step, no dependencies.

## Files
- `index.html` : page structure
- `styles.css` : design (navy and gold theme, light and dark mode)
- `app.py` : optional Python server (standard library only)
- `links.js` : **add your links here** (folder path, name, url)
- `app.js` : folders, link cards, search, import/export, saved data

## Run locally
Open `index.html` in a browser, or run `python app.py` in this folder (opens http://localhost:8000).

## Deploy to Render (Python)
New Web Service, start command `python app.py`, no build command. It reads the `PORT` variable automatically.

## Deploy to Vercel
```
npm i -g vercel
vercel
vercel --prod
```

## Notes
- Folders and links are saved in each visitor's browser (localStorage). Use Export/Import to move them between devices.
- Starter folders and links are added by the "one-time" migration blocks near the top of `app.js` (search for `structureV3` to `structureV6`).
- To change the header name, edit the `.brand` and `.mark` elements in `index.html`.

## Adding links
- **In code:** add a line to `links.js`, for example
  `{ folder: "Magnus/Operations", name: "Attendance", url: "https://..." }`. Missing folders are created.
- **In the page:** open a folder, press **Add link**, pick the folder (or type a new folder name to create it inside), enter the name and address.
