//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module AppTemplate
 * @description
 * One fixed chamber receives every state without producing a second page below
 * it. The Awtsmoos renews each layer from nothing, while Awtsmoos.com keeps the
 * finite selector, teaching, canvas, HUD, and result inside one visible vessel.
 */
export function appTemplate() {
	return `
		<div class="appShell">
			<div class="cosmicVeil" aria-hidden="true"></div>
			<header class="appTopBar">
				<a class="gamesLink" href="../">← Games</a>
				<div class="brandLockup">
					<span>B\"H</span>
					<strong>Seven Mitzvos</strong>
				</div>
				<p id="legacyMark" class="legacyMark">Level 1</p>
			</header>
			<main class="appViewport">
				<section id="hubLayer" class="appLayer hubLayer" aria-labelledby="hubTitle">
					<header class="hubHeader">
						<p class="eyebrow">Seven foundations · Seven real 3D games</p>
						<h1 id="hubTitle">Choose a Mitzvah.</h1>
						<p>Tap one title to learn it, then enter its world.</p>
					</header>
					<div id="mitzvahGrid" class="mitzvahGrid3d"></div>
				</section>
				<section id="detailLayer" class="appLayer detailLayer" hidden aria-labelledby="detailTitle">
					<button id="detailBack" class="navButton detailBack" type="button">← All seven</button>
					<div class="detailCard">
						<div class="detailIdentity">
							<span id="detailNumber"></span>
							<strong id="detailSymbol"></strong>
						</div>
						<p id="detailGenre" class="detailGenre"></p>
						<h2 id="detailTitle"></h2>
						<p id="detailSummary" class="detailSummary"></p>
						<div class="detailPractice">
							<span>Positive work</span>
							<p id="detailPractice"></p>
						</div>
						<p id="detailHook" class="detailHook"></p>
						<div class="detailFooter">
							<p id="detailProgress"></p>
							<button id="playGame" class="primaryButton" type="button">Play game</button>
						</div>
					</div>
				</section>
				<section id="gameLayer" class="appLayer gameLayer" hidden aria-labelledby="gameTitle3d">
					<header class="gameTopBar">
						<button id="gameBack" class="navButton" type="button">← Seven worlds</button>
						<div><p id="gameMitzvah"></p><h2 id="gameTitle3d"></h2></div>
						<div id="gameHud" class="gameHud"></div>
					</header>
					<div id="stageHost" class="stageHost" aria-label="Interactive 3D game canvas"></div>
					<p id="gameStatus" class="gameStatus" aria-live="polite"></p>
					<div id="gameControls" class="gameControls"></div>
					<div id="gameResult" class="gameResult" hidden></div>
				</section>
			</main>
		</div>`;
}
