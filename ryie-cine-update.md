# RYIE — patch: paired animations + unified project text

**Three changes across 3 files. Give to Antigravity.**

---

## What's happening

- W2 (acidneon) gets a new effect `particles_implode` — the **reverse of W3 burst**.
  Dots fly INWARD from outside the canvas and converge into the image.
- W4 (italy) gets a new effect `particles_tilt_left` — the **mirror of W5 tilt**.
  Dots come diagonally from the top-LEFT with -30° rotation, matching W5's right-side motion.
- Result: W2-W3 are now a mirrored pair (implode/burst), W4-W5 are a mirrored pair (left-tilt/right-tilt).
  Less random feeling, more intentional.
- Projects section: all 6 cards now share ONE animation — letters drop in from above
  like dots, staggered. No more 6 different variants.

---

## Change 1 — `js/effects.js`

**Find** the closing of `particles_chunky` followed by `mosaic` (around line 364):

```javascript
          ctx.globalAlpha = al; ctx.fillStyle = pt.col;
          ctx.fillRect(x - halfPS, y - halfPS, ps, ps);
        }
        ctx.globalAlpha = 1;
      }
    },

    /* chunky pixels resolve into the sharp image */
    mosaic: {
```

**Replace with** (inserts two new effects between particles_chunky and mosaic):

```javascript
          ctx.globalAlpha = al; ctx.fillStyle = pt.col;
          ctx.fillRect(x - halfPS, y - halfPS, ps, ps);
        }
        ctx.globalAlpha = 1;
      }
    },

    /* particles_implode — reverse of burst: dots fly INWARD from outside the canvas to targets */
    particles_implode: {
      idle: true,
      setup: function (S) {
        var W = S.w, H = S.h;
        var step = Math.max(4, Math.ceil(Math.sqrt((W * H) / 8000)));
        var cols = Math.max(1, Math.floor(W / step));
        var rows = Math.max(1, Math.floor(H / step));
        var t = tmpCanvas(cols, rows);
        var tc = t.getContext("2d");
        var b = coverBox(S.img.naturalWidth, S.img.naturalHeight, cols, rows);
        tc.drawImage(S.img, b.dx, b.dy, b.dw, b.dh);
        var data; try { data = tc.getImageData(0, 0, cols, rows).data; } catch (e) { data = null; }
        var cx = W / 2, cy = H / 2;
        var R = Math.hypot(W, H) * 0.7;
        var P = [];
        for (var y = 0; y < rows; y++) {
          for (var x = 0; x < cols; x++) {
            var i = (y * cols + x) * 4;
            var a = data ? data[i + 3] : 255;
            if (a < 24) continue;
            var r = data ? data[i] : 200, g = data ? data[i + 1] : 200, bl = data ? data[i + 2] : 200;
            var tx = x * step + step / 2, ty = y * step + step / 2;
            var dx = tx - cx, dy = ty - cy;
            var d2 = Math.hypot(dx, dy) || 1;
            P.push({
              tx: tx, ty: ty,
              sx: cx + (dx / d2) * R + (Math.random() - 0.5) * 40,
              sy: cy + (dy / d2) * R + (Math.random() - 0.5) * 40,
              d: Math.random() * 0.4,
              col: "rgb(" + r + "," + g + "," + bl + ")",
              ph: Math.random() * 6.28
            });
          }
        }
        S.store.P = P; S.store.ps = Math.max(1.4, step * 0.85);
      },
      frame: function (ctx, p, t, S) {
        var P = S.store.P, ps = S.store.ps, n = P.length, halfPS = ps / 2;
        for (var k = 0; k < n; k++) {
          var pt = P[k];
          var local = clamp((p - pt.d) / (1 - pt.d), 0, 1);
          var e = ease(local), x, y, al;
          if (p >= 0.999) {
            x = pt.tx + Math.sin(t * 1.5 + pt.ph) * 0.7;
            y = pt.ty + Math.cos(t * 1.5 + pt.ph) * 0.7; al = 1;
          } else {
            x = lerp(pt.sx, pt.tx, e); y = lerp(pt.sy, pt.ty, e);
            al = clamp(0.2 + local * 1.1, 0, 1);
          }
          ctx.globalAlpha = al; ctx.fillStyle = pt.col;
          ctx.fillRect(x - halfPS, y - halfPS, ps, ps);
        }
        ctx.globalAlpha = 1;
      }
    },

    /* particles_tilt_left — mirror of particles_tilt: diagonal from TOP-LEFT, -30° rotation */
    particles_tilt_left: {
      idle: true,
      setup: function (S) {
        var W = S.w, H = S.h;
        var step = Math.max(4, Math.ceil(Math.sqrt((W * H) / 8000)));
        var cols = Math.max(1, Math.floor(W / step));
        var rows = Math.max(1, Math.floor(H / step));
        var t = tmpCanvas(cols, rows);
        var tc = t.getContext("2d");
        var b = coverBox(S.img.naturalWidth, S.img.naturalHeight, cols, rows);
        tc.drawImage(S.img, b.dx, b.dy, b.dw, b.dh);
        var data; try { data = tc.getImageData(0, 0, cols, rows).data; } catch (e) { data = null; }
        var P = [];
        for (var y = 0; y < rows; y++) {
          for (var x = 0; x < cols; x++) {
            var i = (y * cols + x) * 4;
            var a = data ? data[i + 3] : 255;
            if (a < 24) continue;
            var r = data ? data[i] : 200, g = data ? data[i + 1] : 200, bl = data ? data[i + 2] : 200;
            var off = Math.random();
            P.push({
              tx: x * step + step / 2, ty: y * step + step / 2,
              sx: -off * W * 0.5 - 6,
              sy: -off * H * 0.5 - 6,
              d: Math.random() * 0.45,
              col: "rgb(" + r + "," + g + "," + bl + ")",
              ph: Math.random() * 6.28
            });
          }
        }
        S.store.P = P; S.store.ps = Math.max(1.4, step * 0.88);
        S.store.ca = Math.cos(-Math.PI / 6); S.store.sa = Math.sin(-Math.PI / 6);
      },
      frame: function (ctx, p, t, S) {
        var P = S.store.P, ps = S.store.ps, n = P.length, halfPS = ps / 2;
        var dpr = S.dpr, ca = S.store.ca, sa = S.store.sa;
        for (var k = 0; k < n; k++) {
          var pt = P[k];
          var local = clamp((p - pt.d) / (1 - pt.d), 0, 1);
          var e = ease(local), x, y, al;
          if (p >= 0.999) {
            x = pt.tx + Math.sin(t * 1.6 + pt.ph) * 0.6;
            y = pt.ty + Math.cos(t * 1.6 + pt.ph) * 0.6; al = 1;
          } else {
            x = lerp(pt.sx, pt.tx, e); y = lerp(pt.sy, pt.ty, e);
            al = clamp(0.2 + local * 1.1, 0, 1);
          }
          ctx.globalAlpha = al; ctx.fillStyle = pt.col;
          ctx.setTransform(dpr * ca, dpr * sa, -dpr * sa, dpr * ca, dpr * x, dpr * y);
          ctx.fillRect(-halfPS, -halfPS, ps, ps);
        }
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.globalAlpha = 1;
      }
    },

    /* chunky pixels resolve into the sharp image */
    mosaic: {
```

