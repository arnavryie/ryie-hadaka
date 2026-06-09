# RYIE — consolidated patch (4 changes)

Give all of these to Antigravity in one shot.

---

## 1 · `js/effects.js` — add 2 new canvas effects

Find this comment (unique anchor, should be near line 480):

```javascript
    /* chunky pixels resolve into the sharp image */
    mosaic: {
```

Insert the following block **immediately before** that comment:

```javascript
    /* particles_implode — reverse of burst: dots fly INWARD from an off-screen ring to their targets */
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

```

---

## 2 · `index.html` — swap 2 data-effect values

**Find:**
```html
<div class="art bg" data-effect="particles_swipe" data-src="assets/img/acidneon.jpg">
```
**Replace with:**
```html
<div class="art bg" data-effect="particles_implode" data-src="assets/img/acidneon.jpg">
```

---

**Find:**
```html
<div class="art bg" data-effect="particles_rise" data-src="assets/img/italy.jpg">
```
**Replace with:**
```html
<div class="art bg" data-effect="particles_tilt_left" data-src="assets/img/italy.jpg">
```

---

## 3 · `js/main.js` — unified project title animation

Find the entire project cards block (starts with this comment):

```javascript
  /* ---- PROJECT CARDS:
```

Replace the whole `gsap.utils.toArray(".proj").forEach(...)` block (everything from `gsap.utils.toArray(".proj")` through its closing `});`) with:

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
      // unified animation across all cards: letters scatter in like dots, staggered random
      gsap.from(letters, {
        yPercent: function () { return -180 + (Math.random() - 0.5) * 60; },
        xPercent: function () { return (Math.random() - 0.5) * 70; },
        rotation: function () { return (Math.random() - 0.5) * 50; },
        scale: 0.3,
        opacity: 0,
        stagger: { each: 0.035, from: "random" },
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

## 4 · `css/style.css` — fix mobile gap in THE GRIND / finale section

Find the second `@media (max-width:760px)` block (the one that has `.art.bg` and `.world` inside it):

```css
@media (max-width:760px){
  .art.bg{ position:absolute !important; inset:0 !important; width:100% !important; height:100% !important;
    aspect-ratio:auto !important; margin:0 !important; }
  .world{ padding:0 !important; min-height:100vh !important; display:block; }
  .world .layer{ width:auto !important; margin:0 !important; }
}
```

Replace with:

```css
@media (max-width:760px){
  .art.bg{ position:absolute !important; inset:0 !important; width:100% !important; height:100% !important;
    aspect-ratio:auto !important; margin:0 !important; }
  .world{ padding:0 !important; min-height:100vh !important; display:block; }
  .world .layer{ width:auto !important; margin:0 !important; }

  /* --- W7 finale: remove forced 100vh, let content define height --- */
  .w7{
    min-height:auto !important;
    padding: 10vh 7vw 12vh !important;
    display:flex !important; flex-direction:column !important;
    gap:2.5vh !important;
  }
  /* pull absolute layers into normal document flow */
  .w7 .layer{
    position:relative !important;
    top:auto !important; left:auto !important;
    right:auto !important; bottom:auto !important;
  }
  .w7 .contact{
    position:relative !important;
    bottom:auto !important; left:auto !important;
    flex-wrap:wrap !important; gap:14px 22px !important;
    margin-top:1vh !important;
  }
  footer.foot{
    position:relative !important;
    bottom:auto !important;
    text-align:left !important;
    margin-top:2vh !important;
    padding:0 !important;
  }
}
```

---

That's all 4. After applying, hard-refresh the browser (Ctrl+Shift+R / Cmd+Shift+R).