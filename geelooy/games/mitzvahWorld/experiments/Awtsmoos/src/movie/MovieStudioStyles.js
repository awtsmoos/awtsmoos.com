// B"H
/** @file MovieStudioStyles.js @description Installs the compact NLE and preview layout. */
const STYLE_ID = 'Awtsmoos-movie-studio-style';

export function installMovieStudioStyles() {
	if (document.getElementById(STYLE_ID)) return;
	const style = document.createElement('style');
	style.id = STYLE_ID;
	style.textContent = `
		.Awtsmoos-movie-studio{position:fixed;inset:0;z-index:900;display:grid;grid-template-rows:minmax(0,1fr) 270px;
			background:#05080d;color:#eaffff;font:13px system-ui;user-select:text}
		.movie-workspace{min-height:0;display:grid;grid-template-columns:minmax(0,1fr) 360px;gap:8px;padding:8px}
		.movie-preview{min-height:0;display:grid;place-items:center;background:#010304;border:1px solid #294d56;border-radius:14px;overflow:hidden}
		.movie-preview canvas{position:static;width:min(100%,calc(100vh * 1.34));height:auto;max-height:100%;aspect-ratio:16/9;object-fit:contain}
		.movie-inspector{min-height:0;display:grid;grid-template-rows:auto auto minmax(0,1fr) auto;gap:8px;padding:10px;
			border:1px solid #294d56;border-radius:14px;background:#0a141a;overflow:hidden}
		.movie-inspector h2{margin:0;color:#fff0ad;font-size:18px}.movie-inspector p{margin:0;color:#94c9c9}
		.movie-toolbar{display:flex;gap:6px;flex-wrap:wrap}.movie-toolbar button{border:1px solid #4a7f89;border-radius:9px;
			background:#12313a;color:#fff;padding:8px 10px;font:700 12px system-ui;cursor:pointer}.movie-toolbar button[data-render]{background:#6d5016;color:#fff4c8}
		.movie-toolbar button:disabled{opacity:.45}.movie-json{width:100%;min-height:0;resize:none;box-sizing:border-box;border:1px solid #31515a;
			border-radius:10px;background:#02070a;color:#bfffee;padding:10px;font:11px/1.45 ui-monospace,monospace}
		.movie-status{min-height:20px;color:#9fffe7}.movie-timeline-shell{position:relative;min-height:0;overflow:auto;
			border-top:1px solid #31515a;background:#071016}.movie-ruler{position:sticky;top:0;z-index:6;height:28px;margin-left:130px;
			background:repeating-linear-gradient(90deg,#0f2229 0 1px,transparent 1px 60px),#091820;color:#9bc7ca}
		.movie-track{position:relative;display:grid;grid-template-columns:130px 1fr;min-height:31px;border-top:1px solid rgba(255,255,255,.07)}
		.movie-track-label{position:sticky;left:0;z-index:4;padding:7px 9px;background:#0b1c24;color:#bdecec;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
		.movie-track-lane{position:relative;min-width:900px}.movie-clip{position:absolute;top:4px;height:23px;border-radius:6px;border:1px solid rgba(255,255,255,.25);
			background:#225768;color:#fff;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;padding:3px 6px;box-sizing:border-box;font-size:10px}
		.movie-track[data-type=actor] .movie-clip{background:#315f9d}.movie-track[data-type=camera] .movie-clip{background:#704ca1}
		.movie-track[data-type=dialogue] .movie-clip{background:#9b5d30}.movie-track[data-type=audio] .movie-clip{background:#47772f}
		.movie-track[data-type=door] .movie-clip{background:#8b4b3d}.movie-playhead{position:absolute;top:28px;bottom:0;width:2px;
			background:#ffe064;box-shadow:0 0 8px #ffe064;z-index:8;pointer-events:none;transform:translateX(130px)}
		.movie-playhead::before{content:"";position:absolute;top:-6px;left:-5px;border-left:6px solid transparent;border-right:6px solid transparent;border-top:8px solid #ffe064}
		.movie-loading{position:fixed;inset:0;z-index:1200;display:grid;place-items:center;background:#030908;color:#fff5b5;font-size:22px}
		@media(max-width:850px){.Awtsmoos-movie-studio{grid-template-rows:minmax(0,1fr) 230px}.movie-workspace{grid-template-columns:1fr}.movie-inspector{position:absolute;right:8px;top:8px;width:min(88vw,340px);max-height:52vh;z-index:12}.movie-json{min-height:130px}}
	`;
	document.head.appendChild(style);
}
