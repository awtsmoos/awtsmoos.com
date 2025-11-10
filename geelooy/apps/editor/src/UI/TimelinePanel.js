// B"H
import { HTML } from '../Core/HTML.js';
import { BasePanel } from './BasePanel.js';

export class TimelinePanel extends BasePanel {
    constructor(eventEmitter, timelineManager) {
        super('timeline-panel', 'Timeline', eventEmitter, { initialCollapsed: false });
        this.timelineManager = timelineManager;

        this.pixelsPerSecond = 50; // Zoom level
        this.layerHeight = 25; // Height of each layer row
        this.rulerHeight = 20;
        this.handleWidth = 100; // Width of layer name handles

        // DOM Elements
        this.controlsElement = null;
        this.timeDisplayElement = null;
        this.contentElement = null; // Overall content area
        this.layersElement = null; // Left side layer names/handles
        this.tracksContainerElement = null; // Right side tracks/keyframes scroll area
        this.rulerElement = null;
        this.rulerMarksElement = null;
        this.tracksElement = null; // Holds the actual track visuals
        this.cursorElement = null;

        // State
        this.isScrubbing = false;
        this.timelineData = { layers: [], startTime: 0, endTime: 10 };

        this.populateContent(); // <--- ADD THIS LINE HERE

        this.eventEmitter.on('timelineDataChanged', (data) => this.updateTimeline(data));
        this.eventEmitter.on('timeChanged', this.updateCursor.bind(this));
        this.eventEmitter.on('playbackStateChanged', this.updatePlaybackControls.bind(this));

    }

    populateContent() {
        // Overrides base panel to structure timeline specific elements
        this.element.classList.add('timeline-panel-flex'); // Use flex for layout

        this.controlsElement = this._createControls();
        this.contentElement = this._createContentArea(); // Content area for layers and tracks

        // Replace base panel's children
        HTML.clear(this.element);
        HTML.add(this.element, [
            this.controlsElement,
            this.contentElement
        ]);

         // Initial draw
         this.updateTimelineDisplay();
         this.updateCursor();
    }

    _createControls() {
        this.buttons = {
            play: HTML.create({ tag: 'button', id: 'btn-play', text: '▶ Play' }),
            // pause: HTML.create({ tag: 'button', id: 'btn-pause', text: '❚❚ Pause', class:'hidden'}), // Toggle play/pause text instead
            // TODO: Add Start/End/Prev/Next Keyframe buttons
        };
        this.timeDisplayElement = HTML.create({ tag: 'span', class: 'time-display', text: '0.00s' });
        // TODO: Add duration inputs

        this.buttons.play.addEventListener('click', () => {
            if (this.timelineManager.isPlaying) {
                 this.eventEmitter.emit('pauseTimeline');
            } else {
                 this.eventEmitter.emit('playTimeline');
            }
        });

        return HTML.create({ tag: 'div', class: 'timeline-controls', children: [
             this.buttons.play,
             this.timeDisplayElement,
             // Add more controls here
        ]});
    }

