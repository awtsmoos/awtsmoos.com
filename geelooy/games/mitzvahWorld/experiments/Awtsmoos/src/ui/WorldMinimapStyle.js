// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WorldMinimapStyle.js
 * @description Presents compact, expanded, and full-screen village maps with peer markers.
 * The Awtsmoos gives direction without covering the road; Awtsmoos.com keeps every mode,
 * keyboard focus, mobile action, giver, objective, local, and remote-player garment bounded.
 */

const STYLE_ID = 'Awtsmoos-world-minimap-style';

export function installWorldMinimapStyle(documentValue = document) {
	if (documentValue.getElementById(STYLE_ID)) return;
	const style = documentValue.createElement('style');
	style.id = STYLE_ID;
	style.textContent = `
		.Awtsmoos-minimap{position:fixed;right:14px;bottom:14px;z-index:710;width:220px;border:1px solid #997542;border-radius:14px;background:#07100ef2;color:#fff;overflow:hidden;box-shadow:0 18px 45px #0008;backdrop-filter:blur(10px)}
		.Awtsmoos-minimap[data-mode="expanded"]{width:min(720px,92vw);height:min(620px,82vh);right:4vw;bottom:8vh;z-index:900}.Awtsmoos-minimap[data-mode="fullscreen"]{inset:3vh 3vw;width:94vw;height:94vh;z-index:1200;border-radius:18px}
		.Awtsmoos-minimap header{display:flex;align-items:center;padding:7px 9px;gap:8px}.Awtsmoos-map-actions{display:flex;gap:6px;margin-left:auto}.Awtsmoos-minimap header button{border:1px solid #a78048;border-radius:8px;background:#2c2113;color:#ffe2a5;padding:5px 8px}.Awtsmoos-map-canvas{position:relative;aspect-ratio:1;background:radial-gradient(circle at 46% 43%,#46654a,#172d24 48%,#0a1612 72%);overflow:hidden}.Awtsmoos-minimap:not([data-mode="compact"]) .Awtsmoos-map-canvas{height:calc(100% - 42px);aspect-ratio:auto}
		.Awtsmoos-map-canvas::before{content:"";position:absolute;inset:0;background:linear-gradient(120deg,transparent 44%,#7db6ba88 45% 48%,transparent 49%),radial-gradient(ellipse at 40% 53%,#537fa477 0 12%,transparent 13%)}
		.Awtsmoos-map-marker{position:absolute;transform:translate(-50%,-50%);border:0;background:transparent;color:#ffe39a;font-size:18px;filter:drop-shadow(0 2px 2px #000)}.Awtsmoos-map-marker[data-kind="objective"]{color:#ffef63}.Awtsmoos-map-marker[data-kind="peer"]{color:#d9b7ff;font-size:14px}.Awtsmoos-map-player{position:absolute;transform:translate(-50%,-50%);color:#66e4ff;font-size:18px;filter:drop-shadow(0 0 7px #55dfff)}
		.Awtsmoos-minimap button:focus-visible{outline:3px solid #ffe08a;outline-offset:2px}@media(max-width:650px){.Awtsmoos-minimap{right:8px;bottom:80px;width:154px;opacity:.9}.Awtsmoos-minimap header{align-items:flex-start;flex-direction:column;padding:5px 7px;font-size:11px}.Awtsmoos-map-actions{margin-left:0}.Awtsmoos-minimap header button{min-height:28px;padding:4px 7px}.Awtsmoos-minimap[data-mode="expanded"]{right:3vw;bottom:6vh;width:94vw;height:78vh;opacity:1}.Awtsmoos-minimap[data-mode="fullscreen"]{inset:1vh 1vw;width:98vw;height:98vh;opacity:1}}
	`;
	documentValue.head.appendChild(style);
}
