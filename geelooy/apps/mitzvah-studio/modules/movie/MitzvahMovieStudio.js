// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahMovieStudio.js
 * @description Self-contained "Movie Studio" panel for Mitzvah Studio.
 * Lets the user compose a shot list (camera preset, target object, duration, dialogue),
 * preview it on a timeline strip with live validation, then send it to the game's
 * movie maker: open it there, render it to WebM, or copy/download the project JSON.
 * Mounted by the coordinator with mountMoviePanel(container, { state, announcer }).
 */

import {
	buildMovieProject,
	CAMERA_PRESETS,
	movieMakerUrl,
	PRESET_IDS,
	validateMovieProject
} from './MovieProjectBuilder.js';
import {
	normalizeStudioMovie
} from '../state/StudioDocumentModel.js';

function el(tag, attrs, children) {
	const node = document.createElement(tag);
	if (attrs) {
		for (const key of Object.keys(attrs)) {
			if (key === 'text') {
				node.textContent = attrs[key];
			} else if (key === 'style' && typeof attrs[key] === 'object') {
				Object.assign(node.style, attrs[key]);
			} else if (key.startsWith('on') && typeof attrs[key] === 'function') {
				node.addEventListener(key.slice(2), attrs[key]);
			} else if (key === 'value' && 'value' in node) {
				node.value = attrs[key];
			} else {
				node.setAttribute(key, attrs[key]);
			}
		}
	}
	if (children) {
		for (const child of children) {
			if (child) node.appendChild(child);
		}
	}
	return node;
}

function formatTime(totalSeconds) {
	const seconds = Math.max(0, Math.round(totalSeconds));
	const minutes = Math.floor(seconds / 60);
	const rest = seconds % 60;
	return `${minutes}:${String(rest).padStart(2, '0')}`;
}

function slugify(text) {
	return String(text || '')
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '')
		.slice(0, 60) || 'movie';
}

function gradeForPreset(presetId) {
	const preset = CAMERA_PRESETS.find((candidate) => candidate.id === presetId);
	return preset ? preset.grade : '#9eb8ff';
}

/**
 * Mounts the Movie Studio panel into a container element.
 * @param {HTMLElement} container Element that receives the panel.
 * @param {{state: object, announcer?: Function}} context Studio state and optional announcer.
 * @returns {{unmount: Function}} Cleanup handle.
 */
