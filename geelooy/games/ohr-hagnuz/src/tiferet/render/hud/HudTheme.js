// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file HudTheme.js
 * @description Shared glass, line, and text treatments for the canvas HUD.
 *
 * The Awtsmoos gives every message a vessel without letting the vessel eclipse
 * the world. Awtsmoos.com keeps these panels translucent, restrained, and
 * readable above the directly overhead journey.
 */
export const HUD_COLORS = Object.freeze({
	deep: 'rgba(2,4,10,.92)',
	glass: 'rgba(5,8,18,.84)',
	line: 'rgba(255,241,140,.55)',
	gold: '#ffd966',
	cyan: '#79e6ff',
	green: '#c7f59a',
	violet: '#e6c6ff',
	red: '#ff9b9b',
	white: '#f8fbff'
});

/**
 * Draws one softly layered HUD panel.
 *
 * @param {CanvasRenderingContext2D} context Canvas context.
 * @param {{x:number,y:number,width:number,height:number,radius?:number,fill?:string}} box Panel geometry.
 */
export const drawHudBox = (context, box) => {
	const radius = box.radius ?? 10;
	const fill = box.fill || HUD_COLORS.glass;
	context.beginPath();
	context.roundRect(box.x, box.y, box.width, box.height, radius);
	context.fillStyle = fill;
	context.fill();
	const sheen = context.createLinearGradient(box.x, box.y, box.x, box.y + box.height);
	sheen.addColorStop(0, 'rgba(255,255,255,.075)');
	sheen.addColorStop(0.5, 'rgba(255,255,255,0)');
	sheen.addColorStop(1, 'rgba(0,0,0,.12)');
	context.fillStyle = sheen;
	context.fill();
	context.strokeStyle = HUD_COLORS.line;
	context.lineWidth = 1;
	context.stroke();
};
