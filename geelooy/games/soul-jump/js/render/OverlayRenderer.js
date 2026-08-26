// B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos gives score, world-name, beginning, and failure a readable face above the moving world;
 * Awtsmoos.com keeps HUD truth separate from scenery so information stays bright when the sky is furled.
 */
export class OverlayRenderer {
	constructor(context, config, glyphs) {
		this.context = context;
		this.config = config;
		this.glyphs = glyphs;
	}

	render(state, canvas) {
		this.drawHud(state, canvas);
		if (state.gameState === 'start') {
			this.drawSheet(canvas, 'Ein Sof Ascent', [
				'Drag or use ← → to steer',
				'Tap · Space · Enter to begin',
				'Climb through the Four Worlds'
			]);
		}
		if (state.gameState === 'gameOver') {
			this.drawSheet(canvas, 'Descent becomes ascent', [
				`Sparks redeemed · ${state.score}`,
				`High ascent · ${state.highScore}`,
				'Tap · Space · Enter to rise again'
			]);
		}
	}

	drawHud(state, canvas) {
		this.context.save();
		this.context.textBaseline = 'middle';
		this.context.fillStyle = 'rgba(3, 12, 25, 0.72)';
		this.roundRect(12, 12, canvas.width - 24, 52, 18);
		this.context.fill();
		this.context.fillStyle = '#f7fbff';
		this.context.font = '700 16px system-ui';
		this.context.textAlign = 'left';
		this.context.fillText(`${this.glyphs.spark} ${state.score || 0}`, 30, 38);
		this.context.textAlign = 'right';
		this.context.fillStyle = '#a9d9ff';
		this.context.fillText(this.config.worldNames[state.worldLevel || 0], canvas.width - 30, 38);
		this.context.restore();
	}

	drawSheet(canvas, title, lines) {
		const width = Math.min(canvas.width - 34, 430);
		const height = 218;
		const x = (canvas.width - width) / 2;
		const y = (canvas.height - height) / 2;
		this.context.save();
		this.context.fillStyle = 'rgba(2, 9, 22, 0.88)';
		this.context.strokeStyle = 'rgba(116, 205, 255, 0.5)';
		this.context.lineWidth = 1.5;
		this.roundRect(x, y, width, height, 28);
		this.context.fill();
		this.context.stroke();
		this.context.textAlign = 'center';
		this.context.textBaseline = 'middle';
		this.context.fillStyle = '#ffffff';
		this.context.font = '800 28px system-ui';
		this.context.fillText(title, canvas.width / 2, y + 52);
		this.context.font = '600 15px system-ui';
		for (let index = 0; index < lines.length; index += 1) {
			this.context.fillStyle = index === 1 ? '#8ee9ff' : '#cedbeb';
			this.context.fillText(lines[index], canvas.width / 2, y + 103 + index * 30);
		}
		this.context.restore();
	}

	roundRect(x, y, width, height, radius) {
		if (this.context.roundRect) {
			this.context.beginPath();
			this.context.roundRect(x, y, width, height, radius);
			return;
		}
		this.context.beginPath();
		this.context.rect(x, y, width, height);
	}
}
