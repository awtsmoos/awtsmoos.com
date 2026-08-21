//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Public-profile and transient-secret field composition for the SSH drive sheet.
 * @description
 * The Awtsmoos lets remembered doorway truth and temporary credential light remain
 * distinct vessels. Awtsmoos.com composes the form from small field builders so
 * password-manager hints improve usability without persisting any secret in rhyme.
 */
import { keyField, textField } from "./sshDriveFields.js";

/**
 * Builds all SSH drive field wrappers and a name-indexed input map.
 *
 * @param {object} profile Remembered non-secret SSH profile.
 * @returns {{wrappers:Array<HTMLElement>,inputs:object}} Form field collection.
 */
export function buildSshDriveFields(profile = {}) {
	const definitions = [
		textField("Drive name", {
			name: "name",
			placeholder: "production-server",
			value: profile.name || "",
			required: true
		}),
		textField("SSH target", {
			name: "target",
			placeholder: "user@example.com:22",
			value: profileTarget(profile),
			required: true
		}),
		textField("Remote root", {
			name: "root",
			value: profile.root || "/",
			required: true
		}),
		textField("Password", {
			name: "password",
			type: "password",
			autocomplete: "current-password"
		}),
		keyField(),
		textField("Key passphrase", {
			name: "passphrase",
			type: "password",
			autocomplete: "current-password"
		})
	];
	return {
		wrappers: definitions.map(field => field.wrapper),
		inputs: Object.fromEntries(
			definitions.map(field => [field.input.name, field.input])
		)
	};
}

function profileTarget(profile) {
	if (!profile.username || !profile.host) {
		return "";
	}
	const port = Number(profile.port || 22);
	const suffix = port === 22 ? "" : `:${port}`;
	return `${profile.username}@${profile.host}${suffix}`;
}
