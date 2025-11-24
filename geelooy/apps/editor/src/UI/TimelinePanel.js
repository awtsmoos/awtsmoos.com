// B"H
import {
	HTML
}
from '../Core/HTML.js';
import {
	BasePanel
}
from './BasePanel.js';

export class TimelinePanel extends BasePanel {
	constructor(eventEmitter, timelineManager) {
		super('timeline-panel', 'Timeline', eventEmitter, {
			initialCollapsed: false,
			collapsible: true
		});
		this.timelineManager = timelineManager;

		this.pixelsPerSecond = 50;
		this.layerHeaderHeight = 28;
		this.trackHeight = 24;
		this.handleWidth = 180;

		// DOM Elements
		this.controlsElement = null;
		this.timeDisplayElement = null;
		this.layersElement = null;
		this.tracksContainerElement = null;
		this.rulerElement = null;
		this.rulerMarksElement = null;
		this.tracksElement = null;
		this.cursorElement = null;

		this.isScrubbing = false;
		this.timelineData = {
			layers: [],
			startTime: 0,
			endTime: 10
		};

		this.populateContent();

		this.eventEmitter.on('timelineDataChanged', (data) => this.updateTimeline(data));
		this.eventEmitter.on('timeChanged', this.updateCursor.bind(this));
		this.eventEmitter.on('playbackStateChanged', this.updatePlaybackControls.bind(this));
	}

	populateContent() {
		this.element.classList.add('timeline-panel-flex');
		HTML.clear(this.contentElement);

		this.controlsElement = this._createControls();
		const contentArea = this._createContentArea();

		HTML.add(this.contentElement, [this.controlsElement, contentArea]);
		this.updateTimelineDisplay();
		this.updateCursor();
	}

	_createControls() {
		this.buttons = {
			play: HTML.create({
				tag: 'button',
				id: 'btn-play',
				text: '▶ Play'
			}),
		};
		this.timeDisplayElement = HTML.create({
			tag: 'span',
			class: 'time-display',
			text: '0.00s'
		});

		this.buttons.play.addEventListener('click', () => {
			this.timelineManager.isPlaying ? this.eventEmitter.emit('pauseTimeline') : this.eventEmitter.emit('playTimeline');
		});

		return HTML.create({
			tag: 'div',
			class: 'timeline-controls',
			children: [this.buttons.play, this.timeDisplayElement]
		});
	}

	_createContentArea() {
		this.layersElement = HTML.create({
			tag: 'div',
			class: 'timeline-layers',
			style: {
				width: `${this.handleWidth}px`
			}
		});
		this.rulerMarksElement = HTML.create({
			tag: 'div',
			class: 'timeline-ruler-marks'
		});
		this.rulerElement = HTML.create({
			tag: 'div',
			class: 'timeline-ruler',
			children: [this.rulerMarksElement]
		});
		this.tracksElement = HTML.create({
			tag: 'div',
			class: 'timeline-tracks'
		});
		this.cursorElement = HTML.create({
			tag: 'div',
			class: 'timeline-cursor'
		});
		this.tracksContainerElement = HTML.create({
			tag: 'div',
			class: 'timeline-tracks-container',
			children: [this.rulerElement, this.tracksElement, this.cursorElement]
		});

		// Event listeners for scrubbing
		const startScrub = (e) => {
			this.isScrubbing = true;
			updateScrubTime(e);
			document.addEventListener('pointermove', updateScrubTime);
			document.addEventListener('pointerup', endScrub);
		};
		const updateScrubTime = (e) => {
			if (!this.isScrubbing) return;
			const rect = this.rulerElement.getBoundingClientRect();
			const time = (e.clientX - rect.left) / this.pixelsPerSecond;
			this.timelineManager.seek(time, true);
		};
		const endScrub = () => {
			this.isScrubbing = false;
			this.timelineManager.seek(this.timelineManager.currentTime, false);
			document.removeEventListener('pointermove', updateScrubTime);
			document.removeEventListener('pointerup', endScrub);
		};
		this.rulerElement.addEventListener('pointerdown', startScrub);

		return HTML.create({
			tag: 'div',
			class: 'timeline-content',
			children: [this.layersElement, this.tracksContainerElement]
		});
	}

	updateTimeline(data = this.timelineData) {
		this.timelineData = data;
		this.updateTimelineDisplay();
	}

	updateTimelineDisplay() {
		if (!this.layersElement) return;

		const scrollPos = this.layersElement.scrollTop;
		HTML.clear(this.layersElement);
		HTML.clear(this.tracksElement);

		const totalWidth = (this.timelineData.endTime - this.timelineData.startTime) * this.pixelsPerSecond;
		this.tracksElement.style.width = `${totalWidth}px`;
		this.rulerMarksElement.style.width = `${totalWidth}px`;
		this.drawRuler(totalWidth);

		this.timelineData.layers.forEach(layerData => {
			const isCollapsed = layerData.collapsed;
			const layerGroup = this._createLayerGroup(layerData, totalWidth);
			this.layersElement.appendChild(layerGroup.handle);
			this.tracksElement.appendChild(layerGroup.track);

			if (!isCollapsed) {
				Array.from(layerData.tracks.values())
					.forEach(trackData => {
						const trackGroup = this._createTrackGroup(trackData, totalWidth);
						this.layersElement.appendChild(trackGroup.handle);
						this.tracksElement.appendChild(trackGroup.track);
					});
			}
		});

		this.layersElement.scrollTop = scrollPos;
		this.updateCursor();
	}

