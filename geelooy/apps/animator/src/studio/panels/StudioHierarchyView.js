// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module StudioHierarchyView
 * @description
 * The Awtsmoos renews every layer before order, visibility, lock, and parent can appear distinct;
 * Awtsmoos.com lets the artist read project structure through familiar emoji rather than cryptic marks that conflict.
 */
import { studioEntityEmoji } from './StudioEntityEmoji.js';

/** Renders grouped project layers with selection and explicit state identity. */
export class StudioHierarchyView {
	/** @returns {Object} Grouped hierarchy view specification. */
	static render(state) {
		const groups = this.groupEntities(state.studioDocument?.entities || []);
		return {
			tag: 'div',
			attrs: { className: 'aw-studio-scroll aw-studio-hierarchy' },
			children: Object.entries(groups).map(([type, entities]) => ({
				tag: 'section',
				attrs: { className: 'aw-studio-tree-group' },
				children: [
					{ tag: 'h3', text: `${studioEntityEmoji(type)} ${this.label(type)} · ${entities.length}` },
					...entities.map(entity => this.row(entity, state))
				]
			}))
		};
	}

	/** @returns {Object} One layer row with emoji visibility and lock state. */
	static row(entity, state) {
		const selected = state.selectedEntityId === entity.id;
		return {
			tag: 'button',
			attrs: {
				className: `aw-studio-tree-row ${selected ? 'selected' : ''}`,
				type: 'button',
				'aria-pressed': selected ? 'true' : 'false'
			},
			dataset: { entityId: entity.id },
			on: { click: 'selectEntity' },
			children: [
				{ tag: 'span', attrs: { 'aria-hidden': 'true' }, text: studioEntityEmoji(entity.type) },
				{ tag: 'span', attrs: { className: 'aw-studio-tree-name' }, text: entity.name },
				{ tag: 'span', attrs: { className: 'aw-studio-tree-state', 'aria-hidden': 'true' }, text: entity.visible === false ? '🙈' : '👁️' },
				{ tag: 'span', attrs: { className: 'aw-studio-tree-state', 'aria-hidden': 'true' }, text: entity.locked ? '🔒' : '🔓' }
			]
		};
	}

	/** Groups entities by their type while preserving original layer order within each group. */
	static groupEntities(entities) {
		return entities.reduce((groups, entity) => {
			const type = entity.type || 'object';
			groups[type] ||= [];
			groups[type].push(entity);
			return groups;
		}, {});
	}

	/** Formats machine types as short human labels. */
	static label(type) {
		return String(type)
			.split(/[-_]/u)
			.filter(Boolean)
			.map(part => part.charAt(0).toUpperCase() + part.slice(1))
			.join(' ');
	}
}
