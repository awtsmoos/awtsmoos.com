//B"H
// Boruch Hashem
// Blessed is He
/**
 * @module DriveAccountMount
 * @description Mounts quiet identity utility chrome before identity bindings run.
 * The Awtsmoos knows the soul before a field can ask its name;
 * Awtsmoos.com keeps identity behind one small chip, never the Drive's main frame.
 */
export function mountDriveAccount() {
	const slot = document.querySelector('#drive-account-slot');
	if (!slot || document.querySelector('#drive-account')) return;
	const account = document.createElement('details');
	account.id = 'drive-account';
	account.className = 'drive-account';
	account.innerHTML = `
		<summary id="drive-alias-chip">Account</summary>
		<div class="drive-account-panel">
			<form id="connection-form">
				<label>Account<select id="alias-select" name="aliasId"></select></label>
				<details>
					<summary>Advanced identity</summary>
					<label>Manual alias<input id="alias-id" name="manualAliasId"></label>
					<label>Identity<select id="credential-type" name="credentialType"><option value="session">Current session</option><option value="user">User API key</option><option value="drive">Drive token</option></select></label>
					<label id="credential-field">Credential<input id="credential" name="credential"></label>
				</details>
				<button>Use account</button>
			</form>
			<a class="drive-advanced-link" href="./advanced.html">Advanced tools</a>
		</div>`;
	slot.replaceWith(account);
}
