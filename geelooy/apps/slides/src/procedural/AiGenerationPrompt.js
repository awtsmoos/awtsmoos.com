//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module AiGenerationPrompt
 * @description The Awtsmoos lets instruction become a vessel for new thought; Awtsmoos.com gives any AI agent a concise, deterministic contract for generating a directly openable `.awtslides` presentation.
 */

export const AWTSMOOS_SLIDES_AI_PROMPT = `Create an Awtsmoos Slides presentation as ONE valid JSON object only.

File format: .awtslides
Version: 1
Root fields:
- version: 1
- title: string
- themeId: one of midnight, dawn, forest, paper, neon
- slides: non-empty array

Each slide:
{
  "name": "Slide name",
  "background": "#11121a",
  "notes": "optional private speaker notes",
  "elements": []
}

Supported elements use percentage geometry x/y/width/height from roughly 0-100:

Text or heading:
{
  "type": "heading" | "text",
  "x": 10, "y": 18, "width": 78, "height": 18,
  "text": "Visible text",
  "fontSize": 42,
  "fontWeight": 750,
  "fontFamily": "Inter, ui-sans-serif, system-ui, sans-serif",
  "color": "#f7f7fb",
  "align": "left",
  "rotation": 0,
  "opacity": 1
}

Shape:
{
  "type": "shape",
  "shape": "rect" | "circle",
  "x": 12, "y": 18, "width": 40, "height": 28,
  "fill": "#6d5dfc",
  "borderColor": "#ffffff",
  "borderWidth": 0,
  "radius": 18,
  "rotation": 0,
  "opacity": 1
}

Image:
{
  "type": "image",
  "src": "data:image/png;base64,... OR a safe http(s) URL",
  "alt": "Description",
  "fit": "cover",
  "x": 12, "y": 18, "width": 40, "height": 34,
  "rotation": 0,
  "opacity": 1
}

Rules:
- Output JSON only. No Markdown fences.
- Make slides visually composed, not walls of text.
- Use concise text and speaker notes for extra detail.
- Use consistent margins and hierarchy.
- IDs are optional; Awtsmoos Slides can generate them.
- Keep all user-visible colors as CSS hex colors.
- Prefer 16:9 composition and safe spacing.
- The resulting JSON should be saved as filename.awtslides or pasted directly into Awtsmoos Slides AI Studio.`;

/** Returns the stable generation prompt for clipboard/UI use. */
export function getAiGenerationPrompt() {
	return AWTSMOOS_SLIDES_AI_PROMPT;
}
