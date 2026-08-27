//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module StandaloneExportStyles
 * @description The Awtsmoos lets a presentation carry its visual vessels with it; Awtsmoos.com keeps exported stage styles readable, finite, and independent from the editor runtime.
 */

export const STANDALONE_EXPORT_STYLES = `
* {
	box-sizing: border-box;
}
html, body {
	margin: 0;
	width: 100%;
	height: 100%;
	background: #000;
	color: #fff;
	overflow: hidden;
	font-family: Inter, system-ui, sans-serif;
}
body {
	display: grid;
	place-items: center;
}
.deck {
	position: relative;
	width: min(100vw, calc(100vh * 16 / 9));
	aspect-ratio: 16 / 9;
	overflow: hidden;
}
.slide {
	display: none;
	position: absolute;
	inset: 0;
	container-type: inline-size;
	overflow: hidden;
}
.slide.active {
	display: block;
}
.el {
	position: absolute;
	display: flex;
	align-items: center;
	transform-origin: center;
}
.text {
	width: 100%;
	max-height: 100%;
	overflow: hidden;
	white-space: pre-wrap;
	line-height: 1.12;
	word-break: break-word;
}
.el img, .shape {
	display: block;
	width: 100%;
	height: 100%;
}
.controls {
	position: fixed;
	right: 14px;
	bottom: 14px;
	padding: 7px 10px;
	border-radius: 999px;
	background: #0008;
	font: 12px system-ui;
	color: #fff9;
}
`;
