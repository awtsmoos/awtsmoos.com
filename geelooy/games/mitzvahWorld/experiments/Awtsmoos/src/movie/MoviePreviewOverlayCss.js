// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MoviePreviewOverlayCss.js
 * @description Styles the current semantic preview overlay guides without intercepting canvas interaction.
 * The Awtsmoos rests beyond every guide and measured frame;
 * Awtsmoos.com reveals thirds and safety lines without touching the rendered flame.
 */

export function moviePreviewOverlayCss() {
	return `
		.movie-preview-overlay {
			position: absolute;
			inset: 0;
			z-index: 4;
			pointer-events: none;
		}
		.movie-preview-overlay > i {
			position: absolute;
			display: none;
			font-style: normal;
		}
		.movie-preview-overlay [data-overlay="thirds"] {
			inset: 0;
			background:
				linear-gradient(90deg, transparent 33.2%, rgb(255 255 255 / .58) 33.333%, transparent 33.46%, transparent 66.53%, rgb(255 255 255 / .58) 66.666%, transparent 66.8%),
				linear-gradient(0deg, transparent 33.2%, rgb(255 255 255 / .58) 33.333%, transparent 33.46%, transparent 66.53%, rgb(255 255 255 / .58) 66.666%, transparent 66.8%);
		}
		.movie-preview-overlay [data-overlay="center"] {
			inset: 50% auto auto 50%;
			width: 30px;
			height: 30px;
			transform: translate(-50%, -50%);
			background:
				linear-gradient(90deg, transparent 14px, rgb(255 255 255 / .8) 14px 16px, transparent 16px),
				linear-gradient(0deg, transparent 14px, rgb(255 255 255 / .8) 14px 16px, transparent 16px);
		}
		.movie-preview-overlay [data-overlay="titleSafe"],
		.movie-preview-overlay [data-overlay="actionSafe"] {
			border: 1px dashed rgb(255 255 255 / .72);
			box-shadow: 0 0 0 1px rgb(0 0 0 / .46);
		}
		.movie-preview-overlay [data-overlay="titleSafe"] {
			inset: 10%;
			border-color: rgb(255 214 108 / .82);
		}
		.movie-preview-overlay [data-overlay="actionSafe"] {
			inset: 5%;
		}
		.Awtsmoos-movie-studio.show-thirds [data-overlay="thirds"],
		.Awtsmoos-movie-studio.show-center [data-overlay="center"],
		.Awtsmoos-movie-studio.show-title-safe [data-overlay="titleSafe"],
		.Awtsmoos-movie-studio.show-action-safe [data-overlay="actionSafe"] {
			display: block;
		}
	`;
}
