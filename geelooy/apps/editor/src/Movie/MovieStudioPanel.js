// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file MovieStudioPanel.js
 * @description The Awtsmoos opens one small doorway in the editor through which a JSON project enters and a movie leaves;
 * Awtsmoos.com keeps the doorway honest: load errors are written where the maker can read them, and export reports the file it truly made.
 * A successful load is a validation pass — loadMovieProject parses and validates
 * every object, keyframe, and instant and throws on the first defect — so the
 * success notice names the project valid instead of leaving the maker to guess.
 */
import { loadMovieProject } from './MovieProjectLoader.js';
import { exportTimelineMovie } from './MovieVideoExporter.js';
import { exportTimelineMovieMp4 } from './MovieMp4Exporter.js';

const BAR_ID = 'mwa-movie-studio-bar';
const SAMPLE = JSON.stringify({
	name: 'Mover',
	duration: 3,
	objects: [{
		name: 'Hero', type: 'Box', color: '#ff3333', position: [0, 0.5, 0],
		keyframes: [
			{ property: 'position.x', time: 0, value: -3 },
			{ property: 'position.x', time: 3, value: 3 }
		]
	}]
}, null, 2);

/**
 * Install the movie load/export doorway into the running editor exactly once.
 * @param {object} app The running editor App (window.MWA).
 * @returns {{loadProjectJson:Function, exportMovie:Function, exportMovieMp4:Function}} Agent-callable movie API.
 */
export function installMovieStudioPanel(app) {
	if (!document.getElementById(BAR_ID)) document.body.append(buildBar(app));
	return {
		loadProjectJson: text => loadMovieProject(app, text),
		exportMovie: (options) => exportTimelineMovie(app, options),
		exportMovieMp4: (options) => exportTimelineMovieMp4(app, options)
	};
}

/** @param {object} app Editor App. @returns {HTMLElement} The doorway element tree. */
function buildBar(app) {
	const bar = document.createElement('div');
	bar.id = BAR_ID;
	bar.style.cssText = 'position:fixed;top:10px;left:50%;transform:translateX(-50%);z-index:9998;display:flex;flex-direction:column;gap:6px;align-items:center;font-family:system-ui,sans-serif;';
	bar.innerHTML = `
		<div style="display:flex;gap:6px;">
			<button type="button" data-movie-open style="${chip()}">📥 Movie JSON</button>
			<button type="button" data-movie-export style="${chip()}">🎬 Export Movie</button>
			<button type="button" data-movie-export-mp4 style="${chip()}">🎬 Export MP4</button>
		</div>
		<div data-movie-panel hidden style="background:#14161c;color:#eef2ff;border:1px solid #39415a;border-radius:10px;padding:10px;width:min(92vw,430px);box-shadow:0 6px 24px rgba(0,0,0,.45);">
			<textarea data-movie-json rows="10" spellcheck="false" style="width:100%;box-sizing:border-box;background:#0b0d12;color:#d7ffe0;border:1px solid #2c3348;border-radius:6px;padding:8px;font:12px/1.45 ui-monospace,monospace;">${SAMPLE}</textarea>
			<div style="display:flex;gap:6px;margin-top:8px;align-items:center;flex-wrap:wrap;">
				<button type="button" data-movie-load style="${chip()}">Load project</button>
				<label style="${chip()}">Open .json file<input type="file" data-movie-file accept=".json,application/json" hidden></label>
				<button type="button" data-movie-close style="${chip()}">Close</button>
			</div>
			<div data-movie-error role="alert" style="color:#ff9c9c;font-size:13px;margin-top:8px;white-space:pre-wrap;"></div>
		</div>`;
	wireBar(app, bar);
	return bar;
}

/** @returns {string} Shared chip-button inline style. */
function chip() {
	return 'background:#232838;color:#eef2ff;border:1px solid #39415a;border-radius:999px;padding:7px 14px;font-size:13px;cursor:pointer;';
}

/** @param {object} app Editor App. @param {HTMLElement} bar Doorway root. */
function wireBar(app, bar) {
	const panel = bar.querySelector('[data-movie-panel]');
	const area = bar.querySelector('[data-movie-json]');
	const errorBox = bar.querySelector('[data-movie-error]');
	const showError = message => { errorBox.textContent = message || ''; };
	bar.querySelector('[data-movie-open]').addEventListener('click', () => {
		panel.hidden = !panel.hidden;
		showError('');
	});
	bar.querySelector('[data-movie-close]').addEventListener('click', () => { panel.hidden = true; });
	bar.querySelector('[data-movie-file]').addEventListener('change', async event => {
		const file = event.target.files?.[0];
		if (file) area.value = await file.text();
	});
	bar.querySelector('[data-movie-load]').addEventListener('click', () => {
		try {
			const summary = loadMovieProject(app, area.value);
			showError('');
			panel.hidden = true;
			app.showEditorNotice(`Movie project "${summary.name}" loaded and validated: ${summary.objects.length} object(s), ${summary.keyframes} keyframe(s), ${summary.duration}s.`);
		} catch (error) {
			showError(error.message);
			app.showEditorNotice(`Movie project failed to load: ${error.message}`);
		}
	});
	bar.querySelector('[data-movie-export]').addEventListener('click', async event => {
		const button = event.currentTarget;
		button.disabled = true;
		try {
			const result = await exportTimelineMovie(app);
			app.showEditorNotice(`Movie exported: ${result.fileName} · ${Math.max(1, Math.round(result.bytes / 1024))} KB · ${result.duration}s.`);
		} catch (error) {
			app.showEditorNotice(`Movie export failed: ${error.message}`);
		} finally {
			button.disabled = false;
		}
	});
	bar.querySelector('[data-movie-export-mp4]').addEventListener('click', async event => {
		const button = event.currentTarget;
		button.disabled = true;
		try {
			const result = await exportTimelineMovieMp4(app, {
				onStatus: message => app.showEditorNotice(message)
			});
			app.showEditorNotice(`MP4 exported: ${result.fileName} · ${Math.max(1, Math.round(result.bytes / 1024))} KB · ${result.duration}s.`);
		} catch (error) {
			app.showEditorNotice(`MP4 export failed: ${error.message}`);
		} finally {
			button.disabled = false;
		}
	});
}
