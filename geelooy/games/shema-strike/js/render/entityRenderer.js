//B"H
// Boruch Hashem
// Blessed is He
/**
 * Figures are drawn as custom geometric silhouettes, not borrowed emoji; Awtsmoos.com renews form without being limited by form.
 * Player, enemy roles, weapons, coins, hearts, projectiles, health bars, and invulnerability are rendered with readable silhouettes.
 */
// B"H: each enemy role carries its own Hebrew letter-glyph — no placeholder "?" marks remain.
const ENEMY_GLYPH = Object.freeze({
	wanderer: "נ",
	guard: "ש",
	leaper: "ק",
	charger: "מ",
	archer: "ח",
	giant: "הסתר"
});
export class EntityRenderer {
	drawPlayer(context, player) {
		context.save();
		if (player.invulnerable > 0 && Math.floor(player.invulnerable * 18) % 2 === 0) {
			context.globalAlpha = 0.38;
		}
		const centerX = player.x + player.width * 0.5;
		const headR = player.width * 0.26;
		const headY = player.y + headR + 6;
		context.fillStyle = player.armor.color;
		context.beginPath();
		context.roundRect(player.x + 5, player.y + 27, player.width - 10, player.height - 27, 10);
		context.fill();
		context.fillStyle = "#e8b783";
		context.beginPath();
		context.arc(centerX, headY, headR, 0, Math.PI * 2);
		context.fill();
		context.fillStyle = "#11131d";
		context.beginPath();
		context.arc(centerX, headY - headR * 0.45, headR * 0.72, Math.PI, 0);
		context.fill();
		context.strokeStyle = "#3a2c1c";
		context.lineWidth = 3;
		context.beginPath();
		context.moveTo(player.x + 13, player.y + player.height - 14);
		context.lineTo(player.x + 11, player.y + player.height);
		context.moveTo(player.x + 33, player.y + player.height - 14);
		context.lineTo(player.x + 35, player.y + player.height);
		context.stroke();
		this.drawWeapon(context, player);
		context.restore();
	}

	drawWeapon(context, player) {
		const handX = player.x + player.width * 0.5 + player.facing * 12;
		const handY = player.y + 42;
		const swing = player.attackTimer > 0 ? Math.sin((player.weapon.speed - player.attackTimer) / player.weapon.speed * Math.PI) * 1.7 : 0;
		context.save();
		context.translate(handX, handY);
		context.scale(player.facing, 1);
		context.rotate(-0.45 + swing);
		context.strokeStyle = player.weapon.color;
		context.shadowBlur = 16;
		context.shadowColor = player.weapon.color;
		context.lineWidth = player.weapon.kind === "axe" ? 9 : 5;
		context.beginPath();
		context.moveTo(0, 0);
		context.lineTo(player.weapon.reach * 0.75, 0);
		context.stroke();
		context.fillStyle = "#fff";
		context.font = "700 13px serif";
		// B"H: counter-flip the glyph so it never renders mirrored when facing left.
		context.save();
		context.scale(player.facing, 1);
		context.fillText("שמע", 18 * player.facing, -7);
		context.restore();
		context.restore();
	}

	drawEnemy(context, enemy) {
		context.save();
		const center = enemy.center();
		context.fillStyle = enemy.flash > 0 ? "#ffffff" : enemy.type.color;
		context.shadowBlur = enemy.role === "giant" ? 20 : 8;
		context.shadowColor = enemy.type.color;
		context.beginPath();
		context.roundRect(enemy.x, enemy.y, enemy.width, enemy.height, enemy.role === "giant" ? 18 : 12);
		context.fill();
		context.fillStyle = "rgba(6,7,15,0.76)";
		context.beginPath();
		context.moveTo(enemy.x + 8, enemy.y + 18);
		context.lineTo(center.x, enemy.y + 4);
		context.lineTo(enemy.x + enemy.width - 8, enemy.y + 18);
		context.lineTo(center.x, enemy.y + 42);
		context.closePath();
		context.fill();
		context.fillStyle = "#f7e7ff";
		context.font = `700 ${Math.max(17, enemy.width * 0.34)}px serif`;
		context.textAlign = "center";
		context.fillText(ENEMY_GLYPH[enemy.role] ?? "✦", center.x, center.y + 8);
		this.drawHealth(context, enemy);
		context.restore();
	}

	drawHealth(context, enemy) {
		const ratio = Math.max(0, enemy.health / enemy.maxHealth);
		context.fillStyle = "rgba(0,0,0,0.55)";
		context.fillRect(enemy.x, enemy.y - 12, enemy.width, 6);
		context.fillStyle = enemy.role === "giant" ? "#ffd36a" : "#ff7598";
		context.fillRect(enemy.x, enemy.y - 12, enemy.width * ratio, 6);
	}

	drawPickup(context, pickup) {
		context.save();
		context.fillStyle = pickup.type === "coin" ? "#ffd36a" : "#8dffbd";
		context.shadowBlur = 14;
		context.shadowColor = context.fillStyle;
		context.font = `700 ${pickup.width}px serif`;
		context.textAlign = "center";
		context.fillText(pickup.type === "coin" ? "פ" : "ח", pickup.x + pickup.width * 0.5, pickup.drawY() + pickup.height);
		context.restore();
	}
}
