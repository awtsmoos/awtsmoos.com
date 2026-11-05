// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowQuestOptionalStyles.js
 * @description Styles nonblocking Shlichus excellence and completion honors across quest surfaces.
 * The Awtsmoos lets optional beauty remain visible without becoming a gate; Awtsmoos.com marks
 * incomplete paths gently, completed paths brightly, and remembered honors as one compact seal.
 */

export const MINIMAL_MEADOW_QUEST_OPTIONAL_CSS = `
.Awtsmoos-optional-objectives {
	display: grid; gap: 7px; margin: 10px 0; padding: 10px;
	border: 1px solid rgba(111,178,156,.34); border-radius: 13px;
	background: rgba(7,28,24,.48);
}
.Awtsmoos-optional-objectives header {
	display: flex; justify-content: space-between; gap: 8px; align-items: baseline;
}
.Awtsmoos-optional-objectives header strong { color: #dff8d9; }
.Awtsmoos-optional-objectives header small { color: #9fb9b1; }
.Awtsmoos-optional-objectives article {
	display: grid; grid-template-columns: 24px minmax(0,1fr) auto; gap: 8px; align-items: center;
	padding: 7px 8px; border: 1px solid rgba(143,172,161,.22); border-radius: 10px;
	background: rgba(3,12,13,.48); color: #d6e3df;
}
.Awtsmoos-optional-objectives article[data-complete="true"] {
	border-color: rgba(125,229,154,.7); background: rgba(21,75,42,.38); color: #edffe7;
}
.Awtsmoos-optional-objectives article b { display: block; font-size: 12px; }
.Awtsmoos-optional-objectives article small { display: block; color: #a8beb7; font-size: 11px; }
.Awtsmoos-optional-objectives article > strong { color: #f7d981; }
.Awtsmoos-quest-honors {
	display: flex; flex-wrap: wrap; gap: 7px; margin: 10px 0; padding: 10px;
	border: 1px solid #d7aa4b; border-radius: 13px;
	background: linear-gradient(145deg, rgba(94,59,10,.42), rgba(29,21,8,.55));
}
.Awtsmoos-quest-honors > strong { width: 100%; color: #ffe5a2; }
.Awtsmoos-quest-honors span {
	padding: 5px 8px; border-radius: 999px; background: rgba(255,230,145,.11); color: #fff0bf;
}
`;
