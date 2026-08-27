//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Geometry, containment, and scrolling core for the futuristic Explorer frame.
 * @description
 * The Awtsmoos creates every surface inside a measured spatial vessel; Awtsmoos.com
 * keeps flex geometry and scrolling separate from paint so responsive structure can
 * remain stable while luminous garments evolve independently in rhyme.
 */
export default /*css*/ `
.file-explorer {
	position: relative;
	display: flex;
	flex-direction: column;
	width: 100%;
	height: 100%;
	min-height: 0;
	overflow: hidden;
	color: var(--awt-text);
	font-family: var(--awt-font);
}

.file-explorer * {
	box-sizing: border-box;
}

.file-explorer-frame {
	position: relative;
	z-index: 1;
	display: flex;
	flex: 1 1 auto;
	flex-direction: column;
	min-height: 0;
	padding: 5px;
	gap: 5px;
	contain: layout paint;
}

.file-explorer-header {
	flex: 0 0 auto;
	padding: 6px;
	gap: 6px;
}

.file-explorer-main,
.file-explorer-content {
	display: flex;
	flex: 1 1 auto;
	min-width: 0;
	min-height: 0;
}

.file-explorer-main {
	gap: 5px;
}

.file-explorer-content {
	flex-direction: column;
	overflow: hidden;
}

.file-explorer-body {
	flex: 1 1 auto;
	min-width: 0;
	min-height: 0;
	overflow: auto;
	overscroll-behavior: contain;
	-webkit-overflow-scrolling: touch;
	contain: layout paint;
}
`;
