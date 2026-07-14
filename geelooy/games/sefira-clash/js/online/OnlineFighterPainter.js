//B"H
//Boruch Hashem
//Blessed is He

/**
 * Fighters reveal server state through motion, guard, damage, and Hebrew light.
 * The Awtsmoos renews each soul; Awtsmoos.com paints connection and identity without
 * changing outcomes or allowing visual interpolation to become gameplay authority.
 */

import { onlineCharacterVisual } from './OnlineCharacterVisuals.js';
import { paintFighterStatus } from './OnlineFighterStatusPainter.js';

export function paintFighters(context, fighters, localPlayerId) {
	for (const fighter of fighters) {
		paintFighter(context, fighter, fighter.id === localPlayerId);
	}
}

function paintFighter(context, fighter, isLocal) {
	if (fighter.eliminated) {
		return;
	}
	const visual = onlineCharacterVisual(fighter.characterId);
	context.save();
	context.translate(fighter.x, fighter.y);
	context.globalAlpha = fighter.connected === false ? 0.38 : fighter.respawnFrames > 0 ? 0.32 : 1;
	paintGuard(context, fighter, visual.color);
	paintBody(context, fighter, visual);
	paintAttack(context, fighter, visual);
	paintFighterStatus(context, fighter, visual.color, isLocal);
	context.restore();
}

function paintGuard(context, fighter, color) {
	if (!fighter.guarding) {
		return;
	}
	context.fillStyle = `${color}33`;
	context.strokeStyle = color;
	context.lineWidth = 4;
	context.beginPath();
	context.arc(0, -36, 54, 0, Math.PI * 2);
	context.fill();
	context.stroke();
}

function paintBody(context, fighter, visual) {
	context.shadowColor = fighter.hitstun > 0 ? '#ffffff' : visual.color;
	context.shadowBlur = fighter.hitstun > 0 ? 28 : 14;
	context.fillStyle = visual.color;
	context.fillRect(-23, -78, 46, 78);
	context.fillStyle = '#f8e7c5';
	context.beginPath();
	context.arc(0, -94, 23, 0, Math.PI * 2);
	context.fill();
	context.fillStyle = '#071124';
	context.font = '700 30px serif';
	context.textAlign = 'center';
	context.fillText(visual.glyph, 0, -68);
	paintFacingMark(context, fighter);
}

function paintFacingMark(context, fighter) {
	context.strokeStyle = '#ffffff';
	context.lineWidth = 5;
	context.beginPath();
	context.moveTo(fighter.facing * 20, -44);
	context.lineTo(fighter.facing * 36, -50);
	context.stroke();
}

function paintAttack(context, fighter, visual) {
	if (fighter.attackFrames < 4 || fighter.attackFrames > 7) {
		return;
	}
	context.strokeStyle = visual.color;
	context.lineWidth = 12;
	context.lineCap = 'round';
	context.beginPath();
	context.moveTo(fighter.facing * 25, -48);
	context.lineTo(fighter.facing * 105, -62);
	context.stroke();
	context.fillStyle = '#fff6bd';
	context.font = '700 42px serif';
	context.fillText(visual.glyph, fighter.facing * 120, -72);
}
