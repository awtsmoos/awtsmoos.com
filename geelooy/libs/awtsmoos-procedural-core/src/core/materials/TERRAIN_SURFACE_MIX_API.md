B"H
Boruch Hashem
Blessed is He

# Terrain Surface Mix API Reference

The Awtsmoos renews many grasses and soils upon one earth while a finite renderer can only hold so many texture vessels at once. Awtsmoos.com uses this selector to reveal ecological variety through an explicit bounded page.

## SIMPLE API

```js
const mix = createTerrainSurfaceMixAuthority();
const recipe = mix.recipe({
	id: 'river-village-medium',
	layers,
	maxLayers: 4,
	preferredRoles: [
		'meadow-base-grass',
		'meadow-lush-grass',
		'meadow-moss-and-wet-grass',
		'meadow-open-soil'
	]
});
```

## INPUT

Each candidate layer is preserved as authored. Common fields include:

- `role` — renderer/localized role;
- `sourceRole` — canonical ecological identity;
- `url`;
- `repeat`;
- `zones`;
- strengths/masks understood by the consuming renderer.

## RANKING

A preferred role matches either `role` or `sourceRole`.

Matched layers sort by preferred-role order. Unmatched layers retain original order after matched layers. `maxLayers` bounds the final page.

## OUTPUT

The immutable recipe exposes:

- `id`;
- selected `layers`;
- `stats.availableLayers`;
- `stats.selectedLayers`;
- `stats.preferredRoles`;
- `stats.selectedRoles`.

## IMPORTANT BOUNDARY

This authority performs **selection only**.

The consuming renderer remains responsible for:

- network/cache policy;
- image decoding;
- GPU upload;
- shader blending;
- quality scheduling.

## REALISM GUIDANCE

A good terrain page normally mixes semantic surface families instead of tiny color variants of one source. For a river meadow, useful roles include base grass, lush grass, wet/moss grass, soil/path, then dry grass or exposed stone as budget permits.

## PERFORMANCE GUIDANCE

Prefer a few shared layers used across large terrain over many unique object maps. Keep a procedural/material fallback visible before optional images finish hydrating.
