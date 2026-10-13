//B"H
// Boruch Hashem
// Blessed is He
/**
 * Sprite-sheet entity rendering for Shema Strike (2.5D platformer).
 * Player + enemies are drawn from AI-generated chibi sprite sheets via drawImage,
 * with the magenta key background removed at load time. If a sheet is not ready
 * (or fails), the renderer falls back to the original geometric silhouettes so
 * the game never breaks on asset load.
 *
 * Sheets:
 *  - assets/shema-player.png : 4 frames (684x912 each) — chibi knight, שמע sword
 *  - assets/shema-enemies.png: 3x2 grid (640px cells) — 6 enemies w/ letter glyphs
 *      row0: wanderer(א) guard(ב) leaper(ג) / row1: charger(ד) archer(ה) giant(ו)
 */
const PLAYER_SHEET_URL = new URL("../../assets/shema-player.png", import.meta.url).href;
const ENEMY_SHEET_URL = new URL("../../assets/shema-enemies.png", import.meta.url).href;

const PLAYER_FRAME_W = 684;
const PLAYER_FRAME_H = 912;
const PLAYER_FRAMES = 4;
const ENEMY_CELL = 640;

const ROLE_SPRITE = Object.freeze({
	wanderer: 0,
	guard: 1,
	leaper: 2,
	charger: 3,
	archer: 4,
	giant: 5,
});

const spriteCache = {
	player: null,
	enemies: null,
	playerReady: false,
	enemiesReady: false,
};

/**
 * Chroma-keys the solid magenta (#ff00ff) background out of a loaded Image,
 * returning an offscreen canvas with transparent background.
 */
function keyOutMagenta(img) {
	const canvas = document.createElement("canvas");
	canvas.width = img.naturalWidth;
	canvas.height = img.naturalHeight;
	const ctx = canvas.getContext("2d", { willReadFrequently: true });
	ctx.drawImage(img, 0, 0);
	const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
	const px = data.data;
	for (let i = 0; i < px.length; i += 4) {
		const r = px[i], g = px[i + 1], b = px[i + 2];
		if (r > 140 && b > 140 && g < 130) {
			px[i + 3] = 0;
		}
	}
	ctx.putImageData(data, 0, 0);
	return canvas;
}

function loadSheet(url) {
	return new Promise((resolve) => {
		const img = new Image();
		img.onload = () => {
			try {
				resolve(keyOutMagenta(img));
			} catch {
				resolve(null);
			}
		};
		img.onerror = () => resolve(null);
		img.src = url;
	});
}

if (typeof Image !== "undefined") {
	loadSheet(PLAYER_SHEET_URL).then((canvas) => {
		spriteCache.player = canvas;
		spriteCache.playerReady = !!canvas;
	});
	loadSheet(ENEMY_SHEET_URL).then((canvas) => {
		spriteCache.enemies = canvas;
		spriteCache.enemiesReady = !!canvas;
	});
}

// B"H: letter glyphs remain as the geometric fallback identity (and live on the
// sprite chests themselves).
const ENEMY_GLYPH = Object.freeze({
	wanderer: "נ",
	guard: "ש",
	leaper: "ק",
	charger: "מ",
	archer: "ח",
	giant: "הסתר",
});

export class EntityRenderer {
	drawPlayer(context, player) {
		if (!spriteCache.playerReady) {
			this._drawPlayerGeometric(context, player);
			return;
		}
		context.save();
		if (player.invulnerable > 0 && Math.floor(player.invulnerable * 18) % 2 === 0) {
			context.globalAlpha = 0.38;
		}
		const now = performance.now();
		const moving = Math.abs(player.vx) > 30;
		const airborne = player.vy !== undefined && Math.abs(player.vy) > 60;
		let frame;
		if (player.attackTimer > 0) {
			frame = 2; // raised-sword swing pose
		} else if (airborne) {
			frame = 1; // mid-stride leap pose
		} else if (moving) {
			frame = Math.floor(now / 130) % PLAYER_FRAMES;
		} else {
			frame = Math.floor(now / 600) % 2 === 0 ? 0 : 1; // idle sway
		}
		// B"H: keep the 0.75 aspect of the sheet frame; anchor feet to the hitbox.
		const destH = player.height * 1.22;
		const destW = destH * (PLAYER_FRAME_W / PLAYER_FRAME_H);
		const destX = player.x + player.width * 0.5 - destW * 0.5;
		const destY = player.y + player.height - destH;
		context.translate(player.x + player.width * 0.5, 0);
		context.scale(player.facing >= 0 ? 1 : -1, 1);
		context.drawImage(
			spriteCache.player,
			frame * PLAYER_FRAME_W, 0, PLAYER_FRAME_W, PLAYER_FRAME_H,
			destX - (player.x + player.width * 0.5), destY, destW, destH
		);
		context.restore();
	}

	drawEnemy(context, enemy) {
		if (!spriteCache.enemiesReady) {
			this._drawEnemyGeometric(context, enemy);
			return;
		}
		context.save();
		const idx = ROLE_SPRITE[enemy.role] ?? 0;
		const sx = (idx % 3) * ENEMY_CELL;
		const sy = Math.floor(idx / 3) * ENEMY_CELL;
		const destH = enemy.height * (enemy.role === "giant" ? 1.35 : 1.28);
		const destW = destH; // cells are square
		const destX = enemy.x + enemy.width * 0.5 - destW * 0.5;
		const destY = enemy.y + enemy.height - destH;
		if (enemy.flash > 0) {
			context.shadowBlur = 24;
			context.shadowColor = "#ffffff";
		} else {
			context.shadowBlur = 10;
			context.shadowColor = enemy.type.color;
		}
		const flip = (enemy.facing ?? Math.sign(enemy.vx) ?? 1) < 0 ? -1 : 1;
		context.translate(enemy.x + enemy.width * 0.5, 0);
		context.scale(flip, 1);
		context.drawImage(
			spriteCache.enemies,
			sx, sy, ENEMY_CELL, ENEMY_CELL,
			destX - (enemy.x + enemy.width * 0.5), destY, destW, destH
		);
		context.restore();
		if (enemy.flash > 0) {
			context.save();
			context.globalAlpha = Math.min(0.55, enemy.flash * 2);
			context.fillStyle = "#ffffff";
			context.fillRect(destX, destY, destW, destH);
			context.restore();
		}
		this.drawHealth(context, enemy);
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

	// ---------- geometric fallbacks (used until sprite sheets are ready) ----------
	_drawPlayerGeometric(context, player) {
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
		this._drawWeaponGeometric(context, player);
		context.restore();
	}

	_drawWeaponGeometric(context, player) {
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

	_drawEnemyGeometric(context, enemy) {
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
}
