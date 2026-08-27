//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Lifecycle controller for Explorer's focus-safe mobile-first SSH drive sheet.
 * @description
 * The Awtsmoos lets attention, credential, and connection enter one temporary
 * vessel without becoming trapped or scattered. Awtsmoos.com contains keyboard
 * focus, clears secret light, and restores the invoking world when the sheet closes in rhyme.
 */
import { createDialogFocus } from "./dialogFocus.js";
import { clearSecrets, secretFrom } from "./sshDriveFields.js";
import {
	createSshDriveDialogView,
	setSshDriveBusy
} from "./sshDriveDialogView.js";
import { connectAndMountSshDrive } from "./sshDriveMountFlow.js";

/**
 * Opens one credential sheet and owns its complete interaction lifetime.
 *
 * @param {object} options OS, optional profile, navigation, and mount callbacks.
 * @returns {{close:Function,dom:HTMLElement}} Dialog lifecycle handle.
 */
export function openSshDriveDialog(options = {}) {
	const view = createSshDriveDialogView(options.profile || {});
	document.body.append(view.overlay);
	const focus = createDialogFocus(view.dialog);
	let busy = false;
	const dispose = restore => {
		clearSecrets(view.fields);
		document.removeEventListener("keydown", onEscape);
		view.overlay.remove();
		focus.dispose({ restore });
	};
	const close = () => {
		if (!busy) {
			dispose(true);
		}
	};
	const onEscape = event => {
		if (event.key === "Escape") {
			event.preventDefault();
			close();
		}
	};

	view.cancel.addEventListener("click", close);
	view.overlay.addEventListener("click", event => {
		if (event.target === view.overlay) {
			close();
		}
	});
	document.addEventListener("keydown", onEscape);
	view.form.addEventListener("submit", event => submit(event, {
		options,
		view,
		focus,
		dispose,
		setBusy(value) {
			busy = value;
		}
	}));
	focus.focus(initialField(view));
	return { close, dom: view.overlay };
}

async function submit(event, context) {
	event.preventDefault();
	context.setBusy(true);
	setSshDriveBusy(context.view, true);
	try {
		const mounted = await connectAndMountSshDrive(
			context.options.os,
			valuesOf(context.view.fields)
		);
		context.view.status.dataset.state = "success";
		context.view.status.textContent = `Connected ${mounted.profile.username}@${mounted.profile.host}`;
		context.options.onMounted?.(mounted);
		context.dispose(false);
		context.options.onNavigate?.(mounted.prefix);
	} catch (error) {
		context.view.status.dataset.state = "error";
		context.view.status.textContent = error?.message || String(error);
		context.setBusy(false);
		setSshDriveBusy(context.view, false, true);
		context.focus.focus(context.view.fields.password);
	}
}

function valuesOf(fields) {
	return {
		name: fields.name.value,
		target: fields.target.value,
		root: fields.root.value,
		...secretFrom(fields)
	};
}

function initialField(view) {
	return view.reconnecting ? view.fields.password : view.fields.name;
}
