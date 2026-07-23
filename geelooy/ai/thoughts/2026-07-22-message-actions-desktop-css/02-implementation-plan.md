<!-- B"H -->
<!-- Boruch Hashem -->
<!-- Blessed is He -->

# Implementation Plan: Per-Message Actions

## Target behavior

Every rendered user or assistant message receives one compact action trigger. Activating it reveals an accessible menu whose available actions are derived from the actual message content.

## Intended actions

- Copy the message text.
- Share the message through the Web Share API when available, with clipboard fallback.
- Download attached or generated audio when a valid audio source exists.
- Download attached or generated video when a valid video source exists.

Unavailable media actions must not appear as broken controls.

## Architecture

1. Keep message action discovery separate from rendering.
2. Keep clipboard, share, and download behavior in focused modules.
3. Use delegated event handling so streamed and restored messages behave consistently.
4. Use semantic buttons, keyboard navigation, focus return, Escape dismissal, and outside-click dismissal.
5. Preserve existing message streaming and persistence behavior.

## CSS goals

- Make the action trigger discoverable without crowding the message.
- Prevent menus from clipping inside scrolling panels.
- Improve desktop column proportions, minimum widths, height behavior, and overflow.
- Preserve the compact mobile layout shown in the supplied screenshot.
- Respect reduced motion and coarse pointers.

## Whole-file rule

Any source file changed during this work will be rewritten as a complete file. Oversized responsibilities will be extracted into small modules rather than patched in place.
