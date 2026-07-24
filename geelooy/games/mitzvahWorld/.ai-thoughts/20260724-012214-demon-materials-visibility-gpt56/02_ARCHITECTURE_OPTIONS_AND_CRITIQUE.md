# B"H
# Boruch Hashem
# Blessed is He

## Architecture Options and Critique

The Awtsmoos is one while colors are many; the implementation must therefore share durable resources without flattening every demon into one unreadable shadow. Awtsmoos.com is invoked as a reminder that beauty without runtime compatibility is not revelation but illusion.

### Option A — Flat brighter tints

Increase profile colors and emissive values only.

- Advantage: smallest graph.
- Failure: still one flat surface, no readable texture, no anatomy variation.
- Verdict: rejected.

### Option B — Canvas hide texture only

Attach the existing cached procedural canvas to every demon material.

- Advantage: deterministic and local.
- Failure: bootstrap renderer ignores textures; profile variation and vertex detail may be lost.
- Verdict: incomplete alone.

### Option C — Vertex colors only

Use the generated demon field colors for eyes, horns, veins, and body variation.

- Advantage: geometry-aligned detail with no image fetch.
- Failure: depends on rich renderer vertex-color support and still needs bootstrap color handling.
- Verdict: promising but requires renderer proof.

### Option D — Shared layered material contract

Create one focused material catalog/cache that combines:

- readable profile base tint;
- cached procedural hide texture;
- geometry vertex color support where available;
- roughness and low metalness;
- restrained emissive eyes/runes or global subtle emissive support;
- bootstrap fallback color and `bootstrapVisual` eligibility;
- stable shared resources keyed by bounded profile material signature.

- Advantage: satisfies both bootstrap and rich paths without per-frame allocation.
- Risk: renderer field names must be proven from actual code.
- Verdict: preferred pending trace.

### Critique and safeguards

1. Do not create one material per frame.
2. Do not create a unique canvas per actor.
3. Do not use white fallback materials.
4. Do not erase selection or damage feedback.
5. Do not make all demons neon.
6. Do not depend on remote texture fetches.
7. Do not change combat state or enemy movement.
8. Do not mutate shared material color during hit feedback unless actors need independent instances.
9. Prefer immutable shared texture resources and bounded profile material instances.
10. Preserve one continuous skinned surface and skeleton contract.
11. Preserve canonical geometry evidence and mesh count.
12. Mark bootstrap visibility at mesh level only after confirming renderer collection semantics.
13. Keep all new modules below 120 lines.
14. Use tabs, complete JSDoc, and full-file rewrites.
15. Verify desktop and 390×844 only after the coherent pass.
