B"H

Boruch Hashem

Blessed is He

# Flagship UI/UX Pass 1 — Browser Evidence

The Awtsmoos is beyond pane, pixel, rail, and touch target, yet Awtsmoos.com must still reveal one living social world through a finite interface that feels intentional before the user learns any architecture; this record therefore measures the flagship by real browser geometry, interaction, and responsive behavior rather than by CSS existence alone.

## Product priority
The user explicitly raised UI/UX above further feature breadth for this continuation. The implementation therefore paused backend expansion and concentrated on `/apps/universal-chat/` first impression, information hierarchy, communication density, responsive behavior, Public Torah ergonomics, empty/loading/reconnect states, and visible presence/discovery structure while preserving every existing social permission boundary.

## Measured baseline defects before this pass
Real Chrome at 1440 x 960 showed:
- application/document height around 1,153px inside a 960px viewport;
- workspace search control around 1,000px tall because the list grid had an implicit-row defect;
- mixed emoji/glyph navigation rather than one icon language;
- floating card-like conversation rows instead of a dependable inbox rhythm;
- `list.css` and `thread.css` existed but were not imported by the flagship stylesheet graph;
- Public Torah retained the floating-drawer metaphor inside the dedicated app, including redundant Close/Open-app controls;
- the empty modal host participated in the application grid and created an unintended implicit row;
- special chambers reserved an empty conversation-list column;
- special chambers paid for a redundant conversation header above their own internal header;
- phone-width Public Torah permanently spent roughly 252px of the content canvas on composer controls before any source results existed.

## Current shell geometry
Browser measurements after the redesign:
- `.messaging-app` equals the viewport height exactly;
- document height equals viewport height exactly;
- desktop workspace search is 42px high;
- mobile workspace search is 44px high;
- zero document horizontal or vertical overflow at 1440, 900, 768, 640, 430, 390, and 360px;
- desktop/tablet child panes fill the full application viewport;
- 640px and below use one-screen list/thread/special navigation above a bottom rail;
- mobile rail is about 64px high and navigation touch targets are about 54px high;
- details remain an overlay rather than growing the document.

## Navigation and first impression
- Replaced mixed emoji navigation with one restrained SVG line-icon family.
- Added Awtsmoos identity mark and `Awtsmoos / Social Torah` brand hierarchy.
- Grouped sections visually while keeping all ten sections keyboard-accessible semantic buttons.
- Active state uses shape/border/indicator plus color, not color alone.
- Section catalog now also declares `list` versus `special` canvas ownership.
- Compact alias/Ploni identity has its own responsive layout instead of concatenated raw text.

## Conversation workspace
- Conversation summaries now use dense inbox-style rows with initials avatar, preview, timestamp, unread badge, whole-row keyboard parity, and selected state.
- Message history uses restrained readable bubbles, with the current actor visually distinct but not through color alone.
- Empty accepted rooms explain that consent already opened the private room.
- Private composer is visually separate from Public Torah source publication.
- Conversation details remain overlay-based and member rows gained compact visual hierarchy.

## Special chambers reclaim the main canvas
Desktop/tablet browser proof:
- Public Torah / Online / Discover / Activity / Mail / Settings hide the empty conversation-list column and use `rail + full canvas`.
- At 1440px, Public Torah receives roughly 1,328px of the 1,440px viewport after the 112px rail.
- Chats immediately restores the three-pane communication model with the conversation list and thread.
- The same transition works at 900px and 768px without overflow.

## Duplicate header removal
- Desktop special chambers hide the generic conversation header entirely.
- Public Torah's own header is the sole title bar.
- Mobile special chambers keep only a compact back strip (about 50px) and then begin their own content hierarchy.
- Browser proof showed special desktop content beginning at y=0 rather than below an unnecessary 72px title bar.

## Public Torah flagship integration
Inside the dedicated app:
- the universal chat drawer is restyled as a native full-canvas workspace;
- floating positioning, max-width, shadow, drawer border, redundant Close, and redundant Open-app link are removed only in flagship context;
- existing source-search, source-selection, channel, history, roster, and publication controls remain the original application protocol/UI owners underneath the styling;
- source cards stay server-issued and source-only publication semantics were not modified.

### Phone composer before/after
At 390px before the progressive composer pass:
- composer about 252px tall;
- private search row about 91px;
- publication row about 91px.

After redesign, before any results:
- composer about 95px;
- private search remains a single 42px row;
- publication controls are absent until trusted search-result cards exist.

Real mobile search with `Moshiach redemption`:
- one search request was sent;
- 20 trusted source cards returned;
- publication controls appeared only after source cards existed;
- results are scroll-bounded instead of crushing the discussion canvas;
- no publish request/frame was sent because Publish was not deliberately pressed.

At 360px with results open:
- search row remains 42px;
- publication row remains 42px;
- source target selector and publish action fit in one row;
- results stay bounded and scrollable;
- bottom navigation remains touchable;
- zero document overflow.

