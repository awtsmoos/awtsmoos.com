# B"H
# Boruch Hashem
# Blessed is He

# Runtime Verification

The Awtsmoos is not proven by confidence. Awtsmoos.com records viewport, canvas, actor, material, texture, renderer, and failure evidence from the living page.

## Desktop runtime

- Real game route loaded from the worker-owned port-8879 server.
- CSS viewport and WebGL canvas: 1440×813.
- Resource count: 250.
- Live enemy actors: 6.
- Enemy group children: 6.
- Every demon mesh visible.
- Every demon mesh marked `bootstrapVisual: true`.
- Every demon material uses vertex colors.
- Every demon material uses a 256×256 cached procedural map.
- Families present: `violet-ash`, `scorched-ember`, `weathered-stone`.
- Roughness `0.78`, metalness `0.035`, emissive strength `0.24`, repeat `[3.2, 2.55]`, anisotropy `6`.

## True mobile runtime

DevTools `Emulation.setDeviceMetricsOverride` was applied to an unleased worker-owned target. The acceptance target then reported:

- CSS viewport: 390×844 at DPR 1.
- Canvas backing store: 390×844.
- Canvas client rectangle: 390×844.
- Resource count: 250.
- Live enemy actors: 6.
- Enemy group children: 6.
- Every demon visible, textured, vertex-colored, emissive, and bootstrap-compatible.

### Six measured mobile surfaces

1. `tzel-chai` — `violet-ash` — color `[0.4464, 0.279, 0.589, 1]`.
2. `esh-katan` — `scorched-ember` — color `[0.62, 0.1736, 0.1984, 1]`.
3. `ruach-afelah` — `scorched-ember` — color `[0.2144547, 0.3880609, 0.5106064, 1]`.
4. `shomer-hoshech` — `violet-ash` — color `[0.3875946, 0.1691322, 0.5073966, 1]`.
5. `ketem-layla` — `weathered-stone` — color `[0.5332, 0.217, 0.5704, 1]`.
6. `ayin-raash` — `scorched-ember` — color `[0.4901020, 0.3452992, 0.18, 1]`.

Each row also reported a 256×256 map, vertex colors, roughness `0.78`, metalness `0.035`, emissive strength `0.24`, repeat `[3.2, 2.55]`, and anisotropy `6`.

## External-only artifacts

- `/Users/awtsmoos/.awtsmoos-artifacts/mitzvahWorld/demon-materials-gpt56/desktop-postboot.png`
- `/Users/awtsmoos/.awtsmoos-artifacts/mitzvahWorld/demon-materials-gpt56/mobile-postboot-390x844.png`
  - Size: 310,295 bytes.
  - SHA-256: `a41c437e2de2b39ac2ea45c76aa99ba1a177bfcd93f033df36efa2012161982a`.

## Observed integration failures outside this workstream

- `richWorldError`: `B"H | real procedural tree bark and leaf textures are required.`
- The compact Chrome log collector returned one entry but did not expose its body.
- The complete page uses 250 resources, above the requested budget.

No demon-material exception was returned by the runtime inspections.
