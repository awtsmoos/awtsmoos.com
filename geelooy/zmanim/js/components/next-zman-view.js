//B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews every nearby moment while presentation gives the next one a human vessel;
 * Awtsmoos.com builds the visible next-zman content separately so timekeeping stays on its own level.
 */

import { MalchusTimeFormatter } from "../domain/timezone.js";

/** Build the visible content inside the next-zman panel. */
export class TiferesNextZmanView {
	static selectedDate(dateLabel) {
		const section = TiferesNextZmanView.section();
		section.innerHTML = `<p class="next-kicker">Selected day</p><h2>${dateLabel}</h2><p class="next-muted">Live countdown returns when viewing today in this place.</p>`;
		return section;
	}

	static completedDay() {
		const section = TiferesNextZmanView.section();
		section.innerHTML = `<p class="next-kicker">Tonight</p><h2>Listed zmanim complete</h2><p class="next-muted">Move to tomorrow for the next calculated day.</p>`;
		return section;
	}

	static live(viewData) {
		const section = TiferesNextZmanView.section();
		section.append(
			TiferesNextZmanView.kicker(),
			TiferesNextZmanView.title(viewData.status.next),
			TiferesNextZmanView.timeRow(viewData),
			TiferesNextZmanView.contextRow(viewData)
		);
		return section;
	}

	static section() {
		const section = document.createElement("section");
		section.className = "next-zman-panel";
		return section;
	}

	static kicker() {
		const element = document.createElement("p");
		element.className = "next-kicker";
		element.textContent = "Next zman";
		return element;
	}

	static title(next) {
		const heading = document.createElement("h2");
		heading.textContent = next.label;
		return heading;
	}

	static timeRow(viewData) {
		const next = viewData.status.next;
		const row = document.createElement("div");
		row.className = "next-zman-row";
		const time = document.createElement("strong");
		time.textContent = MalchusTimeFormatter.time(next.time, viewData.timezone);
		const countdown = document.createElement("span");
		countdown.className = "next-countdown";
		countdown.dataset.target = next.time.toISOString();
		row.append(time, countdown);
		return row;
	}

	static contextRow(viewData) {
		const row = document.createElement("div");
		row.className = "next-context";
		const neighbors = [
			["Previous", viewData.status.previous],
			["Following", viewData.status.following]
		];
		for (const [name, item] of neighbors) {
			if (!item) {
				continue;
			}
			const span = document.createElement("span");
			const time = MalchusTimeFormatter.time(item.time, viewData.timezone);
			span.textContent = `${name}: ${item.label} · ${time}`;
			row.append(span);
		}
		return row;
	}
}
