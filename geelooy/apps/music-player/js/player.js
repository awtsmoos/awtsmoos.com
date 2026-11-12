// B"H — Playback: one audio element, queue, shuffle/repeat, and the
// Media Session API so playback keeps going in the background with
// lock-screen and headset controls.
//
// BACKGROUND, READ THIS: the main element's sound runs through the Web Audio
// visualizer graph (createMediaElementSource), and a phone browser suspends
// that AudioContext the moment the page goes to the background — the music
// would stop even though the element is still "playing". So when the page
// hides mid-song, playback hands off to a second, never-routed <audio>
// element (same track, same position) that plays straight to the speakers,
// and hands back to the main element when the page returns. A service worker
// cannot do this job — it cannot play audio at all.
export class Player {
	constructor(audioEl, hooks) {
		this.audio = audioEl;
		this.bgAudio = document.createElement('audio');
		this.bgAudio.preload = 'metadata';
		this.background = false;
		this.pendingSeek = null;
		this.hooks = hooks || {};
		this.queue = [];
		this.index = -1;
		this.shuffle = false;
		this.repeat = 'off'; // off | all | one
		this.playOrder = [];
		this.currentTrack = null;
		this.objectUrl = null;

		this.attach(this.audio);
		this.attach(this.bgAudio);

		if ('mediaSession' in navigator) {
			try {
				navigator.mediaSession.setActionHandler('play', () => this.play());
				navigator.mediaSession.setActionHandler('pause', () => this.pause());
				navigator.mediaSession.setActionHandler('previoustrack', () => this.prev());
				navigator.mediaSession.setActionHandler('nexttrack', () => this.next());
				navigator.mediaSession.setActionHandler('seekto', (d) => { if (d.seekTime != null) this.seek(d.seekTime); });
			} catch (err) { console.warn('Media Session handlers unavailable', err); }
		}
	}

	attach(el) {
		el.addEventListener('ended', () => this.onEnded());
		el.addEventListener('timeupdate', () => this.onTime(el));
		el.addEventListener('play', () => this.hooks.onState && this.hooks.onState());
		el.addEventListener('pause', () => this.hooks.onState && this.hooks.onState());
		el.addEventListener('loadedmetadata', () => {
			if (this.pendingSeek != null) {
				try { el.currentTime = this.pendingSeek; } catch (err) { /* retry on next load */ }
				this.pendingSeek = null;
			}
			this.hooks.onTime && this.hooks.onTime();
		});
	}

	// The element actually making sound right now.
	el() { return this.background ? this.bgAudio : this.audio; }
	get playing() { const a = this.el(); return !a.paused && !a.ended; }
	get duration() { return this.el().duration || this.currentTrack?.duration || 0; }
	get currentTime() { return this.el().currentTime || 0; }

	onTime(el) {
		if (el !== this.el()) return;
		this.updatePositionState();
		this.hooks.onTime && this.hooks.onTime();
	}

	// The lock-screen notification shows live progress only when the session
	// carries a position state; without it some phones treat the session as
	// idle and drop it.
	updatePositionState() {
		if (!('mediaSession' in navigator) || !navigator.mediaSession.setPositionState) return;
		const a = this.el();
		const dur = a.duration;
		if (!Number.isFinite(dur) || !dur) return;
		try {
			navigator.mediaSession.setPositionState({
				duration: dur,
				playbackRate: a.playbackRate || 1,
				position: a.currentTime || 0,
			});
		} catch (err) { /* some browsers reject mid-seek; the next tick retries */ }
	}

	// Page hidden mid-song: move playback to the direct element so the
	// suspended visualizer graph cannot silence it.
	async enterBackground() {
		if (this.background || !this.playing) return false;
		const main = this.audio, bg = this.bgAudio;
		const at = main.currentTime || 0;
		bg.src = main.src;
		bg.volume = main.volume;
		bg.playbackRate = main.playbackRate;
		try { bg.currentTime = at; } catch (err) { this.pendingSeek = at; }
		try {
			await bg.play();
		} catch (err) {
			console.warn('Background audio handoff failed, staying on the main element', err);
			this.pendingSeek = null;
			return false;
		}
		this.background = true;
		main.pause();
		console.info('[music] background handoff: direct audio element');
		return true;
	}

