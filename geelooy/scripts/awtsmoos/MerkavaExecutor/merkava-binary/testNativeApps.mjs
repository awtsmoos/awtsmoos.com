// B"H
// 10 native app tests: compile ANY html/css/js -> .mapp -> run on VM -> verify.

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { compileNativeApp, inspectNativeApp, packMerkavaContainer } = require('./NativeAppCompiler.js');
const { runNativeApp, visibleText, getById } = require('./NativeAppRunner.js');

let pass = 0, fail = 0;
function ok(name, cond, detail = '') {
	if (cond) { pass++; console.log(`  PASS ${name}`); }
	else { fail++; console.log(`  FAIL ${name} ${detail}`); }
}

const APPS = [
	{
		name: 'todo',
		html: `<div id="todo"><h1 id="head">Tasks</h1><ul id="list"><li id="li1">Buy milk</li></ul><button id="add">Add</button></div>`,
		css: `#head { color: navy; } #add { color: green; } li { color: black; }`,
		js: `var n = 1; document.getElementById('add').addEventListener('click', function(){ n = n + 1; document.getElementById('head').textContent = 'Tasks (' + n + ')'; });`,
		check(app) {
			ok('todo-head', getById(app.document, 'head').textContent === 'Tasks');
			ok('todo-style', getById(app.document, 'add').style.color === 'green');
			app.trigger('add', 'click');
			ok('todo-click', getById(app.document, 'head').textContent === 'Tasks (2)');
		}
	},
	{
		name: 'calculator',
		html: `<div id="calc"><div id="display">0</div><button id="b2">2</button><button id="b3">3</button><button id="plus">+</button><button id="eq">=</button></div>`,
		css: `#display { color: black; } button { color: blue; }`,
		js: `var cur = ''; var acc = 0; var op = '';
			document.getElementById('b2').addEventListener('click', function(){ cur = cur + '2'; document.getElementById('display').textContent = cur; });
			document.getElementById('b3').addEventListener('click', function(){ cur = cur + '3'; document.getElementById('display').textContent = cur; });
			document.getElementById('plus').addEventListener('click', function(){ acc = Number(cur); cur = ''; op = '+'; });
			document.getElementById('eq').addEventListener('click', function(){ var r = acc + Number(cur); document.getElementById('display').textContent = '' + r; });`,
		check(app) {
			app.trigger('b2', 'click'); app.trigger('plus', 'click'); app.trigger('b3', 'click'); app.trigger('eq', 'click');
			ok('calc-2+3=5', getById(app.document, 'display').textContent === '5', getById(app.document, 'display').textContent);
		}
	},
	{
		name: 'chat',
		html: `<div id="chat"><h2 id="ctitle">Chat</h2><div id="msgs"><div id="m1">Hi</div></div><button id="send">Send</button></div>`,
		css: `#ctitle { color: purple; } #m1 { color: gray; }`,
		js: `var c = 1; document.getElementById('send').addEventListener('click', function(){ c = c + 1; document.getElementById('ctitle').textContent = 'Chat (' + c + ')'; });`,
		check(app) {
			ok('chat-title', getById(app.document, 'ctitle').textContent === 'Chat');
			app.trigger('send', 'click');
			ok('chat-count', getById(app.document, 'ctitle').textContent === 'Chat (2)');
		}
	},
	{
		name: 'tapgame',
		html: `<div id="game"><h1 id="score">Score: 0</h1><button id="target">Tap me</button></div>`,
		css: `#score { color: orange; } #target { color: red; }`,
		js: `var s = 0; document.getElementById('target').addEventListener('click', function(){ s = s + 1; document.getElementById('score').textContent = 'Score: ' + s; });`,
		check(app) {
			app.trigger('target', 'click'); app.trigger('target', 'click'); app.trigger('target', 'click');
			ok('game-score3', getById(app.document, 'score').textContent === 'Score: 3');
		}
	},
	{
		name: 'wizard',
		html: `<div id="wiz"><div id="step">Step 1</div><button id="next">Next</button><button id="prev">Back</button></div>`,
		css: `#step { color: teal; }`,
		js: `var st = 1; document.getElementById('next').addEventListener('click', function(){ st = st + 1; document.getElementById('step').textContent = 'Step ' + st; }); document.getElementById('prev').addEventListener('click', function(){ st = st - 1; document.getElementById('step').textContent = 'Step ' + st; });`,
		check(app) {
			app.trigger('next', 'click'); app.trigger('next', 'click');
			ok('wiz-step3', getById(app.document, 'step').textContent === 'Step 3');
			app.trigger('prev', 'click');
			ok('wiz-step2', getById(app.document, 'step').textContent === 'Step 2');
		}
	},
	{
		name: 'dashboard',
		html: `<div id="dash"><h1 id="dtitle">Stats</h1><div id="users">0 users</div><div id="sales">0 sales</div></div>`,
		css: `#dtitle { color: darkblue; } #users { color: green; } #sales { color: red; }`,
		js: `var data = { users: 42, sales: 7 }; document.getElementById('users').textContent = data.users + ' users'; document.getElementById('sales').textContent = data.sales + ' sales';`,
		check(app) {
			ok('dash-users', getById(app.document, 'users').textContent === '42 users');
			ok('dash-sales', getById(app.document, 'sales').textContent === '7 sales');
		}
	},
	{
		name: 'blogreader',
		html: `<div id="blog"><h1 id="btitle">Posts</h1><div id="p1">First post</div><button id="open">Read</button><div id="body"></div></div>`,
		css: `#btitle { color: brown; }`,
		js: `document.getElementById('open').addEventListener('click', function(){ document.getElementById('body').textContent = 'Full article text here.'; });`,
		check(app) {
			app.trigger('open', 'click');
			ok('blog-body', getById(app.document, 'body').textContent === 'Full article text here.');
		}
	},
	{
		name: 'musicplayer',
		html: `<div id="player"><div id="track">Song A</div><button id="play">Play</button></div>`,
		css: `#track { color: magenta; } #play { color: green; }`,
		js: `var playing = false; document.getElementById('play').addEventListener('click', function(){ playing = !playing; document.getElementById('play').textContent = playing ? 'Pause' : 'Play'; });`,
		check(app) {
			app.trigger('play', 'click');
			ok('music-pause', getById(app.document, 'play').textContent === 'Pause');
			app.trigger('play', 'click');
			ok('music-play', getById(app.document, 'play').textContent === 'Play');
		}
	},
	{
		name: 'settings',
		html: `<div id="set"><h1 id="stitle">Settings</h1><button id="dark">Dark: off</button></div>`,
		css: `#stitle { color: black; }`,
		js: `var dark = false; document.getElementById('dark').addEventListener('click', function(){ dark = !dark; document.getElementById('dark').textContent = 'Dark: ' + (dark ? 'on' : 'off'); });`,
		check(app) {
			app.trigger('dark', 'click');
			ok('settings-on', getById(app.document, 'dark').textContent === 'Dark: on');
		}
	},
	{
		name: 'hebrew',
		html: `<div id="heb" dir="rtl"><h1 id="h1">בס"ד שלום עולם</h1><button id="hb">לחץ</button></div>`,
		css: `#h1 { color: navy; }`,
		js: `document.getElementById('hb').addEventListener('click', function(){ document.getElementById('h1').textContent = 'נלחץ!'; });`,
		check(app) {
			ok('heb-text', getById(app.document, 'h1').textContent === 'בס"ד שלום עולם');
			app.trigger('hb', 'click');
			ok('heb-click', getById(app.document, 'h1').textContent === 'נלחץ!');
		}
	}
];

