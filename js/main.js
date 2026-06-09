/* =====================================================================
   RYIE — scroll engine: Lenis smooth scroll + GSAP parallax on every
   [data-speed] layer (floating text + floating images). Progressive:
   if libs fail to load, everything stays visible & readable.
   ===================================================================== */
(function () {
  "use strict";
  var root = document.documentElement;
  root.classList.remove("no-js");
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

  // year + loader
  var yr = document.getElementById("yr"); if (yr) yr.textContent = new Date().getFullYear();
  window.addEventListener("load", function () {
    document.body.classList.add("is-ready");
    var l = document.getElementById("loader");
    if (l) setTimeout(function () { l.classList.add("gone"); }, 420);
  });
  setTimeout(function () { var l = document.getElementById("loader"); if (l) l.classList.add("gone"); }, 4000);

  var hasGSAP = typeof window.gsap !== "undefined";
  var hasLenis = typeof window.Lenis !== "undefined";
  if (!hasGSAP || reduce) { document.body.classList.add("static-mode"); return; }

  gsap.registerPlugin(ScrollTrigger);

  /* ---- Lenis smooth scroll ---- */
  if (hasLenis) {
    var lenis = new Lenis({ duration: 1.15, smoothWheel: true, lerp: 0.09 });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
  }

  /* ---- top progress hairline ---- */
  var line = document.querySelector(".progress");
  if (line) gsap.to(line, { scaleX: 1, ease: "none", scrollTrigger: { trigger: document.body, start: "top top", end: "bottom bottom", scrub: true } });

  /* ---- parallax: every [data-speed] drifts at its own rate ----
     positive speed = moves up faster (foreground), small = background. */
  gsap.utils.toArray("[data-speed]").forEach(function (el) {
    var sp = parseFloat(el.getAttribute("data-speed")) || 0;
    var xs = parseFloat(el.getAttribute("data-x")) || 0;
    var trig = el.closest(".world") || el;
    gsap.fromTo(el,
      { yPercent: -sp * 82, xPercent: -xs * 30 },
      {
        yPercent: sp * 82, xPercent: xs * 30, ease: "none",
        scrollTrigger: { trigger: trig, start: "top bottom", end: "bottom top", scrub: true }
      }
    );
  });

  /* ---- subtle rotate drift for tagged accents ---- */
  gsap.utils.toArray("[data-spin]").forEach(function (el) {
    var s = parseFloat(el.getAttribute("data-spin")) || 8;
    gsap.fromTo(el, { rotate: -s }, { rotate: s, ease: "none", scrollTrigger: { trigger: el.closest(".world") || el, start: "top bottom", end: "bottom top", scrub: true } });
  });

  /* ---- entrance reveals for captions / small type ---- */
  ScrollTrigger.batch("[data-reveal]", {
    start: "top 88%",
    onEnter: function (b) { gsap.from(b, { y: 50, opacity: 0, duration: 0.9, stagger: 0.08, ease: "power3.out", overwrite: true }); }
  });

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

  /* ---- scale-in for the image frames as they arrive ---- */
  gsap.utils.toArray(".art:not(.bg)").forEach(function (el) {
    gsap.from(el, {
      scale: 0.9, opacity: 0, duration: 1, ease: "power2.out",
      scrollTrigger: { trigger: el, start: "top 90%", toggleActions: "play none none none" }
    });
  });

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

  /* ---- hero intro on load: RYIE letters drop in one by one ---- */
  window.addEventListener("load", function () {
    var tl = gsap.timeline({ delay: 0.5 });
    tl.from(".hero-name span", { yPercent: -140, opacity: 0, stagger: 0.13, duration: 0.85, ease: "power3.out" })
      .from(".hero-kick", { opacity: 0, duration: 0.8, ease: "power1.out" }, 0.35)
      .from(".hero-sub",  { opacity: 0, duration: 0.8, ease: "power1.out" }, 0.65);
    ScrollTrigger.refresh();
  });
})();
