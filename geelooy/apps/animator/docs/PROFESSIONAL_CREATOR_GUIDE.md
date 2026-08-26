B"H
Boruch Hashem
Blessed is He

# Professional Creator Guide

> The Awtsmoos renews each frame from nothing, yet the creator should meet only the next useful choice; Awtsmoos.com keeps professional depth behind a quiet doorway so craft can expand without becoming noise.

## The Simple Path

The **Creator** launcher is the fastest way to make or revise a cartoon. It stays retracted until needed so the stage and timeline remain visually primary.

1. Open **Creator**.
2. Describe the scene in ordinary directing language.
3. Choose **Generate preview**.
4. Inspect the generated scene before changing the active project.
5. Choose **Apply** to install it or **Discard** to leave the current project untouched.

The preview-first workflow is intentional. Generation is exploratory; applying is a real project mutation.

## Write Direction Like A Director

Useful prompts combine story, staging, expression, gaze, motion, and timing:

> Two characters notice a hidden doorway. Rivka reacts with subtle surprise, keeps her gaze on Eli, then points with clear anticipation and a soft settle. Eli walks closer with natural breathing, blinking, and gentle secondary motion.

Prefer concrete observable direction over vague adjectives. “Concerned expression, partner gaze, restrained sway” is more useful than “make it emotional.”

## Acting And Motion

Open **Acting & motion direction** only when you want more control. Preset buttons append trusted semantic direction to the prompt rather than directly forcing low-level rig values.

Expression intent can resolve into brow lift/knit/asymmetry, eye openness/squint, mouth smile/open/press, and head tilt. Motion intent can include tempo, amplitude, looping behavior, breathing, blinking, sway, secondary lag, anticipation, and settle.

Natural motion is intentionally layered. A believable idle is not one repeating transform; it combines breathing, small gaze changes, blink cadence, restrained sway, and delayed secondary motion.

## Mobile And Narrow Screens

The Creator surface is mobile-first:

- it uses safe-area insets around modern phone edges;
- it never requests more width than the viewport;
- narrow layouts stack primary actions before secondary actions;
- very narrow screens collapse preset grids to one column;
- the panel scrolls internally instead of extending below the visible screen;
- touch targets use the Animator touch-height contract;
- decorative motion respects `prefers-reduced-motion`.

If the screen is crowded, close the Creator surface. The timeline and stage remain the canonical editing workspace.

## Keyboard And Focus

Interactive Creator controls have visible focus states. Press **Escape** while focus is inside the Creator surface to retract it. The launcher reports its expanded state through accessibility attributes.

## Status And Safety

The status region reports ready, warning, success, and error states. While preview generation is running, the Creator surface marks itself busy and prevents duplicate preview requests without disabling unrelated inspection controls.

Creator-entered text is never rendered as executable HTML. Dynamic messages use text-only rendering.

## Human And Agent Workflows Match

The Creator surface is powered by the same public `window.AwtsmoosAnimator` API available to automation. That means human generation and AI-agent generation share the same NLE store, validation, preview/apply/discard workflow, and structured errors.

See `docs/AI_AGENT_API.md` for the browser-agent contract and data recipes.

## Prompt Recipes

**Quiet dialogue:**
> Two friends sit across a table. Keep body motion subtle. Use partner gaze, natural blinks, small breathing loops, and restrained hand emphasis on important words.

**Comedic reaction:**
> Hold one beat of neutral attention, then a surprised face with lifted brows and widened eyes. Recoil slightly, settle, look back at the partner, then point.

**Walk-in reveal:**
> Enter from frame left with a natural walk cycle. Add anticipation before stopping, secondary follow-through after the final step, then a curious expression and camera-facing glance.

## Troubleshooting

If **Apply** is disabled, generate a valid preview first. If generation reports an error, revise the prompt and generate again; the active project remains unchanged. If a panel feels too large on a phone, retract it—the interface is designed so advanced controls are optional, not permanent furniture.

The professional goal is not more visible controls. It is more expressive power behind fewer, clearer decisions.