	// Page visible again: hand playback back to the visualizer element.
	async enterForeground() {
		if (!this.background) return false;
		const main = this.audio, bg = this.bgAudio;
		const at = bg.currentTime || 0;
		main.src = bg.src;
		main.volume = bg.volume;
		main.playbackRate = bg.playbackRate;
		try { main.currentTime = at; } catch (err) { this.pendingSeek = at; }
		try {
			await main.play();
		} catch (err) {
			console.warn('Foreground return failed', err);
			this.pendingSeek = null;
			return false;
		}
		this.background = false;
		bg.pause();
		console.info('[music] foreground return: visualizer element');
		return true;
	}

	setQueue(ids, startId) {
		this.queue = ids.slice();
		this.playOrder = ids.slice();
		this.index = startId ? this.queue.indexOf(startId) : 0;
		if (this.index < 0) this.index = 0;
	}

	shuffleQueue(on) {
		this.shuffle = on;
		if (on) {
			const current = this.queue[this.index];
			const rest = this.queue.filter((id) => id !== current);
			for (let i = rest.length - 1; i > 0; i--) {
				const j = Math.floor(Math.random() * (i + 1));
				[rest[i], rest[j]] = [rest[j], rest[i]];
			}
			this.queue = current ? [current, ...rest] : rest;
			this.index = 0;
		} else {
			const current = this.queue[this.index];
			this.queue = this.playOrder.slice();
			this.index = Math.max(0, this.queue.indexOf(current));
		}
		this.hooks.onQueue && this.hooks.onQueue();
	}

	cycleRepeat() {
		this.repeat = this.repeat === 'off' ? 'all' : this.repeat === 'all' ? 'one' : 'off';
		this.hooks.onState && this.hooks.onState();
		return this.repeat;
	}

	async loadTrack(track, file) {
		if (this.objectUrl) { URL.revokeObjectURL(this.objectUrl); this.objectUrl = null; }
		this.objectUrl = URL.createObjectURL(file);
		this.currentTrack = track;
		const a = this.el();
		a.src = this.objectUrl;
		a.load();
		if ('mediaSession' in navigator) {
			try {
				navigator.mediaSession.metadata = new MediaMetadata({
					title: track.title || track.name,
					artist: track.artist || 'Awtsmoos Music',
					album: track.source || 'My Library',
				});
			} catch (err) { console.warn('MediaMetadata unavailable', err); }
		}
		this.hooks.onTrack && this.hooks.onTrack(track);
	}

	async playId(id, loadFile) {
		const at = this.queue.indexOf(id);
		if (at >= 0) this.index = at;
		else { this.queue.push(id); this.index = this.queue.length - 1; }
		return this.playCurrent(loadFile);
	}

	async playCurrent(loadFile) {
		const id = this.queue[this.index];
		if (!id) return false;
		const track = await loadFile(id);
		if (!track) return false;
		await this.loadTrack(track.track, track.file);
		try { await this.el().play(); } catch (err) { console.warn('Playback blocked until a tap', err); }
		this.hooks.onQueue && this.hooks.onQueue();
		return true;
	}

	async play() {
		if (!this.currentTrack) return this.playCurrent(this.hooks.loadFile);
		try { await this.el().play(); } catch (err) { console.warn('Play failed', err); }
		return true;
	}

	pause() { this.el().pause(); }
	toggle() { return this.el().paused ? this.play() : (this.pause(), Promise.resolve(true)); }
	seek(seconds) { this.el().currentTime = Math.max(0, Math.min(seconds, this.duration || 0)); }
	setVolume(v) {
		const vol = Math.max(0, Math.min(1, v));
		this.audio.volume = vol;
		this.bgAudio.volume = vol;
	}
	setRate(r) {
		this.audio.playbackRate = r;
		this.bgAudio.playbackRate = r;
	}

	async next() {
		if (this.repeat === 'one') { this.seek(0); return this.play(); }
		if (this.index + 1 < this.queue.length) { this.index += 1; return this.playCurrent(this.hooks.loadFile); }
		if (this.repeat === 'all' && this.queue.length) { this.index = 0; return this.playCurrent(this.hooks.loadFile); }
		return false;
	}

	async prev() {
		if (this.el().currentTime > 3) { this.seek(0); return true; }
		if (this.index > 0) { this.index -= 1; return this.playCurrent(this.hooks.loadFile); }
		this.seek(0);
		return true;
	}

	onEnded() {
		if (this.repeat === 'one') { this.seek(0); this.play(); return; }
		this.next();
	}
}
