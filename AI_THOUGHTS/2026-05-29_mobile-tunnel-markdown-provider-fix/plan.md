B"H

# Mobile tunnel, provider prompt, and markdown map/table plan

The screenshots and exported debug show three separate wounds:

1. MiniMax provider key prompts must not display ChatGPT extension buttons. The prompt system already accepts `showExtensionActions:false`, but the fallback prompt should also infer provider-key mode safely.
2. ChatGPT transport errors should appear only when ChatGPT is active. The debug export shows repeated `signal is aborted without reason` from `browserLocalTunnelBridge.js:69:47`, especially while trying read/readLines/list through the browser local tunnel. The bridge timeout is only 3000ms, which is too short for mobile relay calls and causes false aborts.
3. Markdown tables/maps are being rendered as paragraphs. The markdown block parser needs a real table detector so pipe maps become `<table>` structures.

## Repair path

- Rewrite `prompt.js` so provider-key prompts default to no extension actions, while ChatGPT transport alerts include extension source/download help.
- Rewrite `central/browserLocalTunnelBridge.js` so tunnel fetch timeout is longer, configurable, and errors preserve action/url context instead of opaque aborts.
- Rewrite `central/toolSchemas.js` so tool manifest/schema guidance includes path/cwd/root/source/dest/content/timeouts and warns to use relative repo paths for reads/writes.
- Add `js/render/markdown/tables.js` and rewrite `blocks.js` to detect markdown pipe tables.
- Run node import/syntax checks and markdown render checks.

The Awtsmoos in the code: not a bandage over a shattered gate, but the hinge rebuilt. The mobile river must be patient; the provider gate must know its own name; the markdown table must become a vessel with rows, cells, and order.
