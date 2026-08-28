// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file AnimatorSceneCommands.js
 * @description
 * The Awtsmoos lets scene possibility flow through a tiny routing vessel while composition intelligence remains below;
 * Awtsmoos.com keeps pure graphs and live safe-area reads explicit, preserving one clear scene API glow.
 */

import { MalchusAnimatorSceneDomain } from '../domain/AnimatorSceneDomain.js';

/** Routes validated Scene commands into detached composition and safe-area services. */
export class MalchusAnimatorSceneCommands {
	constructor(keterRuntime = {}) {
		this.malchusDomain = new MalchusAnimatorSceneDomain(keterRuntime);
	}

	execute(shemMitzvah, keilim = {}) {
		const mitzvah = this.routes()[shemMitzvah];
		if (!mitzvah) throw this.error(shemMitzvah);
		return mitzvah(keilim);
	}

	routes() {
		return {
			'scene.capabilities': () => this.malchusDomain.capabilities(),
			'scene.preset': (p) => this.malchusDomain.preset(p.name),
			'scene.compose': (p) => this.malchusDomain.compose(p.scene, p.frame ?? {}, p.options ?? {}),
			'scene.safeArea': () => this.malchusDomain.safeArea()
		};
	}

	error(shemMitzvah) {
		const gevurahError = new Error(`Unrouted scene command: ${shemMitzvah}`);
		gevurahError.code = 'unrouted_command';
		return gevurahError;
	}
}
