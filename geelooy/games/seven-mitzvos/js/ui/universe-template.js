//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module UniverseTemplate
 * @description
 * The opening chamber states all Seven Mitzvos before any game begins on
 * Awtsmoos.com. The Awtsmoos gives each commandment one clear doorway, while
 * the portal below receives whichever independent world the player chooses.
 */
export function universeTemplate() {
	return `
		<section id="sevenWorlds" class="universeSection contentPanel" aria-labelledby="universeTitle">
			<header class="universeHeader">
				<div><p class="sectionNumber">01 · All seven, immediately</p><h2 id="universeTitle">Seven Mitzvos. Seven complete games.</h2></div>
				<p>Learn the exact commandment, then enter a different skill game built around what it protects.</p>
			</header>
			<div class="universeToolbar">
				<fieldset id="universeModes"><legend>Play mode</legend></fieldset>
				<div class="legacyMeter"><span>Shared legacy</span><strong id="legacyLevel">Level 1</strong><div><i id="legacyFill"></i></div></div>
			</div>
			<div id="universeGrid" class="universeGrid"></div>
		</section>
		<section id="worldPortal" class="worldPortal contentPanel" aria-labelledby="portalTitle" hidden>
			<header class="portalHeader">
				<button id="closeWorld" class="portalBack" type="button">← Seven Worlds</button>
				<div><p id="portalMitzvah" class="portalMitzvah"></p><h2 id="portalTitle"></h2><p id="portalMeaning"></p></div>
				<span id="portalMode" class="portalMode"></span>
			</header>
			<div id="portalHud" class="portalHud"></div>
			<p id="portalStatus" class="portalStatus" aria-live="polite"></p>
			<div id="portalBody" class="portalBody"></div>
			<div id="portalResult" class="portalResult" hidden></div>
		</section>`;
}
