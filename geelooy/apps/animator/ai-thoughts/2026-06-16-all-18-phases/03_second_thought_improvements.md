B"H

# Second Thought: Improvements and Risk Burn-down

Thirty improvements before writing:

1. Use VirtualGraph nodes only through one ShapeNodeFactory.
2. Asset libraries should return graph nodes, not draw directly.
3. SceneDocument should be serializable JSON-safe.
4. SceneResolver should flatten worlds without random generation.
5. RepeatModifier must accept explicit count/spacing, no randomness.
6. Paths must sample deterministic linear points first.
7. Kitchen scene should be authored as groups and assets, not generated.
8. DefaultSceneInstaller should install the new authored document version.
9. ProductionLunchScene should render resolved graph from document.
10. Keep old tests passing.
11. Avoid breaking existing character renderer; define new rig modules separately.
12. Add smoke tests phase by phase.
13. Do not delete old procedural files yet; bypass them by style.
14. Make editor models pure data so UI can be rebuilt later.
15. AI DSL must compile to scene document commands.
16. Camera planner must clamp shots.
17. Timeline must sample tracks deterministically.
18. Director layer should create authored beats, not canvas commands.
19. Include B"H and readable JSDoc in files.
20. Keep files small under 120 lines where practical.
21. Names should be stable and explicit.
22. New scene should contain no city keywords.
23. Verify graph JSON lacks skyline/building.
24. Include hierarchy model for editor roadmap.
25. Include inspector model for selecting assets.
26. Document registry should hold healthy lunch document.
27. SceneLoader should be able to load by id.
28. Production renderer should be able to build directly from resolved document.
29. After writing, read and compare plan vs actual.
30. If a file grows too much, split immediately.
