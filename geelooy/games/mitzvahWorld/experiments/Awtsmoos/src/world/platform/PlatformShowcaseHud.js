// B"H
// Boruch Hashem
// Blessed is He

/** @file PlatformShowcaseHud.js @description Visible evidence for the extreme platform mode. */
const STYLE_ID = 'Awtsmoos-platform-showcase-style';

export function installPlatformShowcaseHud(diagnostics) {
	installStyle();
	const panel = document.createElement('aside');
	panel.dataset.platformShowcase = 'ready';
	panel.className = 'Awtsmoos-platform-showcase';
	panel.innerHTML = `
		<header><b>B"H Extreme Platform</b><span>LIVE</span></header>
		<p>Walk forward into generated terrain, a flowing river, a constructed well,
			and the complete 113-species procedural garden.</p>
		<dl>
			<div><dt>Botanical species</dt><dd>${diagnostics.botanicalSpecies}</dd></div>
			<div><dt>Rendered meshes</dt><dd>${diagnostics.meshes}</dd></div>
			<div><dt>Inserted colliders</dt><dd>${diagnostics.colliders}</dd></div>
			<div><dt>Firebase water map</dt><dd>${diagnostics.firebaseWater.ok ? 'loaded' : 'fallback'}</dd></div>
			<div><dt>Water GLSL</dt><dd>${diagnostics.waterShader.exposed ? 'exposed' : 'missing'}</dd></div>
		</dl>
		<small>Press movement controls to explore. This panel reports measured runtime state.</small>
	`;
	document.body.appendChild(panel);
	return panel;
}

function installStyle() {
	if (document.getElementById(STYLE_ID)) return;
	const style = document.createElement('style');
	style.id = STYLE_ID;
	style.textContent = `
		.Awtsmoos-platform-showcase{position:fixed;right:14px;top:14px;z-index:40;width:min(340px,calc(100vw - 28px));
			padding:14px;border:1px solid #8fffe4;border-radius:18px;background:rgba(2,14,18,.84);color:#edfffa;
			box-shadow:0 18px 56px rgba(0,0,0,.5),0 0 24px rgba(53,255,216,.16);backdrop-filter:blur(9px);pointer-events:none}
		.Awtsmoos-platform-showcase header{display:flex;justify-content:space-between;gap:12px;color:#fff0a8}
		.Awtsmoos-platform-showcase header span{color:#7dffb2;font-size:11px;letter-spacing:.12em}
		.Awtsmoos-platform-showcase p{margin:9px 0;color:#c8eee6;font-size:12px;line-height:1.4}
		.Awtsmoos-platform-showcase dl{display:grid;gap:4px;margin:0}.Awtsmoos-platform-showcase dl div{display:flex;justify-content:space-between;
			gap:12px;padding:4px 0;border-bottom:1px solid rgba(255,255,255,.08);font-size:12px}
		.Awtsmoos-platform-showcase dt{color:#9ccfc6}.Awtsmoos-platform-showcase dd{margin:0;color:#fff;font-weight:800}
		.Awtsmoos-platform-showcase small{display:block;margin-top:9px;color:#7daea6}
		@media(max-width:720px){.Awtsmoos-platform-showcase{top:auto;right:10px;bottom:180px;width:220px}.Awtsmoos-platform-showcase p{display:none}}
	`;
	document.head.appendChild(style);
}
