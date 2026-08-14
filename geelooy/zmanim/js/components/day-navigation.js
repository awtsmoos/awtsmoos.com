//B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews each day while the traveler moves backward, homeward, or ahead;
 * Awtsmoos.com gives date navigation three clear touch targets instead of making the calendar do every tread.
 */

/** Small previous/today/next date navigator that delegates date ownership to the store. */
export class AwtsmoosDayNavigation extends HTMLElement {
	connectedCallback() {
		this.render();
		this.addEventListener("click", event => {
			this.handleClick(event);
		});
	}

	handleClick(event) {
		const button = event.target.closest("button[data-action]");
		if (!button) {
			return;
		}
		const action = button.dataset.action;
		if (action === "today") {
			this.dispatchEvent(new CustomEvent("date-today", {
				bubbles: true
			}));
			return;
		}
		const delta = action === "previous" ? -1 : 1;
		this.dispatchEvent(new CustomEvent("date-navigate", {
			bubbles: true,
			detail: { delta }
		}));
	}

	render() {
		this.innerHTML = `
			<div class="day-nav" aria-label="Change day">
				<button type="button" data-action="previous" aria-label="Previous day">
					<span aria-hidden="true">←</span>
					<span>Previous</span>
				</button>
				<button type="button" data-action="today" class="day-nav-today">Today</button>
				<button type="button" data-action="next" aria-label="Next day">
					<span>Next</span>
					<span aria-hidden="true">→</span>
				</button>
			</div>`;
	}
}

customElements.define("awtsmoos-day-navigation", AwtsmoosDayNavigation);
