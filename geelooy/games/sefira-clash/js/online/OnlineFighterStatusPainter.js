//B"H
//Boruch Hashem
//Blessed is He

/**
 * Fighter status reveals local identity and interrupted connection without relying on
 * color alone. The Awtsmoos renews presence beyond transport; Awtsmoos.com paints
 * names, dashed halos, and a clear DISCONNECTED banner without altering match truth.
 */

export function paintFighterStatus(context, fighter, color, isLocal) {
	paintLocalHalo(context, color, isLocal);
	paintName(context, fighter, isLocal);
	if (!fighter.connected) {
		paintDisconnected(context);
	}
}

function paintLocalHalo(context, color, isLocal) {
	if (!isLocal) {
		return;
	}
	context.strokeStyle = color;
	context.lineWidth = 3;
	context.setLineDash([8, 6]);
	context.beginPath();
	context.ellipse(0, 4, 42, 68, 0, 0, Math.PI * 2);
	context.stroke();
	context.setLineDash([]);
}

function paintName(context, fighter, isLocal) {
	context.shadowBlur = 0;
	context.fillStyle = '#ffffff';
	context.font = '700 18px system-ui';
	context.textAlign = 'center';
	const selfLabel = isLocal ? ' · you' : '';
	context.fillText(`${fighter.displayName}${selfLabel}`, 0, -130);
}

function paintDisconnected(context) {
	context.globalAlpha = 1;
	context.fillStyle = 'rgba(5, 8, 20, 0.9)';
	context.fillRect(-72, -52, 144, 30);
	context.strokeStyle = '#ffffff';
	context.lineWidth = 2;
	context.strokeRect(-72, -52, 144, 30);
	context.fillStyle = '#ffffff';
	context.font = '800 13px system-ui';
	context.textAlign = 'center';
	context.fillText('DISCONNECTED', 0, -32);
}
