# RYIE — patch: streak cells get the particle animation too

**One file. One block-swap. Give to Antigravity.**

---

## What this does

The 365 streak/contribution cells in **THE GRIND** section now animate in the
same scroll-driven style as the rest of the site:

- Each cell starts at a random scattered offset (x/y), random rotation, scale 0, opacity 0.
- As you scroll into the Grind section, the cells fly in from their random
  starts and snap into the heatmap grid, staggered in a random order across
  the whole year.
- Scroll back up and they scatter back out in reverse.

It uses GSAP if available (which it already is in the site), with a clean
fallback to the original CSS staggered fade.

---

## Change — `js/streak.js`

**Find this block** (inside the `render(days)` function, after the empty-cell
padding loop, starting at the `days.forEach` line):

```javascript
    days.forEach(function (day, idx) {
      var cell = document.createElement("i");
      cell.className = "cell";
      cell.style.background = COLORS[levelOf(day)];
      cell.style.transitionDelay = (idx * 1.1) + "ms";
      cell.title = day.date + " · " + (day.count || 0) + " contributions";
      cells.appendChild(cell);
    });
    grid.appendChild(cells);

    requestAnimationFrame(function () { grid.classList.add("in"); });
    setStat("st-cur", cur + "d");
    setStat("st-long", longest + "d");
    setStat("st-tot", total.toLocaleString());
```

**Replace it with:**

```javascript
    days.forEach(function (day, idx) {
      var cell = document.createElement("i");
      cell.className = "cell";
      cell.style.background = COLORS[levelOf(day)];
      cell.title = day.date + " · " + (day.count || 0) + " contributions";
      cells.appendChild(cell);
    });
    grid.appendChild(cells);

    // ---- animate cells in ----
    // If GSAP is present: scroll-scrubbed scattered entry (cells fly in from random
    // positions, scale up & rotate into the grid; reverses on scroll-up).
    // Fallback: original CSS staggered fade.
    var cellEls = cells.querySelectorAll(".cell");
    if (window.gsap && window.ScrollTrigger) {
      cellEls.forEach(function (c) { c.style.transition = "none"; });
      grid.classList.add("in");
      gsap.from(cellEls, {
        y: function () { return (Math.random() - 0.5) * 240; },
        x: function () { return (Math.random() - 0.5) * 140; },
        rotation: function () { return (Math.random() - 0.5) * 90; },
        scale: 0,
        opacity: 0,
        ease: "power3.out",
        stagger: { each: 0.005, from: "random" },
        scrollTrigger: {
          trigger: grid,
          start: "top 90%",
          end: "top 35%",
          scrub: 0.6
        }
      });
    } else {
      cellEls.forEach(function (c, idx) { c.style.transitionDelay = (idx * 1.1) + "ms"; });
      requestAnimationFrame(function () { grid.classList.add("in"); });
    }

    setStat("st-cur", cur + "d");
    setStat("st-long", longest + "d");
    setStat("st-tot", total.toLocaleString());
```

(Two things changed: the `transitionDelay` line was removed from inside the
forEach, and the single `requestAnimationFrame(...)` line was replaced with
the GSAP-or-CSS conditional block.)

No other files change.

---

## Result

Scrolling down into THE GRIND: the contribution heatmap **assembles from
nothing** — cells fly in from scattered positions, tumbling and scaling up
into the grid in a random order across the year, with the brightest cells
(your contribution days) landing in their proper spots.
Scrolling back up disassembles it cell-by-cell.