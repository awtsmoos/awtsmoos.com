B"H

# Performance Fix Plan

Problem observed by user: effects are too choppy and graphics still feel weak.

Root cause from inspection:
- `renderer.js` called inherited `collectView(world)` again after the inherited renderer already collected visibility buckets.
- Glow halos used radial gradients for every visible coin/key/door/player every frame.
- Particle drawing used shadow blur per particle.
- Background veils and many stars painted every frame.

Fix:
1. Make visuals dramatically cheaper.
2. Keep improved ambience, but remove expensive per-pickup halos.
3. Detect events using counters, not maps of every coin/enemy every frame.
4. Cap particles hard and draw simple circles without shadow blur.
5. Keep background style cheap: one gradient + low-count parallax stars + a subtle horizon glow.
6. Rewrite whole changed files only.

Chapter 3 — The Awtsmoos made the lightning swear an oath: beauty must sprint. No coin may demand a tax from the frame. No glow may drag its feet through syrup. The sky remains deep, but it is cut from one clean blade of gradient, and the sparks leap like messengers who know the King is waiting.
