// B"H
import { HTML } from '../Core/HTML.js';

/**
 * Base class for UI panels to standardize creation and structure.
 */
export class BasePanel {
    constructor(id, title, eventEmitter, options = {}) {
        this.id = id;
        this.title = title;
        this.eventEmitter = eventEmitter;
        this.options = {
            collapsible: true,
            initialCollapsed: false,
            ...options
        };
        this.element = null;
        this.contentElement = null;
        this.isCollapsed = this.options.initialCollapsed;

        this._createElement();
    }

    _createElement() {
        this.contentElement = HTML.create({ tag: 'div', class: 'panel-content' });

        const headerChildren = [{ tag: 'span', text: this.title }];
        if (this.options.collapsible) {
            // Toggle button functionality managed by CSS ::before content and class toggle
        }

        const headerConfig = {
            tag: 'div',
            class: ['panel-header', this.options.collapsible ? 'collapsible' : ''],
            children: headerChildren,
        };

        if (this.options.collapsible) {
            headerConfig.on = { click: () => this.toggleCollapse() };
        }

        const panelClasses = ['panel'];
        if (this.options.initialCollapsed) {
            panelClasses.push('collapsed');
        }


        this.element = HTML.create({
            tag: 'div',
            id: this.id,
            class: panelClasses,
            children: [
                headerConfig,
                this.contentElement
            ]
        });

        // Allow subclasses to populate content
    //    this.populateContent();
    }

    /**
     * Subclasses override this to add their specific content to this.contentElement.
     */
    populateContent() {
        // Override in subclass
    }

    getElement() {
        return this.element;
    }

    toggleCollapse() {
        if (!this.options.collapsible) return;
        this.isCollapsed = !this.isCollapsed;
        this.element.classList.toggle('collapsed', this.isCollapsed);
        this.eventEmitter.emit('panelStateChanged', { id: this.id, collapsed: this.isCollapsed });
    }

    setContent(elements) {
        HTML.clear(this.contentElement);
        HTML.add(this.contentElement, elements);
    }
}