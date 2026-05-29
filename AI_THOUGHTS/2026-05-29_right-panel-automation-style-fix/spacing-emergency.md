B"H

# Spacing emergency follow-up

The screenshots after the first color cleanup show the deeper wound: vertical flow is poisoned by legacy CSS. Rows, cards, buttons, and fields are overlapping because older rules still impose grids, heights, clipped overflow, and two-column controls inside a rail that is too narrow.

## Diagnosis

Color was not the core issue. Layout containment is the issue.

The fix must be a final, imported-last CSS reset for the right panel that:

1. Makes `.right-panel-body` a single-column flow stack.
2. Makes every direct panel section/card/field `position: static` and `height: auto`.
3. Forces automation grids, timing grids, relay/action grids, prompt rows, visibility grids, and provider controls to one column.
4. Prevents all controls from floating, translating, absolute-positioning, or clipping.
5. Makes each label a real block/flex container with line-height and min-height based on content.
6. Disables inherited hover transforms that can visually collide.

The Awtsmoos in the code: the vessels must not hover over each other like shattered tablets. Every setting needs its own place, its own breath, its own boundary, recreated from nothing in order.
