// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file GameplayUiStyles.js
 * @description Styles quest offers, scroll logs, tracker, minimap, Torah library, and bag.
 * The Awtsmoos renews every mission as a readable golden vessel; Awtsmoos.com keeps
 * dense gameplay controls responsive, keyboard-visible, bounded, and off the world center.
 */

const STYLE_ID = 'Awtsmoos-gameplay-ui-style';

export function installGameplayUiStyles() {
	if (document.getElementById(STYLE_ID)) return;
	const style = document.createElement('style');
	style.id = STYLE_ID;
	style.textContent = `
		.Awtsmoos-modal-backdrop{position:fixed;inset:0;z-index:910;background:#020403b8;display:grid;place-items:center;padding:16px;backdrop-filter:blur(8px)}
		.Awtsmoos-modal-backdrop[hidden]{display:none}.Awtsmoos-quest-offer{width:min(600px,94vw);max-height:88vh;overflow:auto;padding:24px;border:2px solid #e0ad49;border-radius:20px;
			background:linear-gradient(145deg,#24170b,#090d0a 70%);color:#fff1c8;box-shadow:0 25px 80px #000,0 0 40px #d6912866;font:15px/1.55 system-ui}
		.Awtsmoos-quest-offer h2{margin:0;color:#ffd778;font:34px Georgia}.Awtsmoos-quest-offer .giver{color:#9fd7bd}.Awtsmoos-objectives{padding-left:22px}.Awtsmoos-objectives li{margin:7px 0}
		.Awtsmoos-offer-actions{display:flex;gap:10px;justify-content:flex-end}.Awtsmoos-offer-actions button,.Awtsmoos-quest-button{padding:10px 14px;border:1px solid #d6a14c;border-radius:10px;background:#3d2912;color:#ffe7ae;font-weight:800}
		.Awtsmoos-quest-log{position:fixed;inset:8vh 7vw;z-index:890;overflow:auto;padding:18px;border:1px solid #c99a4e;border-radius:18px;background:#07100ff2;color:#eaf4ef;box-shadow:0 22px 80px #000;font:13px system-ui}
		.Awtsmoos-quest-log[hidden]{display:none}.Awtsmoos-panel-header{display:flex;align-items:center;gap:10px;position:sticky;top:0;background:#07100f;padding:8px 0;z-index:2}.Awtsmoos-panel-header h2{margin:0;color:#f7cf79}.Awtsmoos-panel-header button{margin-left:auto}
		.Awtsmoos-quest-tabs{display:flex;gap:6px;overflow:auto;margin:10px 0}.Awtsmoos-quest-tabs button{padding:8px 11px;border:1px solid #3e554d;border-radius:999px;background:#10201b;color:#cfe1da}.Awtsmoos-quest-tabs button[aria-selected="true"]{border-color:#d7a34c;color:#ffe4a1;background:#3a2915}
		.Awtsmoos-quest-card{padding:13px;margin:8px 0;border:1px solid #30473f;border-radius:12px;background:#101b18}.Awtsmoos-quest-card h3{margin:0 0 6px;color:#f3cf85}.Awtsmoos-quest-card footer{display:flex;gap:6px;flex-wrap:wrap}.Awtsmoos-progress{height:7px;border-radius:999px;background:#ffffff16;overflow:hidden}.Awtsmoos-progress span{display:block;height:100%;background:linear-gradient(90deg,#d39b3a,#ffe39a)}
		.Awtsmoos-quest-tracker{position:fixed;right:14px;top:78px;z-index:720;width:min(300px,42vw);padding:10px;border:1px solid #9e7a42;border-radius:13px;background:#07100edc;color:#e9f3ed;font:12px system-ui;backdrop-filter:blur(8px)}
		.Awtsmoos-quest-tracker[hidden]{display:none}.Awtsmoos-tracked-quest{margin:6px 0;padding:7px;border-radius:8px;background:#ffffff09}.Awtsmoos-tracked-quest b{color:#ffd47e}
		.Awtsmoos-minimap{position:fixed;right:14px;bottom:14px;z-index:710;width:220px;border:1px solid #997542;border-radius:14px;background:#07100ee8;color:#fff;overflow:hidden}.Awtsmoos-minimap[data-expanded="true"]{width:min(720px,92vw);height:min(620px,82vh);right:4vw;bottom:8vh;z-index:900}
		.Awtsmoos-minimap header{display:flex;align-items:center;padding:7px 9px}.Awtsmoos-minimap header button{margin-left:auto}.Awtsmoos-map-canvas{position:relative;aspect-ratio:1;background:radial-gradient(circle at 46% 43%,#46654a,#172d24 48%,#0a1612 72%);overflow:hidden}.Awtsmoos-map-canvas::before{content:"";position:absolute;inset:0;background:linear-gradient(120deg,transparent 44%,#7db6ba88 45% 48%,transparent 49%),radial-gradient(ellipse at 40% 53%,#537fa477 0 12%,transparent 13%)}
		.Awtsmoos-map-marker{position:absolute;transform:translate(-50%,-50%);border:0;background:transparent;font-size:18px;filter:drop-shadow(0 2px 2px #000)}.Awtsmoos-map-player{position:absolute;transform:translate(-50%,-50%);width:12px;height:12px;border-radius:50%;background:#66e4ff;box-shadow:0 0 10px #55dfff}
		.Awtsmoos-torah-library{position:fixed;inset:7vh 8vw;z-index:900;overflow:auto;padding:18px;border:1px solid #b88a40;border-radius:18px;background:#100b08f4;color:#f4e8c8}.Awtsmoos-torah-library[hidden]{display:none}.Awtsmoos-book-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:10px}.Awtsmoos-book{padding:13px;border:1px solid #53452f;border-radius:12px;background:#1b1510}.Awtsmoos-passage{display:grid;grid-template-columns:1fr auto;gap:7px;padding:9px;margin:7px 0;border-radius:8px;background:#ffffff0b}.Awtsmoos-passage small{color:#d1bd8f}.Awtsmoos-golden-marker{position:fixed;z-index:650;color:#ffd353;font:bold 34px Georgia;text-shadow:0 0 8px #ffb300,0 3px 3px #000;animation:AwtsmoosMarker 1.2s ease-in-out infinite alternate}
		@keyframes AwtsmoosMarker{to{transform:translateY(-8px);filter:brightness(1.3)}}.Awtsmoos-gameplay button:focus-visible,.Awtsmoos-gameplay [tabindex]:focus-visible{outline:3px solid #ffe08a;outline-offset:2px}
		@media(max-width:650px){.Awtsmoos-quest-log,.Awtsmoos-torah-library{inset:4vh 3vw}.Awtsmoos-quest-tracker{top:68px;right:8px;width:54vw}.Awtsmoos-minimap{right:8px;bottom:80px;width:150px}}
	`;
	document.head.appendChild(style);
}
