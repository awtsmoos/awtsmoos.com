//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file AnimatorStageBridge.js
 * @description The bridge the Animator was missing: the native stage and the shared
 * movie dock used to boot as strangers, so a movie loaded into the dock was never
 * seen or heard. The Awtsmoos now lets Awtsmoos.com subscribe one Animator-owned
 * stage view to the dock state and drive the shared deterministic
 * CanvasMovieRenderer with whatever canonical movie the dock validates — play,
 * pause, and scrub included. Driving the shared renderer (instead of translating
 * into the native scene model, which exposes no public load-plan API) keeps one
 * canonical truth: what the stage shows is exactly what export renders.
 *
 * The bridge also closes two honesty gaps:
 *  - load failures (JSON.parse SyntaxErrors and schema validation errors) are
 *    mirrored into an always-visible status strip, because the dock starts
 *    collapsed and its own status line can be hidden when a load fails;
 *  - every successful load reports what the Animator projection deferred,
 *    flattened, or rejected, so silent loss is impossible.
 */
import { CanvasMovieRenderer } from '../../../shared/movie/runtime/CanvasMovieRenderer.js';

const STYLE_ID = 'awtsmoos-animator-stage-style';
const STYLE_TEXT = `
.awtsmoos-animator-stage{position:fixed;top:12px;right:12px;z-index:60;width:min(46vw,560px);background:#0d1420;color:#f5fbff;border:1px solid #2b3a4d;border-radius:12px;box-shadow:0 12px 32px rgba(0,0,0,.45);font:13px/1.45 system-ui,sans-serif;overflow:hidden}
.awtsmoos-animator-stage header{display:flex;align-items:center;gap:8px;padding:8px 10px;background:#131e2e}
.awtsmoos-animator-stage header strong{font-size:13px}
.awtsmoos-animator-stage header span{opacity:.75;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.awtsmoos-animator-stage header button{margin-left:auto;background:#1d2c42;color:inherit;border:1px solid #35506e;border-radius:6px;padding:2px 8px;cursor:pointer}
.awtsmoos-animator-stage canvas{display:block;width:100%;height:auto;background:#070b18}
.awtsmoos-animator-stage .transport{display:flex;align-items:center;gap:8px;padding:8px 10px}
.awtsmoos-animator-stage .transport button{background:#1d2c42;color:inherit;border:1px solid #35506e;border-radius:6px;padding:4px 10px;cursor:pointer}
.awtsmoos-animator-stage .transport input[type=range]{flex:1}
.awtsmoos-animator-stage .transport output{font-variant-numeric:tabular-nums;white-space:nowrap}
.awtsmoos-animator-stage .stage-status{margin:0;padding:6px 10px 9px;opacity:.9}
.awtsmoos-animator-stage .stage-status.is-error{color:#ffb4a2;opacity:1}
.awtsmoos-animator-stage.is-empty canvas,.awtsmoos-animator-stage.is-empty .transport{display:none}
.awtsmoos-animator-stage.is-minimized{display:none}
.awtsmoos-animator-stage-chip{position:fixed;top:12px;right:12px;z-index:60;background:#131e2e;color:#f5fbff;border:1px solid #35506e;border-radius:999px;padding:6px 12px;cursor:pointer;font:13px system-ui,sans-serif}
`;

export class AnimatorStageBridge {
	/** @param {object} runtime Mounted dock runtime ({root, state}). @returns {AnimatorStageBridge|null} */
	static install(runtime) {
		try {
			return new AnimatorStageBridge(runtime);
		} catch (error) {
			console.warn('B"H - Awtsmoos Animator: stage bridge could not start.', error);
			return null;
		}
	}

	constructor({ root, state } = {}) {
		if (!root || !state) {
			throw new TypeError('AnimatorStageBridge requires the mounted dock runtime ({ root, state }).');
		}
		this.dockRoot = root;
		this.state = state;
		this.movie = null;
		this.signature = '';
		this.time = 0;
		this.playing = false;
		this.rafId = 0;
		this.lastTick = 0;
		this.buildDom();
		this.renderer = new CanvasMovieRenderer(this.canvas);
		this.wrapLoaders();
		state.subscribe(snapshot => this.onSnapshot(snapshot));
	}

	buildDom() {
		if (!document.querySelector(`#${STYLE_ID}`)) {
			const style = document.createElement('style');
			style.id = STYLE_ID;
			style.textContent = STYLE_TEXT;
			document.head.append(style);
		}
		const section = document.createElement('section');
		section.className = 'awtsmoos-animator-stage is-empty';
		section.setAttribute('aria-label', 'Animator movie stage');
		section.innerHTML = `<header><strong>Movie stage</strong><span data-stage-scene></span><button type="button" data-stage-hide>Hide</button></header><canvas data-stage-canvas width="640" height="360"></canvas><div class="transport"><button type="button" data-stage-play>▶ Play</button><input type="range" data-stage-scrub min="0" max="0" step="0.05" value="0" aria-label="Scrub movie time"><output data-stage-time>0.0s / 0.0s</output></div><p class="stage-status" data-stage-status role="status">Load a canonical movie in the Movie Data Studio dock and it will play here.</p>`;
		document.body.append(section);
		const chip = document.createElement('button');
		chip.type = 'button';
		chip.className = 'awtsmoos-animator-stage-chip';
		chip.textContent = 'Show movie stage';
		chip.hidden = true;
		document.body.append(chip);
		this.section = section;
		this.chip = chip;
		this.canvas = section.querySelector('[data-stage-canvas]');
		this.sceneLabel = section.querySelector('[data-stage-scene]');
		this.playButton = section.querySelector('[data-stage-play]');
		this.slider = section.querySelector('[data-stage-scrub]');
		this.timeLabel = section.querySelector('[data-stage-time]');
		this.statusNode = section.querySelector('[data-stage-status]');
		section.querySelector('[data-stage-hide]').addEventListener('click', () => this.setMinimized(true));
		chip.addEventListener('click', () => this.setMinimized(false));
		this.playButton.addEventListener('click', () => (this.playing ? this.pause() : this.play()));
		this.slider.addEventListener('input', () => {
			this.time = Number(this.slider.value) || 0;
			this.render();
		});
	}

