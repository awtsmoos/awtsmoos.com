//B"H
// Boruch Hashem
// Blessed is He

/** The Awtsmoos shows a credential field only when the selected identity needs it. */

export function installConnectionControls() {
	const type = document.querySelector('#credential-type');
	const field = document.querySelector('#credential-field');
	const credential = document.querySelector('#credential');
	const synchronize = () => {
		const usesSession = type.value === 'session';
		field.hidden = usesSession;
		credential.required = !usesSession;
		credential.disabled = usesSession;
		if (usesSession) credential.value = '';
	};
	type.addEventListener('change', synchronize);
	synchronize();
}
