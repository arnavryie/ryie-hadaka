/* =====================================================================
   RYIE — live GitHub contributions ("THE GRIND")
   Pulls @arnavryie's last-year contributions and paints a neon heatmap
   with current / longest streak + total. Degrades gracefully offline.
   ===================================================================== */
(function () {
  "use strict";
  var USER = "arnavryie";
  var grid = document.getElementById("streak-grid");
  if (!grid) return;

  // level 0..4 → neon ramp (matches the dark/magenta palette)
  var COLORS = ["rgba(255,255,255,.05)", "#37205c", "#6a2db0", "#b23ad8", "#ff2bd6"];

  function setStat(id, v) { var el = document.getElementById(id); if (el) el.textContent = v; }

  fetch("https://github-contributions-api.jogruber.de/v4/" + USER + "?y=last")
    .then(function (r) { if (!r.ok) throw new Error("bad status"); return r.json(); })
    .then(function (d) { render(d.contributions || []); })
    .catch(function () {
      grid.innerHTML = '<div class="streak-fallback">couldn\'t reach GitHub right now — the grid lights up live when it can.</div>';
    });

  function levelOf(day) {
    if (day.level != null) return Math.max(0, Math.min(4, day.level));
    var c = day.count || 0;
    return c === 0 ? 0 : Math.min(4, Math.ceil(c / 3));
  }

  function render(days) {
    if (!days.length) { grid.innerHTML = '<div class="streak-fallback">no contribution data.</div>'; return; }

    var total = 0, longest = 0, run = 0, cur = 0;
    for (var i = 0; i < days.length; i++) {
      var c = days[i].count || 0; total += c;
      if (c > 0) { run++; if (run > longest) longest = run; } else run = 0;
    }
    for (var j = days.length - 1; j >= 0; j--) {
      if ((days[j].count || 0) > 0) cur++; else break;
    }

    grid.innerHTML = "";
    var cells = document.createElement("div");
    cells.className = "cells";

    var pad = new Date(days[0].date + "T00:00:00").getDay(); // 0=Sun
    for (var p = 0; p < pad; p++) {
      var e = document.createElement("i"); e.className = "cell empty"; cells.appendChild(e);
    }
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

    if (window.ScrollTrigger) { try { window.ScrollTrigger.refresh(); } catch (e) {} }
  }
})();
