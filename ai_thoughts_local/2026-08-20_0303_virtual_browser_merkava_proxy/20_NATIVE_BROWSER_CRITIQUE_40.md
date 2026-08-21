B"H
Boruch Hashem
Blessed is He

# Native Browser Hybrid — Phase 3 Critique, Forty Corrections

The Awtsmoos shines brightest where confidence is broken into evidence. Awtsmoos.com will not call a proxy a browser merely because its pixels glow; every origin, cookie, credential, gesture, header, and animation must remain honest in the flow.

## Forty corrections before implementation

1. **Do not equate User-Agent parity with browser identity.** Node/server transport still differs in IP, TLS fingerprint, HTTP negotiation, header ordering, connection reuse and network stack behavior.
2. **Do not forward high-entropy UA Client Hints by default.** Those APIs are privacy-sensitive and origin-controlled; low-entropy synchronous data is enough for initial parity.
3. **Do not blindly forward `sec-ch-ua*`.** Client Hints have browser policy semantics; incorrectly synthesizing them can make fingerprinting less truthful rather than more compatible.
4. **Prefer structured `browserProfile` over arbitrary caller headers.** The server, not guest content, decides what local-browser testimony may become upstream headers.
5. **Sanitize CR/LF and control characters in every profile string.** Never let profile metadata become header injection.
6. **Cap UA length.** Use a bounded maximum such as 512 characters.
7. **Cap language count and individual language lengths.** Avoid oversized payload/fingerprint surfaces.
8. **Normalize Accept-Language deterministically.** Primary language first, descending quality for later entries, no attacker-provided q-values.
9. **Preserve explicit caller `accept` / `content-type` semantics.** Browser profile must not overwrite request-content headers.
10. **Preserve server cookie ownership in proxy mode.** Profile forwarding must never expose local browser cookies to remote proxy requests.
11. **Never synchronize native-handoff cookies back into the server jar.** That would undermine provider policy and steal browser session material.
12. **Never copy server-jar cookies into a real top-level provider tab.** The native browser session must remain genuinely native.
13. **Google OAuth is not the only protected flow.** Build policy around explicit identity/native-mode rules, not one hard-coded brand.
14. **Do not classify every `accounts.google.com` URL as OAuth if a normal top-level user visit is intended.** Classification should reflect embedding policy and navigation intent.
15. **Do not classify arbitrary `google.com` pages as native-only.** Search/content can use the selected browsing mode when technically viable.
16. **Provider handoff from redirect chains may lack a user gesture.** If `window.open` would be blocked, show a one-click secure-handoff prompt rather than retrying popups invisibly.
17. **Never auto-open repeated handoff loops.** Remember the pending destination and require one explicit user action after a blocked or redirect-triggered handoff.
18. **Use `noopener` by default for native tabs.** Only preserve opener if a reviewed return protocol actually needs it.
19. **Do not call the Geelooy trust icon a browser lock.** It should communicate mode/security facts without mimicking privileged browser chrome that the page cannot actually guarantee.
20. **Embedded content must not share the main Awtsmoos origin.** This is a hard security boundary, not a styling preference.
21. **A sandboxed opaque-origin iframe is safer but less compatible.** Product UI must label it “isolated mode” rather than pretending site origin is preserved.
22. **A dedicated browser-only origin still does not equal the remote origin.** WebAuthn, Origin checks, SameSite behavior and service workers can still differ.
23. **Service workers are a major compatibility seam.** Do not promise arbitrary PWA fidelity until isolated-origin service worker behavior is explicitly designed/tested.
24. **ES modules and dynamic imports need URL rewriting or interception.** Native browser execution alone does not make proxy routing automatic.
25. **WebSocket/EventSource/WebRTC need explicit routing policy.** Fetch/XHR interception does not cover them.
26. **Form submissions and `location` mutations need navigation interception.** Otherwise pages can escape the proxy model unpredictably.
27. **Downloads need their own safe flow.** Do not inject binary download bodies into DOM or expose server temp paths.
28. **Blob/data URLs need per-mode handling.** They should remain local when created by the guest, not be sent to the proxy.
29. **CSP can break injected bridges.** Prefer browser-isolated document bootstrapping that minimizes inline script dependence and records CSP limitations.
30. **Subresource Integrity can break rewritten resource URLs.** Preserve or deliberately strip only with explicit testimony; never silently ignore integrity mismatches.
31. **Content-Encoding is currently forced to identity.** Keep this for deterministic proxy behavior unless transport code is separately hardened for streaming/compression.
32. **Referer/Origin cannot simply mirror remote origin truthfully in a proxy origin.** Never forge security-sensitive origin headers merely for compatibility.
33. **The server proxy must continue DNS pinning/public-address checks on every redirect.** Browser-profile work must not touch SSRF logic.
34. **History state must distinguish embedded and native handoff entries.** Back should not unexpectedly reopen OAuth tabs.
35. **Tabs should be host state, not remote DOM.** Guest scripts must never create/close Geelooy tabs directly without a typed bridge and user policy.
36. **`window.open` should map to a requested-tab event in embedded mode.** The host may create a Geelooy tab/window or native handoff depending on target policy.
37. **Popup spam needs rate/gesture gating.** Only user-activation-related popup requests should produce visible windows automatically.
38. **The developer editor/metrics tools should survive behind an advanced drawer.** Do not delete useful diagnostics merely to make the surface pretty.
39. **UI animation must never delay navigation controls.** State changes are immediate; visual easing follows state, not vice versa.
40. **Animations need reduced-motion parity.** Every keyframe/transformed state must have a nonanimated equivalent.
41. **Avoid heavy backdrop-filter on low-power/mobile environments.** Provide opaque fallback and limit blur regions.
42. **Use native controls where possible.** Text inputs/buttons should remain accessible without custom pointer-only interaction.
43. **Tabs need roving keyboard focus and predictable shortcuts.** Arrow navigation, close semantics and focus restoration must be tested.
44. **Omnibox display should emphasize registrable host visually but preserve the complete editable URL.** Never hide confusing userinfo or punycode security facts.
45. **Internationalized domains need careful display.** Prefer URL API/canonical representation initially; do not invent unsafe Unicode prettification.
46. **Loading progress must not lie.** Use coarse state milestones unless true progress is measurable; never imply byte completion from guessed percentages.
47. **Network errors should be page-state UI, not only tiny status text.** Preserve code/status details in expandable diagnostics.
48. **Session alias/jar IDs should not dominate primary UI.** Move them into an advanced session panel with clear reset controls.
49. **Clearing proxy cookies and native browser cookies are different actions.** UI labels must say exactly which cookie world is cleared.
50. **Native handoff cannot promise automatic return for arbitrary sites.** Only standards-based OAuth redirect/callback or explicit user return can resume state.
51. **Do not expose provider credentials through postMessage.** Handoff completion messages must be narrow, origin-checked, and contain only application callback state.
52. **Do not weaken COOP/COEP/X-Frame policies just to keep a page embedded.** When isolation policies conflict, move to native mode or show an honest compatibility error.
53. **Mixed content must remain blocked.** Do not proxy HTTPS pages to silently permit insecure active subresources unless explicitly safe and user-visible.
54. **Browser fingerprint parity must be observable/tested against controlled endpoints only.** Do not scrape or bypass anti-bot systems.
55. **Keep a generic fallback UA only for non-browser callers/tests.** Browser program requests should nearly always include its real local profile.
56. **No Chromium imports after hybrid coordinator cutover.** Add a source-contract regression that fails if `hybridNavigationCoordinator` imports interactive Chromium modules.
57. **Do not delete Chromium files immediately after cutover.** First prove no production import/references/routes depend on them; delete in a separately auditable cleanup.
58. **Strict Merkava VM remains valuable.** Finish it as a sandbox/fallback after the native browser path is stable, rather than abandoning the security work midstream.
59. **Visual polish requires screenshot proof.** Inspect actual local Geelooy browser at desktop and narrow widths, not only CSS syntax.
60. **Completion requires real flow proof.** Controlled site DOM/JS local execution, proxied network request, native OAuth handoff, keyboard navigation, reduced-motion, and no backend Chromium process must all be observed.

## Revised priority after critique

1. Browser-profile contract and tests.
2. Secure native-handoff policy and tests.
3. Embedded-origin deployment feasibility inspection.
4. Hybrid coordinator without Chromium authority.
5. Futuristic browser chrome and advanced session drawer.
6. Embedded local-browser engine bridge.
7. Navigation/forms/popups/modules/network-family expansion.
8. Visual/accessibility/browser-flow verification.
9. Chromium cleanup only after dependency proof.
10. Resume/finish strict Merkava fallback hardening.

## Phase 3 decision

The architecture remains hybrid, but its promise is precise:

- **ordinary compatible pages:** local browser engine + hardened proxy transport,
- **origin/security-sensitive pages:** real top-level local browser,
- **fallback/untrusted deterministic execution:** strict Merkava VM,
- **backend:** network/cookie/security authority, never a browser engine.

The final execution plan must begin with the small browser-profile contract and must never let visual polish outrun security truth.
