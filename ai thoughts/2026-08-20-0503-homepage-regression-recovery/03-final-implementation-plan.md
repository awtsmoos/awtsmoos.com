B"H
Boruch Hashem
Blessed is He

# Final Implementation Plan

The Awtsmoos renews the world without deleting its useful pathways; this plan restores the pathways on Awtsmoos.com and verifies every visible vessel.

## Final source changes

1. Rewrite `geelooy/index.html` completely.
2. Preserve current social-first hero language unless browser comparison reveals hierarchy failure.
3. Restore popular Torah search chips immediately after the omnibox.
4. Restore `portal-shortcuts` with Games, Apps, Wallet, and Connect.
5. Restore the compact status rail beneath shortcuts.
6. Restore `direct-navigation` with Torah, Games, Apps, Wallet, OS, Code, Community, and About.
7. Keep each restored group marked `data-reveal` so scrolling exposes it through the existing controller.
8. Add `data-pointer-light` only to major interactive cards, not every small link.
9. Keep the current featured-worlds section below the navigation grid for deeper content.
10. Keep the current mobile dock unless visual inspection shows conflict with the restored horizontal ribbon.
11. Keep the alias filesystem hero URL; do not introduce repository binary assets.
12. Replace the alias filesystem hero object only if the genuine larger original can be recovered.
13. If the larger original is not recoverable, report the 1024 limitation explicitly instead of manufacturing pixels.
14. Rewrite `components.css` completely so restored historical CSS modules are imported again; current file removed their imports with the markup regression.
15. Import `portal-shortcuts.css`, `portal-status.css`, and `direct-navigation.css` with fresh cache versions.
16. Rewrite `reveal-motion.css` completely with gentle depth, staggered child entry, hover light, and reduced-motion parity.
17. Rewrite `homeFoldContract.test.mjs` completely so it asserts restored visible grids and external-image storage.
18. Leave `index.js` untouched unless the restored markup creates a runtime need.
19. Leave unrelated dirty files untouched.
20. Do not use patch/replace operations.

## Acceptance criteria

1. Homepage renders without console errors.
2. Hero remains first visual anchor.
3. Search remains directly below hero.
4. Popular search chips are visible.
5. Portal shortcuts render.
6. Portal shortcuts are four columns on desktop.
7. Portal shortcuts reduce to two columns on medium width.
8. Portal shortcuts become horizontal scroll-snap ribbon on mobile.
9. Direct navigation grid renders on desktop/tablet.
10. Direct navigation provides eight destinations.
11. Direct navigation is below the shortcut/status layer, encouraging scroll discovery.
12. Featured cards remain available below the restored navigation.
13. IntersectionObserver reveal attaches to restored groups.
14. Reveals do not hide content when motion is reduced.
15. Hover motion stays subtle.
16. Focus outlines remain visible.
17. External hero URL is used by preload.
18. External hero URL is used by image element.
19. No hero binary appears in Git status.
20. Current external hero dimensions are recorded.
21. Original higher-resolution asset is searched in accessible history/storage.
22. Full-resolution original, if found, replaces only the external alias object.
23. HTML remains semantic and keyboard-navigable.
24. Cache-bust versions change for rewritten CSS bundle imports.
25. Focused homepage tests pass.
26. JavaScript syntax checks pass for affected runtime modules.
27. Browser desktop screenshot shows restored below-fold depth.
28. Browser scroll confirms reveal behavior.
29. Mobile-width browser check confirms ribbon rather than wall.
30. Final Git diff contains no unrelated source rewrites.

## Completion gate

Completion requires implementation, focused tests, browser verification, image-storage proof, full-file readback, planned-vs-actual review, and an empty task-specific remaining-work list.
