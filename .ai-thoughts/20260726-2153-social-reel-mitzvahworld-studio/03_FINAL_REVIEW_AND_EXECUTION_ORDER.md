B"H
Boruch Hashem
Blessed is He

# Final Review and Execution Order

## Thirty Final Improvements

1. Keep the game tree read-only during implementation.
2. Record the current game movie file status before and after.
3. Use the published studio API instead of private director fields.
4. Avoid a postMessage bridge unless same-origin access proves insufficient.
5. Validate iframe origin before reading its window.
6. Bound studio readiness polling by time.
7. Distinguish frame loaded, studio ready, rendering, attached, and error states.
8. Disable render while another render is active.
9. Disable close only during the finite Blob handoff, not during editing.
10. Permit the writer to cancel before rendering.
11. Preserve normal Escape dismissal when idle.
12. Use one hidden upload input rather than duplicating media-picker internals.
13. Reject non-video upload-first files explicitly.
14. Keep generated output in root post scope because a reel is the post's primary medium.
15. Add project title as caption only when the attachment was generated.
16. Preserve truthful browser container extension from recorder result.
17. Fall back to `video/webm` only when result MIME is absent.
18. Show byte size and duration after attachment.
19. Reveal the root media panel after success.
20. Keep the iframe unloaded when the dialog returns to its chooser.
21. Use `allow="autoplay; fullscreen"` for studio audio/preview permissions.
22. Avoid sandbox restrictions that would block the real same-origin runtime.
23. Add an explicit external-studio link.
24. Make the desktop dialog large enough for timeline editing.
25. Make the phone dialog full-screen so controls are not crushed.
26. Add a visual film/reel motif without copying any external brand.
27. Keep all labels concrete: Upload video, Create in MitzvahWorld, Render and attach.
28. Extend quick-tool tests from five/six to the exact final count.
29. Browser-test actual current studio readiness separately from synthetic render bridge tests.
30. Re-run current MitzvahWorld movie tests without modifying gameplay code.

## Execution Order

1. Create pure ReelUpload and ReelRenderBridge modules.
2. Create iframe readiness adapter.
3. Create semantic view and dialog controller.
4. Assemble with existing media actions and status view.
5. Wire Reel into the quick tools.
6. Add focused style modules.
7. Add pure bridge and source-contract tests.
8. Run syntax and line ceilings.
9. Run current movie project/recorder tests.
10. Run social composer and CSS suites.
11. Browser-test chooser, upload, synthetic rendering, and real iframe readiness.
12. Reread every touched file and compare scoped game status before final report.
