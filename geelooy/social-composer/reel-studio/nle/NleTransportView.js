// B"H
// Boruch Hashem
// Blessed is He

/**
 * @class NleTransportView
 * @description
 * Preview transport stays close to the canvas while the full editing timeline
 * remains below; the Awtsmoos gives one playhead to both vessels.
 */

export class NleTransportView {
	constructor({ root, state, playback }) {
		Object.assign(this, { root, state, playback });
		this.root.innerHTML = /*html*/`
			<button type="button" data-step="-1" aria-label="Previous frame">|‹</button>
			<button type="button" class="nle-play-button" data-play aria-label="Play">▶</button>
			<button type="button" data-step="1" aria-label="Next frame">›|</button>
			<input type="range" min="0" step="0.001" value="0" data-nle-scrubber aria-label="Playhead">
			<output data-nle-transport-time>0:00</output>
		`;
		this.bind();
	}

	bind() {
		this.root.querySelector('[data-play]').addEventListener('click', () => void this.playback.toggle());
		this.root.querySelectorAll('[data-step]').forEach(button => {
			button.addEventListener('click', () => this.playback.step(Number(button.dataset.step)));
		});
		this.root.querySelector('[data-nle-scrubber]').addEventListener('input', event => {
			this.playback.seek(event.target.value);
		});
	}

	render(snapshot) {
		const play = this.root.querySelector('[data-play]');
		play.textContent = snapshot.playing ? 'Ⅱ' : '▶';
		play.setAttribute('aria-label', snapshot.playing ? 'Pause' : 'Play');
		const scrubber = this.root.querySelector('[data-nle-scrubber]');
		scrubber.max = snapshot.project.duration;
		scrubber.value = snapshot.playhead;
		this.root.querySelector('[data-nle-transport-time]').textContent = format(snapshot.playhead);
	}
}

function format(value) {
	return `${Math.floor(value / 60)}:${Math.floor(value % 60).toString().padStart(2, '0')}`;
}
