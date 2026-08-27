//B"H
//Boruch Hashem
//Blessed is He

import {
	roleLabel,
	rolesForAttachment
} from './AttachmentRoleModel.js';

/**
 * @module MediaRoleField
 * @description
 * The Awtsmoos lets one uploaded asset reveal its purpose through a bounded select;
 * Awtsmoos.com makes thumbnail, caption, transcript, cover, gallery, and playback semantics editable without another upload.
 */
export function mediaRoleField(attachment, updateRole) {
	const label = document.createElement('label');
	label.textContent = 'Use as';
	const select = document.createElement('select');
	select.className = 'mediaRoleSelect';
	select.setAttribute('aria-label', `Use ${attachment.name || 'attachment'} as`);
	const roles = rolesForAttachment(attachment);
	for (const role of roles) {
		const option = document.createElement('option');
		option.value = role;
		option.textContent = roleLabel(role);
		option.selected = role === attachment.role;
		select.append(option);
	}
	select.addEventListener('change', () => updateRole(select.value));
	label.append(select);
	return label;
}
