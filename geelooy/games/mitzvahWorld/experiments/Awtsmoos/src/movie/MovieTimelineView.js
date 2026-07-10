// B"H
/**
 * @file MovieTimelineView.js
 * @description Renders editable-looking NLE lanes and a deterministic scrub playhead.
 */
const TRACK_COLORS = Object.freeze({
	scene: '#236b65', actor: '#315f9d', door: '#8b4b3d', camera: '#704ca1',
	dialogue: '#9b5d30', audio: '#47772f', event: '#3f5a62'
});

function clipLabel(track, clip) {
	return clip.label || clip.shot || clip.text || clip.action || clip.kind || clip.id || track.type;
}

export class MovieTimelineView {
	constructor(project, shell, onSeek) {
		this.project = project;
		this.shell = shell;
		this.onSeek = onSeek;
		this.scale = 34;
		this.render();
	}

	render() {
		this.shell.innerHTML = '';
		this.shell.className = 'movie-timeline-shell';
		const ruler = document.createElement('div');
		ruler.className = 'movie-ruler';
		ruler.style.width = `${this.project.duration * this.scale}px`;
		ruler.innerHTML = Array.from({ length: Math.ceil(this.project.duration / 5) + 1 }, (_, index) => (
			`<span style="position:absolute;left:${index * 5 * this.scale}px;top:6px">${index * 5}s</span>`
		)).join('');
		this.shell.appendChild(ruler);
		for (const track of this.project.tracks) this.shell.appendChild(this.trackElement(track));
		this.playhead = document.createElement('div');
		this.playhead.className = 'movie-playhead';
		this.shell.appendChild(this.playhead);
		this.shell.addEventListener('pointerdown', (event) => this.scrub(event));
		this.setTime(0);
	}

	trackElement(track) {
		const row = document.createElement('div');
		row.className = 'movie-track';
		row.dataset.type = track.type;
		const label = document.createElement('div');
		label.className = 'movie-track-label';
		label.textContent = `${track.type.toUpperCase()} · ${track.target || track.id}`;
		const lane = document.createElement('div');
		lane.className = 'movie-track-lane';
		lane.style.width = `${this.project.duration * this.scale}px`;
		for (const clip of track.clips) {
			const element = document.createElement('div');
			element.className = 'movie-clip';
			element.title = `${clip.id} · ${clip.start.toFixed(2)}–${(clip.start + clip.duration).toFixed(2)}s`;
			element.textContent = clipLabel(track, clip);
			element.style.left = `${clip.start * this.scale}px`;
			element.style.width = `${Math.max(5, clip.duration * this.scale)}px`;
			element.style.background = TRACK_COLORS[track.type] || TRACK_COLORS.event;
			lane.appendChild(element);
		}
		row.append(label, lane);
		return row;
	}

	scrub(event) {
		const rect = this.shell.getBoundingClientRect();
		const x = event.clientX - rect.left + this.shell.scrollLeft - 130;
		if (x < 0) return;
		this.onSeek?.(Math.max(0, Math.min(this.project.duration, x / this.scale)));
	}

	setTime(time) {
		if (!this.playhead) return;
		this.playhead.style.transform = `translateX(${130 + time * this.scale}px)`;
	}
}

export default MovieTimelineView;
