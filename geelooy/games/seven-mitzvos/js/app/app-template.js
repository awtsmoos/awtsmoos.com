//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module AppTemplate
 * @description
 * One fixed viewport now contains a living procedural city, seven clear doors,
 * one guide, and one game vessel. The Awtsmoos creates every layer together while
 * Awtsmoos.com reveals progress without adding a hidden document beneath it.
 */
export function appTemplate() {
	return `
		<div class="appShell">
			<div class="cosmicVeil" aria-hidden="true"></div>
			<header class="appTopBar">
				<strong id="brandMark">Seven Mitzvos City</strong>
				<span>ב״ה</span>
				<small id="legacyMark">Level 1 · 0/700</small>
			</header>
			<main class="appViewport">
				<section id="hubLayer" class="appLayer hubLayer" aria-label="Seven living districts">
					<div id="cityStage" class="cityStageHost" aria-label="Interactive three-dimensional city"></div>
					<div class="hubInterface">
						<header class="hubHeader">
							<p>THE CITY CHANGES WHEN YOU HELP IT</p>
							<h1>Choose one of seven living districts</h1>
						</header>
						<div class="cityHud">
							<p class="guideCard"><strong>Nechama</strong><span id="guideMessage"></span></p>
							<p class="missionCard"><span id="dailyMission"></span><strong id="dailyMissionProgress">0/3</strong></p>
							<label class="modeCard">Mode
								<select id="difficultyMode" aria-label="Game difficulty">
									<option value="relaxed">Relaxed</option>
									<option value="standard">Standard</option>
									<option value="challenge">Challenge</option>
								</select>
								<strong id="cityLight">0 city light</strong>
							</label>
						</div>
						<div id="mitzvahGrid" class="mitzvahGrid3d"></div>
					</div>
				</section>
				<section id="detailLayer" class="appLayer detailLayer" hidden>
					<button id="detailBack" class="backButton" type="button">← Seven worlds</button>
					<article class="detailCard">
						<p class="detailIdentity"><span id="detailNumber"></span><span id="detailSymbol"></span><span id="detailGenre"></span></p>
						<h2 id="detailTitle" tabindex="-1"></h2>
						<p id="detailSummary"></p>
						<div class="detailFacts">
							<p><strong>Practice</strong><span id="detailPractice"></span></p>
							<p><strong>3D mission</strong><span id="detailHook"></span></p>
						</div>
						<p id="detailProgress" class="detailProgress"></p>
						<button id="playGame" class="primaryButton" type="button">Play this world</button>
					</article>
				</section>
				<section id="gameLayer" class="appLayer gameLayer" hidden>
					<header class="gameHeader"><button id="gameBack" class="backButton" type="button">← Back</button><p><small id="gameMitzvah"></small><strong id="gameTitle3d"></strong></p><div id="gameHud" class="gameHud"></div></header>
					<div id="stageHost" class="stageHost"></div>
					<p id="gameStatus" class="gameStatus" role="status"></p>
					<div id="gameControls" class="gameControls"></div>
					<section id="gameResult" class="gameResult" hidden></section>
				</section>
			</main>
		</div>`;
}
