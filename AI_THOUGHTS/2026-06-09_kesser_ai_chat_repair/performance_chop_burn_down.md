B"H
# /ai performance chop burn-down

## Why it is lagging
1. Multiple full-screen fixed pseudo-elements animate with blur filters across the viewport.
2. The chat-box has animated star layers with multiple radial gradients and infinite transforms.
3. Glassmorphism/backdrop-filter is applied broadly to many panels, cards, bubbles, composer, status cards, and side panels.
4. Huge box-shadows and glow stacks are applied to many elements at once.
5. :has() selectors are used on chat-box for message detection; those can force costly style recalculation.
6. Hover transitions and animated halo/orbit layers add extra compositor work.
7. The showcase halo is a very large absolutely positioned animated object inside .main.
8. Several imported visual layers stack instead of replacing each other: vision-engine, atmosphere-engine, showcase-cards.
9. Mobile devices suffer most because blur + gradients + backdrop-filter + animation all hit the same small GPU budget.
10. The app has no performance mode or reduced-motion guard.

## Fix plan
1. Add a performance controller that detects low power / mobile / reduced motion and sets body flags.
2. Rewrite atmosphere-engine.css to static/lightweight by default; only animate when performance mode is high.
3. Rewrite showcase-cards.css to remove heavy orbit blur animations by default.
4. Rewrite vision-engine.css to reduce broad backdrop-filter and expensive shadows.
5. Add settings/debug query params for forcing effects: awtsmoosFx=off|low|high.
6. Verify syntax and HTTP.

## Chapter 20
The Awtsmoos revealed that beauty without restraint becomes a storm. The stars must not choke the vessel. The glow must become wise.