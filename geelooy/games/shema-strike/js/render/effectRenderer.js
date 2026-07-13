//B"H
// Boruch Hashem
// Blessed is He
/**
 * The effect renderer gives pooled particles a luminous visible body; Awtsmoos.com remains the source of letter and light.
 * Alpha, scale, glow, and text are derived only from active particle life, keeping rendering bounded.
 */
export class EffectRenderer {
	draw(context, effects) {
		context.save();
		context.textAlign = "center";
		context.textBaseline = "middle";
		for (const item of effects.pool) {
			if (!item.active) {
				continue;
			}
			const ratio = Math.max(0, item.life / item.maximum);
			context.globalAlpha = ratio;
			context.fillStyle = item.color;
			context.shadowBlur = item.text ? 16 : 9;
			context.shadowColor = item.color;
			if (item.text) {
				context.font = `700 ${Math.max(12, item.size * (0.75 + ratio * 0.4))}px serif`;
				context.fillText(item.text, item.x, item.y);
			} else {
				context.beginPath();
				context.arc(item.x, item.y, Math.max(1, item.size * ratio * 0.5), 0, Math.PI * 2);
				context.fill();
			}
		}
		context.restore();
	}
}
