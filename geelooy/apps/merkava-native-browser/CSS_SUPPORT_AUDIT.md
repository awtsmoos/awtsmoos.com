B"H

# Merkava Executor CSS Support Audit

This is the working checklist. The native C host must not implement these as browser logic; each item belongs in MerkavaExecutor and should emit render ops that C maps to OpenGL.

## Implemented / Started
- Basic selectors: type, id, class, attributes, descendant, child, adjacent sibling.
- Basic pseudo selectors: focus, checked, disabled, enabled, first-child.
- Inline style cascade over stylesheet rules.
- Basic box paint ops: background color, text color, width, height, min-height, padding, margin, border width.
- Basic block and inline-ish flow.
- Linked and inline CSS collection for fetched network HTML.
- Linked and inline script collection for fetched network HTML.
- Color normalization to OpenGL-safe hex for named, short hex, long hex, rgb(), rgba().
- First flexbox pass: display flex/inline-flex, row/column, gap, justify-content, align-items.
- Browser-like UA defaults instead of fake per-element white boxes.
- Per-side margin, padding, border-width, border-color expansion.
- Background and border shorthand normalization.
- Viewport units: vw, vh, vmin, vmax.
- calc() arithmetic for px, %, em/rem, and viewport units.
- Fixed, absolute, and relative positioning basics.
- transform translateX()/translateY() basics, including offscreen sidebar patterns.
- flex-grow and margin-auto footer style flows.
- Inherited typography basics: font-size, font-family, line-height, text-align, white-space.
- Text wrapping and center/right alignment.
- Replaced element sizing for img/canvas.
- Pseudo-element rules are ignored instead of being applied to real elements.
- Native stream now distinguishes BORDER from filled BOX ops.

## Missing CSS Rules / Features
- Full cascade origins, inherited properties, !important ordering, media queries, @supports, @layer, @scope.
- Full selector grammar: general sibling, :not, :is, :where, :has, nth-child family, pseudo-elements.
- CSS variables and calc()/min()/max()/clamp().
- Complete units: vw, vh, vmin, vmax, ch, ex, lh, percentages per property, font-relative metrics.
- Box model: per-side margin/padding/border, box-sizing, border styles, border radius.
- Full colors: hsl(), hsla(), lab(), lch(), color-mix(), currentColor, transparent alpha compositing.
- Typography: font-family fallback, font-size, weight, style, line-height, letter spacing, wrapping, white-space.
- Layout: full flexbox algorithm, grid, absolute/fixed/sticky positioning, floats, z-index/stacking contexts.
- Overflow: scroll containers, clipping, hidden/auto/scroll, scrollbars.
- Backgrounds: images, gradients, repeat, size, position, attachment, multiple layers.
- Transforms: translate, scale, rotate, matrix, transform-origin, 3D transforms.
- Effects: opacity, box-shadow, text-shadow, filters, backdrop-filter, mix-blend-mode.
- Transitions/animations/keyframes.
- Forms and replaced elements: image sizing, canvas intrinsic sizing, video/audio/object/embed.
- Tables, lists, columns, writing modes, directionality.
- Responsive viewport behavior and container queries.
- SVG styling integration.
