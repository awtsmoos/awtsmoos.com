B"H
Boruch Hashem
Blessed is He

# Cinematic World Asset

The NLE renders a procedural world from an asset in `project.nle.assets`:

```json
{
	"id": "cinematic-village-world",
	"kind": "cinematic-world",
	"shaderGraphId": "shader-village-dawn",
	"particleGraphIds": ["particles-fireflies", "particles-mist"],
	"seed": 613,
	"world": {
		"houses": [],
		"trees": [],
		"paths": [],
		"lamps": [],
		"character": { "id": "hero-chossid", "path": [] }
	}
}
```

## Houses

Each house includes world `x`/`z`, width, height, depth, roof height, and material
IDs for walls, roof, wood, and windows.

## Trees

Each tree includes world `x`/`z`, scale, trunk material, and leaf material. Groves
are deterministic from seed, count, center, and radius.

## Paths and Lamps

Paths contain two world endpoints, width, and material. Lamps contain world
coordinates and use wood plus emissive-window materials.

## Character

The character path is an ordered list:

```json
{ "t": 0.5, "x": -4, "z": 2 }
```

`t` is normalized from zero to one. The preview interpolates between points while
canonical actor tracks preserve the MitzvahWorld movement instructions.

## Runtime

`NleWebGlWorldRenderer` creates an offscreen WebGL canvas. `NleCompositor` draws
that canvas into the main movie canvas before title overlays. Context loss invokes
the 2D fallback with the same scene-frame geometry.
