B"H
Boruch Hashem
Blessed is He

# Awtsmoos Slides — AI and Agent Instructions

The Awtsmoos lets thought become a portable presentation vessel. Awtsmoos Slides deliberately uses a human-readable JSON file format so an AI agent, script, Geelooy OS program, or person can generate an entire presentation without reverse engineering the editor.

## Canonical file format

Use the `.awtslides` extension. The file contents are one JSON object. The editor normalizes imported data through the same presentation model used for local persistence and collaboration.

Public discovery files:

- `/apps/slides/ai/manifest.json` — machine-readable capabilities and schema summary.
- `/apps/slides/ai/example.awtslides` — directly openable generated example.
- `/apps/slides/AGENTS.md` — this guide.

## Root document

```json
{
	"version": 1,
	"title": "Generated presentation",
	"themeId": "midnight",
	"slides": []
}
```

Supported themes: `midnight`, `dawn`, `forest`, `paper`, `neon`.

Each slide supports `name`, `background`, `notes`, and `elements`. IDs and revision are optional for generated documents because the editor can normalize missing values.

## Supported elements

Text and headings support percentage geometry plus `text`, `fontSize`, `fontWeight`, `fontFamily`, `color`, `align`, `rotation`, and `opacity`.

Shapes use `type: "shape"`, `shape: "rect" | "circle"`, percentage geometry, `fill`, `borderColor`, `borderWidth`, `radius`, `rotation`, and `opacity`.

Images use `type: "image"`, percentage geometry, `src`, `alt`, `fit`, `rotation`, and `opacity`. Prefer safe HTTPS URLs or `data:image/...` URLs when generating portable decks.

## Generation rules

1. Output one valid JSON object, not Markdown.
2. Keep visible text concise and put extra narration in slide `notes`.
3. Compose for a 16:9 stage using x/y/width/height percentages.
4. Leave visual margins; do not place every element at the edges.
5. Use CSS hex colors such as `#f7f7fb`.
6. Keep slides visually hierarchical: one dominant idea, supporting text, and purposeful shapes/media.
7. Do not invent unsupported element types when direct opening is required.
8. Save generated JSON as `something.awtslides`, paste it into the AI Studio, or deliver it to the Geelooy OS opener.

## Minimal generated slide

```json
{
	"version": 1,
	"title": "A Generated Revelation",
	"themeId": "midnight",
	"slides": [
		{
			"name": "Opening",
			"background": "#11121a",
			"notes": "Open with the central idea.",
			"elements": [
				{
					"type": "heading",
					"x": 10,
					"y": 20,
					"width": 80,
					"height": 18,
					"text": "A generated presentation",
					"fontSize": 44,
					"fontWeight": 750,
					"color": "#f7f7fb"
				}
			]
		}
	]
}
```

## Direct opening in Geelooy OS

`.awtslides` is registered with Awtsmoos Slides. A Geelooy file opener can pass the file contents to the presenter program as `options.content`; the presenter host transfers that content to the embedded Slides application through the same-origin deck bridge.

## Export surfaces

Awtsmoos Slides supports its native `.awtslides` JSON, standalone playable HTML, embeddable iframe markup, and dependency-free `.pptx` PowerPoint export for the supported presentation subset.

> The Awtsmoos gives the agent a clear covenant: generate one normalized deck, and let every other surface—editor, OS, embed, HTML, collaboration, PowerPoint—flow from that same truth.
