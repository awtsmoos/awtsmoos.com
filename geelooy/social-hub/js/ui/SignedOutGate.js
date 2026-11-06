// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module SignedOutGate
 * @description
 * Signed-out visitors clicking auth-gated Social Hub controls used to get
 * dead silence. This gate intercepts those clicks and shows a sign-in
 * dialog with a working path instead of doing nothing.
 *
 * Public controls (feed mode tabs, links, native disclosures, form
 * submissions, dialog internals) are never gated.
 */

const SIGN_IN_URL = '/login/?next=%2Fsocial-hub%2F';
const SIGN_UP_URL = '/register/';

/**
 * Buttons that work fine for signed-out visitors and must never trigger the gate.
 * Mode tabs carry data-feed-mode; individual controls can opt out with data-gate-skip.
 */
const PUBLIC_BUTTON_SELECTOR = [
	'button[data-feed-mode]',
	'button[data-gate-skip]',
	'button[data-close]',
	'button[aria-label="Close"]',
	'button[aria-label="close"]',
].join(',');

/** Returns true when the click target lives inside a working public vessel. */
function isPublicControl(button) {
	if (!button) return true;
	if (button.matches(PUBLIC_BUTTON_SELECTOR)) return true;
	// Links, native disclosures, and form fields keep their native behavior.
	if (button.closest('a, summary, form, input, select, textarea, [role="dialog"], [data-gate-skip]')) return true;
	if (button.disabled) return true;
	return false;
}

/** Builds the sign-in gate dialog with working sign-in / sign-up paths. */
function buildGate(document) {
	const overlay = document.createElement('div');
	overlay.className = 'awtsmoos-signedout-gate';
	overlay.setAttribute('role', 'dialog');
	overlay.setAttribute('aria-modal', 'true');
	overlay.setAttribute('aria-labelledby', 'awtsmoos-gate-title');
	overlay.style.cssText = [
		'position:fixed', 'inset:0', 'z-index:9999',
		'display:flex', 'align-items:center', 'justify-content:center',
		'background:rgba(2,5,13,0.72)', 'padding:1.25rem',
	].join(';');

	const card = document.createElement('div');
	card.style.cssText = [
		'max-width:26rem', 'width:100%', 'border-radius:1rem',
		'background:#fffdf6', 'color:#2e2417', 'padding:1.75rem',
		'box-shadow:0 24px 64px rgba(0,0,0,0.35)',
		'font-family:inherit', 'text-align:center',
	].join(';');

	const mark = document.createElement('div');
	mark.textContent = '✦';
	mark.setAttribute('aria-hidden', 'true');
	mark.style.cssText = 'font-size:1.75rem;color:#8a6d3b;margin-bottom:0.5rem;';

	const title = document.createElement('h2');
	title.id = 'awtsmoos-gate-title';
	title.textContent = 'Sign in to continue';
	title.style.cssText = 'margin:0 0 0.5rem;font-size:1.25rem;';

	const copy = document.createElement('p');
	copy.textContent = 'This part of the Social Hub needs an Awtsmoos account. Sign in — or create one free — and you will return right here.';
	copy.style.cssText = 'margin:0 0 1.25rem;line-height:1.6;color:#6d5c40;';

	const actions = document.createElement('div');
	actions.style.cssText = 'display:flex;gap:0.75rem;justify-content:center;flex-wrap:wrap;';

	const signIn = document.createElement('a');
	signIn.href = SIGN_IN_URL;
	signIn.textContent = 'Sign in';
	signIn.style.cssText = [
		'display:inline-block', 'padding:0.65rem 1.5rem', 'border-radius:999px',
		'background:#8a6d3b', 'color:#fff', 'text-decoration:none', 'font-weight:700',
	].join(';');

	const signUp = document.createElement('a');
	signUp.href = SIGN_UP_URL;
	signUp.textContent = 'Create account';
	signUp.style.cssText = [
		'display:inline-block', 'padding:0.65rem 1.5rem', 'border-radius:999px',
		'border:2px solid #8a6d3b', 'color:#8a6d3b', 'text-decoration:none', 'font-weight:700',
	].join(';');

	const close = document.createElement('button');
	close.type = 'button';
	close.setAttribute('data-gate-skip', 'true');
	close.textContent = 'Not now';
	close.style.cssText = [
		'display:block', 'margin:1rem auto 0', 'background:none', 'border:none',
		'color:#6d5c40', 'text-decoration:underline', 'cursor:pointer', 'font-size:0.95rem',
	].join(';');

	actions.append(signIn, signUp);
	card.append(mark, title, copy, actions, close);
	overlay.append(card);

	const dismiss = () => {
		overlay.remove();
		document.removeEventListener('keydown', onKey, true);
	};
	const onKey = event => {
		if (event.key === 'Escape') dismiss();
	};
	close.addEventListener('click', dismiss);
	overlay.addEventListener('click', event => {
		if (event.target === overlay) dismiss();
	});
	document.addEventListener('keydown', onKey, true);
	return { overlay, dismiss };
}

/**
 * Mounts the signed-out gate on the Social Hub root.
 * @param {Document|HTMLElement} root Hub mount root for delegated clicks.
 * @param {() => boolean} isSignedIn Reads current signed-in state.
 * @returns {{destroy: () => void}} Teardown handle.
 */
export function mountSignedOutGate(root, isSignedIn) {
	if (!root || typeof isSignedIn !== 'function') return { destroy() {} };
	let gate = null;

	const onClick = event => {
		let signedIn = false;
		try {
			signedIn = Boolean(isSignedIn());
		} catch {
			signedIn = false;
		}
		if (signedIn) return;
		const button = event.target?.closest?.('button');
		if (!button || isPublicControl(button)) return;
		// Signed-out visitor hit an auth-gated control: show the gate
		// with a working path instead of dead silence.
		event.preventDefault();
		event.stopPropagation();
		if (gate) gate.dismiss();
		const doc = root.ownerDocument || document;
		gate = buildGate(doc);
		doc.body.append(gate.overlay);
		const firstLink = gate.overlay.querySelector('a');
		if (firstLink) firstLink.focus();
	};

	root.addEventListener('click', onClick, true);
	return {
		destroy() {
			root.removeEventListener('click', onClick, true);
			if (gate) gate.dismiss();
		},
	};
}
