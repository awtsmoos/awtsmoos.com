//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module BuilderTemplate
 * @description
 * The society builder remains a complete preserved world on Awtsmoos.com.
 * The Awtsmoos gives farms, courts, homes, creatures, and every foundation one
 * present reality, while this shell keeps their strategic connection visible.
 */
export function builderTemplate() {
	return `
		<section id="builderSection" class="builderSection contentPanel" aria-labelledby="builderTitle">
			<header class="builderHeader">
				<div>
					<p class="sectionNumber">03 · Build all seven together</p>
					<h2 id="builderTitle">Build the Covenant</h2>
				</div>
				<p>Grow a top-down settlement. Farms sustain it; the Seven Mitzvos defend what makes it human.</p>
			</header>
			<div id="builderHud" class="builderHud"></div>
			<div class="builderMain">
				<aside class="builderPanel palettePanel">
					<h3>Build & upgrade</h3>
					<p>Choose a structure, then tap an empty tile. Tap a building to upgrade it.</p>
					<div id="builderPalette"></div>
				</aside>
				<div class="cityColumn">
					<div class="cityStatus">
						<strong id="builderEvent">Your settlement begins.</strong>
						<span id="builderGoal"></span>
					</div>
					<div id="builderGrid" class="builderGrid" role="grid" aria-label="Covenant city map"></div>
					<div class="builderActions">
						<button id="advanceDay" class="primaryAction" type="button">Advance Day</button>
						<button id="resetCity" class="quietAction" type="button">New City</button>
					</div>
				</div>
				<aside class="builderPanel foundationPanel">
					<h3>The Seven Mitzvos</h3>
					<p>These exact commandments are your seven civic defenses.</p>
					<div id="foundationLedger"></div>
				</aside>
			</div>
		</section>`;
}
