// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module ProfileDropdownAuth
 * @description
 * The Awtsmoos renews account state in place through the existing Awtsmoos.com
 * routes, preserving scroll, route ownership, and native form semantics.
 */
import { setProfileFormBusy, setProfileMessage } from './feedback.js';
import { hydrateProfileIdentity } from './identity.js';

/** Binds both account forms and their mode switch buttons. */
export function bindProfileAuth(elements, closeMenu = () => {}) {
	elements.loginForm.addEventListener('submit', event => {
		event.preventDefault();
		authenticate(elements, elements.loginForm, '/login/', false, closeMenu);
	});
	elements.registerForm.addEventListener('submit', event => {
		event.preventDefault();
		authenticate(elements, elements.registerForm, '/register/', true, closeMenu);
	});
	elements.toggleRegister.addEventListener('click', () => swapForms(elements.loginForm, elements.registerForm));
	elements.toggleLogin.addEventListener('click', () => swapForms(elements.registerForm, elements.loginForm));
}

async function authenticate(elements, form, url, registering, closeMenu) {
	const usernameInput = registering ? elements.registerUsername : elements.loginUsername;
	const passwordInput = registering ? elements.registerPassword : elements.loginPassword;
	const username = String(usernameInput.value || '').trim();
	if (!username || !passwordInput.value) {
		setProfileMessage(elements.authMessage, 'Enter a username and password.', 'error');
		return;
	}
	setProfileFormBusy(form, true);
	setProfileMessage(elements.authMessage, registering ? 'Creating account…' : 'Signing in…', 'processing');
	try {
		const response = await fetch(url, {
			method: 'POST',
			body: new URLSearchParams({ username, password: passwordInput.value }),
			headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
			credentials: 'include'
		});
		const body = await response.text();
		if (!responseSucceeded(response, body, registering)) {
			throw new Error('The account server rejected this request.');
		}
		passwordInput.value = '';
		if (registering) {
			prepareLoginAfterRegistration(elements, username);
			return;
		}
		await hydrateSignedInIdentity(elements);
		setProfileMessage(elements.authMessage, 'Signed in. Your identity is ready.', 'success');
		closeMenu({ restoreFocus: false });
		requestAnimationFrame(() => elements.dropdownProfile.focus());
	} catch (error) {
		passwordInput.value = '';
		setProfileMessage(elements.authMessage, error.message || 'Sign in failed. Local mode still works.', 'error');
		passwordInput.focus();
	} finally {
		setProfileFormBusy(form, false);
	}
}

async function hydrateSignedInIdentity(elements) {
	for (let attempt = 0; attempt < 3; attempt += 1) {
		const identity = await hydrateProfileIdentity(elements);
		if (identity.username) return identity;
		await new Promise(resolve => setTimeout(resolve, 120));
	}
	throw new Error('Login succeeded, but the session could not be hydrated yet.');
}

function prepareLoginAfterRegistration(elements, username) {
	setProfileMessage(elements.authMessage, 'Account created. Sign in with the new account.', 'success');
	elements.loginUsername.value = username;
	swapForms(elements.registerForm, elements.loginForm);
	elements.loginPassword.focus();
}

function responseSucceeded(response, body, registering) {
	if (!response.ok) return false;
	const normalized = body.toLowerCase();
	if (normalized.includes('success') || normalized.includes('logged in')) return true;
	return registering && (normalized.includes('account created') || normalized.includes('registered'));
}

function swapForms(hiddenForm, shownForm) {
	hiddenForm.hidden = true;
	shownForm.hidden = false;
	shownForm.querySelector('input')?.focus();
}
