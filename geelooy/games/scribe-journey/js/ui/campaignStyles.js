// B"H
// Boruch Hashem
// Blessed is He

const STYLE_ID = 'scribe-campaign-styles';

const CAMPAIGN_CSS = `
#quest-log-list {
	display: grid;
	gap: 1rem;
	padding-bottom: max(1rem, env(safe-area-inset-bottom));
}
#quest-log-list section {
	display: grid;
	gap: 0.75rem;
}
.quest-log-item {
	border: 1px solid currentColor;
	border-radius: 0.75rem;
	padding: 0.85rem;
	background: color-mix(in srgb, Canvas 94%, currentColor 6%);
}
.quest-header {
	display: flex;
	justify-content: space-between;
	gap: 0.75rem;
	align-items: baseline;
}
.quest-objectives,
.restoration-list,
.reputation-list {
	display: grid;
	gap: 0.45rem;
	padding-inline-start: 1.25rem;
}
.quest-objective.is-complete {
	text-decoration: line-through;
	opacity: 0.76;
}
.quest-actions {
	display: flex;
	flex-wrap: wrap;
	gap: 0.5rem;
}
.quest-actions button,
.status-available button {
	min-height: 44px;
	padding: 0.55rem 0.8rem;
}
@media (max-width: 480px) {
	.quest-header {
		align-items: flex-start;
		flex-direction: column;
	}
	.quest-actions button,
	.status-available button {
		flex: 1 1 100%;
	}
}
@media (max-height: 430px) and (orientation: landscape) {
	#quest-log-list {
		grid-template-columns: repeat(2, minmax(0, 1fr));
	}
	#quest-log-list section {
		align-content: start;
	}
}
`;

/** Installs campaign UI rules once without competing with the legacy theme. */
export function ensureCampaignStyles() {
	if (document.getElementById(STYLE_ID)) return;
	const style = document.createElement('style');
	style.id = STYLE_ID;
	style.textContent = CAMPAIGN_CSS;
	document.head.append(style);
}
