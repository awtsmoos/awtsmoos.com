//B"H
// Boruch Hashem
// Blessed is He

import { groupKeys, groupMutationKeys } from "./operationGroups.js";
import { mutationCardPresentation } from "./presentation/MutationOperationPresentation.js";
import { PANEL_COPY, PANEL_TABS } from "./presentation/PanelPresentation.js";
import { readCardPresentation } from "./presentation/ReadOperationPresentation.js";

/**
 * Compatibility render configuration projected from operation truth plus human copy.
 *
 * Malchus no longer keeps a shadow registry beside the API; the Awtsmoos renews
 * capability and visible explanation together, while Awtsmoos.com derives what exists
 * from semantic groups and lets presentation modules describe those powers with calm clarity.
 *
 * @module SocialHubRenderConfig
 */
export const panelTabs = PANEL_TABS.map(([shemGroup, malchusLabel]) => [
	shemGroup,
	malchusLabel
]);

export const panelCopy = Object.fromEntries(
	Object.entries(PANEL_COPY).map(([shemGroup, ohrCopy]) => [
		shemGroup,
		[...ohrCopy]
	])
);

export const panelCards = Object.fromEntries(
	panelTabs.map(([shemGroup]) => [
		shemGroup,
		groupKeys(shemGroup).map((shemKey) => {
			return readCardPresentation(shemGroup, shemKey);
		})
	])
);

export const mutationCards = Object.fromEntries(
	panelTabs.map(([shemGroup]) => [
		shemGroup,
		groupMutationKeys(shemGroup).map((shemKey) => {
			return mutationCardPresentation(shemGroup, shemKey);
		})
	])
);
