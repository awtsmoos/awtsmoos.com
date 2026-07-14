// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MainMenuStyle.js
 * @description Installs the golden mountain world-browser and studio navigation skin.
 * The Awtsmoos renews one doorway with mountain depth and warm practical light;
 * Awtsmoos.com keeps the menu readable, responsive, keyboard-visible, and finite.
 */

const STYLE_ID = 'Awtsmoos-world-browser-style';

export function installMainMenuStyle() {
	if (document.getElementById(STYLE_ID)) return;
	const style = document.createElement('style');
	style.id = STYLE_ID;
	style.textContent = `
		.Awtsmoos-menu{position:fixed;inset:0;z-index:1000;overflow:auto;color:#fff8df;background:
			linear-gradient(180deg,rgba(3,8,12,.18),rgba(3,8,8,.84)),
			radial-gradient(circle at 18% 8%,#d98d35 0,#274b4c 24%,#071314 64%,#020606 100%);font-family:Georgia,serif}
		.Awtsmoos-menu::before{content:"";position:fixed;inset:0;pointer-events:none;opacity:.24;background:
			linear-gradient(118deg,rgba(255,214,116,.55),transparent 24%),
			repeating-linear-gradient(105deg,transparent 0 58px,rgba(255,222,138,.08) 60px 64px,transparent 66px 128px)}
		.Awtsmoos-menu-bar{position:sticky;top:0;z-index:3;display:flex;align-items:center;gap:14px;padding:13px 18px;
			background:rgba(3,10,10,.78);border-bottom:1px solid rgba(255,204,111,.34);backdrop-filter:blur(14px)}
		.Awtsmoos-menu-bar button{width:46px;height:42px;border:1px solid #dcb066;border-radius:12px;background:#241b11;color:#ffe4aa;font-size:24px}
		.Awtsmoos-menu-bar h1{margin:0;font-size:clamp(20px,4vw,34px);font-weight:500;letter-spacing:.04em}.Awtsmoos-menu-bar output{margin-left:auto;color:#ffd786}
		.Awtsmoos-menu-drawer{position:fixed;left:0;top:69px;bottom:0;z-index:4;width:min(290px,82vw);padding:18px;background:rgba(5,12,12,.96);
			border-right:1px solid #c89850;transform:translateX(-104%);transition:transform .22s;box-shadow:18px 0 50px #0008}
		.Awtsmoos-menu[data-drawer="true"] .Awtsmoos-menu-drawer{transform:translateX(0)}.Awtsmoos-menu-drawer button{width:100%;margin:5px 0;padding:14px;
			border:1px solid #675134;border-radius:12px;background:#161713;color:#fbe5bc;text-align:left;font:700 15px system-ui}
		.Awtsmoos-menu-content{position:relative;width:min(1180px,94vw);margin:0 auto;padding:42px 0 72px}.Awtsmoos-menu-hero{max-width:780px;margin-bottom:28px}
		.Awtsmoos-menu-hero h2{font-size:clamp(36px,7vw,78px);line-height:.96;margin:0 0 16px;color:#fff1c2;text-shadow:0 4px 28px #000}
		.Awtsmoos-menu-hero p{font:16px/1.55 system-ui;color:#d9e9df}.Awtsmoos-player-name{display:flex;gap:10px;max-width:520px;margin:20px 0}
		.Awtsmoos-player-name input{flex:1;min-width:0;padding:13px 15px;border:1px solid #a87f46;border-radius:12px;background:#07100ed9;color:#fff;font:16px system-ui}
		.Awtsmoos-world-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(245px,1fr));gap:15px}.Awtsmoos-world-card{display:flex;min-height:210px;flex-direction:column;
			padding:19px;border:1px solid #7d6038;border-radius:18px;background:linear-gradient(150deg,rgba(31,38,30,.95),rgba(6,14,14,.95));box-shadow:0 16px 38px #0008}
		.Awtsmoos-world-card[data-mode="singlePlayer"]{border-color:#cf9d4f;background:linear-gradient(150deg,#49341ae8,#12231ee8)}.Awtsmoos-world-card h3{margin:0 0 8px;color:#ffe2a0}
		.Awtsmoos-world-card p{font:14px/1.45 system-ui;color:#cddbd4}.Awtsmoos-world-meta{margin-top:auto;display:flex;justify-content:space-between;gap:8px;color:#9ed5c0;font:12px system-ui}
		.Awtsmoos-world-card button,.Awtsmoos-menu-action{margin-top:15px;padding:12px;border:1px solid #d0a457;border-radius:11px;background:#3d2913;color:#fff1c3;font-weight:800;cursor:pointer}
		.Awtsmoos-world-card button:disabled{opacity:.42;cursor:not-allowed}.Awtsmoos-tag-list{display:flex;flex-wrap:wrap;gap:5px}.Awtsmoos-tag{padding:4px 7px;border-radius:999px;background:#ffffff12;font:10px system-ui}
		.Awtsmoos-menu-status{min-height:24px;margin:18px 0;color:#ffd684;font:14px system-ui}.Awtsmoos-menu-actions{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:14px}
		.Awtsmoos-menu-action{min-height:110px;text-align:left;font-size:18px}.Awtsmoos-menu-action small{display:block;margin-top:8px;color:#c8d8d0;font:12px system-ui}
		.Awtsmoos-menu button:focus-visible,.Awtsmoos-menu input:focus-visible{outline:3px solid #ffe08a;outline-offset:2px}@media(max-width:620px){.Awtsmoos-menu-bar output{display:none}.Awtsmoos-menu-content{padding-top:26px}}
	`;
	document.head.appendChild(style);
}
