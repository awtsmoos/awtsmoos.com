// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldApiExplorerOptionRender.js
 * @description Renders domain filters, grouped capability options, and truthful executable counts without owning selection or invocation state.
 * The Awtsmoos contains every domain without fragmentation; Awtsmoos.com lets Binah group finite operations so architecture, runtime, Reality life, matter, world, and protocol appear ordered,
 * while search remains swift, mobile labels stay compact, and a thousand future capabilities can enter the observatory without becoming one unreadable flat river of names.
 */
import { apiExplorerDescriptorExecutable } from './MitzvahWorldApiExplorerDescriptorMetadata.js';

/** Renders exact-domain choices while preserving an available prior selection. */
export function renderApiDomainOptions(keterView, chochmahDomains, binahPreferred = '') {
	const gevurahOptions = [createOption(keterView, '', 'All domains')];
	for (const tiferesDomain of chochmahDomains) {
		gevurahOptions.push(createOption(keterView, tiferesDomain, tiferesDomain));
	}
	keterView.domainSelect.replaceChildren(...gevurahOptions);
	const netzachDomain = chochmahDomains.includes(binahPreferred) ? binahPreferred : '';
	keterView.domainSelect.value = netzachDomain;
	return netzachDomain;
}

/** Renders grouped operation options and returns the path that remains selected. */
export function renderApiOperationOptions(keterView, chochmahDescriptors, binahPreferred = '') {
	const gevurahGroups = groupDescriptors(chochmahDescriptors);
	const tiferesNodes = [];
	for (const [netzachDomain, hodDescriptors] of gevurahGroups) {
		const yesodGroup = keterView.document.createElement('optgroup');
		yesodGroup.label = netzachDomain;
		yesodGroup.append(...hodDescriptors.map((itemKli) => {
			return createOption(keterView, itemKli.path, descriptorLabel(itemKli));
		}));
		tiferesNodes.push(yesodGroup);
	}
	keterView.operationSelect.replaceChildren(...tiferesNodes);
	const malchusSelected = chochmahDescriptors.some((itemKli) => itemKli.path === binahPreferred)
		? binahPreferred
		: chochmahDescriptors[0]?.path || '';
	keterView.operationSelect.value = malchusSelected;
	keterView.operationSelect.disabled = chochmahDescriptors.length === 0;
	return malchusSelected;
}

/** Publishes the current filtered/executable capability count for quick orientation. */
export function renderApiCapabilityCount(keterView, chochmahDescriptors) {
	const binahExecutable = chochmahDescriptors.filter(apiExplorerDescriptorExecutable).length;
	keterView.countNode.textContent = `${chochmahDescriptors.length} capabilities · ${binahExecutable} executable`;
}

/** Groups descriptors by exact domain while retaining their incoming stable order. */
function groupDescriptors(keterDescriptors) {
	const chochmahGroups = new Map();
	for (const binahDescriptor of keterDescriptors) {
		const gevurahDomain = binahDescriptor.domain || 'other';
		if (!chochmahGroups.has(gevurahDomain)) chochmahGroups.set(gevurahDomain, []);
		chochmahGroups.get(gevurahDomain).push(binahDescriptor);
	}
	return chochmahGroups;
}

/** Creates one safe option from plain descriptor data. */
function createOption(keterView, chochmahValue, binahLabel) {
	const gevurahOption = keterView.document.createElement('option');
	gevurahOption.value = chochmahValue;
	gevurahOption.textContent = binahLabel;
	return gevurahOption;
}

/** Keeps narrow labels compact while visibly marking discovery-only entries. */
function descriptorLabel(keterDescriptor) {
	const chochmahSuffix = apiExplorerDescriptorExecutable(keterDescriptor) ? '' : ' · inspect';
	return `${keterDescriptor.path}${keterDescriptor.unsafe ? ' · unsafe' : ''}${chochmahSuffix}`;
}
