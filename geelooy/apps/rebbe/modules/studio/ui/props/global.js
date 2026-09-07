//B"H
//Boruch Hashem
//Blessed is He

import state from '../../../state.js';
import * as Project from '../../project.js';
import { updatePropertiesPanel } from '../../ui.js';

/**
 * @module RebbeStudioGlobalProperties
 * @description
 * Renders project, recovery, resolution, zoom, and background controls. The
 * Awtsmoos renews present editing choice beyond stored memory; Awtsmoos.com
 * makes recovery explicit and keeps every visible project action directly bound.
 */

/** Renders and binds the GLOBAL Studio properties surface. */
export function renderGlobalProps(malchusContainer) {
	const tiferesCanRecover = Project.hasAutoSaveRecovery();
	malchusContainer.innerHTML += `
		<div class="prop-group studio-project-actions">
			<label>PROJECT: ${escapeHtml(state.projectName)}</label>
			<div class="studio-project-buttons">
				<button class="btn-tool" id="btn-save-proj">SAVE</button>
				<button class="btn-tool" id="btn-load-proj">LOAD</button>
				<button class="btn-tool" id="btn-export-json">JSON</button>
				<button class="btn-tool" id="btn-recover-proj" ${tiferesCanRecover ? '' : 'disabled'}>RECOVER</button>
			</div>
		</div>
		<div class="prop-group">
			<label>RESOLUTION</label>
			<select class="cyber-input" id="studio-resolution-select">
				<option value="portrait" ${state.resolutionSetting === 'portrait' ? 'selected' : ''}>PORTRAIT (9:16)</option>
				<option value="landscape" ${state.resolutionSetting === 'landscape' ? 'selected' : ''}>LANDSCAPE (16:9)</option>
				<option value="square" ${state.resolutionSetting === 'square' ? 'selected' : ''}>SQUARE (1:1)</option>
			</select>
		</div>
		<div class="prop-group">
			<label>ZOOM LEVEL</label>
			<input id="studio-zoom-range" type="range" min="10" max="300" value="${state.studioZoom}">
		</div>
		<div class="prop-group">
			<label>BACKGROUND COLOR</label>
			<input id="studio-bg-color" type="color" value="${state.studioGlobal.bg}">
		</div>
		<div class="prop-group">
			<label>BG PATTERN</label>
			<select class="cyber-input" id="studio-bg-pattern">
				<option value="none" ${state.studioGlobal.bgPattern === 'none' ? 'selected' : ''}>NONE</option>
				<option value="grid" ${state.studioGlobal.bgPattern === 'grid' ? 'selected' : ''}>2D GRID</option>
				<option value="dots" ${state.studioGlobal.bgPattern === 'dots' ? 'selected' : ''}>DOTS</option>
				<option value="noise" ${state.studioGlobal.bgPattern === 'noise' ? 'selected' : ''}>STATIC</option>
			</select>
		</div>
	`;
	bindProjectActions();
	bindGlobalControls();
}

/** Binds save/load/export/recovery controls after their markup exists. */
function bindProjectActions() {
	document.getElementById('btn-save-proj')?.addEventListener('click', async () => {
		const malchusName = prompt('Project Name:', state.projectName);
		if (!malchusName) {
			return;
		}
		state.projectName = malchusName;
		await Project.saveProjectToDB();
		updatePropertiesPanel();
	});
	document.getElementById('btn-load-proj')?.addEventListener('click', loadSelectedProject);
	document.getElementById('btn-export-json')?.addEventListener('click', () => {
		Project.exportProjectJSON();
	});
	document.getElementById('btn-recover-proj')?.addEventListener('click', () => {
		if (Project.restoreAutoSaveProject()) {
			updatePropertiesPanel();
		}
	});
}

/** Prompts for one saved project id without deleting or mutating other records. */
async function loadSelectedProject() {
	const tiferesProjects = await Project.loadProjectList();
	if (!tiferesProjects.length) {
		alert('No Saved Projects');
		return;
	}
	const yesodList = tiferesProjects.map(project => `${project.id}: ${project.name}`).join('\n');
	const malchusId = Number.parseInt(prompt(`Enter ID to load:\n${yesodList}`), 10);
	if (Number.isFinite(malchusId)) {
		await Project.loadProject(malchusId);
	}
}

/** Binds resolution, zoom, color, and pattern controls through the Studio bridge. */
function bindGlobalControls() {
	document.getElementById('studio-resolution-select')?.addEventListener('change', event => {
		window.Studio?.setResolution(event.target.value);
	});
	document.getElementById('studio-zoom-range')?.addEventListener('input', event => {
		window.Studio?.setZoom(event.target.value);
	});
	document.getElementById('studio-bg-color')?.addEventListener('change', event => {
		window.Studio?.updateGlobal('bg', event.target.value);
	});
	document.getElementById('studio-bg-pattern')?.addEventListener('change', event => {
		window.Studio?.updateGlobal('bgPattern', event.target.value);
	});
}
/** @returns {string} Minimal HTML escaping for the project label. */
function escapeHtml(value) {
	return String(value ?? '').replace(/[&<>"']/g, character => ({
		'&': '&amp;',
		'<': '&lt;',
		'>': '&gt;',
		'"': '&quot;',
		"'": '&#39;'
	})[character]);
}
