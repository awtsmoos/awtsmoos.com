// B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos gives finite color, glyph, shadow, and parallax their place without letting ornament obscure the climb;
 * Awtsmoos.com renders a bright readable world whose depth remains graceful on a small mobile frame and time.
 */
export class WorldRenderer {
	constructor(context, config, glyphs) {
		this.context = context;
		this.config = config;
		this.glyphs = glyphs;
	}

	render(state, camera, canvas) {
		this.drawSky(state, canvas);
		this.drawBackgroundParticles(state);
		if (!state.player) {
			return;
		}
		this.context.save();
		this.context.translate(0, -camera.y);
		this.drawWorldObjects(state);
		this.context.restore();
	}

	drawSky(state, canvas) {
		const color = this.config.worldColors[state.worldLevel || 0];
		const gradient = this.context.createLinearGradient(0, 0, 0, canvas.height);
		gradient.addColorStop(0, color);
		gradient.addColorStop(0.55, '#071626');
		gradient.addColorStop(1, '#02060e');
		this.context.fillStyle = gradient;
		this.context.fillRect(0, 0, canvas.width, canvas.height);
	}

	drawBackgroundParticles(state) {
		this.context.textAlign = 'center';
		this.context.textBaseline = 'middle';
		for (const particle of state.backgroundParticles) {
			this.context.globalAlpha = 0.16 + particle.parallax * 0.35;
			this.context.font = `${particle.size}px system-ui`;
			this.context.fillText(particle.glyph, particle.x, particle.y);
		}
		this.context.globalAlpha = 1;
	}

	drawWorldObjects(state) {
		for (const particle of state.trailParticles) this.drawParticle(particle);
		for (const platform of state.platforms) this.drawPlatform(platform);
		for (const enemy of state.enemies) this.drawEnemy(enemy);
		for (const powerup of state.powerups) this.drawPowerup(powerup);
		this.drawPlayer(state);
		for (const particle of state.sparks) this.drawParticle(particle);
	}

	drawPlatform(platform) {
		this.context.save();
		this.context.shadowColor = platform.type === 'bountiful' ? '#ffe89a' : '#62c9ff';
		this.context.shadowBlur = platform.type === 'stable' ? 5 : 12;
		this.context.font = `${platform.height}px system-ui`;
		this.context.textAlign = 'left';
		this.context.fillText(this.glyphs[platform.type].repeat(4), platform.x, platform.y + platform.height);
		this.context.restore();
	}

	drawEnemy(enemy) {
		this.context.font = `${enemy.size}px system-ui`;
		this.context.textAlign = 'center';
		this.context.fillText(enemy.glyph, enemy.x, enemy.y);
	}

	drawPowerup(powerup) {
		this.context.save();
		this.context.shadowColor = '#fff3a0';
		this.context.shadowBlur = 18;
		this.context.font = `${powerup.size}px system-ui`;
		this.context.textAlign = 'center';
		this.context.fillText(this.glyphs[powerup.type], powerup.x, powerup.y);
		this.context.restore();
	}

	drawPlayer(state) {
		const player = state.player;
		const height = this.config.playerHeight * player.squash;
		const glyph = state.einSofActive ? this.glyphs.spark : this.glyphs.player;
		this.context.save();
		this.context.shadowColor = state.einSofActive ? '#ffffff' : '#ffae42';
		this.context.shadowBlur = state.einSofActive ? 28 : 14;
		this.context.font = `${Math.max(22, height)}px system-ui`;
		this.context.textAlign = 'center';
		this.context.textBaseline = 'middle';
		this.context.fillText(glyph, player.cx, player.cy);
		if (player.shielded) {
			this.context.globalAlpha = 0.45;
			this.context.font = '46px system-ui';
			this.context.fillText(this.glyphs.magenDavid, player.cx, player.cy);
		}
		this.context.restore();
	}

	drawParticle(particle) {
		this.context.save();
		this.context.globalAlpha = Math.max(0, particle.life / particle.initialLife) ** 2;
		this.context.font = '18px system-ui';
		this.context.textAlign = 'center';
		this.context.fillText(particle.glyph, particle.x, particle.y);
		this.context.restore();
	}
}
