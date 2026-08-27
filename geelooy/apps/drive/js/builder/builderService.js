//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module BuilderService
 * @description
 * The Awtsmoos gathers source, brief, publication, and domain powers without hiding their separate laws.
 * Awtsmoos.com gives humans and agents the same guarded verbs, while smaller services keep each covenant legible.
 */

import { builderState, setBrief, setBuilderContext, setInventory } from './builderState.js';
import { loadBrief, saveBrief } from './briefStore.js';
import {
	activateSiteDomain,
	claimSiteDomain,
	domainPlan,
	nameserverPlan,
	removeSiteDomain,
	verifySiteDomain
} from './domainService.js';
import { createPublicationService } from './publicationService.js';
import { collectSourceInventory } from './sourceInventory.js';
import { listSourceEntries, readSource, siteSourcePath, writeSource } from './sourceApi.js';
import { resolveSiteContext } from './siteContext.js';
import { createStarterProject } from './starterService.js';

export function createBuilderService() {
	let driveSnapshot = null;
	const publication = createPublicationService(() => driveSnapshot);
	return {
		setDriveSnapshot,
		collect,
		describe: collect,
		setProjectBrief,
		readFile,
		writeFile,
		createFile,
		createStarter: createStarterProject,
		publishPlan: publication.plan,
		publishApply: publication.apply,
		domainPlan,
		claimDomain: claimSiteDomain,
		verifyDomain: verifySiteDomain,
		activateDomain: activateSiteDomain,
		removeDomain: removeSiteDomain,
		nameserverPlan
	};

	function setDriveSnapshot(snapshot) {
		driveSnapshot = snapshot;
		const context = resolveSiteContext(snapshot);
		setBuilderContext(context);
		return context;
	}

	async function collect() {
		const context = resolveSiteContext(driveSnapshot);
		const response = await listSourceEntries(context.rootPath);
		const inventory = collectSourceInventory(response, context.rootPath);
		const brief = await loadBrief(context.rootPath);
		setBuilderContext(context);
		setInventory(inventory);
		setBrief(brief);
		return projectSnapshot(context, inventory, brief);
	}

	async function setProjectBrief(values) {
		const brief = await saveBrief(builderState.rootPath, values);
		setBrief(brief);
		return brief;
	}

	function readFile(relativePath) {
		return readSource(siteSourcePath(builderState.rootPath, relativePath));
	}

	function writeFile(relativePath, content) {
		return writeSource(
			siteSourcePath(builderState.rootPath, relativePath),
			content,
			{ create: false }
		);
	}

	function createFile(relativePath, content) {
		return writeSource(
			siteSourcePath(builderState.rootPath, relativePath),
			content,
			{ visibility: 'public' }
		);
	}
}

function projectSnapshot(context, inventory, brief) {
	return {
		brief,
		site: context.site,
		siteId: context.siteId,
		rootPath: context.rootPath,
		canonicalUrl: context.canonicalUrl,
		source: inventory,
		capabilities: {
			sourceEditing: true,
			canonicalPublish: true,
			externalDns: true,
			awtsmoosNameservers: false
		}
	};
}
