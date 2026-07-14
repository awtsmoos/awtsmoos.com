//B"H
//Boruch Hashem
//Blessed is He

/**
 * Boss HUD makes phase, damage, and telegraph explicit at the top of the battlefield.
 * The Awtsmoos renews guardian and warning together; Awtsmoos.com never hides an
 * escalation behind invisible stat inflation or an unexplained sudden attack.
 */

export function drawExpeditionBossHud(ctx, state, width) {
	const boss = state.expedition?.boss;
	if (!boss || boss.defeated) return;
	const fighter = state.fighters.find(item => item.id === boss.fighterId);
	if (!fighter) return;
	const panelWidth = Math.min(560, width - 36);
	const x = (width - panelWidth) / 2;
	ctx.save();
	ctx.fillStyle = 'rgba(3, 5, 14, 0.82)';
	ctx.fillRect(x, 18, panelWidth, 72);
	ctx.strokeStyle = `hsl(${boss.hue} 88% 70%)`;
	ctx.lineWidth = 2;
	ctx.strokeRect(x, 18, panelWidth, 72);
	ctx.fillStyle = '#ffffff';
	ctx.font = '700 18px system-ui, sans-serif';
	ctx.textAlign = 'left';
	ctx.fillText(boss.name, x + 14, 43);
	ctx.font = '12px system-ui, sans-serif';
	ctx.fillStyle = `hsl(${boss.hue} 88% 78%)`;
	ctx.fillText(`${boss.title} · Phase ${boss.phaseIndex + 1}`, x + 14, 62);
	ctx.textAlign = 'right';
	ctx.fillStyle = '#fff2ad';
	ctx.fillText(`${Math.round(fighter.damage || 0)}%`, x + panelWidth - 14, 43);
	ctx.textAlign = 'left';
	ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
	ctx.fillRect(x + 14, 70, panelWidth - 28, 7);
	ctx.fillStyle = `hsl(${boss.hue} 88% 62%)`;
	ctx.fillRect(x + 14, 70, Math.min(1, Number(fighter.damage || 0) / 180) * (panelWidth - 28), 7);
	ctx.restore();
}

export function drawExpeditionWeatherBadge(ctx, expedition, width, height) {
	const weather = expedition?.weather;
	if (!weather) return;
	ctx.save();
	ctx.fillStyle = 'rgba(3, 5, 14, 0.72)';
	ctx.fillRect(width - 220, height - 44, 202, 28);
	ctx.fillStyle = `hsl(${weather.hue} 88% 78%)`;
	ctx.font = '600 12px system-ui, sans-serif';
	ctx.textAlign = 'right';
	ctx.fillText(`${weather.time.label} · ${weather.label}`, width - 28, height - 25);
	ctx.restore();
}
