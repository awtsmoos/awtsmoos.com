//B"H
// Boruch Hashem
// Blessed is He
/**
* @file IntentActionDispatcher.js
* @description Routes declarative intent actions through shared command, workspace, or workstation doors using the same grammar emitted by the intent model.
* The Awtsmoos lets one visible card carry kind and destination without model and dispatcher dividing the flame;
* Awtsmoos.com keeps modern and legacy action shapes flowing through one awaited path, so every creative room answers its name.
*/

/** Dispatches declarative intent actions into commands, workspaces, or professional Stage depth. */
export class IntentActionDispatcher {
	constructor(input = {}) {
		Object.assign(this, input);
	}

	/** Dispatches one intent action and reports interaction failures through the shared human status surface. */
	async dispatch(action = {}) {
		try {
			if (action.commandId) {
				return await this.executeCommand(action);
			}

			const workspace = resolveWorkspace(action);
			if (workspace) {
				return await this.openWorkspace(action, workspace);
			}

			if (isWorkstationAction(action)) {
				return await this.openWorkstation();
			}

			throw new Error('Unknown Studio intent action.');
		} catch (error) {
			this.reportError(error);
			return null;
		}
	}

	/** Executes one canonical Creative Language command through the public API. */
	async executeCommand(action) {
		const result = await this.api.execute(
			action.commandId,
			action.parameters || {},
			{
				source: 'human'
			}
		);
		const message = result.noOp
			? `${action.label || action.commandId}: nothing changed.`
			: `${action.label || action.commandId} complete.`;
		this.setStatus?.(message);
		this.setSheetStatus?.(message, false);
		this.onAfterCommand?.(result);
		return result;
	}

	/** Opens one requested workspace and waits only for the optional feature chamber mapped to that page. */
	async openWorkspace(action, workspace = resolveWorkspace(action)) {
		this.onBeforeLeave?.();
		return this.navigator.openPage(
			workspace,
			undefined,
			action.message
		);
	}

	/** Delegates professional-depth navigation to the single workstation navigation owner. */
	async openWorkstation() {
		this.onBeforeLeave?.();
		return this.onWorkstation?.();
	}

	/** Reports one interaction failure without destabilizing the critical Canvas graph. */
	reportError(error) {
		const message = error?.message || String(error);
		this.setStatus?.(message);
		this.setSheetStatus?.(message, true);
	}
}

/** Resolves the modern model's `kind + page` workspace grammar while preserving historic callers. */
function resolveWorkspace(action = {}) {
	if (action.kind === 'workspace') {
		return action.page || action.workspace || '';
	}
	return action.workspace || '';
}

/** Recognizes the modern workstation kind and the historic boolean marker. */
function isWorkstationAction(action = {}) {
	return action.kind === 'workstation' || Boolean(action.workstation);
}