     _createContentArea() {
        this.layersElement = HTML.create({ tag: 'div', class: 'timeline-layers', style: { width: `${this.handleWidth}px`} });
        this.rulerMarksElement = HTML.create({ tag: 'div', class: 'timeline-ruler-marks' });
        this.rulerElement = HTML.create({ tag: 'div', class: 'timeline-ruler', style: { height: `${this.rulerHeight}px` }, children: [this.rulerMarksElement] });
        this.tracksElement = HTML.create({ tag: 'div', class: 'timeline-tracks' }); // Will contain layer track divs
        this.cursorElement = HTML.create({ tag: 'div', class: 'timeline-cursor' });
        this.tracksContainerElement = HTML.create({
             tag: 'div',
             class: 'timeline-tracks-container',
             children: [this.rulerElement, this.tracksElement, this.cursorElement] // Cursor needs to be after tracks for z-index
        });


        // --- Scroll Sync ---
        // Sync vertical scroll between layers and tracks
        let layersScrollTop = 0;
        let tracksScrollTop = 0;
        let isSyncingScroll = false; // Prevent infinite scroll event loops

        this.layersElement.addEventListener('scroll', () => {
            if (isSyncingScroll) return;
            layersScrollTop = this.layersElement.scrollTop;
            if (tracksScrollTop !== layersScrollTop) {
                 isSyncingScroll = true;
                 this.tracksContainerElement.scrollTop = layersScrollTop;
                 tracksScrollTop = layersScrollTop;
                 requestAnimationFrame(() => isSyncingScroll = false); // Reset sync flag after paint
            }
        });
        this.tracksContainerElement.addEventListener('scroll', () => {
            if (isSyncingScroll) return;
             tracksScrollTop = this.tracksContainerElement.scrollTop;
            if (layersScrollTop !== tracksScrollTop) {
                 isSyncingScroll = true;
                 this.layersElement.scrollTop = tracksScrollTop;
                 layersScrollTop = tracksScrollTop;
                 requestAnimationFrame(() => isSyncingScroll = false);
            }
        });


        // --- Scrubbing ---
        const startScrub = (event) => {
            this.isScrubbing = true;
            updateScrubTime(event);
             document.addEventListener('pointermove', updateScrubTime);
             document.addEventListener('pointerup', endScrub);
        };
         const updateScrubTime = (event) => {
            if (!this.isScrubbing) return;
            const rect = this.rulerElement.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const time = x / this.pixelsPerSecond + this.timelineData.startTime;
             // Use manager's seek to update time and notify others
             this.timelineManager.seek(time, true); // Indicate scrubbing
         };
         const endScrub = () => {
            this.isScrubbing = false;
            // Final time update, not scrubbing anymore
             this.timelineManager.seek(this.timelineManager.getCurrentTime(), false);
             document.removeEventListener('pointermove', updateScrubTime);
             document.removeEventListener('pointerup', endScrub);
         };

         this.rulerElement.addEventListener('pointerdown', startScrub);


        return HTML.create({ tag: 'div', class: 'timeline-content', children: [
            this.layersElement,
            this.tracksContainerElement
        ]});
     }

    updateTimeline(data = this.timelineData) {
        this.timelineData = data; // Store latest data
        this.updateTimelineDisplay();
    }

    updateTimelineDisplay() {
        if (!this.layersElement || !this.tracksElement) return;

        HTML.clear(this.layersElement);
        HTML.clear(this.tracksElement);
        HTML.clear(this.rulerMarksElement);

        const totalWidth = (this.timelineData.endTime - this.timelineData.startTime) * this.pixelsPerSecond;
        this.tracksElement.style.width = `${totalWidth}px`;
        this.rulerMarksElement.style.width = `${totalWidth}px`;
        this.drawRuler(totalWidth);


        // Draw layers and tracks
        let totalHeight = 0;
        this.timelineData.layers.forEach((layerData, index) => {
            const layerHeight = this.calculateLayerHeight(layerData);
            // Draw layer handle (left side)
             this.layersElement.appendChild(this._createLayerHandle(layerData, index, layerHeight));
            // Draw track area (right side)
            this.tracksElement.appendChild(this._createLayerTracks(layerData, index, layerHeight, totalWidth));
            totalHeight += layerHeight;
        });
        // Set height for scroll syncing
        this.layersElement.style.height = `${totalHeight}px`;
        this.tracksElement.style.height = `${totalHeight}px`; // Track background areas need height too


        this.updateCursor(); // Ensure cursor position is correct after redraw
    }


    calculateLayerHeight(layerData) {
         // Base height + height for each track if expanded
         let height = this.layerHeight;
         if (!layerData.collapsed && layerData.tracks.size > 0) {
             height += layerData.tracks.size * this.layerHeight; // Add height for each property track row
         }
         return height;
    }


     _createLayerHandle(layerData, index, height) {
        const handle = HTML.create({
             tag: 'div',
             class: 'timeline-layer-header',
             style: { height: `${this.layerHeight}px`, top: `${index * this.layerHeight}px`}, // Basic positioning TBD
             text: layerData.objectName || `Layer ${index + 1}`,
             on: {
                click: () => this.eventEmitter.emit('toggleLayerCollapse', layerData.objectUUID)
             }
        });
         // TODO: Add sub-track labels if expanded

        return handle;
     }

     _createLayerTracks(layerData, index, height, totalWidth) {
         const trackArea = HTML.create({
             tag: 'div',
             class: 'timeline-layer-tracks',
             style: { height: `${height}px`, width: `${totalWidth}px` },
             attrs: { 'data-uuid': layerData.objectUUID }
         });

        // Draw keyframes for all tracks within this layer
        layerData.tracks.forEach(track => {
             track.keyframes.forEach(kf => {
                 const keyframeElement = this._createKeyframeElement(kf, track.propertyPath);
                 trackArea.appendChild(keyframeElement);
             });
             // TODO: Draw track lines/backgrounds if needed
        });

        return trackArea;
     }