---

## Change 2 — `index.html`

**Two single-line swaps.**

**Find:**
```html
      <div class="art bg" data-effect="particles_swipe" data-src="assets/img/acidneon.jpg"><canvas></canvas></div>
```
**Replace with:**
```html
      <div class="art bg" data-effect="particles_implode" data-src="assets/img/acidneon.jpg"><canvas></canvas></div>
```

**Find:**
```html
      <div class="art bg" data-effect="particles_rise" data-src="assets/img/italy.jpg"><canvas></canvas></div>
```
**Replace with:**
```html
      <div class="art bg" data-effect="particles_tilt_left" data-src="assets/img/italy.jpg"><canvas></canvas></div>
```

---

## Change 3 — `js/main.js`

**Find** the entire 6-variant project block (starts at the `/* ---- PROJECT CARDS` comment, ends at the closing `});` of the `.proj` forEach):

```javascript
  /* ---- PROJECT CARDS: per-letter scroll-scrubbed entry (6 variants) ---- */
  var projVariants = [
    function (L, st) {                                     // 0 — drop from above
      gsap.from(L, { yPercent: -200, opacity: 0, stagger: { each: 0.045, from: "start" }, ease: "power3.out", scrollTrigger: st });
    },
    function (L, st) {                                     // 1 — sweep from right
      gsap.from(L, { xPercent: 240, opacity: 0, stagger: { each: 0.03, from: "end" }, ease: "power2.out", scrollTrigger: st });
    },
    function (L, st) {                                     // 2 — rise from below
      gsap.from(L, { yPercent: 200, opacity: 0, stagger: { each: 0.045, from: "start" }, ease: "power3.out", scrollTrigger: st });
    },
    function (L, st) {                                     // 3 — chaotic glitch settle
      gsap.from(L, {
        x: function () { return (Math.random() - 0.5) * 140; },
        y: function () { return (Math.random() - 0.5) * 70; },
        opacity: 0, stagger: { each: 0.025, from: "random" }, ease: "power2.out", scrollTrigger: st
      });
    },
    function (L, st) {                                     // 4 — sweep from left
      gsap.from(L, { xPercent: -240, opacity: 0, stagger: { each: 0.03, from: "start" }, ease: "power2.out", scrollTrigger: st });
    },
    function (L, st) {                                     // 5 — zoom out from centre
      gsap.from(L, { scale: 0, opacity: 0, transformOrigin: "50% 50%", stagger: { each: 0.045, from: "center" }, ease: "back.out(1.6)", scrollTrigger: st });
    }
  ];

  gsap.utils.toArray(".proj").forEach(function (card, i) {
    var title = card.querySelector("h3");
    if (title) {
      var text = title.textContent;
      title.innerHTML = "";
      for (var j = 0; j < text.length; j++) {
        var ch = text[j];
        var s = document.createElement("span");
        s.className = "tl";
        s.textContent = ch === " " ? "\u00A0" : ch;
        title.appendChild(s);
      }
      var letters = title.querySelectorAll(".tl");
      var st = { trigger: card, start: "top 92%", end: "top 45%", scrub: 0.6, invalidateOnRefresh: true };
      projVariants[i % projVariants.length](letters, st);
    }
    var desc = card.querySelector("p");
    if (desc) gsap.from(desc, { opacity: 0, y: 24, ease: "power1.out",
      scrollTrigger: { trigger: card, start: "top 88%", end: "top 55%", scrub: 0.6 } });
    var tags = card.querySelector(".ptags");
    if (tags) gsap.from(tags, { opacity: 0, x: 40, ease: "power1.out",
      scrollTrigger: { trigger: card, start: "top 84%", end: "top 50%", scrub: 0.6 } });
    var num = card.querySelector(".pn");
    if (num) gsap.from(num, { scale: 0.4, opacity: 0, ease: "back.out(1.5)",
      scrollTrigger: { trigger: card, start: "top 92%", end: "top 60%", scrub: 0.5 } });
  });
```

