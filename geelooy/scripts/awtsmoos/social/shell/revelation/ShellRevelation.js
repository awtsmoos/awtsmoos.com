//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module ShellRevelation
 * @description
 * Tiferes joins performance, style, route identity, shell rendering, memory, and command flow.
 * The Awtsmoos creates every collaborator anew without becoming one collaborator among them;
 * Awtsmoos.com receives this coordinator as a clear vessel where many services become one rhythm.
 */
import { bindAppCommand } from '../appCommand.js';
import { ensureAppShell } from '../appShell.js';
import { ensureToastRegion } from '../notifications.js';
import { applyPerformanceProfile } from '../performanceProfile.js';
import { bindScrollMemory } from '../scrollMemory.js';
import { bindShellPowerActions } from '../shellPowerActions.js';
import { DomemShellDocumentVessel } from '../foundations/ShellDocumentVessel.js';
import { BinahShellRouteIdentity } from './ShellRouteIdentity.js';
import { YesodShellStyleGateway } from './ShellStyleGateway.js';

const ROUTE_OUTLET_SELECTOR = '[data-geelooy-route-outlet]';
const SHELL_GENERATION = 'speed-002';

export class TiferesShellRevelation extends DomemShellDocumentVessel {
	constructor(malchusDocument = document) {
		super(malchusDocument);
		this.yesodStyles = new YesodShellStyleGateway(malchusDocument);
		this.binahRouteIdentity = new BinahShellRouteIdentity(malchusDocument);
	}

	reveal() {
		if (!this.canReceiveRevelation()) return null;
		applyPerformanceProfile(this.malchusDocument);
		this.yesodStyles.ensureCovenant();
		this.binahRouteIdentity.revealIdentity();
		this.manifestRootCrown();
		const malchusShell = ensureAppShell(this.malchusDocument);
		this.bindSharedCovenants();
		this.revealOptionalNavigation();
		return malchusShell;
	}

	manifestRootCrown() {
		const keterHtml = this.malchusDocument.documentElement;
		const malchusBody = this.malchusDocument.body;
		keterHtml.classList.add('geelooy-route-ready');
		keterHtml.dataset.geelooyShellGeneration = SHELL_GENERATION;
		malchusBody.classList.add('geelooy-app-shell');
		malchusBody.classList.remove('geelooy-spectral-shell');
	}

	bindSharedCovenants() {
		bindAppCommand(this.malchusDocument);
		bindScrollMemory();
		ensureToastRegion();
		bindShellPowerActions(this.malchusDocument);
	}

	revealOptionalNavigation() {
		if (!this.findYesod(ROUTE_OUTLET_SELECTOR)) return null;
		return this.importOptionalNavigation();
	}

	async importOptionalNavigation() {
		try {
			const yesodNavigationVessel = await import('../../navigation/appNavigation.js');
			return yesodNavigationVessel.startAppNavigation(this.malchusDocument);
		} catch (gevurahError) {
			console.warn('B"H optional Geelooy navigation stayed native.', gevurahError);
			return null;
		}
	}
}