let totalBin = 0, totalSrc = 0, totalMs = 0;
for (const t of APPS) {
	console.log(`\n[app] ${t.name}`);
	const srcBytes = Buffer.byteLength(t.html + t.css + t.js, 'utf8');
	const { binary, meta } = await compileNativeApp({ html: t.html, css: t.css, js: t.js, appName: t.name });
	totalBin += binary.length; totalSrc += srcBytes;
	const insp = inspectNativeApp(binary);
	ok(`${t.name}-native`, insp.ok, JSON.stringify(insp.checks.filter(c => !c.pass)));
	const container = packMerkavaContainer(binary, { appName: t.name });
	ok(`${t.name}-container`, Buffer.from(container.slice(0, 4)).toString() === 'MKV1', 'MKV1 magic');
	const app = runNativeApp(binary);
	totalMs += app.startupMs;
	ok(`${t.name}-runs`, app.ok, `startupMs=${app.startupMs}`);
	try { t.check(app); } catch (e) { ok(`${t.name}-check`, false, e.message); }
	console.log(`  src=${srcBytes}B bin=${binary.length}B container=${container.length}B startup=${app.startupMs}ms`);
}

console.log(`\n==== ${pass} pass, ${fail} fail ====`);
console.log(`total src=${totalSrc}B total bin=${totalBin}B avg startup=${Math.round(totalMs / APPS.length)}ms`);
process.exit(fail ? 1 : 0);