export function mountMoviePanel(container, context = {}) {
	if (!container || typeof container.appendChild !== 'function') {
		throw new Error('mountMoviePanel: a container element is required.');
	}
	const state = context.state || null;
	const announce = typeof context.announcer === 'function'
		? context.announcer
		: () => {};

	const shots = [];
	let shotCounter = 0;
	let busy = false;
	let unsubscribe = null;
	// Key of the object the author last chose in the new-shot target select.
	// Held in JS (not only in the DOM) so state notifications that rebuild
	// the option lists can never silently reset the choice to the first object.
	let chosenTargetKey = '';
	// Signature of the movie slot as last written to / read from the document,
	// so document sync adopts external changes (load, new, undo) without
	// fighting the panel's own persistence writes.
	let syncedMovieSignature = '';

	const root = el('section', { class: 'mitzvah-movie-studio', 'aria-label': 'Movie Studio' }, [
		el('h2', { text: 'Movie Studio', style: { margin: '0 0 4px' } }),
		el('p', {
			text: 'Turn your studio scene into a cinematic movie. Add shots, pick a camera move for each one, write dialogue, then open it in the Movie Maker or render it straight to WebM video. For an MP4 release with dialogue mixed in, run: node geelooy/games/mitzvah-world/movies/tools/finalizeMovie.mjs',
			style: { margin: '0 0 12px', opacity: '0.85' }
		})
	]);

	// Movie title.
	const titleInput = el('input', {
		type: 'text',
		placeholder: 'My Mitzvah Movie',
		'aria-label': 'Movie title',
		style: { width: '100%', boxSizing: 'border-box', padding: '6px 8px', marginBottom: '12px' }
	});
	titleInput.addEventListener('input', () => { persistMovie(); validateNow(); });
	root.appendChild(el('label', { style: { display: 'block', fontWeight: 'bold', marginBottom: '4px' } }, [
		document.createTextNode('Movie title'),
		titleInput
	]));

	// Add-shot form.
	const presetSelect = el('select', { 'aria-label': 'Camera preset' },
		CAMERA_PRESETS.map((preset) => el('option', { value: preset.id, text: preset.label, title: preset.description })));
	const targetSelect = el('select', { 'aria-label': 'Shot target' });
	const durationInput = el('input', { type: 'number', min: '1', step: '0.5', value: '5', 'aria-label': 'Duration in seconds', style: { width: '64px' } });
	const speakerInput = el('input', { type: 'text', placeholder: 'Speaker', 'aria-label': 'Dialogue speaker', style: { width: '110px' } });
	const textInput = el('input', { type: 'text', placeholder: 'Dialogue line (optional)', 'aria-label': 'Dialogue text', style: { flex: '1', minWidth: '140px' } });
	const addButton = el('button', {
		type: 'button',
		text: 'Add shot',
		style: { padding: '6px 14px', cursor: 'pointer' },
		onclick: () => addShot()
	});
	const addRow = el('div', { style: { display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '12px' } }, [
		el('span', { text: 'New shot:', style: { fontWeight: 'bold' } }),
		presetSelect, targetSelect, durationInput, speakerInput, textInput, addButton
	]);
	root.appendChild(addRow);
	targetSelect.addEventListener('change', () => { chosenTargetKey = targetSelect.value; });

	// Shot list.
	root.appendChild(el('h3', { text: 'Shots', style: { margin: '8px 0 6px' } }));
	const emptyState = el('p', {
		text: 'Add your first shot to start building your movie.',
		style: { fontStyle: 'italic', opacity: '0.8' }
	});
	const shotList = el('div', { style: { display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' } });
	root.appendChild(shotList);
	root.appendChild(emptyState);

	// Timeline strip.
	root.appendChild(el('h3', { text: 'Timeline', style: { margin: '8px 0 6px' } }));
	const timelineStrip = el('div', {
		'aria-label': 'Movie timeline',
		style: { display: 'flex', gap: '4px', alignItems: 'stretch', minHeight: '44px', marginBottom: '6px' }
	});
	const timelineTotal = el('p', { text: '', style: { margin: '0 0 12px', fontWeight: 'bold' } });
	root.appendChild(timelineStrip);
	root.appendChild(timelineTotal);

	// Validation + errors + loading.
	const validationBox = el('div', { role: 'status', style: { marginBottom: '12px', fontSize: '0.95em' } });
	const errorBox = el('div', { role: 'alert', style: { display: 'none', color: '#a31212', marginBottom: '12px' } });
	const loadingBox = el('div', { role: 'status', text: 'Building your movie…', style: { display: 'none', marginBottom: '12px', fontStyle: 'italic' } });
	root.appendChild(validationBox);
	root.appendChild(errorBox);
	root.appendChild(loadingBox);

	// Action buttons.
	const openButton = el('button', { type: 'button', text: 'Open in Movie Maker', style: buttonStyle(), onclick: () => openInMaker(false) });
	const renderButton = el('button', { type: 'button', text: 'Render Movie (WebM)', style: buttonStyle(), onclick: () => openInMaker(true) });
	const copyButton = el('button', { type: 'button', text: 'Copy Project JSON', style: buttonStyle(), onclick: () => copyProject() });
	const downloadButton = el('button', { type: 'button', text: 'Download project.json', style: buttonStyle(), onclick: () => downloadProject() });
	// The import input stays rendered (visually hidden, never display:none):
	// it is appended to the live button row below and clicked synchronously
	// from the Import button's own click handler, so the user-gesture chain
	// is intact in real browsers — and the control remains present and
	// drivable for automation and assistive technology, which cannot operate
	// a display:none input.
	const importFileInput = el('input', {
		type: 'file',
		accept: 'application/json,.json',
		'aria-label': 'Import a Movie Maker project JSON file',
		style: { position: 'absolute', width: '1px', height: '1px', opacity: '0', overflow: 'hidden' }
	});
	importFileInput.addEventListener('change', () => {
		const file = importFileInput.files && importFileInput.files[0];
		importFileInput.value = '';
		if (file) void importProjectFile(file);
	});
	const importButton = el('button', {
		type: 'button',
		text: 'Import project JSON',
		style: buttonStyle(),
		onclick: () => {
			announce('Choose a Movie Maker project JSON file to import.');
			importFileInput.click();
		}
	});
	const buttonRow = el('div', { style: { display: 'flex', gap: '8px', flexWrap: 'wrap' } }, [
		openButton, renderButton, copyButton, downloadButton, importButton, importFileInput
	]);
	root.appendChild(buttonRow);
	container.appendChild(root);

	function buttonStyle() {
		return { padding: '8px 14px', cursor: 'pointer' };
	}

	function readDocument() {
		if (!state) return null;
		if (state.document && Array.isArray(state.document.objects)) return state.document;
		if (typeof state.snapshot === 'function') {
			const snapshot = state.snapshot();
			if (snapshot && snapshot.document && Array.isArray(snapshot.document.objects)) {
				return snapshot.document;
			}
		}
		return null;
	}

	function objectOptions() {
		const documentState = readDocument();
		if (!documentState) return [];
		return documentState.objects.map((object) => ({
			id: String(object.id || ''),
			label: String(object.label || 'Object')
		}));
	}

	// Select options are keyed by object id (labels repeat and can be
	// renamed; ids cannot). Objects without an id fall back to a label key.
	function targetKey(option) {
		return option.id ? `id:${option.id}` : `label:${option.label}`;
	}

	function objectForKey(key) {
		const options = objectOptions();
		return options.find((option) => targetKey(option) === key) || null;
	}

	function keyForShot(shot) {
		const options = objectOptions();
		if (shot.targetId) {
			const byId = options.find((option) => option.id === shot.targetId);
			if (byId) return targetKey(byId);
		}
		if (shot.targetLabel) {
			const byLabel = options.find((option) => option.label === shot.targetLabel)
				|| options.find((option) => option.label.toLowerCase() === shot.targetLabel.toLowerCase());
			if (byLabel) return targetKey(byLabel);
		}
		return options.length > 0 ? targetKey(options[0]) : '';
	}

	// --- Movie persistence: the shot list lives in the document's movie slot,
	// so Save / Load / storage round-trips carry it with the world. ---

	function readMovie() {
		const documentState = readDocument();
		return normalizeStudioMovie(documentState ? documentState.movie : undefined);
	}

	function movieSignature(movie) {
		return JSON.stringify(movie);
	}

	function persistMovie() {
		if (!state || typeof state.updateMovie !== 'function') return;
		const slot = normalizeStudioMovie({
			shotCounter,
			shots: JSON.parse(JSON.stringify(shots)),
			title: titleInput.value
		});
		const signature = movieSignature(slot);
		if (signature === syncedMovieSignature) return;
		syncedMovieSignature = signature;
		state.updateMovie(slot);
	}

	function syncMovieFromDocument() {
		const movie = readMovie();
		const signature = movieSignature(movie);
		if (signature === syncedMovieSignature) return;
		syncedMovieSignature = signature;
		shots.length = 0;
		for (const shot of movie.shots) {
			shots.push(JSON.parse(JSON.stringify(shot)));
		}
		shotCounter = movie.shotCounter;
		if (document.activeElement !== titleInput) {
			titleInput.value = movie.title;
		}
		renderShots();
	}

	function movieTitle() {
		const typed = titleInput.value.trim();
		if (typed) return typed;
		const documentState = readDocument();
		if (documentState && documentState.name) return String(documentState.name);
		return 'Untitled Mitzvah Movie';
	}

	function fillTargetSelect(select, preferredKey) {
		const options = objectOptions();
		select.innerHTML = '';
		if (options.length === 0) {
			select.appendChild(el('option', { value: '', text: 'No studio objects yet' }));
			select.disabled = true;
			return '';
		}
		select.disabled = false;
		for (const option of options) {
			select.appendChild(el('option', { value: targetKey(option), text: option.label }));
		}
		const keys = options.map(targetKey);
		const chosen = keys.includes(preferredKey) ? preferredKey : keys[0];
		select.value = chosen;
		return chosen;
	}

	function refreshTargetOptions() {
		// Per-shot selects re-derive their value from the shot record itself,
		// so a rebuild can never drift a row away from its stored target.
		for (const select of root.querySelectorAll('select[data-role="shot-target"]')) {
			const shot = shots.find((candidate) => candidate.id === select.dataset.shotId);
			fillTargetSelect(select, shot ? keyForShot(shot) : select.value);
		}
		// New-shot form: preserve the author's choice held in JS state.
		chosenTargetKey = fillTargetSelect(targetSelect, chosenTargetKey || targetSelect.value);
	}

	function addShot() {
		shotCounter += 1;
		const target = objectForKey(targetSelect.value || chosenTargetKey) || objectOptions()[0] || null;
		shots.push({
			id: `shot-${shotCounter}`,
			title: `Shot ${shotCounter}`,
			preset: presetSelect.value || 'static',
			durationSec: parseDuration(durationInput.value),
			targetId: target ? target.id : '',
			targetLabel: target ? target.label : '',
			dialogue: { speaker: speakerInput.value.trim(), text: textInput.value.trim() },
			cameraOffset: 1
		});
		speakerInput.value = '';
		textInput.value = '';
		persistMovie();
		renderShots();
		announce(`Shot ${shotCounter} added.`);
	}

	function parseDuration(value) {
		const parsed = Number(value);
		return Number.isFinite(parsed) ? parsed : 5;
	}

	function removeShot(id) {
		const index = shots.findIndex((shot) => shot.id === id);
		if (index >= 0) {
			const removed = shots.splice(index, 1)[0];
			persistMovie();
			renderShots();
			announce(`Removed ${removed.title}.`);
		}
	}

	function renderShots() {
		shotList.innerHTML = '';
		emptyState.style.display = shots.length === 0 ? '' : 'none';
		shots.forEach((shot) => {
			shotList.appendChild(buildShotRow(shot));
		});
		refreshTargetOptions();
		renderTimeline();
		validateNow();
	}

	function buildShotRow(shot) {
		const titleField = el('input', { type: 'text', value: shot.title, 'aria-label': 'Shot title', style: { width: '110px' } });
		titleField.addEventListener('input', () => { shot.title = titleField.value; persistMovie(); renderTimeline(); validateNow(); });

		const presetField = el('select', { 'aria-label': 'Camera preset' },
			CAMERA_PRESETS.map((preset) => el('option', {
				value: preset.id,
				text: preset.label,
				title: preset.description,
				...(preset.id === shot.preset ? { selected: 'selected' } : {})
			})));
		presetField.addEventListener('change', () => { shot.preset = presetField.value; persistMovie(); renderTimeline(); validateNow(); });

		const targetField = el('select', { 'aria-label': 'Shot target', 'data-role': 'shot-target', 'data-shot-id': shot.id });
		targetField.addEventListener('change', () => {
			const target = objectForKey(targetField.value);
			shot.targetId = target ? target.id : '';
			shot.targetLabel = target ? target.label : '';
			persistMovie();
			validateNow();
		});

		const durationField = el('input', { type: 'number', min: '0.5', step: '0.5', value: String(shot.durationSec), 'aria-label': 'Duration in seconds', style: { width: '64px' } });
		durationField.addEventListener('input', () => { shot.durationSec = parseDuration(durationField.value); persistMovie(); renderTimeline(); validateNow(); });

		const speakerField = el('input', { type: 'text', value: shot.dialogue.speaker, placeholder: 'Speaker', 'aria-label': 'Dialogue speaker', style: { width: '96px' } });
		speakerField.addEventListener('input', () => { shot.dialogue.speaker = speakerField.value; persistMovie(); validateNow(); });

		const textField = el('input', { type: 'text', value: shot.dialogue.text, placeholder: 'Dialogue line (optional)', 'aria-label': 'Dialogue text', style: { flex: '1', minWidth: '120px' } });
		textField.addEventListener('input', () => { shot.dialogue.text = textField.value; persistMovie(); validateNow(); });

		// step="any": with min 0.25 and step 0.1 the default value 1 was never
		// step-valid (0.25, 0.35, …, 0.95, 1.05), so assistive tech flagged
		// every row invalid. The builder clamps the offset to 0.25–3 anyway.
		const offsetField = el('input', { type: 'number', min: '0.25', max: '3', step: 'any', value: String(shot.cameraOffset || 1), 'aria-label': 'Camera distance multiplier', title: 'Camera distance multiplier', style: { width: '56px' } });
		offsetField.addEventListener('input', () => {
			const parsed = Number(offsetField.value);
			shot.cameraOffset = Number.isFinite(parsed) ? parsed : 1;
			persistMovie();
			validateNow();
		});

		const removeButton = el('button', {
			type: 'button',
			text: 'Remove',
			'aria-label': `Remove ${shot.title}`,
			style: { cursor: 'pointer' },
			onclick: () => removeShot(shot.id)
		});

		const row = el('div', {
			style: {
				display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap',
				border: '1px solid rgba(0,0,0,0.15)', borderRadius: '6px', padding: '6px 8px'
			}
		}, [
			el('strong', { text: shot.id, style: { minWidth: '48px' } }),
			titleField, presetField, targetField, durationField, speakerField, textField, offsetField, removeButton
		]);
		// Seed the target select for this row from the shot's stored target,
		// repairing the record to the resolved object (id first, label as the
		// legacy fallback) so what the row shows is what the build will aim at.
		refreshTargetOptions();
		const resolved = objectForKey(keyForShot(shot));
		if (resolved) {
			shot.targetId = resolved.id;
			shot.targetLabel = resolved.label;
			targetField.value = targetKey(resolved);
		}
		return row;
	}

	function totalRuntime() {
		return shots.reduce((sum, shot) => sum + (Number.isFinite(Number(shot.durationSec)) ? Number(shot.durationSec) : 0), 0);
	}

	function renderTimeline() {
		timelineStrip.innerHTML = '';
		let cursor = 0;
		if (shots.length === 0) {
			timelineStrip.appendChild(el('span', { text: 'No shots yet.', style: { fontStyle: 'italic', opacity: '0.7', alignSelf: 'center' } }));
		}
		shots.forEach((shot) => {
			const duration = Number.isFinite(Number(shot.durationSec)) ? Number(shot.durationSec) : 0;
			const startLabel = formatTime(cursor);
			cursor += duration;
			const segment = el('div', {
				title: `${shot.title}: ${formatTime(cursor - duration)} to ${formatTime(cursor)}`,
				style: {
					flexGrow: String(Math.max(duration, 0.5)),
					flexBasis: '0',
					background: gradeForPreset(shot.preset),
					borderRadius: '4px',
					padding: '6px 8px',
					minWidth: '64px',
					overflow: 'hidden',
					whiteSpace: 'nowrap',
					textOverflow: 'ellipsis',
					fontSize: '0.85em'
				}
			}, [
				el('div', { text: shot.title || shot.id, style: { fontWeight: 'bold' } }),
				el('div', { text: `${startLabel} · ${duration}s` })
			]);
			timelineStrip.appendChild(segment);
		});
		const total = totalRuntime();
		timelineTotal.textContent = shots.length === 0
			? ''
			: `Total runtime: ${formatTime(total)} (${total}s) · ${shots.length} shot${shots.length === 1 ? '' : 's'}`;
	}

	function buildProject() {
		const documentState = readDocument();
		return buildMovieProject(documentState, shots, { title: movieTitle() });
	}

	function validateNow() {
		if (shots.length === 0) {
			errorBox.style.display = 'none';
			errorBox.textContent = '';
			validationBox.textContent = 'Add at least one shot to build a movie.';
			setButtonsEnabled(false);
			return;
		}
		try {
			const project = buildProject();
			// A successful build clears any earlier error state.
			errorBox.style.display = 'none';
			errorBox.textContent = '';
			const total = project.duration;
			validationBox.textContent = `Ready — ${shots.length} shot${shots.length === 1 ? '' : 's'}, ${total}s total. The project passes schema validation.`;
			setButtonsEnabled(true);
		} catch (error) {
			// Keep a button-triggered error box visible; the message always shows here too.
			validationBox.textContent = error.message;
			setButtonsEnabled(false);
		}
	}

	function setButtonsEnabled(enabled) {
		for (const button of [openButton, renderButton, copyButton, downloadButton]) {
			button.disabled = busy || !enabled;
		}
	}

	function setBusy(value) {
		busy = value;
		loadingBox.style.display = value ? '' : 'none';
		setButtonsEnabled(shots.length > 0 && value === false && errorBox.style.display === 'none');
		validateNow();
	}

	function showError(error) {
		errorBox.textContent = `Could not build the movie: ${error.message}`;
		errorBox.style.display = '';
		announce(`Error: ${error.message}`);
	}

	async function withBuild(task) {
		if (busy) return;
		setBusy(true);
		errorBox.style.display = 'none';
		errorBox.textContent = '';
		try {
			// Let the loading state paint before the synchronous build runs.
			await new Promise((resolve) => requestAnimationFrame(resolve));
			const project = buildProject();
			await task(project);
		} catch (error) {
			showError(error);
		} finally {
			setBusy(false);
		}
	}

	function openInMaker(autoRender) {
		withBuild((project) => {
			const url = movieMakerUrl(project, autoRender);
			announce(autoRender ? 'Opening the Movie Maker and starting the render.' : 'Opening the Movie Maker.');
			window.location.href = url;
		});
	}

	function copyProject() {
		withBuild(async (project) => {
			const json = JSON.stringify(project, null, 2);
			if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
				await navigator.clipboard.writeText(json);
			} else {
				const area = el('textarea', { style: { position: 'fixed', opacity: '0' } });
				area.value = json;
				document.body.appendChild(area);
				area.select();
				document.execCommand('copy');
				document.body.removeChild(area);
			}
			announce('Project JSON copied to the clipboard.');
			validationBox.textContent = 'Project JSON copied to the clipboard.';
		});
	}

	function downloadProject() {
		withBuild((project) => {
			const json = JSON.stringify(project, null, 2);
			const blob = new Blob([json], { type: 'application/json' });
			const url = URL.createObjectURL(blob);
			const link = el('a', { href: url, download: `${slugify(movieTitle())}-project.json` });
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			setTimeout(() => URL.revokeObjectURL(url), 1000);
			announce('Project JSON downloaded.');
			validationBox.textContent = 'Project JSON downloaded.';
		});
	}

	// Rebuilds an editable shot list from a Movie Maker project document
	// (the shape Download project.json produces). Camera clips define the
	// shots; scene-clip labels and dialogue cues are matched back by start
	// time. Shot targets and camera offsets are baked into the project's
	// geometry and cannot be recovered, so imported shots start untargeted
	// (the row repair aims them at the first object) with offset 1.
	function shotsFromProject(project) {
		const tracks = Array.isArray(project.tracks) ? project.tracks : [];
		const clipsOf = (type) => {
			const track = tracks.find((candidate) => candidate && candidate.type === type);
			return track && Array.isArray(track.clips) ? [...track.clips] : [];
		};
		const cameraClips = clipsOf('camera').sort((a, b) => Number(a.start) - Number(b.start));
		const sceneClips = clipsOf('scene');
		const dialogueClips = clipsOf('dialogue');
		return cameraClips.map((clip, index) => {
			const start = Number(clip.start) || 0;
			const duration = Number(clip.duration) || 0;
			const sceneClip = sceneClips.find((candidate) => Math.abs(Number(candidate.start) - start) < 0.01);
			const dialogue = dialogueClips.find((candidate) => {
				const cueStart = Number(candidate.start);
				return cueStart >= start && cueStart < start + duration;
			});
			const clipId = String(clip.id || '');
			return {
				id: clipId.endsWith('-camera') ? clipId.slice(0, -'-camera'.length) : `shot-${index + 1}`,
				title: index > 0 && sceneClip && sceneClip.label ? String(sceneClip.label) : `Shot ${index + 1}`,
				preset: PRESET_IDS.includes(clip.shot) ? clip.shot : 'static',
				durationSec: duration > 0 ? duration : 5,
				targetId: '',
				targetLabel: '',
				dialogue: {
					speaker: dialogue ? String(dialogue.speaker || '') : '',
					text: dialogue ? String(dialogue.text || '') : ''
				},
				cameraOffset: 1
			};
		});
	}

	async function importProjectFile(file) {
		try {
			const parsed = JSON.parse(await file.text());
			if (parsed && parsed.protocol === 'awtsmoos-movie-v1') {
				showError(new Error('That file is a canonical movie. Load it in the Movie Data Studio panel (Data tab) — this panel imports Movie Maker project files.'));
				return;
			}
			if (parsed && parsed.format === 'awtsmoos.world.v1') {
				showError(new Error('That file is a Studio world document. Use the toolbar Import button to load it.'));
				return;
			}
			const errors = validateMovieProject(parsed);
			if (errors.length > 0) {
				showError(new Error(`That file is not a valid Movie Maker project: ${errors.join(' ')}`));
				return;
			}
			const imported = shotsFromProject(parsed);
			if (imported.length === 0) {
				showError(new Error('That project has no camera clips to rebuild shots from.'));
				return;
			}
			shots.length = 0;
			for (const shot of imported) shots.push(shot);
			shotCounter = imported.reduce((highest, shot) => {
				const match = /^shot-(\d+)$/.exec(shot.id);
				return match ? Math.max(highest, Number(match[1])) : highest;
			}, imported.length);
			titleInput.value = String(parsed.title || '');
			errorBox.style.display = 'none';
			errorBox.textContent = '';
			persistMovie();
			renderShots();
			announce(`Imported ${imported.length} shot${imported.length === 1 ? '' : 's'} from ${file.name}. Shot targets and camera offsets are not stored in project files, so they were reset.`);
		} catch (error) {
			showError(error instanceof SyntaxError
				? new Error(`That file is not valid JSON: ${error.message}`)
				: error);
		}
	}

	syncMovieFromDocument();
	refreshTargetOptions();
	renderTimeline();
	validateNow();

	if (state && typeof state.subscribe === 'function') {
		unsubscribe = state.subscribe(() => {
			syncMovieFromDocument();
			refreshTargetOptions();
			renderTimeline();
			validateNow();
		});
	}

	return {
		unmount() {
			if (typeof unsubscribe === 'function') unsubscribe();
			if (root.parentNode) root.parentNode.removeChild(root);
		}
	};
}
