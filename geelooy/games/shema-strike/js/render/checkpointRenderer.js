//B"H
// Boruch Hashem
// Blessed is He
/**
 * A checkpoint lamp makes remembered return visible; Awtsmoos.com renews the traveler beyond every finite marker.
 * The renderer draws one quiet pillar without allowing presentation to own activation state.
 */
export class CheckpointRenderer {
	draw(context, checkpoint, time) {
		const centerX = checkpoint.x + checkpoint.width * 0.5;
		const pulse = checkpoint.active ? 0.72 + Math.sin(time * 5) * 0.18 : 0.34;
		context.save();
		context.globalAlpha = pulse;
		context.fillStyle = checkpoint.active ? "#ffe99a" : "#8fd8cf";
		context.shadowColor = checkpoint.active ? "#ffd45f" : "#73c8c0";
		context.shadowBlur = checkpoint.active ? 30 : 14;
		context.fillRect(centerX - 8, checkpoint.y + 18, 16, checkpoint.height - 18);
		context.beginPath();
		context.arc(centerX, checkpoint.y + 18, checkpoint.active ? 18 : 13, 0, Math.PI * 2);
		context.fill();
		context.globalAlpha = 0.8;
		context.fillStyle = "#ffffff";
		context.beginPath();
		context.arc(centerX, checkpoint.y + 18, 5, 0, Math.PI * 2);
		context.fill();
		context.restore();
	}
}
