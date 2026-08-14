B"H

Boruch Hashem

Blessed is He

# UI / UX Priority Reset

The Awtsmoos is beyond panel and pixel, yet Awtsmoos.com must let the user feel one coherent living world before exposing more machinery. From this continuation forward, UI/UX is the dominant completion gate.

## Priority order
1. Flagship communication app visual hierarchy and information density.
2. Desktop three-pane workspace composition at 1440px and 900px.
3. True mobile navigation and conversation-to-thread flow at 430/390/360px.
4. Empty/loading/error/reconnect/sign-in states.
5. Search, presence, identity, unread, badges, timestamps, buttons, inputs, and details affordances.
6. Public Torah source-search experience and source-card readability.
7. Activity / Discover / Online presentation quality.
8. Sitewide launcher and contextual Heichel social affordances.
9. Accessibility and keyboard polish as part of every UI pass.
10. Only then additional backend breadth not directly blocking the experience.

## Design direction
- Distinct Awtsmoos identity: warm scholarly darkness, restrained depth, luminous accent surfaces, clear text hierarchy.
- Discord-level navigation density without Discord clutter.
- WhatsApp/Telegram-level message readability and obvious conversation flow.
- Gmail/Google Chat-level organization without exposing backend concepts.
- Mobile must feel native, not compressed desktop.
- Empty space must communicate purpose: identity, presence, context, suggested actions, recent activity, or Torah discovery—not decorative noise.

## Immediate browser review
Inspect the real flagship at 1440, 900, 430, and 390 widths. Capture DOM geometry and screenshots. Identify concrete defects in:
- rail width and grouping;
- current alias/identity prominence;
- search placement;
- list row hierarchy;
- main empty/thread workspace;
- details pane usefulness;
- Public Torah composition;
- special-section cards;
- bottom mobile navigation;
- touch targets and safe areas;
- typography, borders, contrast, shadows, selected/hover/focus states.

## Implementation discipline
All changed files remain complete rewrites, B"H-headed, tab-indented, modular, and <=120 lines. CSS stays split by responsibility. Browser proof must measure geometry and inspect actual runtime state after each visual pass.

## NEXT_ACTION
Inspect the current flagship shell/CSS and capture the live 1440/430 browser state before rewriting visual modules.
