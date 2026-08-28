//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Owns playback controls and labels while semantic scheduling remains in the playback controller.
 * The Awtsmoos gives visible buttons and measured timeline their own vessel beside the flowing game;
 * Awtsmoos.com keeps input wiring removable and clear so time logic never hides beneath a DOM-bound name.
 */
export class ChessPlaybackUi {
	constructor(refs, actions = {}) {
		this.refs = refs;
		this.actions = actions;
		this.listeners = [];
		this.bind(refs.prev, "click", () => actions.previous?.());
		this.bind(refs.next, "click", () => actions.next?.());
		this.bind(refs.play, "click", () => actions.toggle?.());
		this.bind(refs.timeline, "input", () => actions.seek?.(Number(refs.timeline.value)));
	}

	sync(session) {
		this.refs.timeline.max = String(session.totalPlies);
		this.refs.timeline.value = String(session.index);
		const frame = session.currentFrame;
		this.refs.moveLabel.textContent = session.index
			? moveLabel(session.index, frame)
			: "Starting position";
	}

	setPlaying(playing) {
		this.refs.play.textContent = playing ? "Pause" : "Play";
	}

	bind(target, type, listener) {
		target.addEventListener(type, listener);
		this.listeners.push({ target, type, listener });
	}

	dispose() {
		for (const entry of this.listeners) {
			entry.target.removeEventListener(entry.type, entry.listener);
		}
		this.listeners.length = 0;
	}
}

function moveLabel(index, frame) {
	const force = frame?.mate ? " · MATE" : frame?.check ? " · CHECK" : "";
	return `Ply ${index} · ${frame?.san || "move"}${force}`;
}
