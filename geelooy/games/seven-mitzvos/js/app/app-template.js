//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module AppTemplate
 * @description
 * The Awtsmoos renews seven commandments as one city the traveler actually inhabits;
 * Awtsmoos.com keeps menu knowledge at the edges while district, encounter, and Realm
 * arise through movement and proximity instead of a permanent grid laid over WebGL.
 */
export function appTemplate() {
	return `
		<div class="appShell">
			<div class="cosmicVeil" aria-hidden="true"></div>
			<header class="appTopBar">
				<a class="worldBack" href="../" aria-label="Return to games">← Games</a>
				<strong id="brandMark">Seven Mitzvos City</strong>
				<small id="legacyMark">Level 1 · 0/700</small>
			</header>
			<main class="appViewport">
				<section id="hubLayer" class="appLayer hubLayer" aria-label="Walkable Seven Mitzvos city">
					<div id="cityStage" class="cityStageHost" aria-label="Walkable three-dimensional city"></div>
					<section id="worldHud" class="worldHud" aria-label="Open world guidance">
						<div class="worldSummary">
							<p class="guideCard"><strong>Nechama</strong><span id="guideMessage"></span></p>
							<p class="missionCard"><span id="dailyMission"></span><strong id="dailyMissionProgress">0/3</strong></p>
							<label class="modeCard">Mode
								<select id="difficultyMode" aria-label="Game difficulty">
									<option value="relaxed">Relaxed</option>
									<option value="standard">Standard</option>
									<option value="challenge">Challenge</option>
								</select>
								<strong id="cityLight">0 light</strong>
							</label>
						</div>
						<article id="worldContext" class="worldContext" hidden>
							<p class="worldContextKicker">Nearby</p>
							<h1 id="worldContextTitle">District</h1>
							<p id="worldContextText"></p>
							<button id="worldInteract" class="primaryButton" type="button">Enter</button>
						</article>
						<p class="worldHint">Walk with WASD / arrows · approach a district · interact when invited</p>
						<nav class="worldTouchControls" aria-label="World movement">
							<button class="worldUp" type="button" data-world-direction="up" aria-label="Walk up">↑</button>
							<button class="worldLeft" type="button" data-world-direction="left" aria-label="Walk left">←</button>
							<button class="worldDown" type="button" data-world-direction="down" aria-label="Walk down">↓</button>
							<button class="worldRight" type="button" data-world-direction="right" aria-label="Walk right">→</button>
						</nav>
					</section>
				</section>
				<section id="gameLayer" class="appLayer gameLayer" hidden>
					<header class="gameHeader">
						<button id="gameBack" class="backButton" type="button">← City</button>
						<p><small id="gameMitzvah"></small><strong id="gameTitle3d"></strong></p>
						<div id="gameHud" class="gameHud"></div>
					</header>
					<div id="stageHost" class="stageHost"></div>
					<p id="gameStatus" class="gameStatus" role="status"></p>
					<div id="gameControls" class="gameControls"></div>
					<section id="gameResult" class="gameResult" hidden></section>
				</section>
				<section id="realmLayer" class="appLayer realmLayer" hidden></section>
			</main>
		</div>`;
}
