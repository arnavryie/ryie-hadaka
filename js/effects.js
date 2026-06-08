/* =====================================================================
   RYIE — canvas reveal engine (SCROLL-DRIVEN / reversible)
   Each <figure class="art bg" data-effect="..." data-src="..."> renders a
   full-screen background. The reveal is tied to scroll position: scroll
   down = assemble (p 0->1), scroll up = reverse (p 1->0). Idle effects
   (particles / scan / static) keep a subtle life while settled. The loop
   only runs while the section is near the viewport.
   ===================================================================== */
(function () {
  "use strict";
  var RM = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

  function ease(t) { return 1 - Math.pow(1 - t, 3); }            // easeOutCubic
  function easeIO(t){ return t < .5 ? 4*t*t*t : 1 - Math.pow(-2*t+2,3)/2; }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }

  function fit(canvas) {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var r = canvas.getBoundingClientRect();
    var w = Math.max(1, Math.round(r.width));
    var h = Math.max(1, Math.round(r.height));
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    var ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { ctx: ctx, w: w, h: h, dpr: dpr };
  }
  function coverBox(iw, ih, w, h) {
    var s = Math.max(w / iw, h / ih);
    var dw = iw * s, dh = ih * s;
    return { dx: (w - dw) / 2, dy: (h - dh) / 2, dw: dw, dh: dh };
  }
  function cover(ctx, img, w, h, ox, oy) {
    var b = coverBox(img.naturalWidth, img.naturalHeight, w, h);
    ctx.drawImage(img, b.dx + (ox || 0), b.dy + (oy || 0), b.dw, b.dh);
  }
  function tmpCanvas(w, h) { var c = document.createElement("canvas"); c.width = w; c.height = h; return c; }

  /* ---------------- EFFECTS (each driven by progress p 0..1) ---------------- */
  var EFFECTS = {

    /* dots rain down from above and converge into the picture */
    particles: {
      idle: true,
      setup: function (S) {
        var W = S.w, H = S.h;
        var step = Math.max(4, Math.ceil(Math.sqrt((W * H) / 9000)));
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
            P.push({
              tx: x * step + step / 2, ty: y * step + step / 2,
              sx: x * step + step / 2 + (Math.random() * 2 - 1) * W * 0.12,
              sy: -Math.random() * H * 0.18 - 3,
              d: Math.random() * 0.45, col: "rgb(" + r + "," + g + "," + bl + ")",
              ph: Math.random() * 6.28
            });
          }
        }
        S.store.P = P; S.store.ps = Math.max(1.4, step * 0.92);
      },
      frame: function (ctx, p, t, S) {
        var P = S.store.P, ps = S.store.ps, n = P.length, h = ps / 2;
        for (var k = 0; k < n; k++) {
          var pt = P[k];
          var local = clamp((p - pt.d) / (1 - pt.d), 0, 1);
          var e = ease(local), x, y, al;
          if (p >= 0.999) {
            x = pt.tx + Math.sin(t * 1.7 + pt.ph) * 0.7;
            y = pt.ty + Math.cos(t * 1.7 + pt.ph) * 0.7; al = 1;
          } else {
            x = lerp(pt.sx, pt.tx, e); y = lerp(pt.sy, pt.ty, e);
            al = clamp(0.2 + local * 1.1, 0, 1);
          }
          ctx.globalAlpha = al; ctx.fillStyle = pt.col;
          ctx.fillRect(x - h, y - h, ps, ps);
        }
        ctx.globalAlpha = 1;
      }
    },

    /* particles_swipe — rain in from the LEFT, wide horizontal streak dots */
    particles_swipe: {
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
            P.push({
              tx: x * step + step / 2, ty: y * step + step / 2,
              sx: -Math.random() * W * 0.5 - 8,
              sy: y * step + step / 2 + (Math.random() - 0.5) * step * 1.4,
              d: Math.random() * 0.45,
              col: "rgb(" + r + "," + g + "," + bl + ")",
              ph: Math.random() * 6.28
            });
          }
        }
        S.store.P = P; S.store.ps = Math.max(1.4, step * 0.92);
      },
      frame: function (ctx, p, t, S) {
        var P = S.store.P, ps = S.store.ps, n = P.length;
        var pw = ps * 1.7, ph = ps * 0.65, hw = pw / 2, hh = ph / 2;
        for (var k = 0; k < n; k++) {
          var pt = P[k];
          var local = clamp((p - pt.d) / (1 - pt.d), 0, 1);
          var e = ease(local), x, y, al;
          if (p >= 0.999) {
            x = pt.tx + Math.sin(t * 1.5 + pt.ph) * 0.9;
            y = pt.ty + Math.cos(t * 1.5 + pt.ph) * 0.4; al = 1;
          } else {
            x = lerp(pt.sx, pt.tx, e); y = lerp(pt.sy, pt.ty, e);
            al = clamp(0.2 + local * 1.1, 0, 1);
          }
          ctx.globalAlpha = al; ctx.fillStyle = pt.col;
          ctx.fillRect(x - hw, y - hh, pw, ph);
        }
        ctx.globalAlpha = 1;
      }
    },

    /* particles_burst — radial bloom from centre, small pulsing circles */
    particles_burst: {
      idle: true,
      setup: function (S) {
        var W = S.w, H = S.h;
        var step = Math.max(4, Math.ceil(Math.sqrt((W * H) / 7500)));
        var cols = Math.max(1, Math.floor(W / step));
        var rows = Math.max(1, Math.floor(H / step));
        var t = tmpCanvas(cols, rows);
        var tc = t.getContext("2d");
        var b = coverBox(S.img.naturalWidth, S.img.naturalHeight, cols, rows);
        tc.drawImage(S.img, b.dx, b.dy, b.dw, b.dh);
        var data; try { data = tc.getImageData(0, 0, cols, rows).data; } catch (e) { data = null; }
        var cx = W / 2, cy = H / 2, maxD = Math.hypot(W / 2, H / 2);
        var P = [];
        for (var y = 0; y < rows; y++) {
          for (var x = 0; x < cols; x++) {
            var i = (y * cols + x) * 4;
            var a = data ? data[i + 3] : 255;
            if (a < 24) continue;
            var r = data ? data[i] : 200, g = data ? data[i + 1] : 200, bl = data ? data[i + 2] : 200;
            var tx = x * step + step / 2, ty = y * step + step / 2;
            var dist = Math.hypot(tx - cx, ty - cy);
            P.push({
              tx: tx, ty: ty,
              sx: cx + (Math.random() - 0.5) * 30,
              sy: cy + (Math.random() - 0.5) * 30,
              d: clamp(0.4 * (dist / maxD) + Math.random() * 0.1, 0, 0.5),
              col: "rgb(" + r + "," + g + "," + bl + ")",
              ph: Math.random() * 6.28
            });
          }
        }
        S.store.P = P; S.store.ps = Math.max(1.4, step * 0.78);
      },
      frame: function (ctx, p, t, S) {
        var P = S.store.P, ps = S.store.ps, n = P.length, halfPS = ps / 2;
        for (var k = 0; k < n; k++) {
          var pt = P[k];
          var local = clamp((p - pt.d) / (1 - pt.d), 0, 1);
          var e = ease(local), x, y, al, rad;
          if (p >= 0.999) {
            x = pt.tx; y = pt.ty;
            rad = halfPS * (0.85 + 0.22 * Math.sin(t * 2 + pt.ph));
            al = 1;
          } else {
            x = lerp(pt.sx, pt.tx, e); y = lerp(pt.sy, pt.ty, e);
            rad = halfPS;
            al = clamp(0.2 + local * 1.1, 0, 1);
          }
          ctx.globalAlpha = al; ctx.fillStyle = pt.col;
          ctx.beginPath(); ctx.arc(x, y, rad, 0, 6.2831853); ctx.fill();
        }
        ctx.globalAlpha = 1;
      }
    },

    /* particles_rise — rise UP from below, tall vertical streak dots */
    particles_rise: {
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
            P.push({
              tx: x * step + step / 2, ty: y * step + step / 2,
              sx: x * step + step / 2 + (Math.random() - 0.5) * step * 1.2,
              sy: H + Math.random() * H * 0.55 + 6,
              d: Math.random() * 0.45,
              col: "rgb(" + r + "," + g + "," + bl + ")",
              ph: Math.random() * 6.28
            });
          }
        }
        S.store.P = P; S.store.ps = Math.max(1.4, step * 0.92);
      },
      frame: function (ctx, p, t, S) {
        var P = S.store.P, ps = S.store.ps, n = P.length;
        var pw = ps * 0.65, ph = ps * 1.7, hw = pw / 2, hh = ph / 2;
        for (var k = 0; k < n; k++) {
          var pt = P[k];
          var local = clamp((p - pt.d) / (1 - pt.d), 0, 1);
          var e = ease(local), x, y, al;
          if (p >= 0.999) {
            x = pt.tx + Math.sin(t * 1.7 + pt.ph) * 0.5;
            y = pt.ty + Math.cos(t * 1.7 + pt.ph) * 0.9; al = 1;
          } else {
            x = lerp(pt.sx, pt.tx, e); y = lerp(pt.sy, pt.ty, e);
            al = clamp(0.2 + local * 1.1, 0, 1);
          }
          ctx.globalAlpha = al; ctx.fillStyle = pt.col;
          ctx.fillRect(x - hw, y - hh, pw, ph);
        }
        ctx.globalAlpha = 1;
      }
    },

    /* particles_tilt — diagonal rain from top-right, rotated 30° square dots */
    particles_tilt: {
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
              sx: W + off * W * 0.5 + 6,
              sy: -off * H * 0.5 - 6,
              d: Math.random() * 0.45,
              col: "rgb(" + r + "," + g + "," + bl + ")",
              ph: Math.random() * 6.28
            });
          }
        }
        S.store.P = P; S.store.ps = Math.max(1.4, step * 0.88);
        S.store.ca = Math.cos(Math.PI / 6); S.store.sa = Math.sin(Math.PI / 6); // 30°
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

    /* particles_chunky — fewer, BIG square dots, slow heavy assembly from above */
    particles_chunky: {
      idle: true,
      setup: function (S) {
        var W = S.w, H = S.h;
        var step = Math.max(6, Math.ceil(Math.sqrt((W * H) / 4500)));
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
            P.push({
              tx: x * step + step / 2, ty: y * step + step / 2,
              sx: x * step + step / 2 + (Math.random() - 0.5) * step * 0.4,
              sy: -Math.random() * H * 0.22 - 4,
              d: Math.random() * 0.55,
              col: "rgb(" + r + "," + g + "," + bl + ")",
              ph: Math.random() * 6.28
            });
          }
        }
        S.store.P = P; S.store.ps = Math.max(2, step * 1.25);
      },
      frame: function (ctx, p, t, S) {
        var P = S.store.P, ps = S.store.ps, n = P.length, h = ps / 2;
        for (var k = 0; k < n; k++) {
          var pt = P[k];
          var local = clamp((p - pt.d) / (1 - pt.d), 0, 1);
          var e = ease(local), x, y, al;
          if (p >= 0.999) {
            x = pt.tx + Math.sin(t * 1.3 + pt.ph) * 0.5;
            y = pt.ty + Math.cos(t * 1.3 + pt.ph) * 0.5; al = 1;
          } else {
            x = lerp(pt.sx, pt.tx, e); y = lerp(pt.sy, pt.ty, e);
            al = clamp(0.2 + local * 1.1, 0, 1);
          }
          ctx.globalAlpha = al; ctx.fillStyle = pt.col;
          ctx.fillRect(x - h, y - h, ps, ps);
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
      idle: false,
      setup: function (S) { S.store.t = tmpCanvas(S.w, S.h); },
      frame: function (ctx, p, t, S) {
        var e = easeIO(p);
        var block = Math.max(1, Math.round(lerp(46, 1, e)));
        var cw = Math.max(1, Math.ceil(S.w / block)), ch = Math.max(1, Math.ceil(S.h / block));
        var tc = S.store.t.getContext("2d");
        tc.clearRect(0, 0, S.w, S.h); tc.imageSmoothingEnabled = false;
        var b = coverBox(S.img.naturalWidth, S.img.naturalHeight, cw, ch);
        tc.drawImage(S.img, b.dx, b.dy, b.dw, b.dh);
        ctx.imageSmoothingEnabled = false;
        ctx.globalAlpha = clamp(p * 1.6, 0, 1);
        ctx.drawImage(S.store.t, 0, 0, cw, ch, 0, 0, S.w, S.h);
        ctx.globalAlpha = 1; ctx.imageSmoothingEnabled = true;
      }
    },

    /* vertical slices slide up + fade, one after another */
    slices: {
      idle: false,
      setup: function (S) { S.store.cols = Math.max(8, Math.round(S.w / 70)); },
      frame: function (ctx, p, t, S) {
        var cols = S.store.cols, cw = S.w / cols;
        for (var i = 0; i < cols; i++) {
          var local = clamp((p - (i / cols) * 0.55) / 0.45, 0, 1);
          if (local <= 0) continue;
          var e = ease(local), yoff = (1 - e) * S.h * 0.14;
          ctx.save(); ctx.beginPath(); ctx.rect(i * cw, 0, cw + 1, S.h); ctx.clip();
          ctx.globalAlpha = e; cover(ctx, S.img, S.w, S.h, 0, yoff); ctx.restore();
        }
        ctx.globalAlpha = 1;
      }
    },

    /* organic ink-bleed: soft blobs grow to reveal the picture */
    ink: {
      idle: false,
      setup: function (S) {
        S.store.layer = tmpCanvas(S.w, S.h);
        cover(S.store.layer.getContext("2d"), S.img, S.w, S.h);
        S.store.mask = tmpCanvas(S.w, S.h);
        var seeds = [], n = 5;
        for (var i = 0; i < n; i++) seeds.push({ x: (0.18 + 0.66 * (i / (n - 1))) * S.w + (Math.random() - .5) * S.w * .12, y: (0.3 + Math.random() * 0.4) * S.h, r: 0.6 + Math.random() * 0.5 });
        S.store.seeds = seeds; S.store.maxR = Math.hypot(S.w, S.h) * 0.62;
      },
      frame: function (ctx, p, t, S) {
        var e = easeIO(p), mc = S.store.mask.getContext("2d");
        mc.clearRect(0, 0, S.w, S.h); mc.globalCompositeOperation = "lighter";
        for (var i = 0; i < S.store.seeds.length; i++) {
          var s = S.store.seeds[i], R = e * S.store.maxR * s.r;
          if (R < 1) continue;
          var g = mc.createRadialGradient(s.x, s.y, 0, s.x, s.y, R);
          g.addColorStop(0, "rgba(255,255,255,1)"); g.addColorStop(0.7, "rgba(255,255,255,1)"); g.addColorStop(1, "rgba(255,255,255,0)");
          mc.fillStyle = g; mc.fillRect(0, 0, S.w, S.h);
        }
        mc.globalCompositeOperation = "source-over";
        ctx.drawImage(S.store.layer, 0, 0);
        ctx.globalCompositeOperation = "destination-in";
        ctx.drawImage(S.store.mask, 0, 0);
        ctx.globalCompositeOperation = "source-over";
      }
    },

    /* TV static clears to reveal the image; faint grain stays alive */
    static: {
      idle: true,
      setup: function (S) {
        var tiles = [], TS = 160, n = 6;
        for (var k = 0; k < n; k++) {
          var c = tmpCanvas(TS, TS), cx = c.getContext("2d");
          var img = cx.createImageData(TS, TS), d = img.data;
          for (var i = 0; i < d.length; i += 4) { var v = (Math.random() * 255) | 0; d[i] = d[i + 1] = d[i + 2] = v; d[i + 3] = 255; }
          cx.putImageData(img, 0, 0); tiles.push(c);
        }
        S.store.tiles = tiles;
      },
      frame: function (ctx, p, t, S) {
        ctx.globalAlpha = clamp(p * 1.35, 0, 1); cover(ctx, S.img, S.w, S.h);
        var tile = S.store.tiles[(Math.floor(t * 14) % S.store.tiles.length + S.store.tiles.length) % S.store.tiles.length];
        var a = p < 0.999 ? (1 - p) * 0.85 : (0.04 + 0.03 * Math.abs(Math.sin(t * 1.6)));
        ctx.globalAlpha = a; ctx.fillStyle = ctx.createPattern(tile, "repeat"); ctx.fillRect(0, 0, S.w, S.h);
        ctx.globalAlpha = 1;
      }
    },

    /* glitch scanline reveal: displaced slices settle in, scanlines + flicker */
    scan: {
      idle: true,
      setup: function (S) {
        var NS = Math.max(16, Math.round(S.h / 22)); var r = [];
        for (var i = 0; i < NS; i++) r.push(Math.random() * 2 - 1);
        S.store.NS = NS; S.store.r = r;
      },
      frame: function (ctx, p, t, S) {
        var NS = S.store.NS, sh = S.h / NS;
        for (var i = 0; i < NS; i++) {
          var rev = clamp((p - (i / NS) * 0.22) * 1.6, 0, 1);
          if (rev <= 0) continue;
          var disp = (1 - ease(rev)) * S.store.r[i] * S.w * 0.6;
          disp += Math.sin(t * 6 + i * 1.3) * (1 - p) * 6;
          if (p >= 0.999) { var g = Math.sin(t * 0.7 + i * 2.1) * 0.5 + 0.5; if (g > 0.965) disp += S.store.r[i] * 22; }
          ctx.save(); ctx.beginPath(); ctx.rect(0, i * sh, S.w, sh + 1); ctx.clip();
          ctx.globalAlpha = rev; cover(ctx, S.img, S.w, S.h, disp, 0);
          if (1 - p > 0.03) { ctx.globalAlpha = rev * (1 - p) * 0.45; cover(ctx, S.img, S.w, S.h, disp + 9, 0); }
          ctx.restore();
        }
        ctx.globalAlpha = (p < 0.999 ? 0.12 * (1 - p) : 0.05) + 0.05; ctx.fillStyle = "#000";
        for (var y = 0; y < S.h; y += 3) ctx.fillRect(0, y, S.w, 1);
        ctx.globalAlpha = 1;
      }
    }
  };

  /* ---------------- per-figure controller (scroll-driven) ---------------- */
  function attach(fig, io) {
    var canvas = fig.querySelector("canvas"); if (!canvas) return;
    var name = fig.getAttribute("data-effect") || "mosaic";
    var eff = EFFECTS[name] || EFFECTS.mosaic;
    var img = new Image(); img.decoding = "async";
    var S = null, raf = 0, active = false, ready = false, lastP = -1, drew = false;
    var intro = fig.getAttribute("data-intro") === "1";
    var introDone = !intro, introT0 = 0, INTRO = 2.1;

    function rebuild() { var c = fit(canvas); S = { ctx: c.ctx, w: c.w, h: c.h, dpr: c.dpr, img: img, store: {} }; if (eff.setup) eff.setup(S); lastP = -1; drew = false; }

    // scroll progress: 0 when section top is at viewport bottom, 1 when near top.
    // Hero (data-intro): stays assembled while in view, scatters as it exits upward,
    // and re-assembles when you scroll back down to it.
    function scrollP() {
      var r = fig.getBoundingClientRect();
      var vh = window.innerHeight || document.documentElement.clientHeight || 1;
      if (intro && introDone) {
        if (r.top >= 0) return 1;                        // in view → assembled
        return clamp(1 + r.top / vh, 0, 1);              // exit top → scatter
      }
      return clamp((vh - r.top) / (vh * 0.9), 0, 1);
    }
    function loop(now) {
      if (!S) { raf = 0; return; }
      var p;
      if (RM) { p = 1; }
      else if (!introDone) {                       // one-time build on load
        if (!introT0) introT0 = now;
        var ip = (now - introT0) / 1000 / INTRO;
        if (ip >= 1) { introDone = true; p = scrollP(); }
        else p = clamp(ip, 0, 1);
      } else p = scrollP();
      var t = now / 1000;
      var moved = Math.abs(p - lastP) > 0.0006;
      if (eff.idle || moved || !drew) {
        S.ctx.clearRect(0, 0, S.w, S.h);
        eff.frame(S.ctx, p, t, S);
        lastP = p; drew = true;
      }
      raf = active ? requestAnimationFrame(loop) : 0;
    }
    function start() { if (raf || !ready) return; raf = requestAnimationFrame(loop); }
    function stop() { if (raf) { cancelAnimationFrame(raf); raf = 0; } }
    function still() { if (S) { S.ctx.clearRect(0, 0, S.w, S.h); eff.frame(S.ctx, RM ? 1 : scrollP(), performance.now() / 1000, S); } }

    fig._ctl = {
      enter: function () { active = true; start(); },
      leave: function () { active = false; stop(); },           // keep last drawn frame
      resize: function () { if (!ready) return; rebuild(); if (active) start(); else still(); }
    };

    img.onload = function () { ready = true; rebuild(); io.observe(fig); };
    img.onerror = function () { fig.classList.add("art--err"); };
    img.src = fig.getAttribute("data-src");
  }

  function init() {
    var figs = [].slice.call(document.querySelectorAll(".art[data-src]"));
    if (!figs.length) return;
    var io = new IntersectionObserver(function (ents) {
      ents.forEach(function (en) {
        var ctl = en.target._ctl; if (!ctl) return;
        if (en.isIntersecting) ctl.enter(); else ctl.leave();
      });
    }, { root: null, rootMargin: "45% 0px 45% 0px", threshold: 0 });
    figs.forEach(function (f) { attach(f, io); });

    var rt;
    window.addEventListener("resize", function () {
      clearTimeout(rt);
      rt = setTimeout(function () { figs.forEach(function (f) { if (f._ctl) f._ctl.resize(); }); }, 180);
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
  window.RyieFX = { effects: EFFECTS };
})();
