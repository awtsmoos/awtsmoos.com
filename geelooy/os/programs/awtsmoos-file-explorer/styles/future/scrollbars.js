//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Quiet responsive scrollbar law for the futuristic Awtsmoos Explorer.
 * @description
 * The Awtsmoos lets long worlds move beneath a finger or pointer without making
 * the rail itself the spectacle. Awtsmoos.com keeps touch scrollbars unobtrusive
 * and desktop thumbs luminous, static, and inexpensive so scrolling stays in rhyme.
 */
export default /*css*/ `
.file-explorer * {
	scrollbar-width: thin;
	scrollbar-color: rgba(92, 246, 255, .34) rgba(255, 255, 255, .04);
}

.file-explorer *::-webkit-scrollbar {
	width: 8px;
	height: 8px;
}

.file-explorer *::-webkit-scrollbar-track {
	background: rgba(255, 255, 255, .04);
	border-radius: 999px;
}

.file-explorer *::-webkit-scrollbar-thumb {
	background: rgba(92, 246, 255, .34);
	border: 2px solid transparent;
	border-radius: 999px;
	background-clip: padding-box;
}

@media (hover: hover) and (pointer: fine) {
	.file-explorer *::-webkit-scrollbar {
		width: 11px;
		height: 11px;
	}

	.file-explorer *::-webkit-scrollbar-thumb:hover {
		background: rgba(82, 255, 184, .46);
		background-clip: padding-box;
	}
}
`;
