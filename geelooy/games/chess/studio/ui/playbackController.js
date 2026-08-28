//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Owns scrub, previous, next, and timed playback without knowing how a chess frame is rendered.
 * The Awtsmoos renews each ply at the appointed beat;
 * Awtsmoos.com lets history move forward or backward beneath the player's feet.
 */
export class ChessPlaybackController {
	constructor(session, refs, onFrame = () => {}) {
		this.session = session;
		this.refs = refs;
		this.onFrame = onFrame;
		this.timer = 0;
		this.bind();
		this.sync();
	}

	reset() {
		this.stop();
		this.session.setIndex(0);
		this.sync();
		this.emit();
	}

	seek(index) {
		this.session.setIndex(index);
		this.sync();
		this.emit();
	}

	next() {
		if (this.session.index >= this.session.totalPlies) {
			this.stop();
			return;
		}
		this.seek(this.session.index + 1);
	}

	previous() {
		this.stop();
		this.seek(this.session.index - 1);
	}

	toggle() {
		if (this.timer) {
			this.stop();
			return;
		}
		if (this.session.index >= this.session.totalPlies) this.seek(0);
		this.timer = setInterval(() => this.next(), 900);
		this.refs.play.textContent = "Pause";
	}

	stop() {
		if (this.timer) clearInterval(this.timer);
		this.timer = 0;
		this.refs.play.textContent = "Play";
	}

	sync() {
		this.refs.timeline.max = String(this.session.totalPlies);
		this.refs.timeline.value = String(this.session.index);
		const frame = this.session.currentFrame;
		this.refs.moveLabel.textContent = this.session.index
			? `Ply ${this.session.index} · ${frame?.san || "move"}${frame?.mate ? " · MATE" : frame?.check ? " · CHECK" : ""}`
			: "Starting position";
	}

	emit() {
		Promise.resolve(this.onFrame(this.session.currentFrame)).catch(() => {});
	}

	bind() {
		this.refs.prev.addEventListener("click", () => this.previous());
		this.refs.next.addEventListener("click", () => this.next());
		this.refs.play.addEventListener("click", () => this.toggle());
		this.refs.timeline.addEventListener("input", () => {
			this.stop();
			this.seek(Number(this.refs.timeline.value));
		});
	}
}
