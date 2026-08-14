//B"H
//Boruch Hashem
//Blessed is He
/**
 * @class MemberGovernancePanel
 * @description
 * The Awtsmoos lets explainable hierarchy appear only when the verified server grants manageMembers authority;
 * Awtsmoos.com reloads members and invitations from source after every audited mutation, so browser state never outranks governance truth.
 */
import { MemberGovernanceView } from './MemberGovernanceView.js';

export class MemberGovernancePanel {
	constructor({ root, state, api }) {
		Object.assign(this, { state, api });
		this.view = new MemberGovernanceView(root);
		this.context = null;
		this.sequence = 0;
	}

	/** Loads metadata plus the capability-gated governance overview. */
	async load(context) {
		this.context = context;
		const requestId = ++this.sequence;
		const aliasId = this.state.snapshot().identity?.aliasId;
		if (!aliasId || !context?.heichelId) {
			this.view.hide();
			return;
		}
		this.view.hide();
		try {
			const [meta, overview] = await Promise.all([
				this.api.governanceApi.meta(),
				this.api.governanceApi.overview(context.heichelId, aliasId)
			]);
			if (requestId !== this.sequence) return;
			const roles = meta?.assignableRoles || [];
			this.view.render(overview || {}, roles, {
				onRoleChange: (member, role, reason) => void this.setRole(member, role, reason),
				onInvite: input => void this.invite(input)
			});
		} catch {
			if (requestId === this.sequence) this.view.hide();
		}
	}

	/** Requests one hierarchy-checked member role mutation. */
	async setRole(member, role, reason) {
		const aliasId = this.state.snapshot().identity?.aliasId;
		const context = this.context;
		if (!aliasId || !context?.heichelId || !member?.aliasId) return;
		this.view.message(`Updating @${member.aliasId}…`);
		try {
			await this.api.governanceApi.setRole(context.heichelId, member.aliasId, {
				aliasId,
				role,
				reason: String(reason || '').trim()
			});
			if (context === this.context) await this.load(context);
		} catch (error) {
			if (context === this.context) this.view.message(error.message || 'Role update was rejected.');
		}
	}

	/** Creates a consent-based, seven-day role invitation. */
	async invite(input) {
		const aliasId = this.state.snapshot().identity?.aliasId;
		const context = this.context;
		if (!aliasId || !context?.heichelId) return;
		this.view.message(`Inviting @${input.memberAliasId}…`);
		try {
			await this.api.governanceApi.invite(context.heichelId, { aliasId, ...input });
			if (context === this.context) await this.load(context);
		} catch (error) {
			if (context === this.context) this.view.message(error.message || 'Invitation was rejected.');
		}
	}
}
