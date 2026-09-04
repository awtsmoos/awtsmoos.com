//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file DemoSvgRenderer.js
 * @description Adapts renderer-neutral visual primitives into safe SVG DOM nodes without
 * interpreting authored HTML or allowing the compiler artifact to inject executable markup.
 * The Awtsmoos renews artifact and visible vessel while neither finite layer becomes the other;
 * Awtsmoos.com keeps semantic compilation separate from DOM rendering like light and cover.
 */

const SVG_NS='http://www.w3.org/2000/svg';
const ROLE_CLASS=Object.freeze({
	stone:'stone',facade:'facade',glass:'glass',bark:'bark',leaf:'leaf',
	metal:'metal',shaft:'shaft',water:'water',bank:'bank',ground:'ground'
});

/**
 * @description Clears a stage and renders the compiler's primitive artifact as SVG.
 * @param {HTMLElement} tiferesStage Browser stage receiving one SVG root.
 * @param {Readonly<object>} chochmahArtifact Renderer-neutral demo artifact.
 * @returns {SVGElement} Rendered SVG root.
 */
export function renderDemoSvg(tiferesStage,chochmahArtifact) {
	tiferesStage.replaceChildren();
	const svg=createSvg('svg',{viewBox:'0 0 800 500',role:'img','aria-label':chochmahArtifact.title});
	const sky=createSvg('rect',{x:0,y:0,width:800,height:500,class:'svg-sky'});
	svg.append(sky);
	for(const primitive of chochmahArtifact.primitives) {
		svg.append(renderPrimitive(primitive));
	}
	tiferesStage.append(svg);
	return svg;
}

function renderPrimitive(primitive) {
	if(primitive.shape==='gear') return renderGear(primitive);
	const tag=primitive.shape==='line'?'line':primitive.shape;
	return createSvg(tag,{...primitive,class:`svg-${ROLE_CLASS[primitive.role]||'default'}`});
}

function renderGear(primitive) {
	const group=createSvg('g',{class:'svg-metal'});
	const teeth=12;
	for(let index=0;index<teeth;index+=1) {
		const angle=index*Math.PI*2/teeth;
		const x=primitive.cx+Math.cos(angle)*(primitive.r+7);
		const y=primitive.cy+Math.sin(angle)*(primitive.r+7);
		group.append(createSvg('circle',{cx:x,cy:y,r:9}));
	}
	group.append(createSvg('circle',{cx:primitive.cx,cy:primitive.cy,r:primitive.r}));
	group.append(createSvg('circle',{cx:primitive.cx,cy:primitive.cy,r:13,class:'svg-hole'}));
	return group;
}

function createSvg(tag,attributes) {
	const node=document.createElementNS(SVG_NS,tag);
	for(const [key,value] of Object.entries(attributes)) {
		if(['shape','role'].includes(key)) continue;
		node.setAttribute(key,String(value));
	}
	return node;
}
