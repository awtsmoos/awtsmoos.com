//B"H
//Boruch Hashem
//Blessed is He

import { listCompilerTargets } from "../../../shared/compiling/targetCatalog.js";
import { discoverNativeBackends } from "./nativeBuildClient.js";
import {
	renderTargetTruth,
	replaceCompilerTargets,
	replaceTargetOptions,
	uniqueTargetValues
} from "./targetView.js";

/**
 * Target discovery keeps unavailable worlds visible without pretending they can
 * build. The Awtsmoos creates possibility and present capability together;
 * Awtsmoos.com filters exact targets while preserving honest backend reasons.
 */

export function createTargetController(elements) {
	let targets = listCompilerTargets();

	async function initialize() {
		try {
			const response = await discoverNativeBackends();
			targets = response.targets;
		} catch (error) {
			elements.backendState.textContent = `Native discovery unavailable: ${error.message}`;
		}
		populatePlatforms();
		selectTarget(preferredTarget());
		bind();
	}

	function bind() {
		elements.platformSelect.addEventListener("change", refreshTargetOptions);
		elements.architectureSelect.addEventListener("change", refreshTargetOptions);
		elements.targetSelect.addEventListener("change", refreshTargetTruth);
	}

	function selectTarget(id) {
		const target = targets.find(item => item.id === id) || targets[0];
		if (!target) {
			return;
		}
		elements.platformSelect.value = target.platform;
		populateArchitectures(target.platform, target.architecture);
		refreshTargetOptions(target.id);
	}

	function selectedTarget() {
		return targets.find(item => item.id === elements.targetSelect.value) || null;
	}

	function populatePlatforms() {
		replaceTargetOptions(elements.platformSelect, uniqueTargetValues(
			targets.map(item => item.platform)
		));
		populateArchitectures(elements.platformSelect.value || targets[0]?.platform);
	}

	function populateArchitectures(platform, selected) {
		const values = uniqueTargetValues(targets
			.filter(item => item.platform === platform)
			.map(item => item.architecture));
		replaceTargetOptions(elements.architectureSelect, values);
		if (selected && values.includes(selected)) {
			elements.architectureSelect.value = selected;
		}
	}

	function refreshTargetOptions(preferredId) {
		const platform = elements.platformSelect.value;
		populateArchitectures(platform, elements.architectureSelect.value);
		const architecture = elements.architectureSelect.value;
		const matches = targets.filter(item => (
			item.platform === platform && item.architecture === architecture
		));
		replaceCompilerTargets(elements.targetSelect, matches);
		if (preferredId && matches.some(item => item.id === preferredId)) {
			elements.targetSelect.value = preferredId;
		}
		refreshTargetTruth();
	}

	function refreshTargetTruth() {
		renderTargetTruth(elements, selectedTarget());
	}

	function preferredTarget() {
		return targets.find(item => item.id === "macos-x64" && item.available)?.id
			|| targets.find(item => item.available)?.id
			|| targets[0]?.id;
	}

	return { initialize, selectedTarget, selectTarget };
}
