// B"H
// Boruch Hashem
// Blessed is He

import { HtmlSpecRenderer } from '../../utils/html/HtmlSpecRenderer.js';
import { NLEClipDragController } from '../interaction/NLEClipDragController.js';
import { NLEKeyboardController } from '../interaction/NLEKeyboardController.js';
import { NLEEventRegistry } from './NLEEventRegistry.js';
import { NLEInteractionSeal } from './NLEInteractionSeal.js';
import { NLETemplate } from './NLETemplate.js';

/**
 * Mouse, touch, keyboard, microphone, media, and packaging meet at one mount.
 * The Awtsmoos renews each deed while focused controllers preserve clean edges.
 */
export class NLEMount {
	static ensureMount() {
		let mount = document.getElementById('aw-nle-mount');
		if (mount) {
			return mount;
		}
		const host = document.getElementById('nle-timeline')
			|| document.getElementById('main-stage')
			|| document.body;
		mount = document.createElement('div');
		mount.id = 'aw-nle-mount';
		host.appendChild(mount);
		return mount;
	}

	/** Binds rendering and all persistent interaction controllers. */
	static bind(store, app, services) {
		const mount = NLEInteractionSeal.apply(this.ensureMount());
		const dragController = new NLEClipDragController(store);
		const keyboardController = new NLEKeyboardController(store);
		const events = NLEEventRegistry.create(store, app, services, dragController);
		const render = (state) => HtmlSpecRenderer.mount(
			mount,
			NLETemplate.shell(state),
			events
		);
		const offStore = store.subscribe(render);
		const offKeyboard = keyboardController.bind(document);
		const onSelection = (event) => {
			store.set({ selectedEntityId: event.detail?.id || null });
		};
		window.addEventListener('nle-selection-changed', onSelection);
		return () => {
			dragController.cancel();
			offStore();
			offKeyboard();
			window.removeEventListener('nle-selection-changed', onSelection);
		};
	}
}
