# RYIE — patch: add LICENSE + README

Two new files at the repo root. After Antigravity creates them, just
`git add LICENSE README.md && git commit -m "add license and readme" && git push`.

---

## Secret scan result

I grepped `js/`, `css/`, `index.html`, `*.json`, `*.md` for `api_key|apikey|secret|token|password|bearer|sk-*` — **no matches**. The streak page hits the public unauthenticated `github-contributions-api.jogruber.de` endpoint, so nothing leaks. Repo is safe to share publicly.

---

## 1 · Create `LICENSE` at repo root

```
MIT License

Copyright (c) 2026 Ryie (Arnav)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 2 · Create `README.md` at repo root

````markdown
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
````

---

After both files exist:

```bash
git add LICENSE README.md
git commit -m "add MIT license and README"
git push
```

GitHub will start showing the README on the repo home page and the "MIT" license badge in the sidebar. Now your friend (and anyone else) gets the install/run/customize steps without having to message you.
