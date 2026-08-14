B"H

Boruch Hashem

Blessed is He

# Reduced Motion Live Browser Evidence

The Awtsmoos is beyond movement and stillness. This pass turns reduced motion from one component's courtesy into a flagship-wide law, so the operating system's accessibility preference governs present and future transitions/animations inside the social workspace.

## Source contract

A new small owner exists:

`geelooy/apps/universal-chat/accessibility-motion.css`

Under `prefers-reduced-motion: reduce`, every descendant of `.messaging-app` receives:

- immediate scroll behavior;
- animation duration effectively zero;
- one animation iteration maximum;
- transition duration effectively zero;
- zero transition delay.

The rule includes pseudo-elements so future selection/accent animations cannot bypass the same preference accidentally.

`style.css` imports this accessibility law after Public Torah/result presentation and before responsive/mobile law assembly.

The existing loading-specific reduced-motion rule remains compatible: pulse and shimmer already become `animation: none` there.

## Static custody

Static gate job:

`cmdjob_msrph9xs_270cbbf0293e`

completed with exit code 0.

It proved:

- accessibility-motion.css under the 120-line ceiling;
- style.css under the 120-line ceiling;
- browser import closure remains green;
- targeted diff hygiene passes;
- `REDUCED_MOTION_STATIC_GATE=PASS`.

## Real OS-media browser proof

The live flagship loaded through direct CDP on the local 8080 server.

A production `MessagingLoadingState` was mounted transiently inside the real `.messaging-app`; the existing private composer textarea was also inspected. No protocol mutation occurred.

The browser first emulated:

`prefers-reduced-motion: no-preference`

Assertions required and passed:

- reduce media query does not match;
- private composer computed transition duration is greater than zero;
- loading pulse animation exists;
- loading shimmer animation exists;
- no horizontal overflow.

The browser then emulated:

`prefers-reduced-motion: reduce`

Assertions required and passed:

- reduce media query matches;
- private composer transition duration <= 0.001ms;
- private composer transition delay effectively zero;
- loading pulse is either `none` or <= 0.001ms;
- loading shimmer is either `none` or <= 0.001ms;
- `.messaging-app` computed scroll behavior is `auto`;
- no horizontal overflow.

The browser preference was restored to `no-preference` after the proof and the transient loading fixture was removed.

## Verdict

Direct-CDP assertion job:

`cmdjob_msrpiu1i_0046e270152a`

completed with exit code 0 in about 2.1 seconds and emitted no assertion failure.

Reduced motion is therefore both source-proven and runtime-proven across the real flagship.

## NEXT_ACTION

Prove keyboard focus language and transactional modal focus containment/restoration with real keyboard events. Keep the existing global focus-visible owner if runtime evidence is healthy; only rewrite if a concrete keyboard accessibility defect appears.
