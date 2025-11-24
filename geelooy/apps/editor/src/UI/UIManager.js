// B"H
import { HTML } from '../Core/HTML.js';
import { ObjectTreePanel } from './ObjectTreePanel.js';
import { PropertiesPanel } from './PropertiesPanel.js';
import { TimelinePanel } from './TimelinePanel.js';
import { Toolbar } from './Toolbar.js';

/**
 * Manages the creation and layout of UI panels.
 */
export class UIManager {
    constructor(container, eventEmitter, objectManager, timelineManager, transformManager, historyManager) {
        this.container = container;
        this.eventEmitter = eventEmitter;
        this.objectManager = objectManager;
        this.timelineManager = timelineManager;
        this.transformManager = transformManager;
        this.historyManager = historyManager;

        this.panels = {};

        this.initUI();
        console.log("B\"H - UIManager Initialized");
    }

    initUI() {
        HTML.clear(this.container);

        // Create Toolbar
        this.panels.toolbar = new Toolbar(this.eventEmitter, this.historyManager, this.objectManager);
        HTML.add(this.container, this.panels.toolbar.getElement());

        // Create Object Tree Panel
        this.panels.objectTree = new ObjectTreePanel(this.eventEmitter, this.objectManager);
        HTML.add(this.container, this.panels.objectTree.getElement());

        // Create Properties Panel
        this.panels.properties = new PropertiesPanel(this.eventEmitter, this.objectManager, this.timelineManager, this.historyManager);
        HTML.add(this.container, this.panels.properties.getElement());
        
        
        

        // Create Timeline Panel
        this.panels.timeline = new TimelinePanel(this.eventEmitter, this.timelineManager);
        HTML.add(this.container, this.panels.timeline.getElement());

        // Initial population/updates
        this.panels.objectTree.updateTree(this.objectManager.getAllObjects());
        this.panels.timeline.updateTimeline(); // Initial draw
        this.panels.toolbar.updateHistoryButtons({ canUndo: false, canRedo: false }); // Init button state
    }

    // Methods to show/hide panels or handle layout changes could go here if needed
}