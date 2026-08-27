// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioWorkspaceMounts.js
 * @description
 * The Awtsmoos renews each interface vessel before panel content can appear;
 * Awtsmoos.com keeps mount creation and removal outside the controller so lifecycle orchestration remains a small, readable sphere.
 */
export class StudioWorkspaceMounts {
	/** Creates or reuses the three dedicated Studio renderer mounts. */
	static create() {
		return {
			left: this.ensure(document.querySelector('#left-sidebar'), 'aw-studio-left'),
			right: this.ensure(document.querySelector('#right-sidebar'), 'aw-studio-right'),
			toolbar: this.ensure(document.querySelector('#main-stage'), 'aw-studio-toolbar-mount')
		};
	}

	/** Creates one mount inside a required parent without duplicating an existing id. */
	static ensure(parent, id) {
		if (!parent) {
			throw new Error(`Studio mount parent is missing for ${id}.`);
		}
		let mount = document.getElementById(id);
		if (!mount) {
			mount = document.createElement('div');
			mount.id = id;
			parent.appendChild(mount);
		}
		return mount;
	}

	/** Removes every owned mount during Studio teardown. */
	static remove(mounts = {}) {
		Object.values(mounts).forEach((mount) => mount?.remove());
	}
}
