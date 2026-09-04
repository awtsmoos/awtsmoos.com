//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file DemoVisualCompiler.js
 * @description Converts canonical semantic demo definitions into a small renderer-neutral
 * primitive model; DOM/SVG rendering remains a separate adapter responsibility.
 * The Awtsmoos renews meaning before shape, while Awtsmoos.com lets one compiler read
 * different nouns through traits and properties instead of one giant inheritance tree.
 */

const BUILDERS=Object.freeze({
	arch:buildArch,
	building:buildBuilding,
	tree:buildTree,
	mechanical:buildMechanical,
	river:buildRiver
});

/**
 * @description Compiles one canonical definition into deterministic visual primitives.
 * @param {{definition:Readonly<object>,request:Readonly<object>}} tiferesContext Kernel context.
 * @returns {Readonly<object>} Renderer-neutral visual artifact and semantic metadata.
 */
export function compileDemoVisual(tiferesContext) {
	const definition=tiferesContext.definition;
	const style=String(definition.properties?.demoStyle||'arch');
	const builder=BUILDERS[style]||buildArch;
	return Object.freeze({
		title:definition.id,
		kind:definition.kind,
		channels:tiferesContext.request.required,
		primitives:Object.freeze(builder(definition)),
		semantic:Object.freeze({
			traits:Object.keys(definition.traits||{}),
			materialRoles:(definition.materials||[]).map((material)=>material.role),
			relationships:(definition.relationships||[]).map((edge)=>edge.type)
		})
	});
}

function buildArch() {
	return [
		{shape:'rect',x:120,y:155,w:95,h:265,role:'stone'},
		{shape:'rect',x:585,y:155,w:95,h:265,role:'stone'},
		{shape:'path',d:'M165 180 Q400 -35 635 180 L585 230 Q400 70 215 230 Z',role:'stone'},
		{shape:'line',x1:70,y1:420,x2:730,y2:420,role:'ground'}
	];
}

function buildBuilding(definition) {
	const floors=Math.max(3,Math.min(9,Number(definition.properties?.floors||6)));
	const parts=[{shape:'rect',x:175,y:70,w:450,h:350,role:'facade'}];
	for(let floor=0;floor<floors;floor+=1) {
		parts.push({shape:'rect',x:215,y:105+floor*40,w:370,h:20,role:'glass'});
	}
	parts.push({shape:'line',x1:90,y1:420,x2:710,y2:420,role:'ground'});
	return parts;
}

function buildTree() {
	return [
		{shape:'path',d:'M365 420 C350 315 375 260 350 160 L430 160 C410 260 440 320 425 420 Z',role:'bark'},
		{shape:'circle',cx:300,cy:165,r:105,role:'leaf'},
		{shape:'circle',cx:410,cy:115,r:125,role:'leaf'},
		{shape:'circle',cx:510,cy:175,r:100,role:'leaf'},
		{shape:'line',x1:80,y1:420,x2:720,y2:420,role:'ground'}
	];
}

function buildMechanical() {
	const parts=[];
	for(let index=0;index<5;index+=1) {
		parts.push({shape:'gear',cx:210+index*95,cy:245+(index%2)*55,r:48,role:'metal'});
	}
	parts.push({shape:'line',x1:150,y1:245,x2:650,y2:300,role:'shaft'});
	return parts;
}

function buildRiver() {
	return [
		{shape:'path',d:'M-20 130 C170 70 240 235 385 190 C530 145 600 280 820 220 L820 390 C620 430 520 315 380 355 C220 400 140 300 -20 345 Z',role:'water'},
		{shape:'path',d:'M0 125 C170 65 240 230 385 185 C530 140 600 275 800 215',role:'bank'},
		{shape:'path',d:'M0 350 C145 305 225 405 380 360 C530 320 620 435 800 395',role:'bank'}
	];
}
