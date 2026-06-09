# RYIE — patch: dark transitions between section backgrounds

One file, one block insert in `js/main.js`.

---

## What this does

Right now: when you scroll from one section to the next, both backgrounds
are visible simultaneously for a while — the previous one feels "stuck"
behind the new one until it finally fades.

After this patch: each section's background canvas has its opacity tied to
how centered the section is in the viewport. As you scroll away from a
section, its bg fades to **0** (full dark) *before* the next section's bg
starts fading in. Net effect: a clean **dark zone between sections**, so
each background gets its own moment without bleeding into the neighbor.

Concrete opacity curve per section (across its scroll lifetime):
- 0 – 25 %  → opacity 0  (dark)
- 25 – 40 % → fade in 0 → 1
- 40 – 60 % → opacity 1  (centered, full)
- 60 – 75 % → fade out 1 → 0
- 75 – 100 % → opacity 0 (dark)

When section 1 hits 75 % (dark), section 2 is only at 25 % (also dark) —
that's your dark gap.

---

## Change — `js/main.js`

**Find this line** (the comment that starts the image-frames scale-in block):

```javascript
  /* ---- scale-in for the image frames as they arrive ---- */
```

**Insert this entire block immediately BEFORE that comment** (don't delete
the comment line, just put this above it):

```javascript
  /* ---- BG SECTION FADES: each canvas only visible when its section is centered, dark between ---- */
  gsap.utils.toArray(".art.bg").forEach(function (bg) {
    var section = bg.closest(".world");
    if (!section) return;
    bg.style.willChange = "opacity";
    ScrollTrigger.create({
      trigger: section,
      start: "top bottom",
      end: "bottom top",
      onUpdate: function (self) {
        var p = self.progress;
        var op;
        // bell curve: dark → fade in → hold → fade out → dark
        if (p < 0.25) op = 0;
        else if (p < 0.40) op = (p - 0.25) / 0.15;
        else if (p < 0.60) op = 1;
        else if (p < 0.75) op = (0.75 - p) / 0.15;
        else op = 0;
        bg.style.opacity = op;
      }
    });
  });

```

That's it. No other file changes.

---

## Tuning knob (optional)

If you want each bg to **linger longer** (smaller dark zone), widen the
"opacity 1" band — e.g. change `0.40` → `0.35` and `0.60` → `0.65`.

If you want **bigger dark zones** between sections (more dramatic), tighten
it — e.g. change `0.40` → `0.45` and `0.60` → `0.55`. The values in the
patch are the balanced default.