     _createKeyframeElement(keyframe, propertyPath) {
        const xPos = (keyframe.time - this.timelineData.startTime) * this.pixelsPerSecond;
         // TODO: Determine Y position based on propertyPath if tracks are visually separated
         const yPos = this.layerHeight / 2; // Simple vertical centering for now

         return HTML.create({
            tag: 'div',
            class: 'timeline-keyframe',
            style: { left: `${xPos}px`, top: `${yPos}px` }, // Use top for simple single-line layers
            attrs: { 'data-kf-id': keyframe.id, 'data-kf-time': keyframe.time },
            title: `${propertyPath} @ ${keyframe.time.toFixed(2)}s`,
            on: {
                 click: (e) => {
                     e.stopPropagation(); // Prevent ruler scrub
                     console.log("Keyframe clicked:", keyframe);
                     // TODO: Select keyframe, enable dragging/deletion
                 }
            }
         });
     }


    drawRuler(totalWidth) {
        const startTime = this.timelineData.startTime;
        const endTime = this.timelineData.endTime;
        const duration = endTime - startTime;
        if (duration <= 0) return;

        // Determine appropriate tick intervals based on zoom (pixelsPerSecond)
        let majorTickSec = 1; // Default: 1 second major ticks
        let minorTickSec = 0.1; // Default: 0.1 second minor ticks

        // Adjust intervals based on visual density
        if (this.pixelsPerSecond < 15) { majorTickSec = 5; minorTickSec = 1; }
        else if (this.pixelsPerSecond < 30) { majorTickSec = 2; minorTickSec = 0.5; }
        else if (this.pixelsPerSecond > 150) { majorTickSec = 0.5; minorTickSec = 0.1; }
        else if (this.pixelsPerSecond > 300) { majorTickSec = 0.2; minorTickSec = 0.05; }

        const createTick = (time, isMajor) => {
             const xPos = (time - startTime) * this.pixelsPerSecond;
             if (xPos < 0 || xPos > totalWidth + 1) return null; // Only draw visible ticks

             const tick = HTML.create({
                 tag: 'div',
                 class: ['timeline-tick', isMajor ? 'major' : 'minor'],
                 style: { left: `${xPos}px` }
             });
             if (isMajor) {
                 const label = HTML.create({
                     tag: 'span',
                     class: 'timeline-tick-label',
                     style: { left: `${xPos}px` },
                     text: `${time.toFixed(time < 1 ? 2 : (time < 10 ? 1 : 0))}s` // Adjust decimal places based on magnitude
                 });
                 return [tick, label];
             }
             return tick;
        };

        // Minor ticks
        for (let t = startTime; t <= endTime; t += minorTickSec) {
             // Avoid floating point issues near major ticks
             if (Math.abs(t % majorTickSec) > minorTickSec * 0.1) {
                 HTML.add(this.rulerMarksElement, createTick(t, false));
             }
        }
        // Major ticks (drawn last to overlay labels correctly)
        for (let t = Math.ceil(startTime / majorTickSec) * majorTickSec; t <= endTime; t += majorTickSec) {
             HTML.add(this.rulerMarksElement, createTick(t, true));
        }
    }

    updateCursor({ currentTime, isScrubbing } = { currentTime: this.timelineManager.getCurrentTime(), isScrubbing: this.isScrubbing }) {
        if (!this.cursorElement) return;
        const cursorX = (currentTime - this.timelineData.startTime) * this.pixelsPerSecond;
        this.cursorElement.style.left = `${cursorX}px`;
        this.timeDisplayElement.textContent = `${currentTime.toFixed(2)}s`;

         // If scrubbing, ensure the track container scrolls to keep cursor visible
         if (isScrubbing) {
            const containerWidth = this.tracksContainerElement.clientWidth;
            const scrollLeft = this.tracksContainerElement.scrollLeft;
            if (cursorX < scrollLeft + 10) { // Cursor near left edge
                 this.tracksContainerElement.scrollLeft = Math.max(0, cursorX - 50);
            } else if (cursorX > scrollLeft + containerWidth - 10) { // Cursor near right edge
                 this.tracksContainerElement.scrollLeft = cursorX - containerWidth + 50;
            }
         }
    }

     updatePlaybackControls({ isPlaying }) {
         this.buttons.play.textContent = isPlaying ? '❚❚ Pause' : '▶ Play';
     }
}