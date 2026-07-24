B"H

# Baseline and Runtime Discovery

## Material paths actually observed

- Bootstrap fragment output is `uColor * vColor`.
- Bootstrap uses geometry color unless `material.vertexColors === false`.
- Bootstrap does not sample a texture and has no light response.
- Rich fragment albedo is `uColor * vColor * texel`, then encoded color is squared, lit, fogged, and tone-mapped.
- Rich texture upload consumes `material.mapImage`; binding only a conventional `map` property is insufficient evidence.
- Rich rendering reads geometry vertex color whether or not the material flag is true.
- Names containing ember, fire, or flame trigger the renderer's emissive mode automatically.
- Roughness and metallic values are retained by materials but are not consumed by the current rich shader.

## Baseline defects found

- Only three procedural families existed for six live demons.
- Rich material diagnostics were not attached consistently where callers expected them.
- Material and test contracts disagreed about vertex-color use and roughness.
- The texture existed as a canvas source but its luminance range was not measured or recorded.
- Anatomical vertex colors existed, but no acceptance ledger tied them to eyes, face, torso, arms, legs, horns, and claws.
- The prior ember family name could accidentally invoke full-surface emissive rendering.

## Baseline hashes

The original scoped SHA-1 values are recorded in `00_SCOPE_AND_EVIDENCE.md` and the agent transcript. `MinimalMeadowDemonMaterial.js` was already modified before this mission; its worktree state was preserved through a complete-file rewrite rather than reverted.
