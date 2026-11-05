// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioPerformanceMarkup.js
 * @description Provides accessible inspector, recorder, take-manager, action, and touch vessels.
 * The Awtsmoos lets director, performer, keyboard, finger, and agent meet in one studio;
 * Awtsmoos.com keeps every range, loop, voice, camera, control, and warning truthful in rhyme.
 */

export function movieStudioPerformanceInspectorMarkup() {
	return `
		<section class="performance-panel" data-performance-panel aria-labelledby="performance-title">
			<h3 id="performance-title">Character Performance</h3>
			<div class="performance-grid">
				<label>Character<select data-performance-character aria-label="Character performer"></select></label>
				<label>Mode<select data-performance-mode><option value="object">Object</option><option value="edit">Edit</option><option value="performance">Performance</option></select></label>
				<label>Camera<select data-performance-camera><option value="director">Director</option><option value="follow">Follow</option><option value="firstPerson">First Person</option><option value="freeDirector">Free Director</option><option value="recorded">Recorded</option></select></label>
				<label>Movement<select data-performance-reference><option value="camera">Camera relative</option><option value="character">Character relative</option></select></label>
				<label>Walk speed<input data-performance-walk type="number" min="0.1" max="20" step="0.1" value="4.2"></label>
				<label>Run speed<input data-performance-run-speed type="number" min="0.1" max="30" step="0.1" value="7.2"></label>
				<label>Turn speed<input data-performance-turn type="number" min="0.1" max="10" step="0.1" value="2.35"></label>
				<label>Take name<input data-performance-take-name maxlength="500" value="Performance Take"></label>
				<label>Count-in<input data-performance-count-in type="number" min="0" max="10" step="1" value="3"></label>
				<label>Pre-roll<input data-performance-pre-roll type="number" min="0" max="30" step="0.1" value="0"></label>
				<label>Post-roll<input data-performance-post-roll type="number" min="0" max="30" step="0.1" value="0"></label>
				<label>Punch in<input data-performance-punch-in type="number" min="0" step="0.01" placeholder="Playhead"></label>
				<label>Punch out<input data-performance-punch-out type="number" min="0" step="0.01" placeholder="Open ended"></label>
				<label>Loop count<input data-performance-loop-count type="number" min="1" max="100" step="1" value="1"></label>
				<label>Insert loop<input data-performance-active-loop type="number" min="1" max="100" step="1" value="1"></label>
				<label>Sample rate<select data-performance-sample-rate><option>24</option><option selected>30</option><option>60</option></select></label>
			</div>
			<div class="performance-options">
				<label><input data-performance-metronome type="checkbox"> Metronome</label>
				<label><input data-performance-audio type="checkbox"> Microphone</label>
				<label><input data-performance-record-camera type="checkbox"> Record camera</label>
				<label><input data-performance-overlay type="checkbox" checked> Gameplay overlay</label>
			</div>
			<div class="performance-buttons" role="group" aria-label="Performance recording controls">
				<button data-performance-arm type="button">Arm</button>
				<button data-performance-record type="button">Record</button>
				<button data-performance-pause type="button">Pause</button>
				<button data-performance-stop type="button">Stop</button>
				<button data-performance-cancel type="button">Cancel</button>
				<button data-performance-retake type="button">Retake</button>
				<button data-performance-keep type="button">Keep</button>
				<button data-performance-discard type="button">Discard</button>
			</div>
			<div class="performance-status" data-performance-status role="status" aria-live="polite">Select a performer.</div>
			<div class="performance-actions" data-performance-actions aria-label="Available actions"></div>
			<section class="performance-takes" aria-labelledby="performance-takes-title">
				<h4 id="performance-takes-title">Take Manager</h4>
				<div class="performance-take-filters">
					<label>Sort<select data-performance-take-sort><option value="date">Date</option><option value="rating">Rating</option><option value="favorite">Favorite</option><option value="duration">Duration</option><option value="preferred">Preferred</option></select></label>
					<label><input data-performance-filter-favorite type="checkbox"> Favorites</label>
					<label><input data-performance-filter-preferred type="checkbox"> Preferred</label>
				</div>
				<div data-performance-takes></div>
				<div data-performance-recovery></div>
			</section>
		</section>`;
}

export function movieStudioPerformanceTouchMarkup() {
	return `
		<div class="performance-touch" data-performance-touch hidden aria-label="Mobile performance controls">
			<div class="performance-touch-status" data-performance-touch-status>Performance</div>
			<div class="performance-dpad" aria-label="Movement pad">
				<button data-performance-direction="forward" aria-label="Move forward">▲</button>
				<button data-performance-direction="left" aria-label="Strafe left">◀</button>
				<button data-performance-direction="backward" aria-label="Move backward">▼</button>
				<button data-performance-direction="right" aria-label="Strafe right">▶</button>
			</div>
			<div class="performance-touch-actions">
				<button data-performance-run aria-label="Toggle run">Run</button>
				<button data-performance-jump aria-label="Jump">Jump</button>
				<button data-performance-action aria-label="Trigger action">Action</button>
				<button data-performance-record-touch aria-label="Record or stop">Record</button>
				<button data-performance-cancel-touch aria-label="Cancel recording">Cancel</button>
				<button data-performance-next-character aria-label="Next character">Actor</button>
			</div>
		</div>`;
}
