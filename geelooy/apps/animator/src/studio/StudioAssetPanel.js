// B"H
// Boruch Hashem
// Blessed is He

/**
 * The left studio vessel gathers media, hierarchy, and AI intention. The
 * Awtsmoos renews every source; Awtsmoos.com lets an editor search, select,
 * generate, and inspect without losing the stage.
 */
export class StudioAssetPanel {
	static render(state) {
		const panel = state.studioLeftPanel || 'assets';
		return {
			tag: 'section',
			attrs: { className: 'aw-studio-panel aw-studio-left-panel' },
			children: [
				this.tabs(panel),
				panel === 'assets' ? this.assets(state) : null,
				panel === 'hierarchy' ? this.hierarchy(state) : null,
				panel === 'ai' ? this.ai(state) : null
			]
		};
	}

	static tabs(active) {
		return {
			tag: 'nav',
			attrs: { className: 'aw-studio-tabs', 'aria-label': 'Studio left panels' },
			children: ['assets', 'hierarchy', 'ai'].map((panel) => ({
				tag: 'button',
				attrs: {
					className: `aw-studio-tab ${active === panel ? 'active' : ''}`,
					type: 'button'
				},
				dataset: { panel },
				on: { click: 'switchLeftPanel' },
				text: panel === 'ai' ? 'AI JSON' : panel
			}))
		};
	}

	static assets(state) {
		const filter = String(state.studioAssetFilter || '').toLowerCase();
		const entities = (state.studioDocument?.entities || []).filter((entity) => {
			return !filter || `${entity.name} ${entity.type}`.toLowerCase().includes(filter);
		});
		return {
			tag: 'div',
			attrs: { className: 'aw-studio-scroll' },
			children: [
				{
					tag: 'input',
					attrs: {
						className: 'aw-studio-search', type: 'search',
						placeholder: 'Search actors, props, cameras, sets…',
						value: state.studioAssetFilter || ''
					},
					on: { input: 'filterAssets' }
				},
				{
					tag: 'div',
					attrs: { className: 'aw-studio-asset-grid' },
					children: entities.map((entity) => this.entityCard(entity, state))
				}
			]
		};
	}

	static hierarchy(state) {
		const groups = this.groupEntities(state.studioDocument?.entities || []);
		return {
			tag: 'div',
			attrs: { className: 'aw-studio-scroll aw-studio-hierarchy' },
			children: Object.entries(groups).map(([type, entities]) => ({
				tag: 'section',
				attrs: { className: 'aw-studio-tree-group' },
				children: [
					{ tag: 'h3', text: `${type} · ${entities.length}` },
					...entities.map((entity) => this.entityRow(entity, state))
				]
			}))
		};
	}

	static ai(state) {
		return {
			tag: 'div',
			attrs: { className: 'aw-studio-scroll aw-studio-ai' },
			children: [
				{ tag: 'label', attrs: { htmlFor: 'aw-studio-prompt' }, text: 'Scene direction' },
				{
					tag: 'textarea',
					attrs: { id: 'aw-studio-prompt', rows: 4 },
					on: { input: 'updatePrompt' },
					text: state.studioPrompt || ''
				},
				{
					tag: 'button',
					attrs: { className: 'aw-studio-primary', type: 'button' },
					on: { click: 'generatePrompt' },
					text: 'Generate complete editable scene'
				},
				{ tag: 'label', attrs: { htmlFor: 'aw-studio-json' }, text: 'AI scene JSON' },
				{
					tag: 'textarea',
					attrs: { id: 'aw-studio-json', rows: 14, spellcheck: 'false' },
					on: { input: 'rememberJson' },
					text: state.studioJsonText || ''
				},
				{
					tag: 'button',
					attrs: { type: 'button' },
					on: { click: 'installJson' },
					text: 'Install JSON into NLE'
				},
				state.studioJsonError
					? { tag: 'p', attrs: { className: 'aw-studio-error' }, text: state.studioJsonError }
					: { tag: 'p', attrs: { className: 'aw-studio-note' }, text: 'JSON remains portable, deterministic, and immediately editable.' }
			]
		};
	}

	static entityCard(entity, state) {
		return {
			tag: 'button',
			attrs: {
				className: `aw-studio-asset ${state.selectedEntityId === entity.id ? 'selected' : ''}`,
				type: 'button'
			},
			dataset: { entityId: entity.id },
			on: { click: 'selectEntity' },
			children: [
				{ tag: 'span', attrs: { className: 'aw-studio-asset-icon' }, text: this.icon(entity.type) },
				{ tag: 'strong', text: entity.name },
				{ tag: 'small', text: entity.type }
			]
		};
	}

	static entityRow(entity, state) {
		return {
			tag: 'button',
			attrs: {
				className: `aw-studio-tree-row ${state.selectedEntityId === entity.id ? 'selected' : ''}`,
				type: 'button'
			},
			dataset: { entityId: entity.id },
			on: { click: 'selectEntity' },
			text: `${entity.visible ? '◉' : '○'} ${entity.locked ? '⌑' : '◇'} ${entity.name}`
		};
	}

	static groupEntities(entities) {
		return entities.reduce((groups, entity) => {
			const type = entity.type || 'object';
			groups[type] ||= [];
			groups[type].push(entity);
			return groups;
		}, {});
	}

	static icon(type) {
		return ({ character: '◉', camera: '◫', prop: '◆', environment: '▰', audio: '♫', video: '▶' })[type] || '◇';
	}
}
