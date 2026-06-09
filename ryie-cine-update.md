# RYIE — patch: tone down the glow (was washed out)

One file. Two block swaps in `css/style.css`.

The wide-radius halo layers (88px, 120px, 140px) were blowing everything out
into white mist. Killed those, kept the tight 14–32px inner glow so it still
reads as neon but doesn't look like fog.

---

## 1 · Hero — drop the giant cyan halo around RYIE

**Find:**
```css
/* ============ HERO type (white glow) ============ */
.hero-name{ color:var(--white);
  text-shadow:0 2px 22px rgba(0,0,0,.6), 0 0 26px rgba(185,215,255,.45), 0 0 64px rgba(25,230,255,.25); }
```

**Replace with:**
```css
/* ============ HERO type (white glow — restrained) ============ */
.hero-name{ color:var(--white);
  text-shadow:0 2px 14px rgba(0,0,0,.75), 0 0 14px rgba(185,215,255,.28), 0 0 38px rgba(25,230,255,.12); }
```

---

## 2 · All neon variants — kill the wide-radius blow-out

**Find:**
```css
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

**Replace with:**
```css
/* HOLLOW NEON outline (restrained) */
.stroke{ color:transparent; -webkit-text-stroke:2.5px #ffffff;
  text-shadow:0 0 6px rgba(255,255,255,.6), 0 0 18px rgba(185,215,255,.3); }
.stroke.s-cyan{ -webkit-text-stroke:2.5px #19e6ff;
  text-shadow:0 0 6px rgba(25,230,255,.7), 0 0 18px rgba(25,230,255,.35); }
.stroke.s-mag{ -webkit-text-stroke:2.5px #ff2bd6;
  text-shadow:0 0 6px rgba(255,43,214,.7), 0 0 18px rgba(255,43,214,.35); }
.stroke.s-pur{ -webkit-text-stroke:2.5px #8b5cff;
  text-shadow:0 0 6px rgba(139,92,255,.7), 0 0 18px rgba(139,92,255,.35); }

/* SOLID-FILL neon glow (restrained) */
.grad{ background:linear-gradient(120deg,#19e6ff 0%,#ff2bd6 52%,#9d5fff 100%);
  -webkit-background-clip:text; background-clip:text; color:transparent;
  filter:drop-shadow(0 0 8px rgba(25,230,255,.5)) drop-shadow(0 0 20px rgba(255,43,214,.32)); }
.glow-c{ color:#19e6ff;
  text-shadow:0 0 4px rgba(255,255,255,.5), 0 0 14px #19e6ff, 0 0 32px rgba(25,230,255,.4); }
.glow-m{ color:#ff2bd6;
  text-shadow:0 0 4px rgba(255,255,255,.5), 0 0 14px #ff2bd6, 0 0 32px rgba(255,43,214,.4); }
.glow-p{ color:#a78bff;
  text-shadow:0 0 4px rgba(255,255,255,.5), 0 0 14px #8b5cff, 0 0 32px rgba(139,92,255,.4); }
```

---

What changed: every glow stack went from 4–5 layers (up to 140px radius) to
2–3 layers (max 38px). Stroke thickness 3px → 2.5px. Color is still readable
as neon, but no more washed-out halo eating the rest of the design.