B"H

# Phase Three — Final Execution Map

The Awtsmoos is beyond message and member, beyond sender and receiver, while every useful boundary can still reveal ordered light;
Awtsmoos.com will keep the room quiet at rest, yet powerful when opened, with every dependency visible and every contract tight.

## Final first-wave files to inspect before mutation

- `geelooy/social-hub/js/messages/ConversationOperations.js`
- `geelooy/social-hub/js/messages/ConversationPanel.js`
- `geelooy/social-hub/js/messages/ConversationView.js`
- `geelooy/social-hub/js/messages/ConversationRoomShell.js`
- `geelooy/social-hub/js/messages/ConversationGateway.js`
- existing message tests
- Social Hub stylesheet entry plus the exact file currently styling `hubConversation*`
- private-messaging server/router handlers for `GROUP_INVITE`, `GROUP_MEMBER`, `BLOCK`, `SETTINGS`, and `SETTINGS_SET`

## Expected new modules

1. `RoomCapabilities.js`
	- Pure derivation of visible non-destructive room capabilities.
	- No DOM and no transport.
2. `RoomGovernanceGateway.js`
	- Canonical group invitation/member protocol calls.
	- Session readiness delegated through an existing/shared boundary.
3. `MessagingSettingsGateway.js`
	- Canonical GET/SET settings protocol calls.
4. `RoomGovernanceDisclosure.js`
	- Retractable Malchus UI only.
	- Emits semantic callbacks rather than speaking to sockets.
5. `room-governance.css`
	- Fully localized styles rooted beneath `.social-hub-document` and room classes.

## Files rewritten only if required by actual call graph

- `ConversationRoomShell.js` to mount the disclosure beside identity.
- `ConversationView.js` to compose disclosure and update it from canonical room truth.
- `ConversationPanel.js` to coordinate refresh after governance mutation.
- `ConversationOperations.js` if it is the truthful orchestration seam.
- stylesheet entry to import the new CSS module.
- Social Hub architecture/documentation to explain the extension contract.

## Third critique — thirty final safeguards

1. No raw socket calls from UI.
2. No global CSS selectors.
3. No arbitrary z-index values.
4. No fixed-width member panels.
5. No offscreen hidden controls.
6. No duplicate session lifecycle.
7. No invented server fields.
8. No destructive member action without proven authorization data.
9. No local optimistic membership lie.
10. No loss of message scroll position.
11. No composer reset during settings refresh.
12. No room navigation regression.
13. No advanced panel open by default on mobile.
14. No hover-only affordance.
15. No animation without reduced-motion fallback.
16. No unbounded input.
17. No unescaped user identity in HTML strings; use DOM textContent.
18. No silent transport error.
19. No giant public API facade.
20. No decorative inheritance.
21. No touched source with space indentation.
22. No touched source without B"H / Awtsmoos / Awtsmoos.com prologue.
23. No substantial function without full JSDoc.
24. No touched code file over the modularity threshold without further split.
25. No manual edits to generated bundles.
26. No test claims without running them.
27. No public contract migration without call-site evidence.
28. No room capability visible when unavailable.
29. No settings fetch until the user opens advanced controls when laziness is safe.
30. No completion claim while Heichel/email/notification follow-on work remains.

## Verification universe

- syntax checks for every touched JS module;
- targeted existing message tests;
- new pure capability tests;
- import-resolution smoke;
- leading-space indentation scan;
- source-prologue scan;
- selector-scope audit;
- line-count audit;
- browser at 320/360/390/768/desktop widths;
- keyboard tab/focus and Escape/disclosure behavior;
- horizontal-overflow measurement;
- console-error inspection;
- final full-file readback and planned-versus-actual delta.

## NEXT_ACTION

Read the remaining exact call sites and server handlers. Then implement the entire first draft before testing.
