// B"H — Playback: one audio element, queue, shuffle/repeat, and the
// Media Session API so playback keeps going in the background with
// lock-screen and headset controls.
export class Player {
	constructor(audioEl, hooks) {
		this.audio = audioEl;
		this.hooks = hooks || {};
		this.queue = [];
		this.index = -1;
		this.shuffle = false;
		this.repeat = 'off'; // off | all | one
		this.playOrder = [];
		this.currentTrack = null;
		this.objectUrl = null;

		audioEl.addEventListener('ended', () => this.onEnded());
		audioEl.addEventListener('timeupdate', () => this.hooks.onTime && this.hooks.onTime());
		audioEl.addEventListener('play', () => this.hooks.onState && this.hooks.onState());
		audioEl.addEventListener('pause', () => this.hooks.onState && this.hooks.onState());
		audioEl.addEventListener('loadedmetadata', () => this.hooks.onTime && this.hooks.onTime());

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
		this.audio.src = this.objectUrl;
		this.audio.load();
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
		try { await this.audio.play(); } catch (err) { console.warn('Playback blocked until a tap', err); }
		this.hooks.onQueue && this.hooks.onQueue();
		return true;
	}

	async play() {
		if (!this.currentTrack) return this.playCurrent(this.hooks.loadFile);
		try { await this.audio.play(); } catch (err) { console.warn('Play failed', err); }
		return true;
	}

	pause() { this.audio.pause(); }
	toggle() { return this.audio.paused ? this.play() : (this.pause(), Promise.resolve(true)); }
	seek(seconds) { this.audio.currentTime = Math.max(0, Math.min(seconds, this.audio.duration || 0)); }
	setVolume(v) { this.audio.volume = Math.max(0, Math.min(1, v)); }
	setRate(r) { this.audio.playbackRate = r; }
	get playing() { return !this.audio.paused && !this.audio.ended; }

	async next() {
		if (this.repeat === 'one') { this.seek(0); return this.play(); }
		if (this.index + 1 < this.queue.length) { this.index += 1; return this.playCurrent(this.hooks.loadFile); }
		if (this.repeat === 'all' && this.queue.length) { this.index = 0; return this.playCurrent(this.hooks.loadFile); }
		return false;
	}

	async prev() {
		if (this.audio.currentTime > 3) { this.seek(0); return true; }
		if (this.index > 0) { this.index -= 1; return this.playCurrent(this.hooks.loadFile); }
		this.seek(0);
		return true;
	}

	onEnded() {
		if (this.repeat === 'one') { this.seek(0); this.play(); return; }
		this.next();
	}
}
