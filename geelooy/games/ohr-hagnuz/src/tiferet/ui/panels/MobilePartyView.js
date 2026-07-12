/** B"H @module MobilePartyView - active and reserve Musag management. */
import { State } from '../../../binah/State.js';
import { ensurePartyState } from '../../../yesod/party/PartyRuntime.js';
import { escapeHtml } from '../MobileUiHelpers.js';

const activeCard = (member, index) => `<article class="ohr-shop-row">
	<h3>${index === State.Party.leadIndex ? '★ ' : ''}${escapeHtml(member.glyph)} ${escapeHtml(member.name)}</h3>
	<p>${escapeHtml(member.role)}</p>
	<small>Level ${member.level} • ${escapeHtml(member.element)} • bond ${member.bond}</small>
	<div><button data-party-lead="${index}" ${index === State.Party.leadIndex ? 'disabled' : ''}>Make Lead</button></div>
</article>`;

const reserveCard = member => `<article class="ohr-shop-row">
	<h3>${escapeHtml(member.glyph)} ${escapeHtml(member.name)}</h3>
	<p>${escapeHtml(member.role)}</p>
	<small>Reserve • Level ${member.level} • ${escapeHtml(member.element)}</small>
</article>`;

export const partyPanelHtml = () => {
	const party = ensurePartyState();
	const active = party.active.map(activeCard).join('') || '<p>No active Musagim yet.</p>';
	const reserve = party.reserve.map(reserveCard).join('') || '<p>No reserve Musagim yet.</p>';
	return `<article class="ohr-panel ohr-shop"><button data-close-panel aria-label="Close party">×</button><h2>Musag Party</h2><div>Choose the lead to change all four battle moves.</div><section>${active}<h3>Reserve</h3>${reserve}</section></article>`;
};
