// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file inspectWardrobeRuntime.mjs
 * @description Exercises the live mobile Bag, GLB garments, appearance, and tailor transaction.
 * The Awtsmoos creates ownership and clothing before observation; Awtsmoos.com records DOM,
 * model, material, store, NPC, purchase, and exception evidence without screenshots.
 */

import { writeFile } from 'node:fs/promises';
import { WardrobeDevtoolsClient, createWardrobePage, waitForWardrobeProbe } from './WardrobeDevtoolsClient.mjs';

const outputPath = process.argv[2];
const port = Number(process.argv[3] || 9252);
const url = process.argv[4] || 'http://127.0.0.1:8080/games/mitzvahWorld/';
const target = await createWardrobePage(port);
const client = await WardrobeDevtoolsClient.connect(target.webSocketDebuggerUrl);
const protocol = { exceptions: [], logs: [] };
client.on('Runtime.exceptionThrown', value => protocol.exceptions.push(value.exceptionDetails));
client.on('Log.entryAdded', value => protocol.logs.push(value.entry));
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
await client.call('Page.addScriptToEvaluateOnNewDocument', { source: errorCaptureSource() });
await client.call('Page.navigate', { url });
const readyMs = await waitForWardrobeProbe(() => client.evaluate(readyExpression()));
const before = await client.evaluate(evidenceExpression());
const actions = await client.evaluate(actionExpression(), true);
const after = await client.evaluate(evidenceExpression());
const receipt = { actions, after, before, protocol, readyMs, url };
await writeFile(outputPath, `${JSON.stringify(receipt, null, 2)}\n`);
process.stdout.write(`${JSON.stringify(summary(receipt), null, 2)}\n`);
client.close();

function readyExpression() {
	return `Boolean(globalThis.AwtsmoosMitzvahWorld?.runtime?.clothingMerchant?.panel)`;
}

function evidenceExpression() {
	return `(() => {
		const r=globalThis.AwtsmoosMitzvahWorld.runtime; const s=r.inventory.snapshot();
		const panel=document.querySelector('.Awtsmoos-inventory-panel');
		const slots=[...document.querySelectorAll('[data-equipment] [data-slot]')].map(b=>({slot:b.dataset.slot,itemId:b.dataset.itemId||null,text:b.textContent.trim(),disabled:b.disabled}));
		const roots=[]; r.model.traverse?.(o=>{const e=o.userData?.gltfNode?.extras||{};const g=e.garment||e.garament;if(g)roots.push({garment:g,name:o.name,visible:o.visible!==false});});
		return {viewport:{width:innerWidth,height:innerHeight,dpr:devicePixelRatio},phase:r.featureStatus?.phase,bag:{open:panel?.dataset?.open,slotCount:slots.length,slots,backpackCards:document.querySelectorAll('[data-items] [data-item-id]').length},inventory:{equipment:s.equipment,appearance:s.appearance,spiritual:s.stats.spiritual,garments:s.items.filter(x=>x.definition?.category==='clothing').map(x=>x.itemId),perutas:r.inventory.quantity('perutas')},equipment:r.equipment.diagnostics(),tailor:r.clothingMerchant.diagnostics(),tailorPanel:{hidden:r.clothingMerchant.panel.root.hidden,cards:r.clothingMerchant.panel.root.querySelectorAll('[data-buy]').length},roots,pageErrors:globalThis.__wardrobeProbeErrors||[],resources:performance.getEntriesByType('resource').length};
	})()`;
}

function actionExpression() {
	return `(async()=>{const r=globalThis.AwtsmoosMitzvahWorld.runtime;const wait=ms=>new Promise(q=>setTimeout(q,ms));
		r.bus.emit('inventory:toggle');await wait(120);
		let requiredError=null;try{r.inventory.unequip('shirt');}catch(e){requiredError=e.message;}
		const glasses=()=>{const a=[];r.model.traverse?.(o=>{const e=o.userData?.gltfNode?.extras||{};if((e.garment||e.garament)==='glasses')a.push(o.visible!==false);});return a;};
		const glassesBefore=glasses();r.inventory.unequip('eyes');await wait(40);const glassesOff=glasses();r.inventory.equip('scholar-glasses');await wait(40);const glassesOn=glasses();
		const coatMaterial=()=>{let m=null;r.model.traverse?.(o=>{const e=o.userData?.gltfNode?.extras||{};if(!m&&(e.garment||e.garament)==='jacket'){let c=o.children?.[0]?.material;m=Array.isArray(c)?c[0]:c;}});return m;};
		const coatBefore={...(coatMaterial()?.userData||{})};r.inventory.cycleAppearance('black-coat','color');r.inventory.cycleAppearance('black-coat','fabric');await wait(80);const coatAfter={...(coatMaterial()?.userData||{})};
		r.bus.emit('tailor:toggle');await wait(80);const candidates=['blue-scholar-glasses','linen-outer-shirt','brown-kapote'];const itemId=candidates.find(id=>!r.inventory.owns(id));const coinsBefore=r.inventory.quantity('perutas');if(itemId)await r.clothingMerchant.panel.buy(itemId);await wait(100);
		return {bagOpen:document.querySelector('.Awtsmoos-inventory-panel')?.dataset?.open,requiredError,glassesBefore,glassesOff,glassesOn,coatBefore,coatAfter,tailorOpen:!r.clothingMerchant.panel.root.hidden,purchasedItemId:itemId,ownsPurchased:itemId?r.inventory.owns(itemId):null,coinsBefore,coinsAfter:r.inventory.quantity('perutas'),sharedInventory:r.clothingMerchant.panel.store===r.inventory};})()`;
}

function errorCaptureSource() {
	return `globalThis.__wardrobeProbeErrors=[];addEventListener('error',e=>__wardrobeProbeErrors.push({type:'error',message:e.message}));addEventListener('unhandledrejection',e=>__wardrobeProbeErrors.push({type:'rejection',message:String(e.reason?.message||e.reason)}));`;
}

function summary(receipt) {
	return {readyMs:receipt.readyMs,viewport:receipt.after.viewport,phase:receipt.after.phase,bag:receipt.after.bag,inventory:receipt.after.inventory,equipment:receipt.after.equipment,tailor:receipt.after.tailor,actions:receipt.actions,pageErrors:receipt.after.pageErrors,protocolExceptions:receipt.protocol.exceptions.length,protocolLogs:receipt.protocol.logs.length,resources:receipt.after.resources};
}