	_createLayerGroup(layerData) {
		const isCollapsed = layerData.collapsed;
		const handle = HTML.create({
			tag: 'div',
			class: 'timeline-layer-header',
			children: [
				HTML.create({
					tag: 'button',
					class: 'toggle-btn',
					text: isCollapsed ? '▸' : '▾'
				}),
				HTML.create({
					tag: 'span',
					class: 'item-name',
					text: layerData.objectName
				})
			],
			on: {
				click: () => this.eventEmitter.emit('toggleLayerCollapse', layerData.objectUUID)
			}
		});
		const track = HTML.create({
			tag: 'div',
			class: 'timeline-layer-track-bg'
		});
		return {
			handle,
			track
		};
	}

	_createTrackGroup(trackData, totalWidth) {
		const pathParts = trackData.propertyPath.split('.');
		const displayName = pathParts.length > 1 ? pathParts.slice(1)
			.join('.') : pathParts[0];

		const handle = HTML.create({
			tag: 'div',
			class: 'timeline-track-header',
			children: [
				HTML.create({
					tag: 'span',
					class: 'item-name',
					text: displayName
				})
			]
		});

		const keyframeElements = trackData.keyframes.map(kf => this._createKeyframeElement(kf));
		const track = HTML.create({
			tag: 'div',
			class: 'timeline-track-row',
			style: {
				width: `${totalWidth}px`
			},
			children: keyframeElements
		});
		return {
			handle,
			track
		};
	}

	_createKeyframeElement(keyframe) {
		const xPos = (keyframe.time - this.timelineData.startTime) * this.pixelsPerSecond;
		return HTML.create({
			tag: 'div',
			class: 'timeline-keyframe',
			style: {
				left: `${xPos}px`
			},
			attrs: {
				'data-kf-id': keyframe.id
			},
			on: {
				click: (e) => {
					e.stopPropagation();
					this.timelineManager.seek(keyframe.time);
				}
			}
		});
	}

	// In TimelinePanel.js
	drawRuler(totalWidth) {
		HTML.clear(this.rulerMarksElement);
		const startTime = this.timelineData.startTime;
		const endTime = this.timelineData.endTime;
		const duration = endTime - startTime;
		if (duration <= 0) return;

		// Determine appropriate tick intervals based on zoom (pixelsPerSecond)
		let majorTickSec = 1; // Default: 1 second major ticks
		let minorTickSec = 0.1; // Default: 0.1 second minor ticks

		if (this.pixelsPerSecond < 15) {
			majorTickSec = 5;
			minorTickSec = 1;
		}
		else if (this.pixelsPerSecond < 30) {
			majorTickSec = 2;
			minorTickSec = 0.5;
		}
		else if (this.pixelsPerSecond > 150) {
			majorTickSec = 0.5;
			minorTickSec = 0.1;
		}
		else if (this.pixelsPerSecond > 300) {
			majorTickSec = 0.2;
			minorTickSec = 0.05;
		}

		const createTick = (time, isMajor) => {
			const xPos = (time - startTime) * this.pixelsPerSecond;
			if (xPos < 0 || xPos > totalWidth + 1) return null; // Only draw visible ticks

			const tick = HTML.create({
				tag: 'div',
				class: ['timeline-tick', isMajor ? 'major' : 'minor'],
				style: {
					left: `${xPos}px`
				}
			});
			if (isMajor) {
				const label = HTML.create({
					tag: 'span',
					class: 'timeline-tick-label',
					style: {
						transform: `translateX(${xPos}px)`
					},
					text: `${time.toFixed(time < 1 ? 2 : (time < 10 ? 1 : 0))}`
				});
				return [tick, label];
			}
			return tick;
		};

		const fragment = document.createDocumentFragment();

		// Add minor ticks first
		for (let t = startTime; t <= endTime; t += minorTickSec) {
			if (Math.abs(t % majorTickSec) > minorTickSec * 0.1) { // Avoid floating point issues near major ticks
				const tick = createTick(t, false);
				if (tick) fragment.appendChild(tick);
			}
		}
		// Add major ticks and labels
		for (let t = Math.ceil(startTime / majorTickSec) * majorTickSec; t <= endTime; t += majorTickSec) {
			const ticks = createTick(t, true);
			if (ticks) ticks.forEach(el => fragment.appendChild(el));
		}

		this.rulerMarksElement.appendChild(fragment);
	}

	updateCursor({
		currentTime
	} = {
		currentTime: this.timelineManager.currentTime
	}) {
		if (!this.cursorElement) return;
		const cursorX = (currentTime - this.timelineData.startTime) * this.pixelsPerSecond;
		this.cursorElement.style.left = `${cursorX}px`;
		this.timeDisplayElement.textContent = `${currentTime.toFixed(2)}s`;
	}
	// In TimelinePanel.js
	updatePlaybackControls({
		isPlaying
	}) {
		if (this.buttons.play) {
			this.buttons.play.textContent = isPlaying ? '❚❚ Pause' : '▶ Play';
		}
	}

}