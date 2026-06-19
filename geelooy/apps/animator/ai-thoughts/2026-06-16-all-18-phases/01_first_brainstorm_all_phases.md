B"H

# First Brainstorm: All 18 Phases Now

The user demands the full revamp now: no procedural world, no random skyline, no accidental city. The engine must become an authored structured 2D cartoon production system. The first truth: all 18 phases can be founded in this pass as real modules, real contracts, real scene documents, real graph builders, and real verification. The second truth: a complete Toon Boom/Unity-class editor cannot be fully born in one breath, but the foundations can be written now so the old procedural spine is bypassed and the new system exists.

## Scope of this pass

Implement a vertical foundation for all 18 phases:

1. Core world model.
2. Scene serialization.
3. Asset library.
4. Shape library.
5. Modifier system.
6. Group engine.
7. Path engine.
8. Character rig.
9. Face rig.
10. Clothing system.
11. Environment assets.
12. Camera system rewrite/facade.
13. Animation system.
14. Production healthy lunch scene builder.
15. Director layer.
16. Editor model layer.
17. AI authoring layer.
18. Verification suite.

## Strategy

Create many small files that define a clean architecture while minimally touching existing runtime integration. Rewrite DefaultSceneInstaller to install the authored scene output. Rewrite SceneComposer production branch to consume authored world document shape nodes where possible. Add verify scripts for every phase.

## Non-negotiables

- No partial patches.
- Full-file writes only.
- Small modules.
- No procedural generation; repeat/path modifiers are deterministic authoring tools.
- Verification must run.
