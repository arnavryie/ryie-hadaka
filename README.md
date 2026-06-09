# ryie-hadaka

A cinematic scroll-driven portfolio site. Dark palette, neon headlines, per-section canvas particle effects, live GitHub contribution heatmap. Vanilla JS — no build step, no framework.

**Live:** [ryie-hadaka.vercel.app](https://ryie-hadaka.vercel.app)

---

## Run it locally

You need a local web server — the canvas particle effects use `getImageData` which is blocked on `file://` URLs.

```bash
git clone https://github.com/arnavryie/ryie-hadaka.git
cd ryie-hadaka
python -m http.server 8000
```

Open [http://localhost:8000](http://localhost:8000).

Any static server works — `npx serve`, `php -S localhost:8000`, VS Code Live Server, whatever.

## Fork & make it yours

If you want to use this as your own portfolio, here's what to change:

1. **GitHub heatmap** — `js/streak.js`, line 8:
   ```js
   var USER = "arnavryie";  // ← your GitHub handle
   ```
2. **Headline text & copy** — search `index.html` for `RYIE`, `FULL OF`, `HUSTLE`, `WE SHIP`, etc. and rewrite.
3. **Projects** — the `<a class="proj">` cards in the `w-work` section. Change the title, description, tags, and links.
4. **Social links** — search `.rail` and `.contact` in `index.html` and swap the GitHub / X / LinkedIn / email URLs.
5. **Background images** — replace files in `assets/img/` (keep the same filenames or update the `data-src` attributes in `index.html`).
6. **Color palette** — top of `css/style.css`, the `:root` block. Defaults are magenta `#ff2bd6`, cyan `#19e6ff`, purple `#8b5cff` on `#06070b` black.

## Stack

- **GSAP 3** + **ScrollTrigger** — scroll-driven animations
- **Lenis** — smooth scroll
- **Plain `<canvas>`** — the particle / mosaic / dot reveal effects in `js/effects.js`
- **[github-contributions-api](https://github.com/grubersjoe/github-contributions-api)** (jogruber) — public, unauthenticated, gives back the contribution data for the heatmap

All libraries are loaded from CDN — no `npm install` step, no `package.json`.

## Deploy

It's all static files. Drop the folder into Vercel / Netlify / Cloudflare Pages / GitHub Pages — done.

## Credits

Built solo by **Ryie** ([@arnavryie](https://github.com/arnavryie)) using Claude for architecture/strategy and Antigravity as the coding agent.

If you fork this and ship something cool, ping me — I want to see it.

## License

[MIT](./LICENSE) — use it, modify it, ship it. Keep the copyright line in the LICENSE file if you redistribute.
