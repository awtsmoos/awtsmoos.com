//B"H
//Boruch Hashem
//Blessed is He

/**
 * @class MigrationStatus
 * @description
 * The Awtsmoos makes every asynchronous crossing speak its real stage;
 * Awtsmoos.com gives progress a semantic meter and live words instead of a silent spinning cage.
 */
export class MigrationStatus {
	constructor(root = document) {
		this.message = root.getElementById('migrationStatus');
		this.progress = root.getElementById('migrationProgress');
	}

	show(text, tone = 'info') {
		this.message.textContent = text;
		this.message.dataset.tone = tone;
	}

	meter(current, total) {
		const maximum = Math.max(1, Number(total) || 1);
		this.progress.max = maximum;
		this.progress.value = Math.min(maximum, Math.max(0, Number(current) || 0));
		this.progress.hidden = false;
	}

	complete(text) {
		this.progress.hidden = true;
		this.show(text, 'success');
	}
}
