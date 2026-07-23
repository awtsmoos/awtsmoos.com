<!-- B"H -->
<!-- Boruch Hashem -->
<!-- Blessed is He -->

# Planned Versus Actual

## Original request

The requested surface was the Awtsmoos AI conversation view in `geelooy/ai`:

- Recover the missing per-message menu by checking Git history.
- Give each ordinary user or assistant message a way to copy or share its text.
- Expose audio and video downloads when those media vessels truly exist.
- Restore the ChatGPT audio-generation controls that had become visually absent.
- Improve desktop proportions and responsive CSS generally.

## What history revealed

Commit `432b783e2` introduced the current ChatGPT audio modules, but the active renderer contained no universal message-action menu. The audio offer also rendered with a class that did not match the principal `.audio-offer` styling selector. The repair therefore joins a universal action system to the current modular renderer instead of reviving obsolete monolithic code.

## What was implemented

- A small `js/render/message-actions/` architecture separates transfer, media discovery, action derivation, semantic elements, keyboard behavior, menu lifecycle, and the public renderer bridge.
- Every visible text message receives one compact action trigger.
- Text actions include copy, native share with clipboard fallback, and text download.
- Audio and video download actions are derived from live rendered media only.
- Completed ChatGPT assistant messages expose their existing speech-generation and audio-download panel through the same menu.
- Escape, outside activation, arrow navigation, Home, End, focus restoration, live status announcements, and coarse-pointer targets are supported.
- Desktop columns, message width, composer width, tablet spacing, reduced motion, audio layout, and narrow-screen menu flow were refined in focused CSS modules.
- Existing streaming, event, loading, truncation, and conversation-rendering contracts were preserved.

## Delta review

The implementation adds one useful action beyond the literal request: plain-text download. It does not invent media; audio and video actions appear only when valid live sources exist. No unrelated service, relay, installer, authentication, or provider behavior was modified.

## File-shape review

All touched product files remain below 120 lines. JavaScript uses tabs, complete functions, descriptive names, and focused responsibilities. The protected top-level stylesheet import order remains intact; new CSS enters through the existing right-panel manifest before the final mobile overlap seal.