**Replace with:**

```javascript
  /* ---- PROJECT CARDS: per-letter scroll-scrubbed entry (single unified animation) ---- */
  gsap.utils.toArray(".proj").forEach(function (card, i) {
    var title = card.querySelector("h3");
    if (title) {
      var text = title.textContent;
      title.innerHTML = "";
      for (var j = 0; j < text.length; j++) {
        var ch = text[j];
        var s = document.createElement("span");
        s.className = "tl";
        s.textContent = ch === " " ? "\u00A0" : ch;
        title.appendChild(s);
      }
      var letters = title.querySelectorAll(".tl");
      var st = { trigger: card, start: "top 92%", end: "top 45%", scrub: 0.6, invalidateOnRefresh: true };
      // unified animation across all cards: letters drop in from above like dots, staggered
      gsap.from(letters, {
        yPercent: -180,
        opacity: 0,
        stagger: { each: 0.04, from: "start" },
        ease: "power3.out",
        scrollTrigger: st
      });
    }
    var desc = card.querySelector("p");
    if (desc) gsap.from(desc, { opacity: 0, y: 24, ease: "power1.out",
      scrollTrigger: { trigger: card, start: "top 88%", end: "top 55%", scrub: 0.6 } });
    var tags = card.querySelector(".ptags");
    if (tags) gsap.from(tags, { opacity: 0, x: 40, ease: "power1.out",
      scrollTrigger: { trigger: card, start: "top 84%", end: "top 50%", scrub: 0.6 } });
    var num = card.querySelector(".pn");
    if (num) gsap.from(num, { scale: 0.4, opacity: 0, ease: "back.out(1.5)",
      scrollTrigger: { trigger: card, start: "top 92%", end: "top 60%", scrub: 0.5 } });
  });
```

---

## Final effect map

| Section | Image       | Effect                | Direction                          |
|---------|-------------|-----------------------|------------------------------------|
| W1 hero | ink1        | `particles`           | rain from above                    |
| W2      | acidneon    | `particles_implode`   | **NEW** — converge inward          |
| W3      | iris        | `particles_burst`     | explode outward from centre        |
| W4      | italy       | `particles_tilt_left` | **NEW** — diagonal from top-LEFT   |
| W5      | mexico      | `particles_tilt`      | diagonal from top-RIGHT            |
| W6      | ink2        | `particles_chunky`    | slow heavy fall from above         |
| W7      | planet2     | `particles`           | rain from above                    |

Projects: all 6 cards drop letters from above with consistent stagger.