//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module AwtsmoosAudioPlayer
 * @description Beautiful inline audio player with golden Awtsmoos styling.
 * Play/pause, scrubber, time display, works on mobile and desktop.
 *
 * Usage:
 *   // Auto-enhance all audio elements with .awtsmoos-audio:
 *   AwtsmoosAudioPlayer.enhanceAll();
 *
 *   // Or create one programmatically:
 *   const player = new AwtsmoosAudioPlayer(containerEl, {
 *     src: 'https://.../audio.mp3',
 *     title: 'My Shiur'
 *   });
 */

(function(global) {
	'use strict';

	function formatTime(seconds) {
		if (!isFinite(seconds) || seconds < 0) return '0:00';
		const m = Math.floor(seconds / 60);
		const s = Math.floor(seconds % 60);
		return `${m}:${s.toString().padStart(2, '0')}`;
	}

	class AwtsmoosAudioPlayer {
		constructor(container, options = {}) {
			this.container = typeof container === 'string'
				? document.querySelector(container)
				: container;
			if (!this.container) throw new Error('Container not found');

			this.src = options.src || '';
			this.title = options.title || '';

			this._build();
			this._wire();
		}

		_build() {
			this.container.classList.add('aap-player');
			this.container.innerHTML = `
				<button type="button" class="aap-play-btn" aria-label="Play">
					<svg class="aap-icon-play" viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
						<path d="M8 5v14l11-7z"/>
					</svg>
					<svg class="aap-icon-pause" viewBox="0 0 24 24" width="20" height="20" fill="currentColor" style="display:none">
						<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
					</svg>
				</button>
				<div class="aap-main">
					${this.title ? `<div class="aap-title">${escapeHtml(this.title)}</div>` : ''}
					<div class="aap-scrubber-wrap">
						<input type="range" class="aap-scrubber" min="0" max="100" value="0" step="0.1"
							aria-label="Seek">
						<div class="aap-scrubber-fill"></div>
					</div>
					<div class="aap-times">
						<span class="aap-current">0:00</span>
						<span class="aap-duration">0:00</span>
					</div>
				</div>
				<audio preload="metadata" src="${escapeAttr(this.src)}"></audio>
			`;

			this.audio = this.container.querySelector('audio');
			this.playBtn = this.container.querySelector('.aap-play-btn');
			this.iconPlay = this.container.querySelector('.aap-icon-play');
			this.iconPause = this.container.querySelector('.aap-icon-pause');
			this.scrubber = this.container.querySelector('.aap-scrubber');
			this.scrubberFill = this.container.querySelector('.aap-scrubber-fill');
			this.currentEl = this.container.querySelector('.aap-current');
			this.durationEl = this.container.querySelector('.aap-duration');
		}

		_wire() {
			// Play/pause toggle
			this.playBtn.addEventListener('click', (e) => {
				e.preventDefault();
				e.stopPropagation();
				this.toggle();
			});

			// Audio events
			this.audio.addEventListener('loadedmetadata', () => {
				this.durationEl.textContent = formatTime(this.audio.duration);
			});
			this.audio.addEventListener('timeupdate', () => {
				const pct = this.audio.duration > 0
					? (this.audio.currentTime / this.audio.duration) * 100
					: 0;
				this.scrubber.value = pct;
				this.scrubberFill.style.width = pct + '%';
				this.currentEl.textContent = formatTime(this.audio.currentTime);
			});
			this.audio.addEventListener('play', () => this._setPlaying(true));
			this.audio.addEventListener('pause', () => this._setPlaying(false));
			this.audio.addEventListener('ended', () => {
				this._setPlaying(false);
				this.scrubber.value = 0;
				this.scrubberFill.style.width = '0%';
			});

			// Scrubber
			let wasPlaying = false;
			this.scrubber.addEventListener('input', () => {
				const pct = parseFloat(this.scrubber.value);
				this.scrubberFill.style.width = pct + '%';
				if (this.audio.duration > 0) {
					this.audio.currentTime = (pct / 100) * this.audio.duration;
				}
			});
			// Pause while scrubbing on touch for smoother UX
			this.scrubber.addEventListener('touchstart', () => {
				wasPlaying = !this.audio.paused;
				if (wasPlaying) this.audio.pause();
			}, { passive: true });
			this.scrubber.addEventListener('touchend', () => {
				if (wasPlaying) this.audio.play().catch(() => {});
			});
		}

		_setPlaying(playing) {
			this.iconPlay.style.display = playing ? 'none' : '';
			this.iconPause.style.display = playing ? '' : 'none';
			this.playBtn.setAttribute('aria-label', playing ? 'Pause' : 'Play');
			this.container.classList.toggle('aap-playing', playing);
		}

		toggle() {
			if (this.audio.paused) {
				// Pause other players (only one at a time)
				document.querySelectorAll('.aap-player.aap-playing').forEach(el => {
					if (el !== this.container) {
						const other = el.querySelector('audio');
						if (other) other.pause();
					}
				});
				this.audio.play().catch(() => {});
			} else {
				this.audio.pause();
			}
		}

		play() { this.audio.play().catch(() => {}); }
		pause() { this.audio.pause(); }

		setSrc(src, title) {
			this.src = src;
			this.audio.src = src;
			if (title !== undefined) {
				this.title = title;
				const titleEl = this.container.querySelector('.aap-title');
				if (titleEl) titleEl.textContent = title;
			}
		}

		destroy() {
			this.audio.pause();
			this.container.innerHTML = '';
			this.container.classList.remove('aap-player');
		}

		/**
		 * Auto-enhance all <audio class="awtsmoos-audio"> elements on the page.
		 */
		static enhanceAll(root = document) {
			root.querySelectorAll('audio.awtsmoos-audio:not([data-aap-enhanced])').forEach(audioEl => {
				audioEl.setAttribute('data-aap-enhanced', 'true');
				const wrapper = document.createElement('div');
				audioEl.parentNode.insertBefore(wrapper, audioEl);
				const src = audioEl.getAttribute('src') || '';
				const title = audioEl.getAttribute('data-title') || audioEl.getAttribute('title') || '';
				// Move the audio element into the wrapper (player will use it)
				new AwtsmoosAudioPlayer(wrapper, { src, title });
				audioEl.remove(); // Player creates its own audio element
			});
		}
	}

	function escapeHtml(s) {
		const d = document.createElement('div');
		d.textContent = s;
		return d.innerHTML;
	}
	function escapeAttr(s) {
		return String(s).replace(/"/g, '&quot;').replace(/</g, '&lt;');
	}

	global.AwtsmoosAudioPlayer = AwtsmoosAudioPlayer;

	// Auto-enhance on DOM ready
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', () => AwtsmoosAudioPlayer.enhanceAll());
	} else {
		AwtsmoosAudioPlayer.enhanceAll();
	}

})(typeof window !== 'undefined' ? window : this);
