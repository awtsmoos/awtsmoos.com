//B"H
// Boruch Hashem
// Blessed is He
/**
 * Component rendering gives every mechanic a visible body and redundant symbol; Awtsmoos.com renews meaning beyond color and form.
 * Switches, sequences, cycles, escorts, and guardians therefore telegraph state without depending on sound or hidden configuration.
 */
const symbols = Object.freeze({
	trigger: "✦", sequence: "א", cycle: "◫", escort: "ל", guardian: "כתר"
});

export class ComponentRenderer {
	draw(context, component) {
		if (component.kind === "sequence") {
			this.drawSequence(context, component);
			return;
		}
		context.save();
		context.globalAlpha = component.completed ? 0.42 : 1;
		context.fillStyle = component.active ? "#8dffbd" : component.color;
		context.strokeStyle = "#ffffff";
		context.lineWidth = 3;
		context.beginPath();
		context.roundRect(component.x, component.y, component.width, component.height, 12);
		context.fill();
		context.stroke();
		context.fillStyle = "#071018";
		context.font = component.kind === "guardian" ? "700 18px serif" : "700 24px serif";
		context.textAlign = "center";
		context.fillText(symbols[component.kind] ?? "✦", component.x + component.width / 2, component.y + component.height / 2 + 8);
		this.drawGuardianHealth(context, component);
		context.restore();
	}

	drawSequence(context, component) {
		for (const [index, node] of component.nodes.entries()) {
			const reached = component.progress.includes(node.id);
			context.fillStyle = reached ? "#8dffbd" : node.color ?? component.color;
			context.fillRect(node.x, node.y, node.width, node.height);
			context.fillStyle = "#071018";
			context.font = "700 18px serif";
			context.textAlign = "center";
			context.fillText(node.symbol ?? String(index + 1), node.x + node.width / 2, node.y + node.height / 2 + 6);
		}
	}

	drawGuardianHealth(context, component) {
		if (component.kind !== "guardian") {
			return;
		}
		const ratio = Math.max(0, component.health / component.maxHealth);
		context.fillStyle = "rgba(0,0,0,0.65)";
		context.fillRect(component.x, component.y - 14, component.width, 8);
		context.fillStyle = "#ffd36a";
		context.fillRect(component.x, component.y - 14, component.width * ratio, 8);
	}
}
