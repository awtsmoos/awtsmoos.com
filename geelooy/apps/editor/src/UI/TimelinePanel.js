// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos gathers many measured Timeline vessels beneath one stable public panel, simple outside and infinitely extensible within;
 * on Awtsmoos.com rendering, scrubbing, scrolling, presentation, and events each keep their own light while the façade keeps them in rhythm.
 */
import { BasePanel } from "./BasePanel.js";
import { TimelineView } from "./TimelineView.js";
import { TimelineRulerView } from "./TimelineRulerView.js";
import { TimelineRowView } from "./TimelineRowView.js";
import { TiferesTimelineRenderer } from "./TimelineRenderer.js";
import { YesodTimelineScrubController } from "./TimelineScrubController.js";
import { YesodTimelineScrollSync } from "./TimelineScrollSync.js";
import { MalchusTimelinePanelPresenter } from "./TimelinePanelPresenter.js";
import { KesherTimelinePanelBindings } from "./TimelinePanelBindings.js";
import { KesherTimelinePanelLegacyAliases } from "./TimelinePanelLegacyAliases.js";

/** Historical TimelinePanel API preserved as an orchestration façade over focused UI collaborators. */
export class TimelinePanel extends BasePanel {
	/**
	 * Compose the modern Timeline UI around the existing event and manager contracts.
	 * @param {object} eventEmitter Existing Editor event emitter.
	 * @param {object} timelineManager Historical TimelineManager façade.
	 */
	constructor(eventEmitter, timelineManager) {
		super("timeline-panel", "Timeline", eventEmitter, {
			initialCollapsed: false,
			collapsible: true
		});
		this.timelineManager = timelineManager;
		this.pixelsPerSecond = 50;
		this.timelineData = {
			layers: timelineManager.getLayersArray(),
			startTime: timelineManager.startTime,
			endTime: timelineManager.endTime
		};
		this.populateContent();
	}

	/** Build focused collaborators, preserve the historical surface, connect behavior, and reveal initial runtime state. */
	populateContent() {
		this.element.classList.add("timeline-panel-flex");
		this.timelineView = new TimelineView(this.contentElement);
		this.rulerView = new TimelineRulerView(
			this.timelineView.rulerElement,
			this.timelineView.rulerMarksElement
		);
		this.rowView = new TimelineRowView(this.eventEmitter, this.timelineManager);
		this.renderer = new TiferesTimelineRenderer(this.timelineView, this.rowView, this.rulerView);
		this.presenter = new MalchusTimelinePanelPresenter(
			this.timelineView,
			this.rulerView,
			this.timelineManager,
			() => this.timelineData,
			() => this.pixelsPerSecond
		);
		this.legacyAliases = new KesherTimelinePanelLegacyAliases(this, this.timelineView);
		this.legacyAliases.connect();
		this.connectBehavior();
		this.updateTimelineDisplay();
		this.presenter.revealPlayback();
	}

	/** Connect scrubbing, synchronized scrolling, controls, and historical Editor revelations. */
	connectBehavior() {
		this.scrubController = new YesodTimelineScrubController(
			this.rulerElement,
			this.tracksContainerElement,
			this.timelineManager,
			() => this.pixelsPerSecond,
			() => this.timelineData
		);
		this.scrollSync = new YesodTimelineScrollSync(this.layersElement, this.tracksContainerElement);
		this.bindings = new KesherTimelinePanelBindings(
			this.eventEmitter,
			this.timelineManager,
			this.timelineView,
			{
				updateTimeline: ohrData => this.updateTimeline(ohrData),
				updateCursor: misparTime => this.updateCursor({ currentTime: misparTime }),
				updatePlayback: isPlaying => this.updatePlaybackControls({ isPlaying })
			}
		);
		this.scrubController.connect();
		this.scrollSync.connect();
		this.bindings.connect();
	}

	/** Replace current Timeline data and rerender its declarative rows. */
	updateTimeline(data = this.timelineData) {
		this.timelineData = data;
		this.updateTimelineDisplay();
	}

	/** Render ruler/layers/tracks, then synchronize the cursor against canonical time. */
	updateTimelineDisplay() {
		this.renderer.render(this.timelineData, this.pixelsPerSecond);
		this.updateCursor();
	}

	/** Preserve the historical cursor update entry point while delegating presentation. */
	updateCursor({ currentTime } = { currentTime: this.timelineManager.currentTime }) {
		this.presenter.revealCurrentTime(currentTime ?? this.timelineManager.currentTime);
	}

	/** Preserve the historical playback-control update entry point while delegating presentation. */
	updatePlaybackControls({ isPlaying } = { isPlaying: this.timelineManager.isPlaying }) {
		this.presenter.revealPlayback(isPlaying);
	}
}