	setMinimized(minimized) {
		this.section.classList.toggle('is-minimized', minimized);
		this.chip.hidden = !minimized;
	}

	/**
	 * Mirror dock load failures into the always-visible stage status strip.
	 * Errors still propagate to the dock panels exactly as before; this only
	 * guarantees the failure is seen even while the dock body is collapsed.
	 */
	wrapLoaders() {
		const report = error => this.reportLoadError(error);
		const loadJson = this.state.loadJson.bind(this.state);
		this.state.loadJson = json => {
			try {
				return loadJson(json);
			} catch (error) {
				report(error);
				throw error;
			}
		};
		const load = this.state.load.bind(this.state);
		this.state.load = movie => {
			try {
				return load(movie);
			} catch (error) {
				report(error);
				throw error;
			}
		};
	}

	reportLoadError(error) {
		const kind = error instanceof SyntaxError ? 'JSON parse error' : 'Movie data error';
		this.setStatus(`${kind}: ${error.message}`, true);
		this.setMinimized(false);
	}

	onSnapshot(snapshot) {
		if (!snapshot?.movie) {
			this.movie = null;
			this.pause();
			this.section.classList.add('is-empty');
			return;
		}
		const movie = snapshot.movie;
		const signature = `${movie.id || ''}|${movie.duration || 0}|${(movie.scenes || []).length}`;
		const isNewMovie = signature !== this.signature;
		this.movie = movie;
		this.signature = signature;
		this.section.classList.remove('is-empty');
		this.slider.max = String(Math.max(0, Number(movie.duration || 0)));
		if (isNewMovie || snapshot.reason === 'loaded') {
			this.time = 0;
			this.render();
			this.reportProjection(snapshot);
			this.play();
		} else if (!this.playing) {
			this.render();
		}
	}

	reportProjection(snapshot) {
		const movie = snapshot.movie;
		const title = movie.metadata?.title || movie.title || movie.id || 'Untitled movie';
		const duration = Number(movie.duration || 0);
		const parts = [`Now playing "${title}" — ${(movie.scenes || []).length} scene(s), ${duration}s.`];
		const report = snapshot.projection?.report;
		if (report) {
			const losses = [
				['deferred', report.deferred],
				['flattened', report.flattened],
				['rejected', report.rejected]
			].filter(([, entries]) => Array.isArray(entries) && entries.length);
			if (losses.length) {
				parts.push(`Animator projection ${losses.map(([name, entries]) => `${name} ${entries.length}`).join(', ')} (see projection report).`);
			}
		}
		const message = parts.join(' ');
		this.setStatus(message, false);
		const dockStatus = this.dockRoot.querySelector('[data-movie-status]');
		if (dockStatus) {
			dockStatus.textContent = message;
		}
	}

	setStatus(message, isError) {
		this.statusNode.textContent = message;
		this.statusNode.classList.toggle('is-error', Boolean(isError));
	}

	play() {
		if (!this.movie || this.playing) {
			return;
		}
		const duration = Number(this.movie.duration || 0);
		if (duration > 0 && this.time >= duration) {
			this.time = 0;
		}
		this.playing = true;
		this.playButton.textContent = '❚❚ Pause';
		this.lastTick = performance.now();
		this.rafId = requestAnimationFrame(moment => this.tick(moment));
	}

	pause() {
		this.playing = false;
		this.playButton.textContent = '▶ Play';
		if (this.rafId) {
			cancelAnimationFrame(this.rafId);
			this.rafId = 0;
		}
	}

	tick(moment) {
		if (!this.playing || !this.movie) {
			return;
		}
		const delta = Math.max(0, (moment - this.lastTick) / 1000);
		this.lastTick = moment;
		const duration = Number(this.movie.duration || 0);
		this.time = Math.min(duration, this.time + delta);
		this.render();
		if (this.time >= duration) {
			this.pause();
			return;
		}
		this.rafId = requestAnimationFrame(next => this.tick(next));
	}

	render() {
		if (!this.movie) {
			return;
		}
		const duration = Number(this.movie.duration || 0);
		try {
			const frame = this.renderer.render(this.movie, this.time);
			this.sceneLabel.textContent = frame?.scene
				? `Scene: ${frame.scene.name || frame.scene.id || ''}`
				: 'No scene at this time';
		} catch (error) {
			this.pause();
			this.setStatus(`Stage render error: ${error.message}`, true);
		}
		this.slider.value = String(this.time);
		this.timeLabel.textContent = `${this.time.toFixed(1)}s / ${duration.toFixed(1)}s`;
	}
}
