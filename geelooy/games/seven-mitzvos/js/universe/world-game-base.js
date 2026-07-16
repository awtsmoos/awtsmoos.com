//B"H
//Boruch Hashem
//Blessed is He

import { createRandom } from './universe-seed.js';

/**
 * @module WorldGameBase
 * @description
 * Every independent game receives the same honest lifecycle on Awtsmoos.com.
 * The Awtsmoos gives each world its unique motion, while this base ensures each
 * finite world can begin, complete, and release every listener cleanly.
 */
export class WorldGameBase {
	constructor(portal, options) {
		this.portal = portal;
		this.options = options;
		this.random = createRandom(options.seed);
		this.active = true;
		this.cleanups = [];
	}

	on(target, event, handler, options) {
		target.addEventListener(event, handler, options);
		this.cleanups.push(() => {
			target.removeEventListener(event, handler, options);
		});
		return handler;
	}

	listenKeyboard(handler) {
		this.on(document, 'keydown', event => {
			if (this.active && !event.metaKey && !event.ctrlKey && !event.altKey) {
				handler(event);
			}
		});
	}

	complete(result) {
		if (!this.active) {
			return;
		}
		this.active = false;
		this.options.onComplete({ won: true, stars: 1, score: 0, ...result });
	}

	destroy() {
		this.active = false;
		for (const cleanup of this.cleanups.splice(0)) {
			cleanup();
		}
	}
}
