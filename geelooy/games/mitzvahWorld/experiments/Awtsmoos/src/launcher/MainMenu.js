// B"H
/**
 * @file MainMenu.js
 * @description A short threshold: enter the world or enter the movie workshop.
 */
const STYLE_ID = 'Awtsmoos-main-menu-style';

function installStyle() {
	if (document.getElementById(STYLE_ID)) return;
	const style = document.createElement('style');
	style.id = STYLE_ID;
	style.textContent = `
		.Awtsmoos-main-menu{position:fixed;inset:0;z-index:1000;display:grid;place-items:center;
			background:radial-gradient(circle at 50% 22%,#24544c 0,#0a211c 38%,#020806 100%);color:#effffb}
		.Awtsmoos-main-menu::before{content:"";position:absolute;inset:0;opacity:.18;background:
			repeating-linear-gradient(90deg,transparent 0 80px,rgba(255,255,255,.08) 81px)}
		.Awtsmoos-main-menu article{position:relative;width:min(90vw,620px);padding:38px;border:1px solid #75f4d6;
			border-radius:28px;background:rgba(3,15,13,.86);box-shadow:0 32px 90px #000,0 0 40px rgba(90,255,220,.18);text-align:center}
		.Awtsmoos-main-menu h1{margin:0;font-size:clamp(34px,7vw,72px);letter-spacing:-.04em;color:#fff5bc}
		.Awtsmoos-main-menu p{margin:12px auto 28px;max-width:470px;color:#c8eee6;line-height:1.55}
		.Awtsmoos-main-menu nav{display:grid;grid-template-columns:1fr 1fr;gap:14px}
		.Awtsmoos-main-menu button{min-height:86px;border-radius:18px;border:1px solid rgba(255,255,255,.24);
			background:linear-gradient(145deg,#17493f,#0b2822);color:#fff;font:700 17px system-ui;cursor:pointer}
		.Awtsmoos-main-menu button:last-child{background:linear-gradient(145deg,#75551c,#34240b);color:#fff4c9}
		.Awtsmoos-main-menu button:hover{transform:translateY(-2px);filter:brightness(1.18)}
		.Awtsmoos-main-menu small{display:block;margin-top:16px;color:#79b7aa}
		@media(max-width:600px){.Awtsmoos-main-menu article{padding:26px 20px}.Awtsmoos-main-menu nav{grid-template-columns:1fr}}
	`;
	document.head.appendChild(style);
}

export function setGameHostsVisible(hosts, visible) {
	for (const host of Object.values(hosts || {})) {
		if (!host?.style) continue;
		host.style.visibility = visible ? '' : 'hidden';
	}
}

export function showMainMenu(hosts, handlers = {}) {
	installStyle();
	setGameHostsVisible(hosts, false);
	const menu = document.createElement('main');
	menu.className = 'Awtsmoos-main-menu';
	menu.innerHTML = `
		<article>
			<div>B"H</div>
			<h1>Mitzvah World</h1>
			<p>Walk directly into Eretz, or enter the cinematic workshop where JSON becomes actors, cameras, dialogue, doors, and rendered movies.</p>
			<nav>
				<button data-world>Enter World<br><small>Play immediately</small></button>
				<button data-movie>Movie Maker<br><small>AI JSON + NLE timeline</small></button>
			</nav>
			<small>Every frame is drawn from the real world runtime.</small>
		</article>
	`;
	document.body.appendChild(menu);
	const choose = async (kind) => {
		menu.querySelectorAll('button').forEach((button) => button.disabled = true);
		menu.querySelector('p').textContent = kind === 'world'
			? 'Opening the world…'
			: 'Opening the movie workshop…';
		await handlers[kind]?.();
		menu.remove();
		setGameHostsVisible(hosts, true);
	};
	menu.querySelector('[data-world]').addEventListener('click', () => choose('world'));
	menu.querySelector('[data-movie]').addEventListener('click', () => choose('movie'));
	return menu;
}
