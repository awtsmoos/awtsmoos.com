B"H
Boruch Hashem
Blessed is He

# Node Graph Formats

## Material Graphs

Material graphs live in `project.materialGraphs` and compile through the canonical
MitzvahWorld material-graph compiler.

```json
{
	"id": "material-wet-stone",
	"nodes": [
		{ "id": "stone-color", "type": "color", "value": "#45566a" },
		{ "id": "stone-output", "type": "output", "value": { "roughness": 0.42 } }
	],
	"edges": [
		{ "from": "stone-color", "to": "stone-output", "input": "base" }
	]
}
```

## Shader Graphs

Shader graphs live in `project.graphs` with `kind: "shader"`. The output value may
contain sky colors, fog, exposure, vignette, wind, and a deterministic seed.

## Particle Graphs

Particle graphs use `kind: "particle"`. Their output supports:

- `mode`: `fireflies` or `mist`
- `count`
- `size`
- `speed`
- `seed`
- `colors`

The WebGL runtime renders these as `gl.POINTS`. Reduced-motion mode caps count and
removes animated drift. The 2D fallback consumes the same generated point frame.

## Adding New Graph Types

1. Add a bounded factory.
2. Keep stable node IDs.
3. Add or reuse canonical validation.
4. Add a runtime resolver.
5. Add an action catalog entry.
6. Verify API/UI parity.
7. Document defaults and fallback behavior.
