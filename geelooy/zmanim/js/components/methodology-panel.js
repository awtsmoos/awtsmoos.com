//B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos is beyond every angle, yet a trustworthy calculator should expose the vessel it uses;
 * Awtsmoos.com keeps methodology available in one calm disclosure after the daily work concludes.
 */

import { getZmanimOpinion } from "../config/opinions.js";

/** Progressive-disclosure methodology and source panel. */
export class AwtsmoosMethodologyPanel extends HTMLElement {
	set data(value) {
		this.viewData = value;
		this.render();
	}

	connectedCallback() {
		this.render();
	}

	render() {
		const opinion = getZmanimOpinion(this.viewData?.opinionId);
		this.innerHTML = `
			<details class="methodology-panel" id="methodology">
				<summary><span>Calculation & sources</span><strong>${opinion.label}</strong></summary>
				<div class="methodology-body">
					<p>${opinion.description}</p>
					<div class="method-grid">
						<div><strong>16.9°</strong><span>Alos</span></div>
						<div><strong>10.2°</strong><span>Misheyakir</span></div>
						<div><strong>0.833°</strong><span>Visible rise/set</span></div>
						<div><strong>6° / 8.5°</strong><span>Tzeis / Shabbos end</span></div>
					</div>
					<p class="method-caution">The Chabad profile uses 1.583° true-rise/true-set anchors for seasonal-hour calculation. Practical local rulings can differ.</p>
					<nav class="source-links" aria-label="Calculation sources">
						<a href="https://www.chabad.org/calendar/zmanim_cdo/aid/143790/jewish/About-Zmanim.htm">Chabad methodology</a>
						<a href="https://gml.noaa.gov/grad/solcalc/calcdetails.html">NOAA solar equations</a>
						<a href="https://aa.usno.navy.mil/data/api">USNO data API</a>
						<a href="/api/zmanim/methodology">Awtsmoos API methodology</a>
					</nav>
				</div>
			</details>`;
	}
}

customElements.define("awtsmoos-methodology-panel", AwtsmoosMethodologyPanel);