## Presence
Online is no longer a raw heading and paragraph. It now has:
- editorial presence header;
- two weighted metrics: visible people across Awtsmoos and people in the current context;
- privacy explanation;
- visible-alias roster chips;
- explicit empty identifiable-roster state.

At 390px the metrics collapse to one column without overflow. Hidden/anonymous identity semantics remain server-owned and unchanged.

## Discover
Anonymous Discover now gives Ploni a truthful first-session starting surface instead of a blank/raw paragraph:
- Public Torah;
- Heichelos exploration;
- privacy explanation for staying anonymous.

An initial view bug introduced during the rewrite was caught in Chrome: the view called a nonexistent authentication method and remained on Public Torah. The view was corrected back to the real `client.load()` flow. Browser proof afterward showed `aria-current=discover` and the three-card Ploni surface. Authenticated ranking still combines public candidates with private meaningful-activity signals only inside the browser through `MessagingDiscoveryRanker`.

## Empty, loading, and activity states
- Added reusable icon-based empty-state composition.
- Signed-out/private dead ends now occupy the complete chamber instead of appearing as sparse text near the top.
- Added semantic loading skeletons with reduced-motion support.
- Activity now has a composed private-history workspace and timeline rather than raw cards/paragraphs.
- Discovery loading/error states use the same composed visual language.

## Reconnect treatment
The existing lifecycle contract and prior real-browser proof already established:
- unexpected physical close;
- one replacement social socket;
- same site singleton object;
- universal/private application adapters remain attached to that singleton;
- warning clears after recovery;
- ordinary action status is not overwritten.

This UI pass found a placement defect: the reconnect warning lived inside the conversation-list column, so special chambers that reclaim/hide that column made the warning 0 x 0. The shell was rewritten so connection state is now a direct child of the application and `status.css` renders it as a global compact toast above every chamber. Ordinary action feedback remains local to the list. The native tunnel screenshot wrapper is still unavailable; exact toast geometry is therefore not claimed here until the direct Chrome probe returns reliably.

## Shared transport preserved
Throughout the browser geometry and interaction sweeps:
- universal client mounted;
- private bridge mounted;
- both resolved to the same `window.__awtsmoosSiteRealtimeSocket`;
- physical social WebSocket stayed OPEN outside deliberate reconnect probes;
- no UI redesign created an extra social transport.

## Accessibility / interaction evidence
- Navigation remains real buttons.
- Prior native-like CDP input proof showed Enter activates Online and Space activates Discover.
- Visible focus rules cover buttons, links, form fields, and interactive rows.
- Mobile navigation targets remain approximately 54px high.
- Search has a programmatic accessible label.
- status regions remain `aria-live` without replacing ordinary action status.
- reduced-motion rules were added to loading/reconnect animations.

## CSS/source architecture
The flagship CSS is now split into focused owners including:
- theme;
- layout;
- controls;
- status;
- loading;
- empty states;
- workspace;
- identity;
- rail;
- list / list metadata;
- thread;
- private composer;
- modal;
- activity;
- discovery;
- presence / presence metrics;
- Public Torah feed / composer;
- tablet responsiveness;
- mobile workspace;
- mobile navigation.

New and rewritten UI JavaScript is likewise split into focused icon, section catalog, element map, row factory, empty/loading state, list, thread, presence, discovery, and special-state modules.

## Static/contract evidence
Focused flagship checks have passed during this pass:
- browser import closure;
- `MessagingConnectionStatus.test.mjs`;
- `MessagingDiscoveryRanker.test.mjs`;
- `MessagingSectionPolicy.test.mjs`;
- JavaScript syntax checks over the redesigned modules;
- targeted `git diff --check`;
- touched/new UI modules were kept at or below the 120-line ceiling by splitting responsibilities when a first draft exceeded it.

One legacy flagship file, `api.js`, remains 127 lines and was not modified by this UI pass; the changed/new UI owners comply with the ceiling.

## Visual-proof caveat
The tunnel's native `chromeScreenshot` action still fails at its browser-helper routing layer even though CDP port 9222 is healthy. This pass therefore uses direct CDP DOM/runtime/computed-geometry and real interaction evidence as the authoritative browser proof. Earlier direct CDP screenshots were captured remotely, but they are not treated as the primary success criterion.

## Residual UI priorities
1. Authenticated conversation-list/thread visual proof with a real signed-in alias session remains valuable because the current controlled browser is Ploni.
2. Authenticated Activity/Mail/Settings should receive a comparable real-session browser review.
3. The global reconnect toast should receive one reliable direct-CDP geometry capture after the tunnel browser lane stabilizes.
4. Mobile bottom navigation currently keeps all ten chambers horizontally discoverable; a future five-primary-plus-More information architecture may further reduce thumb travel, but the current rail is fully touchable and overflow-free.
5. Additional screenshot-led polish can continue once the Chrome screenshot wrapper is repaired, but it should not replace DOM/runtime/accessibility proof.

## NEXT_ACTION
Keep UI/UX as the primary product gate: obtain authenticated visual proof for list/thread/request/group flows, then refine density and action placement based on those real states before adding further social feature breadth.
