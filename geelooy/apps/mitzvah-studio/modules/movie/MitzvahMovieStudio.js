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
	movieMakerUrl
} from './MovieProjectBuilder.js';

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

	const root = el('section', { class: 'mitzvah-movie-studio', 'aria-label': 'Movie Studio' }, [
		el('h2', { text: 'Movie Studio', style: { margin: '0 0 4px' } }),
		el('p', {
			text: 'Turn your studio scene into a cinematic movie. Add shots, pick a camera move for each one, write dialogue, then open it in the Movie Maker or render it straight to WebM video. For an MP4 release with dialogue mixed in, run: node geelooy/games/mitzvahWorld/movies/tools/finalizeMovie.mjs',
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
	titleInput.addEventListener('input', () => validateNow());
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
	const buttonRow = el('div', { style: { display: 'flex', gap: '8px', flexWrap: 'wrap' } }, [
		openButton, renderButton, copyButton, downloadButton
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

	function objectLabels() {
		const documentState = readDocument();
		if (!documentState) return [];
		return documentState.objects.map((object) => String(object.label || 'Object'));
	}

	function movieTitle() {
		const typed = titleInput.value.trim();
		if (typed) return typed;
		const documentState = readDocument();
		if (documentState && documentState.name) return String(documentState.name);
		return 'Untitled Mitzvah Movie';
	}

	function refreshTargetOptions() {
		const labels = objectLabels();
		for (const select of root.querySelectorAll('select[data-role="shot-target"]')) {
			const current = select.value;
			select.innerHTML = '';
			if (labels.length === 0) {
				select.appendChild(el('option', { value: '', text: 'No studio objects yet' }));
				select.disabled = true;
				continue;
			}
			select.disabled = false;
			for (const label of labels) {
				select.appendChild(el('option', { value: label, text: label }));
			}
			if (labels.includes(current)) select.value = current;
		}
		// New-shot form target select.
		const currentNew = targetSelect.value;
		targetSelect.innerHTML = '';
		if (labels.length === 0) {
			targetSelect.appendChild(el('option', { value: '', text: 'No studio objects yet' }));
			targetSelect.disabled = true;
		} else {
			targetSelect.disabled = false;
			for (const label of labels) {
				targetSelect.appendChild(el('option', { value: label, text: label }));
			}
			if (labels.includes(currentNew)) targetSelect.value = currentNew;
		}
	}

	function addShot() {
		shotCounter += 1;
		const labels = objectLabels();
		shots.push({
			id: `shot-${shotCounter}`,
			title: `Shot ${shotCounter}`,
			preset: presetSelect.value || 'static',
			durationSec: parseDuration(durationInput.value),
			targetLabel: targetSelect.value || labels[0] || '',
			dialogue: { speaker: speakerInput.value.trim(), text: textInput.value.trim() },
			cameraOffset: 1
		});
		speakerInput.value = '';
		textInput.value = '';
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
		titleField.addEventListener('input', () => { shot.title = titleField.value; renderTimeline(); validateNow(); });

		const presetField = el('select', { 'aria-label': 'Camera preset' },
			CAMERA_PRESETS.map((preset) => el('option', {
				value: preset.id,
				text: preset.label,
				title: preset.description,
				...(preset.id === shot.preset ? { selected: 'selected' } : {})
			})));
		presetField.addEventListener('change', () => { shot.preset = presetField.value; renderTimeline(); validateNow(); });

		const targetField = el('select', { 'aria-label': 'Shot target', 'data-role': 'shot-target' });
		targetField.addEventListener('change', () => { shot.targetLabel = targetField.value; validateNow(); });

		const durationField = el('input', { type: 'number', min: '0.5', step: '0.5', value: String(shot.durationSec), 'aria-label': 'Duration in seconds', style: { width: '64px' } });
		durationField.addEventListener('input', () => { shot.durationSec = parseDuration(durationField.value); renderTimeline(); validateNow(); });

		const speakerField = el('input', { type: 'text', value: shot.dialogue.speaker, placeholder: 'Speaker', 'aria-label': 'Dialogue speaker', style: { width: '96px' } });
		speakerField.addEventListener('input', () => { shot.dialogue.speaker = speakerField.value; validateNow(); });

		const textField = el('input', { type: 'text', value: shot.dialogue.text, placeholder: 'Dialogue line (optional)', 'aria-label': 'Dialogue text', style: { flex: '1', minWidth: '120px' } });
		textField.addEventListener('input', () => { shot.dialogue.text = textField.value; validateNow(); });

		const offsetField = el('input', { type: 'number', min: '0.25', max: '3', step: '0.1', value: String(shot.cameraOffset || 1), 'aria-label': 'Camera distance multiplier', title: 'Camera distance multiplier', style: { width: '56px' } });
		offsetField.addEventListener('input', () => {
			const parsed = Number(offsetField.value);
			shot.cameraOffset = Number.isFinite(parsed) ? parsed : 1;
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
		// Seed the target select for this row, then restore the shot's choice.
		refreshTargetOptions();
		targetField.value = shot.targetLabel;
		if (!objectLabels().includes(shot.targetLabel)) {
			shot.targetLabel = objectLabels()[0] || '';
			targetField.value = shot.targetLabel;
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

	refreshTargetOptions();
	renderTimeline();
	validateNow();

	if (state && typeof state.subscribe === 'function') {
		unsubscribe = state.subscribe(() => {
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
