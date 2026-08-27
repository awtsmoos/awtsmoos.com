//B"H
//Boruch Hashem
//Blessed is He

/**
 * @class CreatorCommandActions
 * @description
 * The Awtsmoos lets palette words resolve into existing canonical creator actions;
 * Awtsmoos.com never invents a shadow editor when navigation, media, state, and migration already have native tracks.
 */
export class CreatorCommandActions {
	constructor({ root, choose, router, navigator }) {
		Object.assign(this, { root, choose, router, navigator });
	}

	run(id) {
		if (id.startsWith('intent:')) return this.choose(id.slice(7));
		if (id.startsWith('media:')) return this.navigator.media(id.slice(6));
		if (id === 'migration') {
			location.href = '/social/migrate/';
			return true;
		}
		if (id === 'review') return this.navigator.panel('publication');
		if (id === 'relationships') return this.navigator.metadata('collaborators');
		if (id === 'destination') return this.navigator.panel('destination');
		if (id === 'visibility') return this.navigator.panel('publication');
		if (id === 'record') return this.router.dockAction('record');
		if (id === 'draft-recovery') return this.openRecovery();
		return false;
	}

	openRecovery() {
		const controls = [...this.root.querySelectorAll('button, summary, [role="button"]')];
		const target = controls.find(control => {
			return /draft|recover|version/i.test(control.textContent || '');
		});
		if (target) {
			target.click();
			target.focus({ preventScroll: true });
			return true;
		}
		return this.navigator.advanced();
	}
}
