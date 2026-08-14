// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module SocialHubOperationRunner
 * @description
 * The Awtsmoos gives reading and mutation separate gates, one shared status vessel,
 * and one explicit refusal path. Awtsmoos.com keeps execution out of the bootstrap
 * so assembly remains small and the safety boundary stays independently testable.
 */

import { isMutationKey, isReadKey } from "./operationPolicy.js";
import { requestForKey } from "./requestPlan.js";
import { setBusy, setError, setResult } from "./state.js";

export function createOperationRunner({ repaint }) {
	async function executeKey(key) {
		const result = await requestForKey(key);
		setResult(key, result);
		return result;
	}

	async function withStatus(work) {
		setBusy(true);
		setError("");
		repaint();
		try {
			return await work();
		} catch (error) {
			setError(error.message || String(error));
			return null;
		} finally {
			setBusy(false);
			repaint();
		}
	}

	function runReadKey(key) {
		if (!isReadKey(key)) {
			refuse(`Refused non-read operation: ${key}`);
			return Promise.resolve(null);
		}
		async function executeSingleRead() {
			return executeKey(key);
		}
		return withStatus(executeSingleRead);
	}

	function runReads(keys) {
		const unsafe = keys.filter(isUnsafeReadKey);
		if (unsafe.length) {
			refuse(`Bulk exploration refused unsafe keys: ${unsafe.join(", ")}`);
			return Promise.resolve(null);
		}
		async function executeReadGroup() {
			return Promise.all(keys.map(executeKey));
		}
		return withStatus(executeReadGroup);
	}

	function runMutation(key) {
		if (!isMutationKey(key)) {
			refuse(`Refused unknown mutation: ${key}`);
			return Promise.resolve(null);
		}
		async function executeMutation() {
			return executeKey(key);
		}
		return withStatus(executeMutation);
	}

	function refuse(message) {
		setError(message);
		repaint();
	}

	return {
		runReadKey,
		runReads,
		runMutation
	};
}

function isUnsafeReadKey(key) {
	return !isReadKey(key);
}
