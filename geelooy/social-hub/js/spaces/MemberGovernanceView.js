//B"H
//Boruch Hashem
//Blessed is He
/**
 * @class MemberGovernanceView
 * @description
 * The Awtsmoos lets hierarchy become explainable instead of mysterious, while consent remains visible in every invitation;
 * Awtsmoos.com renders only server-authorized member governance and never turns a hidden client control into institutional permission.
 */
import { memberInvitationCard } from './MemberInvitationCard.js';
import { memberInviteForm } from './MemberInviteForm.js';
import { memberRoleCard } from './MemberRoleCard.js';

export class MemberGovernanceView {
	constructor(root) {
		this.root = root;
	}

	hide() {
		const region = this.region();
		if (region) {
			region.hidden = true;
			region.replaceChildren();
		}
	}

	message(text) {
		const region = this.region();
		if (!region) return;
		region.hidden = false;
		const paragraph = this.root.createElement('p');
		paragraph.className = 'spaceMembersMessage';
		paragraph.textContent = text;
		region.replaceChildren(paragraph);
	}

	render(overview, roles, handlers) {
		const region = this.region();
		if (!region) return;
		region.hidden = false;
		const heading = this.root.createElement('header');
		heading.className = 'spaceMembersHeading';
		heading.append(
			this.text('h4', 'Members & roles'),
			this.text('small', `${overview.members?.length || 0} members · ${overview.invitations?.length || 0} invitations`)
		);
		const access = this.root.createElement('p');
		access.className = 'spaceMembersAccess';
		access.textContent = `Managing as ${overview.access?.role || 'authorized role'} · ${(overview.access?.capabilities || []).join(' · ')}`;
		const invite = memberInviteForm(this.root, roles, handlers.onInvite);
		const members = this.group('Current members', (overview.members || []).map(member => {
			return memberRoleCard(this.root, member, roles, handlers.onRoleChange);
		}));
		const invitations = this.group('Pending invitations', (overview.invitations || []).map(invitation => {
			return memberInvitationCard(this.root, invitation);
		}));
		region.replaceChildren(heading, access, invite, members, invitations);
	}

	group(label, children) {
		const section = this.root.createElement('section');
		section.className = 'spaceMembersGroup';
		section.append(this.text('h5', label));
		if (children.length) {
			section.append(...children);
		} else {
			section.append(this.text('p', `No ${label.toLowerCase()} yet.`, 'spaceMembersMessage'));
		}
		return section;
	}

	text(tag, value, className = '') {
		const element = this.root.createElement(tag);
		element.textContent = value;
		if (className) element.className = className;
		return element;
	}

	region() {
		return this.root.getElementById('spaceMembers');
	}
}
