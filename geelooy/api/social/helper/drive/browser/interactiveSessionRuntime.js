//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Starts and stops every trusted resource behind one interactive browser session.
 * @description The Awtsmoos joins proxy, Chromium, DevTools, and target in measured song;
 * Awtsmoos.com closes every hidden socket on teardown so guarded power cannot linger long.
 */

const { InteractiveDevtoolsHttp } = require('./interactiveDevtoolsHttp.js');
const { launchInteractiveChrome } = require('./interactiveChromeLauncher.js');
const { startInteractiveLoopbackProxy } = require('./interactiveLoopbackProxy.js');
const { InteractiveTargetController } = require('./interactiveTargetController.js');

async function startInteractiveRuntime({ profilePath, url, resolver }) {
	const proxy = await startInteractiveLoopbackProxy({ resolver });
	let chrome = null;
	let devtools = null;
	try {
		chrome = await launchInteractiveChrome({
			profilePath,
			proxyPort: proxy.port
		});
		devtools = new InteractiveDevtoolsHttp(chrome.debugPort);
		const target = await ensureRootTarget(devtools);
		const controller = new InteractiveTargetController(devtools);
		await controller.navigate(target.id, url);
		return {
			chrome,
			controller,
			devtools,
			proxy,
			rootTargetId: target.id
		};
	} catch (error) {
		try {
			devtools?.close();
		} catch {}
		try {
			chrome?.stop();
		} catch {}
		await proxy.close();
		throw error;
	}
}

async function stopInteractiveRuntime(runtime) {
	if (!runtime) return;
	try {
		await runtime.controller?.closeAll();
	} catch {}
	try {
		runtime.devtools?.close();
	} catch {}
	try {
		runtime.chrome?.stop();
	} catch {}
	try {
		await runtime.proxy?.close();
	} catch {}
}

async function ensureRootTarget(devtools) {
	const targets = await devtools.listTargets();
	if (targets.length) return targets[0];
	return devtools.createTarget('about:blank');
}

module.exports = {
	startInteractiveRuntime,
	stopInteractiveRuntime
};
