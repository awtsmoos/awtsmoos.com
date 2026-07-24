//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module RealmTemplate
 * @description
 * One fixed interface reveals continuous travel, civic state, enduring account,
 * equipment, quests, bank, recovery, and chronicle without stacking a second page.
 * The Awtsmoos surrounds every panel; Awtsmoos.com keeps one viewport and one world.
 */
export function realmTemplate() {
	return `
		<header class="realmTopbar">
			<button id="realmBack" class="backButton" type="button">← Seven worlds</button>
			<p><small>COVENANT REALM</small><strong>Covenant Crossing</strong></p>
			<button id="realmAccountToggle" class="realmAccountToggle" type="button" aria-expanded="false">Account</button>
			<div id="realmPerformance" class="realmPerformance">60 FPS target</div>
		</header>
		<div id="realmStage" class="realmStage"></div>
		<section class="realmOverlay" aria-label="Persistent realm information">
			<div class="realmVitals">
				<strong id="realmClock">Day 1 · 07:00</strong>
				<span id="realmRole">Traveler</span>
				<span id="realmTrust">Trust 22</span>
			</div>
			<article id="realmEvent" class="realmEvent"></article>
			<article class="realmLedger">
				<div><small>BRIDGE</small><strong id="realmBridge"></strong></div>
				<div><small>HOME</small><strong id="realmHome"></strong></div>
				<div><small>INVENTORY</small><span id="realmInventory"></span></div>
				<div><small>MASTERY</small><span id="realmSkills"></span></div>
			</article>
			<p id="realmMessage" class="realmMessage" role="status">Walk with WASD, arrows, or the touch compass.</p>
			<div id="realmActions" class="realmActions"></div>
			<details class="realmChronicle">
				<summary>World memory and chronicle</summary>
				<div id="realmChronicle"></div>
			</details>
		</section>
		<aside id="realmAccountDrawer" class="realmAccountDrawer" aria-label="Persistent account" hidden>
			<header><div><small>ENDURING ACCOUNT</small><h2>Traveler record</h2></div><button id="realmAccountClose" type="button">Close</button></header>
			<div class="realmAccountScroll">
				<section><h3>Summary</h3><div id="realmAccountSummary" class="realmAccountStats"></div></section>
				<section><h3>Health and travel</h3><div id="realmAccountVitals" class="realmAccountStats"></div></section>
				<section><h3>Equipment</h3><div id="realmAccountEquipment"></div></section>
				<section><h3>Carried items</h3><div id="realmAccountCarriedItems"></div></section>
				<section><h3>Local bank</h3><div id="realmAccountBank"></div></section>
				<section><h3>Quest journal</h3><div id="realmAccountQuests"></div></section>
				<section><h3>Collections</h3><div id="realmAccountCollections"></div></section>
			</div>
		</aside>
		<nav id="realmMovement" class="realmMovement" aria-label="Movement controls">
			<button data-move="0,-1" aria-label="Move north">▲</button>
			<button data-move="-1,0" aria-label="Move west">◀</button>
			<button data-move="0,1" aria-label="Move south">▼</button>
			<button data-move="1,0" aria-label="Move east">▶</button>
		</nav>`;
}
