B"H

Boruch Hashem

Blessed is He

# Transactional New Modal Live Evidence

The Awtsmoos is beyond request, failure, retry, and success. This pass repaired the finite moment where a human has already entered an alias or group name but the network has not yet confirmed anything, so Awtsmoos.com no longer throws the words away merely because a request failed between intention and acceptance.

## Product defect repaired

Previously the one-field messaging sheet closed as soon as it collected a string. The actual network mutation ran only afterward in MessagingSectionActions. A failed chat request, friend request, mail request, or group creation therefore discarded the entered value and forced the human to reopen the sheet and type it again.

The mutation now lives inside the sheet lifetime.

- New chat stays open while the chat request is being sent.
- Add friend stays open while the friend request is being sent.
- New group stays open while group creation is being confirmed.
- Mail contact stays open while the consent request is being sent.
- Submit and Cancel are disabled while the mutation is in flight.
- The primary action says `Sending…` or `Creating…`.
- Failure restores the same field and exact value.
- Failure appears inline in a role=alert chamber.
- Only confirmed success closes the sheet.
- Existing chat/friend/group/mail protocol ownership remains unchanged.

## Section-specific New language

The formerly generic New doorway is now human-specific.

- Chats: `New chat` / `Request a private chat`.
- Friends: `Add friend` / `Send a friend request`.
- Groups: `New group` / `Create a private group`.
- Requests and unrelated special sections expose no New action.

Modal and completion copy remain consent-accurate: a request is never described as accepted access.

## Source and regression gate

`TRANSACTIONAL_NEW_MODAL_UX_GATE` exited 0.

The gate proved:

- MessagingModalView.js: 62 lines;
- MessagingModalSubmission.js: 61 lines;
- MessagingModalSubmission.test.mjs: 83 lines;
- MessagingModal.js: 67 lines;
- MessagingSectionActions.js: 83 lines;
- MessagingNewActionPresentation.js: 61 lines;
- MessagingNewActionPresentation.test.mjs: 87 lines;
- MessagingSectionController.js: 97 lines;
- MessagingShellTemplate.js: 59 lines;
- modal.css: 84 lines;
- modal-actions.css: 56 lines;
- style.css: 52 lines;
- transactional modal submission contract: PASS;
- section-specific transactional New/consent language contract: PASS;
- browser import closure: PASS;
- private consent: PASS;
- private groups: PASS;
- private request dedupe: PASS;
- targeted diff hygiene: PASS.

## Real browser failure-continuity proof

A long-lived local server was started with `AWTSMOOS_DISABLE_MAIL=true` and explicitly emitted:

`B\"H - HTTP listening on port 8080.`

A clean Chrome tab was navigated through direct CDP to the real flagship. At a 390×844 mobile viewport, production MessagingModal was opened with a local-only commit function deliberately throwing `Connection interrupted`; no backend private request was sent.

A separate assertion worker then required all of the following from the live DOM and exited 0:

- flagship `.messaging-app` mounted;
- transactional sheet remained present;
- field value remained exactly `Miriam`;
- field was no longer read-only after failure;
- inline error was visible;
- inline error text was exactly `Connection interrupted`;
- form `aria-busy` returned to `false`;
- action labels returned to `Cancel` and `Send chat request`;
- both buttons were enabled again;
- both phone action heights were at least 46px;
- document horizontal overflow was false.

This is real browser runtime evidence, not a source-only inference.

## NEXT_ACTION

Use the same small assertion-based direct-CDP method to prove the everyday accepted private room at desktop, tablet, 390px, and 360px: rail readability, selected-room orientation, list/thread geometry, message grouping, composer controls, Back/New/Details/send/details-close touch sizes, and horizontal overflow.
