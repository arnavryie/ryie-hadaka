# RYIE — patch: tighten mobile section spacing

One file, one line add in `css/style.css`.

The issue: on desktop, `padding: 18vh 0 14vh` on `.w-work` and `.w-grind`
is proportional (looks good). On mobile (390px wide, ~800px viewport height),
18vh = 144px and 14vh = 112px — **huge** relative padding that squishes content
and leaves massive black voids between sections.

On phone, the projects section and grind section stick too close to things above,
and the grind bottom has a giant empty gap before WE SHIP.

---

## `css/style.css`

**Find this block** (the last `@media (max-width:760px)` near the end):

```css
@media (max-width:760px){
  .proj{ flex-wrap:wrap; gap:12px; padding:18px; }
  .proj .pn{ font-size:26px; min-width:40px; }
  .streak-stats{ gap:26px; }
}
```

**Replace with:**

```css
@media (max-width:760px){
  .w-work, .w-grind{ padding:8vh 0 6vh; }
  .proj{ flex-wrap:wrap; gap:12px; padding:18px; }
  .proj .pn{ font-size:26px; min-width:40px; }
  .streak-stats{ gap:26px; }
}
```

---

What changed: `.w-work, .w-grind` padding on mobile is now `8vh top / 6vh bottom`
instead of `18vh / 14vh`. That's about 55-60% smaller, which scales the section
spacing properly to phone viewport. Content flows tight but readable, no weird
gaps.

Desktop is untouched — keeps the original airy `18vh / 14vh` padding.