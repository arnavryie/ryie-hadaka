arnhvooo, [09-06-2026 15:11]
# RYIE — patch: minimal glow on mobile

One file, one block swap in css/style.css. Replacing the previous mobile damping
with a more aggressive version — single tight shadow layer, no outer halo.

-----

## css/style.css

Find this block (the previous mobile damping):
/* MOBILE GLOW DAMPING — shadow blur scales with screen proportionally */
@media (max-width:760px){
  .hero-name{
    text-shadow:0 1px 8px rgba(0,0,0,.75), 0 0 8px rgba(185,215,255,.22), 0 0 20px rgba(25,230,255,.1); }
  .stroke{ -webkit-text-stroke:1.5px #ffffff;
    text-shadow:0 0 3px rgba(255,255,255,.5), 0 0 10px rgba(185,215,255,.22); }
  .stroke.s-cyan{ -webkit-text-stroke:1.5px #19e6ff;
    text-shadow:0 0 3px rgba(25,230,255,.6), 0 0 10px rgba(25,230,255,.28); }
  .stroke.s-mag{ -webkit-text-stroke:1.5px #ff2bd6;
    text-shadow:0 0 3px rgba(255,43,214,.6), 0 0 10px rgba(255,43,214,.28); }
  .stroke.s-pur{ -webkit-text-stroke:1.5px #8b5cff;
    text-shadow:0 0 3px rgba(139,92,255,.6), 0 0 10px rgba(139,92,255,.28); }
  .grad{ filter:drop-shadow(0 0 4px rgba(25,230,255,.4)) drop-shadow(0 0 10px rgba(255,43,214,.22)); }
  .glow-c{ text-shadow:0 0 3px rgba(255,255,255,.4), 0 0 8px #19e6ff, 0 0 18px rgba(25,230,255,.3); }
  .glow-m{ text-shadow:0 0 3px rgba(255,255,255,.4), 0 0 8px #ff2bd6, 0 0 18px rgba(255,43,214,.3); }
  .glow-p{ text-shadow:0 0 3px rgba(255,255,255,.4), 0 0 8px #8b5cff, 0 0 18px rgba(139,92,255,.3); }
}

Replace with:
/* MOBILE GLOW DAMPING — single tight shadow, no outer halo */
@media (max-width:760px){
  .hero-name{
    text-shadow:0 1px 8px rgba(0,0,0,.75), 0 0 6px rgba(185,215,255,.22); }
  .stroke{ -webkit-text-stroke:1.5px #ffffff;
    text-shadow:0 0 4px rgba(255,255,255,.35); }
  .stroke.s-cyan{ -webkit-text-stroke:1.5px #19e6ff;
    text-shadow:0 0 4px rgba(25,230,255,.4); }
  .stroke.s-mag{ -webkit-text-stroke:1.5px #ff2bd6;
    text-shadow:0 0 4px rgba(255,43,214,.4); }
  .stroke.s-pur{ -webkit-text-stroke:1.5px #8b5cff;
    text-shadow:0 0 4px rgba(139,92,255,.4); }
  .grad{ filter:drop-shadow(0 0 4px rgba(25,230,255,.3)); }
  .glow-c{ text-shadow:0 0 6px rgba(25,230,255,.4); }
  .glow-m{ text-shadow:0 0 6px rgba(255,43,214,.4); }
  .glow-p{ text-shadow:0 0 6px rgba(139,92,255,.4); }
}

-----

What changed: each headline class went from 2–3 shadow layers down to 1 single tight shadow at 4–6px blur. The wide halo layer (10–18px) is gone entirely on mobile. Color is still visible as a faint edge glow but no fog/halo. Should now match the crispness of the small RYIE brandtag.
