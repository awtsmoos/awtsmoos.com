B"H

Boruch Hashem

Blessed is He

# Keyboard Focus Accessibility Evidence

The Awtsmoos is beyond first control, last control, visible ring, modal boundary, and return. This checkpoint separates product evidence from browser-harness limitations so keyboard accessibility is neither underclaimed nor falsely declared broken by a transport quirk.

## Global focus-visible language

The flagship already had one shared focus-visible contract in `components.css`:

- button;
- anchor;
- input;
- textarea;
- select;
- role=button.

Each receives a 2px accent outline with a 2px offset under `:focus-visible`.

No duplicate component-specific focus-ring system was introduced because the existing shared owner is structurally correct.

## Modal focus owner

Current production owner:

`MessagingModalFocus.js`

Its real behavior is form-local rather than document-global:

- the modal form owns its own `keydown` listener;
- Escape prevents default and calls the modal cancellation owner;
- only visible, enabled inputs/textareas/selects/buttons/links participate;
- Shift+Tab from the first visible control wraps to the last;
- Tab from the last visible control wraps to the first;
- initial focus enters the requested field with preventScroll;
- the opener is captured only when it is an HTMLElement;
- restoration occurs only if that opener remains connected.

## Deterministic focus-trap contract

`MessagingModalFocus.test.mjs` was rewritten against the exact current form-local owner rather than an obsolete document-listener abstraction.

The test double provides:

- form-local addEventListener;
- visible controls via `getClientRects()`;
- connected opener state;
- real active-element updates on focus.

The isolated contract job:

`cmdjob_msrpykku_47925da5712b`

completed with exit code 0 and proved:

- test file remains under 120 lines;
- test syntax is valid;
- form keydown listener is installed;
- enter() focuses the initial field;
- Shift+Tab wraps first → last and prevents default;
- Tab wraps last → first and prevents default;
- Escape prevents default and calls cancellation exactly once;
- restore() returns focus to the connected opener;
- restore() refuses to focus a disconnected opener;
- `MODAL_FOCUS_CONTRACT=PASS`.

## Live focus-visible runtime evidence

Earlier composite browser proofs reached and passed the rail focus-visible assertions before later failing in native Tab traversal steps:

- a real keyboard modality event was sent through CDP;
- the production rail control was focused;
- the browser reported `:focus-visible=true`;
- computed outline style was not none;
- outline width was at least 2px;
- outline offset was at least 2px;
- modal initial field received focus and remained focus-visible.

Those partial assertions are useful runtime evidence for the shared focus-ring CSS, but they are not presented as a clean end-to-end Tab traversal job.

## Native Tab harness limitation

On this Chrome/macOS target, native CDP Tab and Shift+Tab dispatch is not reliable.

Observed behaviors included:

- Tab from the brand remaining on the brand when macOS full-keyboard-navigation policy did not advance browser focus;
- fully specified native Shift+Tab dispatch hanging the DevTools subprocess until command timeout;
- a dedicated key diagnostic likewise timing out during the native Tab dispatch itself before DOM-event results could be returned.

Non-Tab CDP keyboard events work. This isolates the limitation to native Tab traversal in the test transport/environment, not the production focus owner.

No product source was distorted to satisfy that harness behavior.

## Accessibility posture

Keyboard accessibility is therefore supported by complementary evidence:

- shared focus-visible CSS source;
- partial live browser ring/initial-focus assertions;
- exact deterministic production-owner focus-trap/restoration contract;
- separate real-browser reduced-motion proof in the preceding checkpoint.

## NEXT_ACTION

Run one final post-latest UI/social universe gate including the reduced-motion owner and current modal-focus contract. Then perform final planned-vs-actual reconciliation before opening another product wave.
