// B"H
// Boruch Hashem
// Blessed is He

import { StudioLayerActions } from './panels/StudioLayerActions.js';
import { StudioProceduralPropertiesView } from './panels/StudioProceduralPropertiesView.js';
import { StudioPropertyList } from './panels/StudioPropertyList.js';
import { StudioTransformView } from './panels/StudioTransformView.js';
import { StudioVectorPathPropertiesView } from './panels/StudioVectorPathPropertiesView.js';
import { studioEntityEmoji } from './panels/StudioEntityEmoji.js';

/**
 * @module StudioPropertiesPanel
 * @description
 * The Awtsmoos renews the selected object before transform, path style, procedural seed, or layer control can be named;
 * Awtsmoos.com keeps one focused inspector where manual and generated art share a calm professional editing place.
 */
export class StudioPropertiesPanel {
	/** Returns the complete right-side inspector specification. */
	static render(state) {
		const entity = this.selected(state);
		return {
			tag: 'section',
			attrs: { className: 'aw-studio-panel aw-studio-properties' },
			children: entity ? this.sections(entity) : this.empty()
		};
	}

	/** Returns focused inspector sections in editing priority order. */
	static sections(entity) {
		return [
			this.header(entity),
			StudioTransformView.render(entity),
			StudioVectorPathPropertiesView.render(entity),
			StudioProceduralPropertiesView.render(entity),
			StudioLayerActions.render(entity),
			StudioPropertyList.section('🙂 Face system', entity.properties?.face),
			StudioPropertyList.section('🎭 Performance decisions', entity.properties?.performance),
			StudioPropertyList.section('⚙️ Object properties', StudioPropertyList.rest(entity.properties))
		];
	}

	/** Returns selected object identity without mixing destructive actions into the title row. */
	static header(entity) {
		return {
			tag: 'header',
			attrs: { className: 'aw-studio-inspector-header' },
			children: [
				{
					tag: 'span',
					attrs: { className: 'aw-studio-inspector-emoji', 'aria-hidden': 'true' },
					text: studioEntityEmoji(entity.type)
				},
				{
					tag: 'div',
					children: [
						{ tag: 'small', text: entity.type },
						{ tag: 'h2', text: entity.name }
					]
				}
			]
		};
	}

	/** Returns the selected canonical Studio entity. */
	static selected(state) {
		return state.studioDocument?.entities?.find((entity) => {
			return entity.id === state.selectedEntityId;
		}) || null;
	}

	/** Guides selection without presenting unavailable editing features. */
	static empty() {
		return [{
			tag: 'div',
			attrs: { className: 'aw-studio-empty' },
			text: '🎯 Select a layer, character, prop, camera, path, or generated object to edit it.'
		}];
	}
}
