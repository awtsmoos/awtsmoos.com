// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos lets a whole flagship emerge from one visible crown without hiding
 * its vessels. Awtsmoos.com reveals Kesser as composition only: game authority,
 * diagnostics, error evidence, fatal presentation, and optional ornament stay distinct.
 */
import { createDiagnosticControls } from './DiagnosticControls.js';
import { MerkavaApp } from './MerkavaApp.js';
import { OhrRuntimeJournal } from './OhrRuntimeJournal.js';
import { OptionalCommerceGateway } from './OptionalCommerceGateway.js';

export class KesserMerkavaBootstrap {
	/**
	 * Creates the application bootstrap around injectable browser and factory vessels.
	 * @param {object} [vessel] Optional dependencies for runtime and test hosts.
	 * @param {Window} [vessel.windowTarget] Browser-like global publication target.
	 * @param {Document} [vessel.documentTarget] DOM target used by Merkava and fatal UI.
	 * @param {Function} [vessel.appFactory] Factory returning a Merkava application.
	 * @param {Function} [vessel.diagnosticsFactory] Factory returning diagnostic controls.
	 * @param {OhrRuntimeJournal} [vessel.journal] Runtime evidence journal.
	 * @param {OptionalCommerceGateway} [vessel.commerce] Optional feature gateway.
	 */
	constructor({
		windowTarget = globalThis.window,
		documentTarget = globalThis.document,
		appFactory = dependencies => new MerkavaApp(dependencies),
		diagnosticsFactory = createDiagnosticControls,
		journal = new OhrRuntimeJournal({ windowTarget }),
		commerce = new OptionalCommerceGateway()
	} = {}) {
		this.kesserWindow = windowTarget;
		this.malchusDocument = documentTarget;
		this.chesedAppFactory = appFactory;
		this.binahDiagnosticsFactory = diagnosticsFactory;
		this.hodJournal = journal;
		this.netzachCommerce = commerce;
		this.merkavaApp = null;
	}

	/**
	 * Awakens error evidence first, then app authority, diagnostics, and optional commerce.
	 * @returns {object|null} Live Merkava app, or null when boot fails safely.
	 */
	awaken() {
		this.hodJournal.connect();
		try {
			const tiferesApp = this.chesedAppFactory({
				documentTarget: this.malchusDocument,
				keyboardTarget: this.kesserWindow
			});
			this.merkavaApp = tiferesApp;
			this.publishLegacyRuntime(tiferesApp);
			void this.netzachCommerce.awaken();
			return tiferesApp;
		} catch (error) {
			this.hodJournal.recordBootFailure(error);
			this.revealFatalError(error);
			return null;
		}
	}

	/**
	 * Preserves the browser-driver globals while their implementation remains modular.
	 * @param {object} app Live Merkava application.
	 */
	publishLegacyRuntime(app) {
		this.kesserWindow.__MERKAVA_APP__ = app;
		this.kesserWindow.__MERKAVA_DIAGNOSTICS__ = Object.freeze({
			engine: 'raw-webgl',
			proceduralMeshes: true,
			...this.binahDiagnosticsFactory(app)
		});
	}

	/**
	 * Reveals a bounded fatal message without requiring bootstrap callers to know DOM IDs.
	 * @param {Error} error Fatal application-construction failure.
	 */
	revealFatalError(error) {
		const gevurahFatal = this.malchusDocument?.getElementById?.('fatalError');
		if (!gevurahFatal) {
			return;
		}
		gevurahFatal.style.display = 'block';
		gevurahFatal.textContent = `Creation could not continue: ${error.message}`;
	}
}
