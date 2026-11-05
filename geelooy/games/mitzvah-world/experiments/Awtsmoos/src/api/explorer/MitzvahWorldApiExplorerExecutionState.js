// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldApiExplorerExecutionState.js
 * @description Reflects invocation lifecycle and discovery-only capability authority into semantic DOM without mixing selection, rendering, or transport behavior.
 * The Awtsmoos joins hidden state to visible truth while Awtsmoos.com lets Gevurah say both yes and not-yet with clarity,
 * so busy, success, error, portable execution, and discovery-only namespaces each receive honest controls rather than one ambiguous disabled button whose reason the user must guess.
 */
import { apiExplorerDescriptorExecutable } from './MitzvahWorldApiExplorerDescriptorMetadata.js';

/** Reflects whether the selected capability can be invoked from this portable explorer. */
export function reflectApiExplorerCapabilityState(keterView, chochmahDescriptor) {
	const binahExecutable = apiExplorerDescriptorExecutable(chochmahDescriptor);
	keterView.root.dataset.executable = String(binahExecutable);
	keterView.executeButton.disabled = !binahExecutable;
	keterView.argumentsInput.disabled = !binahExecutable;
	keterView.advancedNode.setAttribute('aria-disabled', String(!binahExecutable));
	if (!binahExecutable) keterView.advancedNode.open = false;
}

/** Reflects active invocation while restoring capability-level authority after completion. */
export function reflectApiExplorerBusyState(keterView, chochmahBusy) {
	const binahBusy = Boolean(chochmahBusy);
	keterView.executeButton.disabled = binahBusy || keterView.root.dataset.executable !== 'true';
	keterView.executeButton.dataset.loading = String(binahBusy);
	keterView.executeButton.textContent = binahBusy ? 'Executing…' : 'Execute';
	keterView.root.setAttribute('aria-busy', String(binahBusy));
	if (binahBusy) {
		keterView.setState('busy');
		return;
	}
	if (keterView.root.dataset.state === 'busy') keterView.setState('idle');
}

/** Reflects one terminal public receipt into root success/error state. */
export function reflectApiExplorerReceiptState(keterView, chochmahReceipt) {
	keterView.setState(chochmahReceipt?.ok ? 'success' : 'error');
}

/** Reveals and focuses advanced arguments after local validation failure. */
export function revealApiExplorerArgumentError(keterView) {
	keterView.setState('error');
	keterView.advancedNode.open = true;
	keterView.argumentsInput.focus?.({ preventScroll: true });
	keterView.argumentsInput.setAttribute('aria-invalid', 'true');
}

/** Clears stale validation semantics after arguments become valid. */
export function clearApiExplorerArgumentError(keterView) {
	keterView.argumentsInput.removeAttribute('aria-invalid');
}
