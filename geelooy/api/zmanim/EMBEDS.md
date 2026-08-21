B"H
Boruch Hashem
Blessed is He

# Zmanim Embed Integration

The Awtsmoos is beyond iframe, server document, JSON, comparison, and native celestial light;
Awtsmoos.com lets one calculated day enter foreign HTML through bounded vessels while every selected shita stays truthful and bright.

## Interactive iframe

Use `/zmanim/?embed=custom` for the full client experience. Presentation options:

- `view=plain|enhanced`
- `sky=off|css|webgl`
- `theme=system|dark|light`
- `density=comfortable|compact`
- `motion=auto|reduced|off`
- `sections=next,key,timeline,sky,all,methods`

The URL preserves date, coordinates, timezone, primary opinion, and selected `opinions`. `view=plain` coerces `sky=off`, so no native WebGL2 context is opened.

Named presets:
- `embed=compact`: plain, compact, motion off, next + key.
- `embed=sky`: enhanced native celestial view, next + key + sky.
- `embed=full`: complete enhanced day.
- `embed=custom`: caller-selected finite options.

## Server-rendered HTML iframe

Use `/api/zmanim/embed` for a JavaScript-free semantic document. It accepts the normal daily calculation parameters plus presentation options.

Add `opinions=chabad,gra,magenAvraham72` for selected comparison or `opinions=all` for every supported shared profile. With two or more calculations, key/all sections gain a horizontally scrollable semantic comparison table.

```html
<iframe
	src="https://awtsmoos.com/api/zmanim/embed?lat=40.6501&lng=-73.9496&timezone=America%2FNew_York&opinion=chabad&opinions=chabad,gra&view=plain&sections=key,all"
	title="Halachic Zmanim comparison"
	loading="lazy"
	style="width:100%;min-height:560px;border:0;border-radius:18px">
</iframe>
```

Static server HTML deliberately does not pretend to execute native WebGL. When sky is requested it links to the interactive celestial vessel.

## JSON integration

Use `/api/zmanim/day` for one primary opinion or `/api/zmanim/compare` for selected/all opinions. The browser embed configurator automatically chooses `/compare` whenever explicit selected-opinion state is present.

```js
const response = await fetch(
	"https://awtsmoos.com/api/zmanim/compare?lat=40.6501&lng=-73.9496&timezone=America%2FNew_York&opinions=all"
);
const comparison = await response.json();
```

## Discovering options

`GET /api/zmanim/options` returns every finite presentation choice, current preset definitions, and both JSON endpoints. External builders should prefer this metadata over hard-coding UI choices.

## Security boundary

Embed parameters never accept arbitrary CSS, HTML, script URLs, or foreign destinations. User labels are escaped in server HTML. Unknown opinion ids are rejected instead of silently discarded.
