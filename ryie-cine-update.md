# RYIE — patch: fix the grind gap on mobile (actual root cause)

One line changed in the LAST `@media (max-width:760px)` block in `css/style.css`.

---

## Why the previous padding fix didn't work

The mobile media query at the top of the file has:
```css
.world{ padding:0 !important; min-height:100vh !important; display:block; }
```

`.w-grind` is also a `.world` — so this forces it to `min-height:100vh`
(full phone screen height). The `!important` beats the base-style
`min-height:auto` on `.w-grind`. That's the 400px void — the section is
stretching to fill the full screen even though the content is only ~300px tall.

The padding reduction from the last patch only shrank the breathing room,
but the section was still 100vh tall. This patch kills the `min-height` override.

---

## `css/style.css`

Find the LAST `@media (max-width:760px)` block (near the very end of the file):

```css
@media (max-width:760px){
  .w-work, .w-grind{ padding:8vh 0 6vh; }
  .proj{ flex-wrap:wrap; gap:12px; padding:18px; }
  .proj .pn{ font-size:26px; min-width:40px; }
  .streak-stats{ gap:26px; }
}
```

Replace with:

```css
@media (max-width:760px){
  .w-work, .w-grind{ padding:8vh 0 6vh; min-height:auto !important; }
  .proj{ flex-wrap:wrap; gap:12px; padding:18px; }
  .proj .pn{ font-size:26px; min-width:40px; }
  .streak-stats{ gap:26px; }
}
```

One word added: `min-height:auto !important` — overrides the `.world` rule
that was forcing full-screen height. Now grind section shrinks to content height.