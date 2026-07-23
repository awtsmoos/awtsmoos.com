//B"H
// Boruch Hashem
// Blessed is He

const fs = require("fs");
const path = require("path");
const CDP = require("chrome-remote-interface");

const chromePort = 9370;
const evidencePath = path.join(__dirname, "browser-smoke-evidence.json");

/**
 * The Awtsmoos asks a real browser to testify that Awtsmoos.com reveals one
 * useful message-action vessel on both wide and narrow screens.
 */
async function run() {
	const target = await CDP.New({ port: chromePort, url: "about:blank" });
	const client = await CDP({ port: chromePort, target });
	const { Emulation, Page, Runtime } = client;
	await Promise.all([Page.enable(), Runtime.enable()]);
	await setViewport(Emulation, 1440, 900, false);
	await Page.navigate({ url: "http://127.0.0.1:8088/ai/" });
	await Page.loadEventFired();
	const desktop = await evaluate(Runtime, desktopProbe());
	await screenshot(Page, "browser-smoke-desktop.png");
	await setViewport(Emulation, 390, 844, true);
	await delay(220);
	const mobile = await evaluate(Runtime, mobileProbe());
	await screenshot(Page, "browser-smoke-mobile.png");
	const evidence = { ok: Boolean(desktop.ok && mobile.ok), desktop, mobile };
	fs.writeFileSync(evidencePath, `${JSON.stringify(evidence, null, 2)}\n`);
	await client.close();
	await CDP.Close({ port: chromePort, id: target.id });
	if (!evidence.ok) {
		throw new Error(`Browser smoke failed: ${JSON.stringify(evidence)}`);
	}
	console.log(JSON.stringify(evidence, null, 2));
}

async function evaluate(Runtime, expression) {
	const response = await Runtime.evaluate({ expression, awaitPromise: true, returnByValue: true });
	const detail = response.exceptionDetails?.exception?.description || response.exceptionDetails?.text;
	if (detail) {
		throw new Error(detail);
	}
	return response.result.value;
}

function desktopProbe() {
	return `(async()=>{try{
		const actions=await import('/ai/js/render/message-actions/index.js?smoke=4');
		const shell=document.createElement('div');shell.className='message-shell start-flow has-text';shell.dataset.messageId='browser-smoke';
		const message=Object.assign(document.createElement('div'),{className:'message assistant',textContent:'A browser-verified message from the Awtsmoos.'});
		const audio=Object.assign(document.createElement('audio'),{src:'data:audio/mpeg;base64,SUQz'});
		const panel=document.createElement('div');panel.className='awtsmoos-audio-offer';panel.hidden=true;panel.append(document.createElement('button'));
		shell.append(message,audio,panel);document.body.append(shell);
		Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async value=>{window.__awtCopied=value;}}});
		actions.ensureMessageActionMenu(shell,{id:'browser-smoke',role:'assistant',text:message.textContent});
		const trigger=shell.querySelector('.message-action-trigger');trigger.click();const menu=shell.querySelector('.message-action-menu');
		const labels=[...menu.querySelectorAll('button')].map(button=>button.lastElementChild.textContent.trim());
		menu.querySelector('[data-message-action="copy"]').click();await new Promise(resolve=>setTimeout(resolve,40));
		trigger.click();menu.querySelector('[data-message-action="audio-options"]').click();await new Promise(resolve=>setTimeout(resolve,40));
		trigger.click();menu.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}));
		const expected=['Copy message','Share message','Download text','Audio & download','Download audio'];
		return{ok:expected.every(label=>labels.includes(label))&&window.__awtCopied===message.textContent&&!panel.hidden&&menu.hidden&&document.activeElement===trigger,labels,copied:window.__awtCopied,audioPanelOpen:!panel.hidden,escapeClosed:menu.hidden,focusReturned:document.activeElement===trigger,stylesLoaded:[...document.styleSheets].some(sheet=>String(sheet.href).includes('/ai/styles.css'))};
	}catch(error){return{ok:false,error:String(error),stack:error?.stack||''};}})()`;
}

function mobileProbe() {
	return `(()=>{try{const shell=document.querySelector('[data-message-id="browser-smoke"]');const trigger=shell?.querySelector('.message-action-trigger');if(!trigger)return{ok:false,error:'Synthetic message disappeared.'};if(trigger.getAttribute('aria-expanded')!=='true')trigger.click();const root=trigger.closest('.message-action-root');const rect=trigger.getBoundingClientRect();const rootRect=root.getBoundingClientRect();const menuRect=root.querySelector('.message-action-menu').getBoundingClientRect();return{ok:rect.width>=38&&rect.height>=34&&rootRect.right<=innerWidth+1&&menuRect.right<=innerWidth+1,viewport:{width:innerWidth,height:innerHeight},triggerRect:rect.toJSON(),rootRect:rootRect.toJSON(),menuRect:menuRect.toJSON()};}catch(error){return{ok:false,error:String(error),stack:error?.stack||''};}})()`;
}

async function setViewport(Emulation, width, height, mobile) {
	await Emulation.setDeviceMetricsOverride({ width, height, deviceScaleFactor: mobile ? 2 : 1, mobile });
}

async function screenshot(Page, filename) {
	const image = await Page.captureScreenshot({ format: "png", captureBeyondViewport: false });
	fs.writeFileSync(path.join(__dirname, filename), Buffer.from(image.data, "base64"));
}

function delay(milliseconds) {
	return new Promise(resolve => setTimeout(resolve, milliseconds));
}

run().catch(error => {
	console.error(error.stack || error);
	process.exit(1);
});
