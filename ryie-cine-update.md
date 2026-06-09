# RYIE — patch: bright neon headlines + color variety

Two files. CSS block-swap + two HTML one-liners.

---

## What this does

All headlines now have **RYIE-level brightness**:

- The hollow `.stroke` headlines (WORLDS, FULL OF, RELENTLESS, PROJECTS) were
  flat thin outlines with **zero glow** — that's why they looked so dull.
  Now: thicker 3px stroke + 4-layer text-shadow bloom in matching color.
  Proper neon-sign look.
- Added a new `s-pur` stroke variant (purple neon) + `glow-p` solid-fill purple
  glow, for color variety.
- Two HTML class swaps so the new variants actually appear on the site.

---

## 1 · `css/style.css` — boost stroke variants + add purple options

**Find this block:**

```css
.c-mag{ color:var(--magenta);} .c-cyan{ color:var(--cyan);} .c-pur{ color:var(--purple);}
.c-lime{ color:var(--lime);} .c-rose{ color:var(--rose);} .c-white{ color:var(--white);}
.stroke{ color:transparent; -webkit-text-stroke:2px var(--white); }
.stroke.s-cyan{ -webkit-text-stroke-color:var(--cyan); }
.stroke.s-mag{ -webkit-text-stroke-color:var(--magenta); }
.grad{ background:linear-gradient(120deg,#19e6ff 0%,#ff2bd6 52%,#9d5fff 100%);
  -webkit-background-clip:text; background-clip:text; color:transparent;
  filter:drop-shadow(0 0 14px rgba(25,230,255,.85)) drop-shadow(0 0 32px rgba(255,43,214,.65)) drop-shadow(0 0 60px rgba(25,230,255,.3)); }
.glow-c{ color:#19e6ff;
  text-shadow:0 0 6px #fff, 0 0 18px #19e6ff, 0 0 42px #19e6ff, 0 0 88px rgba(25,230,255,.6), 0 0 140px rgba(25,230,255,.3); }
.glow-m{ color:#ff2bd6;
  text-shadow:0 0 6px #fff, 0 0 18px #ff2bd6, 0 0 42px #ff2bd6, 0 0 88px rgba(255,43,214,.6), 0 0 140px rgba(255,43,214,.3); }
```

**Replace with:**

```css
.c-mag{ color:var(--magenta);} .c-cyan{ color:var(--cyan);} .c-pur{ color:var(--purple);}
.c-lime{ color:var(--lime);} .c-rose{ color:var(--rose);} .c-white{ color:var(--white);}

/* HOLLOW NEON outline (RYIE-bright neon-sign look) */
.stroke{ color:transparent; -webkit-text-stroke:3px #ffffff;
  text-shadow:0 0 10px rgba(255,255,255,.95), 0 0 24px rgba(255,255,255,.7), 0 0 58px rgba(185,215,255,.55), 0 0 120px rgba(25,230,255,.32); }
.stroke.s-cyan{ -webkit-text-stroke:3px #19e6ff;
  text-shadow:0 0 10px #19e6ff, 0 0 26px #19e6ff, 0 0 58px rgba(25,230,255,.78), 0 0 120px rgba(25,230,255,.45); }
.stroke.s-mag{ -webkit-text-stroke:3px #ff2bd6;
  text-shadow:0 0 10px #ff2bd6, 0 0 26px #ff2bd6, 0 0 58px rgba(255,43,214,.78), 0 0 120px rgba(255,43,214,.45); }
.stroke.s-pur{ -webkit-text-stroke:3px #8b5cff;
  text-shadow:0 0 10px #8b5cff, 0 0 26px #8b5cff, 0 0 58px rgba(139,92,255,.78), 0 0 120px rgba(139,92,255,.45); }

/* SOLID-FILL neon glow (RYIE-bright) */
.grad{ background:linear-gradient(120deg,#19e6ff 0%,#ff2bd6 52%,#9d5fff 100%);
  -webkit-background-clip:text; background-clip:text; color:transparent;
  filter:drop-shadow(0 0 14px rgba(25,230,255,.85)) drop-shadow(0 0 32px rgba(255,43,214,.65)) drop-shadow(0 0 60px rgba(25,230,255,.3)); }
.glow-c{ color:#19e6ff;
  text-shadow:0 0 6px #fff, 0 0 18px #19e6ff, 0 0 42px #19e6ff, 0 0 88px rgba(25,230,255,.6), 0 0 140px rgba(25,230,255,.3); }
.glow-m{ color:#ff2bd6;
  text-shadow:0 0 6px #fff, 0 0 18px #ff2bd6, 0 0 42px #ff2bd6, 0 0 88px rgba(255,43,214,.6), 0 0 140px rgba(255,43,214,.3); }
.glow-p{ color:#a78bff;
  text-shadow:0 0 6px #fff, 0 0 18px #8b5cff, 0 0 42px #8b5cff, 0 0 88px rgba(139,92,255,.6), 0 0 140px rgba(139,92,255,.3); }
```

---

## 2 · `index.html` — use the new variants for color variety

**Find:**
```html
      <h2 class="ftype t-xl stroke layer" data-speed="0.5" style="top:22%; left:7%">WORLDS</h2>
```
**Replace with:**
```html
      <h2 class="ftype t-xl stroke s-pur layer" data-speed="0.5" style="top:22%; left:7%">WORLDS</h2>
```

---

**Find:**
```html
        <h2 class="ftype t-lg stroke wtitle" data-speed="0.45">PROJECTS</h2>
```
**Replace with:**
```html
        <h2 class="ftype t-lg stroke s-cyan wtitle" data-speed="0.45">PROJECTS</h2>
```

---

## Headline palette after this patch

| Section | Text | Class | Vibe |
|---|---|---|---|
| W1 hero | RYIE | (custom) | white + cyan halo |
| W2 acidneon | FULL OF | `stroke s-cyan` | cyan neon outline |
| W2 acidneon | HUSTLE | `grad glow-m` | gradient w/ magenta bloom |
| W3 iris | WORLDS | `stroke s-pur` | **purple neon (NEW)** |
| W4 italy | SHIP IT | `grad glow-c` | gradient w/ cyan bloom |
| W5 mexico | RELENTLESS | `stroke s-mag` | magenta neon outline |
| W6 ink2 | INK | `glow-c` | solid cyan |
| W6 ink2 | & IRON | `grad` | gradient |
| Projects | PROJECTS | `stroke s-cyan` | **cyan neon (NEW)** |
| Grind | THE GRIND | `grad glow-c` | gradient w/ cyan bloom |
| W7 finale | WE SHIP | `glow-c` | solid cyan |
| W7 finale | FOR ALL. | `grad` | gradient |

Available extra classes you can swap onto any headline whenever you want:
`glow-p` (solid purple bright), `stroke s-pur` (purple neon outline).