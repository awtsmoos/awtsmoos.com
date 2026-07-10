// B"H
/**
 * @file MovieOverlay.js
 * @description Composites the real WebGL frame with titles, scene cards, and subtitles.
 */
function rounded(context, x, y, width, height, radius) {
	context.beginPath();
	context.roundRect(x, y, width, height, radius);
}

function wrappedLines(context, text, maximumWidth) {
	const words = String(text || '').split(/\s+/);
	const lines = [];
	let current = '';
	for (const word of words) {
		const proposed = current ? `${current} ${word}` : word;
		if (context.measureText(proposed).width <= maximumWidth) current = proposed;
		else {
			if (current) lines.push(current);
			current = word;
		}
	}
	if (current) lines.push(current);
	return lines;
}

export class MovieOverlay {
	constructor(project) {
		this.project = project;
		this.canvas = document.createElement('canvas');
		this.canvas.width = project.resolution.width;
		this.canvas.height = project.resolution.height;
		this.canvas.className = 'Awtsmoos-movie-output-canvas';
		this.context = this.canvas.getContext('2d', { alpha: false });
	}

	draw(sourceCanvas, frame) {
		const { context, canvas } = this;
		context.drawImage(sourceCanvas, 0, 0, canvas.width, canvas.height);
		this.drawGrade(frame.scene);
		this.drawHeader(frame);
		this.drawDialogue(frame.dialogue);
		this.drawTransition(frame.scene);
	}

	drawGrade(scene) {
		if (!scene?.grade) return;
		this.context.save();
		this.context.globalAlpha = .09;
		this.context.fillStyle = scene.grade;
		this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
		this.context.restore();
	}

	drawHeader(frame) {
		const { context } = this;
		context.save();
		context.fillStyle = 'rgba(2,9,12,.72)';
		rounded(context, 18, 16, 410, 62, 15);
		context.fill();
		context.fillStyle = '#fff4bd';
		context.font = '700 20px system-ui';
		context.fillText(`B"H ${this.project.title}`, 34, 43);
		context.fillStyle = '#9fffe7';
		context.font = '600 14px system-ui';
		context.fillText(`${frame.scene?.label || 'Eretz'} · ${frame.shot || 'camera'}`, 34, 65);
		context.fillStyle = 'rgba(2,9,12,.72)';
		rounded(context, this.canvas.width - 160, 18, 142, 42, 12);
		context.fill();
		context.fillStyle = '#ffffff';
		context.font = '700 16px ui-monospace,monospace';
		context.fillText(frame.time.toFixed(2).padStart(5, '0'), this.canvas.width - 140, 45);
		context.restore();
	}

	drawDialogue(dialogue) {
		if (!dialogue) return;
		const { context, canvas } = this;
		context.save();
		context.font = '700 27px system-ui';
		const lines = wrappedLines(context, dialogue.text, canvas.width - 190).slice(0, 3);
		const height = 42 + lines.length * 34;
		context.fillStyle = 'rgba(0,0,0,.78)';
		rounded(context, 70, canvas.height - height - 30, canvas.width - 140, height, 18);
		context.fill();
		context.fillStyle = '#ffe278';
		context.font = '700 15px system-ui';
		context.fillText(dialogue.speaker || 'Narrator', 92, canvas.height - height - 3);
		context.fillStyle = '#ffffff';
		context.font = '700 27px system-ui';
		lines.forEach((line, index) => {
			context.fillText(line, 92, canvas.height - height + 29 + index * 34);
		});
		context.restore();
	}

	drawTransition(scene) {
		if (!scene || scene.transition === 'cut') return;
		const edge = Math.min(scene.progress, 1 - scene.progress);
		const alpha = Math.max(0, 1 - edge * 10);
		if (alpha <= 0) return;
		this.context.save();
		this.context.globalAlpha = alpha;
		this.context.fillStyle = '#020605';
		this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
		this.context.restore();
	}
}

export default MovieOverlay;
