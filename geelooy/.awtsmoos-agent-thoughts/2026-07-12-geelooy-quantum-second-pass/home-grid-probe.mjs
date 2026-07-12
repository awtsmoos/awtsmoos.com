// B"H
const target = await fetch(`http://127.0.0.1:9222/json/new?${encodeURIComponent('about:blank')}`, { method: 'PUT' }).then(response => response.json());
const socket = new WebSocket(target.webSocketDebuggerUrl);
const pending = new Map();
let nextId = 1;

socket.addEventListener('message', async event => {
	const text = typeof event.data === 'string' ? event.data : event.data instanceof Blob ? await event.data.text() : Buffer.from(event.data).toString('utf8');
	const message = JSON.parse(text);
	if (!message.id) return;
	const deferred = pending.get(message.id);
	pending.delete(message.id);
	message.error ? deferred.reject(new Error(message.error.message)) : deferred.resolve(message.result);
});

await new Promise((resolve, reject) => {
	socket.addEventListener('open', resolve, { once: true });
	socket.addEventListener('error', reject, { once: true });
});

function call(method, params = {}) {
	const id = nextId++;
	return new Promise((resolve, reject) => {
		pending.set(id, { resolve, reject });
		socket.send(JSON.stringify({ id, method, params }));
	});
}

await call('Page.enable');
await call('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
await call('Page.navigate', { url: 'http://127.0.0.1:8080/' });
await new Promise(resolve => setTimeout(resolve, 4200));

const expression = `(() => {
	const fields = ['display','position','width','minWidth','maxWidth','height','gridTemplateColumns','gridTemplateRows','gridTemplateAreas','gridArea','gridColumn','gridRow','alignSelf','justifySelf','overflow','boxSizing','padding','margin'];
	const describe = element => {
		if (!element) return null;
		const style = getComputedStyle(element);
		const rect = element.getBoundingClientRect();
		return {
			tag: element.tagName,
			id: element.id,
			className: String(element.className),
			rect: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
			style: Object.fromEntries(fields.map(field => [field, style[field]])),
			scroll: { width: element.scrollWidth, height: element.scrollHeight, clientWidth: element.clientWidth, clientHeight: element.clientHeight },
			parent: element.parentElement ? { tag: element.parentElement.tagName, id: element.parentElement.id, className: String(element.parentElement.className) } : null
		};
	};
	const hero = document.querySelector('.g-home-hero');
	return {
		body: describe(document.body),
		main: describe(document.querySelector('.g-home')),
		mainColumn: describe(document.querySelector('.g-home-main')),
		hero: describe(hero),
		children: [...hero.children].map(describe),
		styleSheets: [...document.styleSheets].map(sheet => sheet.href || 'inline'),
		media: { compact: matchMedia('(max-width: 42rem)').matches, tablet: matchMedia('(max-width: 54rem)').matches }
	};
})()`;
const result = await call('Runtime.evaluate', { expression, returnByValue: true });
console.log(JSON.stringify(result.result.value, null, 2));
socket.close();
await fetch(`http://127.0.0.1:9222/json/close/${target.id}`).catch(() => null);
setTimeout(() => process.exit(0), 100);
