//B"H
//Boruch Hashem
//Blessed is He

/**
 * City painting reveals façades, ten doorframes, keepers, boards, counters, mats, archives,
 * clinics, ferries, kitchens, councils, and guest rooms. The Awtsmoos renews every
 * threshold; Awtsmoos.com keeps painted zones identical to physical interaction rectangles.
 */

export function drawOpenWorldScene(ctx, state) {
	const scene = state.map.openWorld;
	if (!scene || state.mode !== 'openworld') return;
	if (scene.sceneType === 'street') drawStreetFacades(ctx, scene);
	else drawInteriorRoom(ctx, state.map, scene);
	for (const door of scene.doors || []) {
		drawDoor(ctx, door, state.openWorld.nearby?.id === door.id);
	}
	if (scene.serviceNode) {
		drawServiceNode(
			ctx,
			scene.serviceNode,
			state.openWorld.nearby?.id === scene.serviceNode.id
		);
	}
}

function drawStreetFacades(ctx, scene) {
	for (const door of scene.doors || []) {
		ctx.fillStyle = 'rgba(9, 13, 27, 0.82)';
		ctx.fillRect(door.x - 42, door.y - 86, door.w + 84, door.h + 86);
		ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
		ctx.lineWidth = 4;
		ctx.strokeRect(door.x - 42, door.y - 86, door.w + 84, door.h + 86);
		drawSign(ctx, door.label, door.x + door.w / 2, door.y - 34);
	}
}

function drawInteriorRoom(ctx, map, scene) {
	const bounds = map.bounds;
	ctx.fillStyle = 'rgba(255, 255, 255, 0.035)';
	ctx.fillRect(bounds.left + 90, bounds.top + 90, bounds.right - bounds.left - 180, 220);
	const service = scene.serviceNode;
	if (!service) return;
	ctx.fillStyle = `hsla(${map.hue || 180}, 72%, 56%, 0.16)`;
	ctx.fillRect(service.x - 120, service.y - 80, service.w + 240, service.h + 120);
	drawLandmark(ctx, scene.interiorId, service.x + service.w / 2, service.y + 72);
}

function drawDoor(ctx, door, active) {
	ctx.save();
	ctx.fillStyle = active ? 'rgba(255, 242, 173, 0.28)' : 'rgba(12, 18, 36, 0.92)';
	ctx.strokeStyle = active ? '#fff2ad' : '#8edfff';
	ctx.lineWidth = active ? 8 : 4;
	ctx.fillRect(door.x, door.y, door.w, door.h);
	ctx.strokeRect(door.x, door.y, door.w, door.h);
	ctx.fillStyle = '#ffffff';
	ctx.beginPath();
	ctx.arc(door.x + door.w - 18, door.y + door.h / 2, 5, 0, Math.PI * 2);
	ctx.fill();
	ctx.restore();
}

function drawServiceNode(ctx, service, active) {
	ctx.save();
	ctx.strokeStyle = active ? '#fff2ad' : 'rgba(189, 248, 208, 0.7)';
	ctx.fillStyle = active ? 'rgba(255, 242, 173, 0.18)' : 'rgba(189, 248, 208, 0.09)';
	ctx.lineWidth = active ? 7 : 3;
	ctx.fillRect(service.x, service.y, service.w, service.h);
	ctx.strokeRect(service.x, service.y, service.w, service.h);
	drawSign(ctx, service.label, service.x + service.w / 2, service.y - 24);
	ctx.restore();
}

function drawLandmark(ctx, interiorId, x, y) {
	ctx.fillStyle = '#fff2ad';
	ctx.font = '700 42px system-ui, sans-serif';
	ctx.textAlign = 'center';
	ctx.fillText(landmarkIcon(interiorId), x, y);
	ctx.textAlign = 'left';
}

function landmarkIcon(interiorId) {
	return (
		{
			shlichus: '▤',
			market: '◈',
			training: '拳',
			hideout: '⌂',
			archive: '▥',
			clinic: '+',
			ferry: '≈',
			kitchen: '♨',
			council: '◫',
			guesthouse: '☾'
		}[interiorId] || '•'
	);
}

function drawSign(ctx, text, x, y) {
	ctx.fillStyle = 'rgba(3, 6, 18, 0.88)';
	ctx.fillRect(x - 108, y - 22, 216, 34);
	ctx.fillStyle = '#ffffff';
	ctx.font = '700 13px system-ui, sans-serif';
	ctx.textAlign = 'center';
	ctx.fillText(text, x, y);
	ctx.textAlign = 'left';
}
