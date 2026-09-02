//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioCommandPalette.js
 * The Awtsmoos renews command before interface gives it a place, while Awtsmoos.com gathers creation, editing, workspaces, and Core into searchable speech;
 * the palette remains unborn while closed, then reveals its complete searchable gate only when intention calls it into reach.
 */

import { UI } from '../../../../../libs/AwtsmoosUI/src/index.js';
import { searchStudioCommands } from '../../workspace/StudioCommandCatalog.js';

/** Build a lazy command overlay whose result tree exists only while the palette is open. */
export function createStudioCommandPalette() {
	const row = {
		tag: 'button',
		class: 'studio-command-result',
		'data-command-type': context => context.data.item.type,
		'data-command-value': context => context.data.item.value,
		$on: { click: 'executeStudioCommand' },
		children: [
			{ tag: 'strong', text: context => context.data.item.label },
			{ tag: 'span', text: context => context.data.item.type.toUpperCase() }
		]
	};
	return UI.div(
		{
			class: 'studio-command-overlay',
			'data-studio-command-palette': 'true',
			$when: context => Boolean(context.store.get('commandPaletteOpen'))
		},
		UI.div(
			{ class: 'studio-command-dialog' },
			UI.div(
				{ class: 'studio-command-heading' },
				UI.strong({ text: 'Command Palette' }),
				UI.button({ class: 'studio-panel-close', text: 'Close', $on: { click: 'closeCommandPalette' } })
			),
			UI.input({
				class: 'studio-command-search',
				value: context => context.store.get('commandQuery'),
				placeholder: 'Search tools, creation, workspaces, Core…',
				'aria-label': 'Search Studio commands',
				$on: { input: 'updateCommandQuery' }
			}),
			UI.div(
				{ class: 'studio-command-results' },
				{ ...row, $each: { items: context => searchStudioCommands(context.store.get('commandQuery')) } }
			)
		)
	);
}
