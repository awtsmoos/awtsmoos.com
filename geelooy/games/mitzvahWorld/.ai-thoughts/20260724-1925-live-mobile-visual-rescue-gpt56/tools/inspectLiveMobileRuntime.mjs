// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file inspectLiveMobileRuntime.mjs
 * @description Inspects the served 390x844 game through runtime state, never screenshots.
 * The Awtsmoos creates every visible truth before our probe; Awtsmoos.com records menu, GLB,
 * UV, road, house, demon, weapon, casting, network, and exception evidence in finite JSON.
 */

import { writeFile } from 'node:fs/promises';
import { DevtoolsClient, createDevtoolsPage, sleep, waitForRuntime } from './DevtoolsClient.mjs';

const outputPath = process.argv[2];
const url = process.argv[3] || 'http://127.0.0.1:8080/games/mitzvahWorld/';
const target = await createDevtoolsPage('about:blank');
const client = await DevtoolsClient.connect(target.webSocketDebuggerUrl);
const protocol = { exceptions: [], logs: [] };
client.on('Runtime.exceptionThrown', event => protocol.exceptions.push(finite(event.exceptionDetails)));
client.on('Log.entryAdded', event => protocol.logs.push(finite(event.entry)));
await Promise.all([client.call('Page.enable'), client.call('Runtime.enable'), client.call('Log.enable')]);
await client.call('Emulation.setDeviceMetricsOverride', {
	deviceScaleFactor: 2,
	height: 844,
	mobile: true,
	screenHeight: 844,
	screenWidth: 390,
	width: 390
});
await client.call('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
await client.call('Page.addScriptToEvaluateOnNewDocument', { source: pageErrorCapture() });
await client.call('Page.navigate', { url });
const runtimeReadyMs = await waitForRuntime(() => client.evaluate(runtimeReadyProbe()));
const featuresSettledMs = await waitForRuntime(() => client.evaluate(featuresSettledProbe()));
const beforeCast = await client.evaluate(runtimeEvidenceExpression());
const casts = await client.evaluate(castEvidenceExpression(), true);
const afterCast = await client.evaluate(runtimeEvidenceExpression());
const receipt = {
	afterCast,
	beforeCast,
	casts,
	featuresSettledMs,
	protocol,
	runtimeReadyMs,
	url
};
await writeFile(outputPath, `${JSON.stringify(receipt, null, 2)}\n`);
process.stdout.write(`${JSON.stringify(summary(receipt), null, 2)}\n`);
client.close();

function runtimeReadyProbe() {
	return `Boolean(globalThis.AwtsmoosMitzvahWorld?.runtime)`;
}

function featuresSettledProbe() {
	return `['ready','degraded','failed-core-still-playable'].includes(`
		+ `globalThis.AwtsmoosMitzvahWorld?.runtime?.featureStatus?.phase)`;
}

function runtimeEvidenceExpression() {
	return `(() => {
		const d = globalThis.AwtsmoosMitzvahWorld; const r = d?.runtime;
		const range = g => { const a = g?.attributes?.uv?.array || []; let min=Infinity,max=-Infinity;
			for (const v of a) { min=Math.min(min,v); max=Math.max(max,v); } return {count:a.length,min,max}; };
		const rail=document.querySelector('.Awtsmoos-game-rail'); const secondary=document.querySelector('[data-rail-secondary]');
		const weapon=[]; r?.model?.traverse?.(o=>{if(o.userData?.weaponPart)weapon.push({name:o.name,parent:o.parent?.name||null,visible:o.visible!==false});});
		return { viewport:{width:innerWidth,height:innerHeight,dpr:devicePixelRatio}, root:{...document.documentElement.dataset},
			featureStatus:r?.featureStatus||null, visualStability:r?.visualStability||null,
			rail:{hostHidden:document.getElementById('gameRail')?.hidden,collapsed:rail?.dataset?.collapsed,secondaryHidden:secondary?.hidden,buttons:rail?.querySelectorAll('button').length||0,rect:rail?.getBoundingClientRect?.().toJSON?.()||null},
			friendly:r?.friendlyNpcs?.diagnostics?.()||null, terrain:{stats:r?.terrain?.stats||null,uv:range(r?.terrain?.mesh?.geometry),roadUv:range(r?.terrain?.road?.geometry),roadVisible:r?.terrain?.road?.visible===true,road:r?.terrain?.road?.userData?.AwtsmoosRoad||null},
			equipment:r?.equipment?.diagnostics?.()||null, action:r?.playerActions?.snapshot?.()||r?.playerAnimation?.actions?.snapshot?.()||null, weapon,
			pageErrors:globalThis.__awtsmoosInspectorErrors||[], resources:performance.getEntriesByType('resource').length, readyState:document.readyState };
	})()`;
}

function castEvidenceExpression() {
	return `(async () => { const r=globalThis.AwtsmoosMitzvahWorld.runtime; const original=r.inventory.equipment.hand; const results=[];
		for (const [itemId,type] of [['wooden-staff','staff'],['spark-blade','sword']]) {
			if(!r.inventory.owns(itemId))r.inventory.add(itemId,1); r.inventory.equip(itemId); r.equipment.sync?.(); r.equipment.synchronize?.();
			r.bus.emit('combat:cast-start',{actionId:'live-inspection',duration:1.2}); r.bus.emit('combat:cast-progress',{progress:0.55}); await new Promise(q=>setTimeout(q,80));
			const parts=[]; r.model.traverse?.(o=>{if(o.userData?.weaponPart)parts.push({name:o.name,parent:o.parent?.name||null,visible:o.visible!==false});});
			results.push({itemId,type,equipment:r.equipment.diagnostics(),action:r.playerActions?.snapshot?.()||null,parts});
			r.bus.emit('combat:cast-launch',{actionId:'live-inspection'}); await new Promise(q=>setTimeout(q,280));
		}
		if(original&&r.inventory.owns(original))r.inventory.equip(original); r.equipment.sync?.(); r.equipment.synchronize?.(); return results; })()`;
}

function pageErrorCapture() {
	return `globalThis.__awtsmoosInspectorErrors=[]; addEventListener('error',e=>__awtsmoosInspectorErrors.push({type:'error',message:e.message})); addEventListener('unhandledrejection',e=>__awtsmoosInspectorErrors.push({type:'rejection',message:String(e.reason?.message||e.reason)}));`;
}

function finite(value) {
	return JSON.parse(JSON.stringify(value, (_, item) => typeof item === 'bigint' ? String(item) : item));
}

function summary(receipt) {
	const state = receipt.afterCast;
	return { runtimeReadyMs: receipt.runtimeReadyMs, featuresSettledMs: receipt.featuresSettledMs, viewport: state.viewport, phase: state.featureStatus?.phase, rail: state.rail, friendly: state.friendly, terrain: state.terrain, visualStability: state.visualStability, casts: receipt.casts, pageErrors: state.pageErrors, protocolExceptions: receipt.protocol.exceptions.length, protocolLogs: receipt.protocol.logs.length, resources: state.resources };
}
