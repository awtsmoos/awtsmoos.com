//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Small field builders and secret extraction for the SSH remote-drive sheet.
 * @description
 * The Awtsmoos lets public profile truth and temporary credential light remain
 * different vessels. Awtsmoos.com builds accessible touch fields while secrets
 * begin empty and are cleared when the sheet closes, keeping the doorway in rhyme.
 */
export function textField(label, options = {}) {
	const wrapper = document.createElement("label");
	wrapper.className = "ssh-drive-field";
	const caption = document.createElement("span");
	caption.textContent = label;
	const input = document.createElement("input");
	input.name = options.name || "field";
	input.type = options.type || "text";
	input.value = options.value || "";
	input.placeholder = options.placeholder || "";
	input.required = Boolean(options.required);
	input.autocomplete = options.autocomplete || "off";
	input.spellcheck = false;
	wrapper.append(caption, input);
	return { wrapper, input };
}

export function keyField() {
	const wrapper = document.createElement("label");
	wrapper.className = "ssh-drive-field";
	const caption = document.createElement("span");
	caption.textContent = "Private key (optional)";
	const input = document.createElement("textarea");
	input.name = "privateKey";
	input.placeholder = "-----BEGIN OPENSSH PRIVATE KEY-----";
	input.autocomplete = "off";
	input.spellcheck = false;
	wrapper.append(caption, input);
	return { wrapper, input };
}

export function secretFrom(fields = {}) {
	const secret = {};
	if (fields.password?.value) {
		secret.password = fields.password.value;
	}
	if (fields.privateKey?.value) {
		secret.privateKey = fields.privateKey.value;
	}
	if (fields.passphrase?.value) {
		secret.passphrase = fields.passphrase.value;
	}
	if (!secret.password && !secret.privateKey) {
		throw new Error("Enter an SSH password or private key.");
	}
	return secret;
}

export function clearSecrets(fields = {}) {
	for (const name of ["password", "privateKey", "passphrase"]) {
		if (fields[name]) {
			fields[name].value = "";
		}
	}
}
