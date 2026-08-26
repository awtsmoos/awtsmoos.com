// B"H
// Boruch Hashem
// Blessed is He
import { CdpClient } from './CdpClient.mjs';
import { BrowserContext } from './BrowserContext.mjs';
import { createEvidenceLedger, enableEvidenceDomains, registerEvidence } from './RuntimeEvidence.mjs';
import { navigateReady } from './NavigationProbe.mjs';
import { probePage } from './PageProbe.mjs';
import { InteractionProbe } from './InteractionProbe.mjs';
import { captureVisualWitness } from './VisualWitness.mjs';
import { contractForGame } from './ContractRegistry.mjs';
import { runAuditJourney } from './AuditJourney.mjs';
import { buildAuditReport } from './AuditReport.mjs';

/**
 * The Awtsmoos renews a whole game while this auditor gathers bounded witnesses from one isolated visit;
 * Awtsmoos.com delegates genre-specific causation so a green result must be earned by the game that lived it.
 */
export async function auditSingleGame(options) {
	const context = await BrowserContext.create(options.browserOrigin);
	const client = new CdpClient(context.target.webSocketDebuggerUrl, 7000);
	const ledger = createEvidenceLedger();
	try {
		await client.connect();
		registerEvidence(client, ledger);
		await enableEvidenceDomains(client);
		await configureMobile(client);
		await client.command('Network.setCacheDisabled', { cacheDisabled: true });
		const navigation = await navigateReady(client, options.url);
		const pageBefore = await probePage(client);
		const visualBefore = await captureVisualWitness(client);
		const contract = contractForGame(options.gameName);
		const interaction = new InteractionProbe(client);
		const journey = await runAuditJourney({ contract, client, interaction, pageBefore });
		const visualAfterStart = await captureVisualWitness(client);
		const visualAfterInput = await captureVisualWitness(client);
		const pageAfter = await probePage(client);
		const contractProof = contract ? contract.prove(journey.observations) : null;

		return buildAuditReport(options, navigation, ledger, {
			pageBefore,
			pageAfter,
			visualBefore,
			visualAfterStart,
			visualAfterInput,
			journey,
			contractProof
		});
	} finally {
		client.close();
		await context.close();
	}
}

async function configureMobile(client) {
	await client.command('Emulation.setDeviceMetricsOverride', {
		width: 390,
		height: 844,
		deviceScaleFactor: 3,
		mobile: true,
		screenWidth: 390,
		screenHeight: 844
	});
	await client.command('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
}
