// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module ProfileDropdownTemplate
 * @description
 * The Awtsmoos shapes one solid identity chamber for every Awtsmoos.com mount.
 * Unique relationships let Header and Mail coexist without duplicate document IDs.
 */
import { profileIcon } from './icons.js';

/**
 * Builds the signed-out and signed-in identity surfaces.
 * @param {HTMLElement} container Local profile root.
 * @param {string} prefix Unique relationship prefix.
 * @returns {Record<string, HTMLElement>} Named local references.
 */
export function buildProfileDropdown(container, prefix) {
	const id = name => `${prefix}-${name}`;
	container.dataset.profilePrefix = prefix;
	container.innerHTML = /*html*/`
		<button class="awtsmoos-dropdown-backdrop" data-profile-ref="dropdownBackdrop" type="button" tabindex="-1" aria-label="Close identity menu" hidden></button>
		<section class="notLoggedIn" data-profile-ref="notLoggedIn" aria-label="Account access" hidden>
			<button class="profile-trigger" data-profile-ref="signinButton" type="button" aria-haspopup="true" aria-expanded="false" aria-controls="${id('signin-panel')}">
				<span class="profile-trigger-crest">${profileIcon('login')}</span>
				<span class="profile-trigger-copy"><small>Identity access</small><strong>Sign in</strong></span>
				${profileIcon('chevron', 'profile-chevron')}
			</button>
			<div id="${id('signin-panel')}" class="dropdown-content auth-menu-card" data-profile-ref="signinDropdown" data-state="closed" aria-hidden="true" inert hidden>
				<header class="profile-panel-heading"><span class="profile-panel-orb">${profileIcon('key')}</span><span><small>Account gateway</small><strong>Enter Geelooy</strong></span></header>
				<p class="local-mode-note">Local mode remains available. Connect when you want publishing and synchronized identity.</p>
				<form class="profile-auth-form" data-profile-ref="loginForm">
					<label for="${id('login-user')}">Username</label>
					<input id="${id('login-user')}" data-profile-ref="loginUsername" name="username" autocomplete="username" required>
					<label for="${id('login-password')}">Password</label>
					<input id="${id('login-password')}" data-profile-ref="loginPassword" name="password" type="password" autocomplete="current-password" required>
					<button data-profile-ref="loginSubmit" type="submit">${profileIcon('login')}<span>Log in</span></button>
					<p class="description"><button class="text-button" data-profile-ref="toggleRegister" type="button">Create an account</button> · <a href="/login">Full login</a></p>
				</form>
				<form class="profile-auth-form" data-profile-ref="registerForm" hidden>
					<label for="${id('register-user')}">Username</label>
					<input id="${id('register-user')}" data-profile-ref="registerUsername" name="username" autocomplete="username" required>
					<label for="${id('register-password')}">Password</label>
					<input id="${id('register-password')}" data-profile-ref="registerPassword" name="password" type="password" autocomplete="new-password" required>
					<button data-profile-ref="registerSubmit" type="submit">${profileIcon('register')}<span>Create account</span></button>
					<p class="description"><button class="text-button" data-profile-ref="toggleLogin" type="button">Return to login</button> · <a href="/register">Full registration</a></p>
				</form>
				<div class="validation-message" data-profile-ref="authMessage" aria-live="polite"></div>
			</div>
		</section>
		<section class="loggedIn" data-profile-ref="loggedIn" aria-label="Identity menu" hidden>
			<button class="profile-trigger" data-profile-ref="dropdownProfile" type="button" aria-haspopup="true" aria-expanded="false" aria-controls="${id('profile-panel')}">
				<span class="profile-trigger-crest">${profileIcon('alias')}</span>
				<span class="profile-trigger-copy"><small>Active alias</small><strong class="currentAliasName">Profile</strong></span>
				${profileIcon('chevron', 'profile-chevron')}
			</button>
			<div id="${id('profile-panel')}" class="dropdown-content profile-menu-card" data-profile-ref="awtsmoosProfileDropContent" data-state="closed" aria-hidden="true" inert hidden>
				<header class="profile-panel-heading"><span class="profile-panel-orb">${profileIcon('profile')}</span><span><small data-profile-ref="modeBadge">Local</small><strong data-profile-ref="usernameDisplay"></strong></span></header>
				<a class="currentAlias identity-current-card" data-profile-ref="aliasSection" href="/profile"><span>${profileIcon('spark')}<small>Current vessel</small></span><strong class="currentAliasName">Profile</strong></a>
				<p class="local-mode-note" data-profile-ref="localModeNote">Reconnect when you want this local work synchronized.</p>
				<button class="menu-wide" data-profile-ref="switchAlias" type="button" aria-expanded="false" aria-controls="${id('alias-panel')}">${profileIcon('switch')}<span>Switch alias</span>${profileIcon('chevron', 'profile-chevron')}</button>
				<div id="${id('alias-panel')}" class="dropdown-content alias-switcher" data-profile-ref="aliasInfo" data-state="closed" aria-hidden="true" inert hidden></div>
				<nav class="profile-menu-actions" aria-label="Identity actions">
					<a href="/profile">${profileIcon('profile')}<span>Manage aliases</span></a>
					<span data-profile-ref="logoutSection"><a href="/logout">${profileIcon('logout')}<span>Log out</span></a></span>
				</nav>
			</div>
		</section>
	`;
	return references(container, prefix);
}

function references(root, prefix) {
	const entries = Array.from(root.querySelectorAll('[data-profile-ref]'), element => [element.dataset.profileRef, element]);
	return { ...Object.fromEntries(entries), container: root, prefix };
}
