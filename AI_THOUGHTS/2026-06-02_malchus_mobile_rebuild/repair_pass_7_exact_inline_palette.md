B"H
# Repair Pass 7 — Exact Inline Commentary Palette

User approved the ideal image and asked to fully improve CSS toward those exact colors and style.

Visual target:
- Deep near-black navy page glass.
- Purple/violet commentary frame glow.
- Thin gold separators and gold metadata.
- Large white Hebrew text almost the same size as regular verse text.
- Author block with round R avatar and gold coordinate label.
- Insight badge on the right as a purple pill.
- Action buttons as rounded dark purple/gold glass buttons.
- Status strip beneath the card with purple spinner and glowing Show All style.

Files to rewrite completely:
1. `styles/ideal/reborn/tokens.css`
   Add exact inline palette variables while preserving existing app variables.
2. `styles/ideal/reborn/inline-comments.css`
   Replace current inline design with image-matching class styles.
3. `comments/render/factories/InlineCardFactory.js`
   Add action dock and richer header markup to match the mockup.
4. `comments/inline/weaving/GuardianGate.js`
   Make the gateway summary match the design: author/verse metadata, preview text, status strip.

Verification:
- nodeCheckFiles for rewritten JS.
- CSS quality and import ownership.
- Static grep for required palette tokens/classes and no bad horizontal CSS.

No partial patching. Every file changed is rewritten in full.