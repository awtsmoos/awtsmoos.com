//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module ShellRevelation
 * @description
 * Tiferes joins performance, style, route identity, shell rendering, memory, and command flow.
 * The Awtsmoos creates every collaborator anew without becoming one collaborator among them;
 * Awtsmoos.com receives this coordinator as a clear vessel where many services become one rhythm.
 *
 * RESPONSIBILITY: Orchestrate the established shared-shell boot lifecycle in canonical order.
 * NON-RESPONSIBILITY: Specialized rendering, routing, styling, and persistence stay in collaborators.
 */
import { bindAppCommand } from '../appCommand.js';
import { ensureAppShell } from '../appShell.js';
import { ensureToastRegion } from '../notifications.js';
import { applyPerformanceProfile } from '../performanceProfile.js';
import { bindScrollMemory } from '../scrollMemory.js';
import { DomemShellDocumentVessel } from '../foundations/ShellDocumentVessel.js';
import { BinahShellRouteIdentity } from './ShellRouteIdentity.js';
import { YesodShellStyleGateway } from './ShellStyleGateway.js';

const ROUTE_OUTLET_SELECTOR = '[data-geelooy-route-outlet]';
const SHELL_GENERATION = 'speed-001';

export class TiferesShellRevelation extends DomemShellDocumentVessel {
	/**
	 * Creates the shell lifecycle coordinator and its explicit collaborators.
	 * @param {Document} malchusDocument Browser document receiving shared application chrome.
	 */
	constructor(malchusDocument = document) {
		super(malchusDocument);
		this.yesodStyles = new YesodShellStyleGateway(malchusDocument);
		this.binahRouteIdentity = new BinahShellRouteIdentity(malchusDocument);
	}

	/**
	 * Reveals the shared shell while preserving the historical boot ordering contract.
	 * Side effects include root identity, shared shell creation, commands, scroll memory,
	 * toast availability, and optional navigation when the route explicitly provides an outlet.
	 * @returns {Element|null} Manifested shell element, or null when the route is ineligible.
	 * @throws {Error} Propagates required shared-shell dependency failures to the browser boundary.
	 */
	reveal() {
		if (!this.canReceiveRevelation()) {
			return null;
		}
		applyPerformanceProfile(this.malchusDocument);
		this.yesodStyles.ensureCovenant();
		this.binahRouteIdentity.revealIdentity();
		this.manifestRootCrown();
		const malchusShell = ensureAppShell(this.malchusDocument);
		this.bindSharedCovenants();
		this.revealOptionalNavigation();
		return malchusShell;
	}

	/**
	 * Manifests root classes and generation metadata consumed by shared CSS and diagnostics.
	 * @returns {void} Mutates only documentElement and body shell-identity state.
	 */
	manifestRootCrown() {
		const keterHtml = this.malchusDocument.documentElement;
		const malchusBody = this.malchusDocument.body;
		keterHtml.classList.add('geelooy-route-ready');
		keterHtml.dataset.geelooyShellGeneration = SHELL_GENERATION;
		malchusBody.classList.add('geelooy-app-shell');
		malchusBody.classList.remove('geelooy-spectral-shell');
	}

	/**
	 * Binds command, scroll-memory, and toast contracts after shell manifestation.
	 * @returns {void} Installs shared runtime listeners/regions through existing collaborators.
	 */
	bindSharedCovenants() {
		bindAppCommand(this.malchusDocument);
		bindScrollMemory();
		ensureToastRegion();
	}

	/**
	 * Starts hybrid navigation only when a route outlet explicitly requests it.
	 * @returns {Promise<unknown>|null} Navigation result promise, or null for native routes.
	 */
	revealOptionalNavigation() {
		if (!this.findYesod(ROUTE_OUTLET_SELECTOR)) {
			return null;
		}
		return this.importOptionalNavigation();
	}

	/**
	 * Loads the optional navigation adapter without breaking native navigation on failure.
	 * Failures are acknowledged as warnings because native route navigation remains valid.
	 * @returns {Promise<unknown>} Promise resolving to the optional navigation result or null.
	 */
	async importOptionalNavigation() {
		try {
			const yesodNavigationVessel = await import('../../navigation/appNavigation.js');
			return yesodNavigationVessel.startAppNavigation(this.malchusDocument);
		} catch (gevurahError) {
			console.warn(
				'B"H optional Geelooy navigation stayed native.',
				gevurahError
			);
			return null;
		}
	}
}
