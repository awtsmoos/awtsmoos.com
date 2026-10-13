//B"H
//Boruch Hashem
//Blessed is He

/**
 * Installs the expedition menu machinery onto MenuFlow.prototype. The
 * expedition sync coordinator and its menu views stay out of the boot graph;
 * they load on first expedition access while the mode menu and VS flow boot
 * without them.
 *
 * @param {typeof import('./MenuFlow.js').MenuFlow} MenuFlow - The menu flow class.
 */
export function installMenuFlowExpedition(MenuFlow) {
	/**
	 * Loads the expedition sync coordinator on first use.
	 * Requires the expedition model to be prepared via model.ensureExpedition().
	 */
	MenuFlow.prototype.ensureExpeditionSync = async function ensureExpeditionSync() {
		if (!this.expeditionSync) {
			await this.model.ensureExpedition();
			const { ExpeditionSyncCoordinator } = await import(
				'../expedition/ExpeditionSyncCoordinator.js'
			);
			this.expeditionSync = new ExpeditionSyncCoordinator(
				this.model.expedition
			);
		}
		// B"H — warm the loadout painter alongside the sync so expedition
		// fighters render their garments on the first frame.
		const { ensureExpeditionLoadoutPainter } = await import('../render/fighters.js');
		const { ensureExpeditionWeaponAura } = await import('../render/weapons.js');
		void ensureExpeditionLoadoutPainter();
		void ensureExpeditionWeaponAura();
		return this.expeditionSync;
	};

	/** Safely closes expedition sync if it was ever created. */
	MenuFlow.prototype.closeExpeditionSync = function closeExpeditionSync() {
		try {
			this.expeditionSync?.close();
		} catch {
			/* never block unload */
		}
	};

	MenuFlow.prototype.showExpedition = async function showExpedition() {
		this.status.textContent = 'Charting the expedition road…';
		await this.ensureExpeditionSync();
		const { showExpeditionMenu } = await import('./JourneyMenuFlow.js');
		showExpeditionMenu(this);
	};

	MenuFlow.prototype.refreshExpedition = async function refreshExpedition() {
		await this.ensureExpeditionSync();
		const { refreshExpeditionMenu } = await import('./JourneyMenuFlow.js');
		refreshExpeditionMenu(this);
	};
}
