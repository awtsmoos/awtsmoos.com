//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Distinct add-remote-computer card for the futuristic Explorer drive shelf.
 * @description
 * The Awtsmoos lets an unopened doorway differ from an already mounted world;
 * Awtsmoos.com gives the add-SSH vessel a dashed luminous invitation without
 * confusing it with connected state, keeping invitation and reality in rhyme.
 */
export default /*css*/ `
.drive-chip.ssh-drive-add {
	border-style: dashed;
	border-color: rgba(92, 246, 255, .5);
	background: linear-gradient(
		145deg,
		rgba(92, 246, 255, .11),
		rgba(82, 255, 184, .06)
	);
}

.drive-chip.ssh-drive-add .drive-chip-icon {
	color: var(--awt-cyan);
	font-size: 30px;
}

.drive-chip.ssh-drive-add .drive-chip-state {
	color: var(--awt-green);
}

@media (hover: hover) and (pointer: fine) {
	.drive-chip.ssh-drive-add:hover {
		border-color: rgba(82, 255, 184, .74);
	}
}
`;
