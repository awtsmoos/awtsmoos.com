// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MobilePartyView.js
 * @description Renders active and reserve Nitzotz bonds for touch and desktop UI.
 *
 * A companion panel should reveal a life, not merely a level. The Awtsmoos
 * renews habitat, temperament, deed, and friendship together; this view lets the
 * player understand who walks beside them and why, beneath Awtsmoos.com.
 */
import { State } from '../../../binah/State.js';
import { ensurePartyState } from '../../../yesod/party/PartyRuntime.js';
import { escapeHtml } from '../MobileUiHelpers.js';

const abilityLine = member => member.explorationAbility
	? `${member.explorationAbility.name}: ${member.explorationAbility.description}`
	: 'Exploration gift still concealed.';

const memberCard = (member, index, reserve = false) => `<article class="ohr-shop-row">
	<h3>${!reserve && index === State.Party.leadIndex ? '★ ' : ''}${escapeHtml(member.glyph)} ${escapeHtml(member.name)}</h3>
	<p><b>${escapeHtml(member.bondStage)}</b> bond ${member.bond}/100 · Level ${member.level} · ${escapeHtml(member.element)}</p>
	<p>${escapeHtml(member.role)}</p>
	<small><b>Habitat:</b> ${escapeHtml(member.habitat)}</small><br>
	<small><b>Temperament:</b> ${escapeHtml(member.temperament)}</small><br>
	<small><b>Road gift:</b> ${escapeHtml(abilityLine(member))}</small><br>
	<small><b>Care:</b> ${escapeHtml(member.preferredCare)}</small><br>
	<small><b>Personal Shlichus:</b> ${escapeHtml(member.personalShlichus)}</small>
	${reserve ? '<div><em>Reserve sanctuary</em></div>' : `<div><button data-party-lead="${index}" ${index === State.Party.leadIndex ? 'disabled' : ''}>Make Lead</button></div>`}
</article>`;

export const partyPanelHtml = () => {
	const party = ensurePartyState();
	const active = party.active.map((member, index) => memberCard(member, index)).join('') || `
		<p>No Nitzotz has chosen this road yet. Study wild sparks, protect them from danger, and answer their needs.</p>`;
	const reserve = party.reserve.map((member, index) => memberCard(member, index, true)).join('') || '<p>The reserve sanctuary is quiet.</p>';
	return `<article class="ohr-panel ohr-shop">
		<button data-close-panel aria-label="Close Nitzotz bonds">×</button>
		<h2>Nitzotz Bonds</h2>
		<div>The lead companion supplies the four battle commands and its exploration gift.</div>
		<section>${active}<h3>Reserve Sanctuary</h3>${reserve}</section>
	</article>`;
};
