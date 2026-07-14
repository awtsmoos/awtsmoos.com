// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MainMenu.js
 * @description One threshold into the world, extreme platform, materials, and cinema.
 */
const STYLE_ID = 'Awtsmoos-main-menu-style';
const CHOICES = Object.freeze([
	Object.freeze({ kind: 'world', title: 'Enter World', note: 'Play immediately' }),
	Object.freeze({ kind: 'platform', title: 'Extreme Platform', note: 'Generated terrain, river, well, and 113 plants' }),
	Object.freeze({ kind: 'missionMovie', title: 'Two-Minute Mission Film', note: 'Walking, talking, cameras, and NLE timeline' }),
	Object.freeze({ kind: 'movie', title: 'Movie Maker', note: 'AI JSON + nonlinear editor' }),
	Object.freeze({ kind: 'materials', title: 'Material Lab', note: 'Public Firebase texture evidence' })
]);

function installStyle() {
	if (document.getElementById(STYLE_ID)) return;
	const style = document.createElement('style');
	style.id = STYLE_ID;
	style.textContent = `
		.Awtsmoos-main-menu{position:fixed;inset:0;z-index:1000;display:grid;place-items:center;overflow:auto;padding:24px;
			background:radial-gradient(circle at 50% 18%,#24544c 0,#0a211c 38%,#020806 100%);color:#effffb}
		.Awtsmoos-main-menu::before{content:"";position:absolute;inset:0;opacity:.18;background:
			repeating-linear-gradient(90deg,transparent 0 80px,rgba(255,255,255,.08) 81px)}
		.Awtsmoos-main-menu article{position:relative;width:min(94vw,850px);padding:34px;border:1px solid #75f4d6;
			border-radius:28px;background:rgba(3,15,13,.88);box-shadow:0 32px 90px #000,0 0 40px rgba(90,255,220,.18);text-align:center}
		.Awtsmoos-main-menu h1{margin:0;font-size:clamp(34px,7vw,72px);letter-spacing:-.04em;color:#fff5bc}
		.Awtsmoos-main-menu p{margin:12px auto 26px;max-width:650px;color:#c8eee6;line-height:1.55}
		.Awtsmoos-main-menu nav{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
		.Awtsmoos-main-menu button{min-height:86px;padding:14px;border-radius:18px;border:1px solid rgba(255,255,255,.24);
			background:linear-gradient(145deg,#17493f,#0b2822);color:#fff;font:700 16px system-ui;cursor:pointer}
		.Awtsmoos-main-menu button[data-kind="platform"]{grid-column:1/-1;background:linear-gradient(145deg,#166354,#092d27);color:#fff8c8}
		.Awtsmoos-main-menu button[data-kind="missionMovie"]{background:linear-gradient(145deg,#75551c,#34240b);color:#fff4c9}
		.Awtsmoos-main-menu button:hover{transform:translateY(-2px);filter:brightness(1.18)}
		.Awtsmoos-main-menu small{display:block;margin-top:7px;color:#8fc9bd;font-weight:500}
		@media(max-width:640px){.Awtsmoos-main-menu article{padding:24px 18px}.Awtsmoos-main-menu nav{grid-template-columns:1fr}
			.Awtsmoos-main-menu button[data-kind="platform"]{grid-column:auto}}
	`;
	document.head.appendChild(style);
}

export function setGameHostsVisible(hosts, visible) {
	for (const host of Object.values(hosts || {})) {
		if (host?.style) host.style.visibility = visible ? '' : 'hidden';
	}
}

export function showMainMenu(hosts, handlers = {}) {
	installStyle();
	setGameHostsVisible(hosts, false);
	const menu = document.createElement('main');
	menu.className = 'Awtsmoos-main-menu';
	menu.innerHTML = `
		<article>
			<div>B"H</div><h1>Mitzvah World</h1>
			<p>Enter the playable world, reveal the generated platform, inspect public materials,
				or direct a complete JSON-authored cinematic timeline.</p>
			<nav>${CHOICES.map(choice => `
				<button data-kind="${choice.kind}">${choice.title}<small>${choice.note}</small></button>
			`).join('')}</nav>
			<small>Every mode enters the real production runtime.</small>
		</article>
	`;
	document.body.appendChild(menu);
	menu.querySelectorAll('[data-kind]').forEach(button => {
		button.addEventListener('click', () => choose(menu, hosts, handlers, button.dataset.kind));
	});
	return menu;
}

async function choose(menu, hosts, handlers, kind) {
	menu.querySelectorAll('button').forEach(button => { button.disabled = true; });
	menu.querySelector('p').textContent = `Opening ${kind.replace(/([A-Z])/g, ' $1').toLowerCase()}…`;
	await handlers[kind]?.();
	menu.remove();
	setGameHostsVisible(hosts, true);
}
