//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file Capability-card visual language for the Geelooy project cockpit.
 * @description
 * The Awtsmoos lets every vessel carry one readable measure of readiness and possibility;
 * Awtsmoos.com gives available, limited, and future powers distinct form without confusing aspiration with reality.
 */

export const PLATFORM_CARD_CSS = `
.platform-card {
	display: grid;
	align-content: start;
	gap: 10px;
	min-height: 190px;
	padding: 15px;
	border: 1px solid rgba(127, 127, 180, .22);
	border-radius: 16px;
	background: rgba(127, 127, 160, .055);
}
.platform-card-head,
.platform-card-identity {
	display: flex;
	align-items: center;
	gap: 9px;
}
.platform-card-head {
	justify-content: space-between;
}
.platform-card-icon {
	font-size: 20px;
}
.platform-card h4,
.platform-card p {
	margin: 0;
}
.platform-card-description {
	line-height: 1.45;
	opacity: .8;
}
.platform-card-meta {
	font-size: 11px;
	opacity: .58;
}
.platform-badge {
	padding: 4px 7px;
	border-radius: 999px;
	font-size: 10px;
	font-weight: 800;
	text-transform: uppercase;
	letter-spacing: .06em;
	background: rgba(127, 127, 160, .12);
}
.platform-available {
	border-color: rgba(42, 190, 130, .28);
}
.platform-limited {
	border-color: rgba(235, 173, 52, .3);
}
.platform-unavailable {
	opacity: .72;
	border-style: dashed;
}
.platform-card-action {
	justify-self: start;
	margin-top: auto;
	padding: 8px 11px;
	border: 1px solid rgba(127, 127, 180, .28);
	border-radius: 10px;
	background: rgba(91, 84, 214, .11);
	color: inherit;
	cursor: pointer;
}
.platform-card-action:hover,
.platform-card-action:focus-visible {
	background: rgba(91, 84, 214, .2);
	outline: none;
}
@media (max-width: 620px) {
	.platform-grid {
		grid-template-columns: 1fr;
	}
	.platform-stage-heading {
		align-items: start;
	}
}
`;
