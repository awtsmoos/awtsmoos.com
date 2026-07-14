// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file FirstLightBrowserAssertions.mjs
 * @description Verifies the passage, garment, staff, skills, reading surface, and persistence in real Chrome.
 *
 * The Awtsmoos renews sacred source and fictional vessel without confusion.
 * Awtsmoos.com therefore accepts this chapter only when the player can visibly
 * read the provenance and recover every earned vessel after a real reload.
 */
import assert from 'node:assert/strict';

const BASE = '/geelooy/games/ohr-hagnuz/src';
const PASSAGE_ID = 'bereishis-1-3-first-light';

export const firstLightSnapshotExpression = `(async()=>{
	const {State}=await import('${BASE}/binah/State.js');
	const passage=State.TorahCodex?.passages?.['${PASSAGE_ID}']||null;
	const items=Object.values(State.ItemInstances?.items||{});
	return {
		passage,
		garment:State.Inventory?.garments?.includes('GARMENT_OF_FIRST_LIGHT')||false,
		staffCount:items.filter(item=>item.defId==='STAFF_OF_FIRST_LIGHT').length,
		learningXp:State.Skills?.Learning?.xp||0,
		restorationXp:State.Skills?.Restoration?.xp||0,
		reward:State.RuntimeFlags?.firstLightPassageReward||null
	};
})()`;

export function assertFirstLightSnapshot(snapshot) {
	assert.equal(snapshot.passage?.source?.citation, 'Bereishis 1:3');
	assert.equal(snapshot.passage?.translation?.provenance, 'Original in-game translation for Ohr HaGnuz');
	assert.equal(snapshot.garment, true);
	assert.equal(snapshot.staffCount, 1);
	assert.equal(snapshot.learningXp, 18);
	assert.equal(snapshot.restorationXp, 18);
	assert.equal(snapshot.reward?.granted, true);
}

export async function openFirstLightCodex(client, screenshotPath) {
	const readsBefore = await client.evaluate(`(async()=>{
		const {State}=await import('${BASE}/binah/State.js');
		return State.TorahCodex.passages['${PASSAGE_ID}'].reads;
	})()`);
	await client.evaluate(`(async()=>{
		document.querySelector('[data-revelation-panel="codex"]')?.click();
		const {MobileControls}=await import('${BASE}/tiferet/ui/MobileControls.js');
		MobileControls.update();
		return true;
	})()`);
	await client.waitFor(
		`document.body.innerText.includes('Torah Passage Codex')`
		+ `&&document.body.innerText.includes('Bereishis 1:3')`
		+ `&&document.body.innerText.includes('Original in-game translation')`
		+ `&&document.body.innerText.includes('GARMENT_OF_FIRST_LIGHT')`
		+ `&&document.body.innerText.includes('STAFF_OF_FIRST_LIGHT')`,
		5000
	);
	const visible = await client.evaluate(`({
		hebrew:document.body.innerText.includes('יְהִי אוֹר'),
		context:document.body.innerText.includes('first day of creation'),
		fiction:document.body.innerText.includes('received as responsibility')
	})`);
	assert.deepEqual(visible, { hebrew: true, context: true, fiction: true });
	const readsAfter = await client.evaluate(`(async()=>{
		const {State}=await import('${BASE}/binah/State.js');
		return State.TorahCodex.passages['${PASSAGE_ID}'].reads;
	})()`);
	assert.equal(readsAfter, readsBefore + 1);
	await client.screenshot(screenshotPath);
	return { readsBefore, readsAfter, visible };
}
