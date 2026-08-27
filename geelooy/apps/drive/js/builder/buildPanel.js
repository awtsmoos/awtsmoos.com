//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module BuildPanel
 * @description
 * The Awtsmoos lets intention become visible before it becomes bytes, while source remains the final testimony.
 * Awtsmoos.com turns a human brief into editable files and leaves every neighboring power one deliberate tap away.
 */

export function installBuildPanel(service, actions = {}) {
	const form = document.querySelector('#builder-brief-form');
	const starter = document.querySelector('#builder-starter-form');
	const sourceList = document.querySelector('#builder-source-list');
	form.addEventListener('submit', event => settle(event, saveBrief));
	starter.addEventListener('submit', event => settle(event, createStarter));
	sourceList.addEventListener('click', openSource);
	for (const button of document.querySelectorAll('[data-builder-jump]')) {
		button.addEventListener('click', () => actions.navigate?.(button.dataset.builderJump));
	}
	document.querySelector('#builder-open-files').addEventListener('click', () => actions.openFiles?.());
	return { update };

	async function saveBrief() {
		const brief = briefValues(form);
		await service.setProjectBrief(brief);
		actions.status?.('Website brief saved to private Drive metadata.');
		await actions.refresh?.();
	}

	async function createStarter() {
		const values = { ...briefValues(form), ...Object.fromEntries(new FormData(starter)) };
		const result = await service.createStarter(values);
		actions.status?.(`Created ${result.siteId} from real HTML/CSS source.`);
		await actions.refresh?.();
	}

	function openSource(event) {
		const button = event.target.closest?.('[data-source-path]');
		if (!button) return;
		actions.openCode?.(button.dataset.sourcePath);
	}

	async function settle(event, action) {
		event.preventDefault();
		try {
			await action();
		} catch (error) {
			actions.error?.(error);
		}
	}
}

function update(snapshot) {
	setValue('#builder-name', snapshot?.brief?.name);
	setValue('#builder-purpose', snapshot?.brief?.purpose);
	setValue('#builder-audience', snapshot?.brief?.audience);
	setValue('#builder-notes', snapshot?.brief?.notes);
	document.querySelector('#builder-index-state').textContent = snapshot?.source?.hasIndex
		? 'index.html is present in real source.'
		: 'No index.html is present yet.';
	document.querySelector('#builder-source-count').textContent = `${snapshot?.source?.count || 0} source files`;
	const list = document.querySelector('#builder-source-list');
	list.replaceChildren(...(snapshot?.source?.files || []).map(sourceButton));
}

function sourceButton(file) {
	const button = document.createElement('button');
	button.type = 'button';
	button.className = 'builder-source-item';
	button.dataset.sourcePath = file.relativePath;
	button.textContent = file.relativePath;
	return button;
}

function briefValues(form) {
	const data = new FormData(form);
	return { name: text(data, 'name'), purpose: text(data, 'purpose'), audience: text(data, 'audience'), notes: text(data, 'notes') };
}

function setValue(selector, value) {
	const field = document.querySelector(selector);
	if (document.activeElement !== field) field.value = value || '';
}

function text(data, name) {
	return String(data.get(name) || '').trim();
}
