// B"H
import { HTML } from '../Core/HTML.js';
import { BasePanel } from './BasePanel.js'; // Use BasePanel structure if desired

export class Toolbar {
    constructor(eventEmitter, historyManager, objectManager) {
        this.eventEmitter = eventEmitter;
        this.historyManager = historyManager; // Need direct reference? Or just events? Use events.
        this.objectManager = objectManager;

        this.element = null;
        this.buttons = {}; // Store button elements
        this.isMultiSelectActive = false; // Track state locally for button text

        this._createElement();
        this._setupEventListeners();
    }

    _createElement() {
        // --- ADD ALL PRIMITIVE OPTIONS ---
        const primitiveOptions = ['Box', 'Sphere', 'Plane', 'Cylinder', 'Cone', 'Torus']
            .map(type => ({ tag: 'option', attrs: { value: type }, text: type }));

        this.buttons.undo = HTML.create({ tag: 'button', id: 'btn-undo', text: 'Undo', attrs: { disabled: true } });
        this.buttons.redo = HTML.create({ tag: 'button', id: 'btn-redo', text: 'Redo', attrs: { disabled: true } });
        this.buttons.createPrimitive = HTML.create({ tag: 'button', id: 'btn-create', text: 'Add' }); // Shorter name
        this.buttons.primitiveSelect = HTML.create({ tag: 'select', id: 'select-primitive', children: primitiveOptions }); // Corrected children
        this.buttons.loadGLB = HTML.create({ tag: 'button', id: 'btn-load-glb', text: 'Load GLB' });
        this.buttons.group = HTML.create({ tag: 'button', id: 'btn-group', text: 'Group (Parent)', attrs: { disabled: true } }); // Clarify Grouping
        this.buttons.ungroup = HTML.create({ tag: 'button', id: 'btn-ungroup', text: 'Ungroup', attrs: { disabled: true } });
        this.buttons.delete = HTML.create({ tag: 'button', id: 'btn-delete', text: 'Delete', attrs: { disabled: true } });
        // Default text reflects initial state (OFF)
        this.buttons.multiSelect = HTML.create({ tag: 'button', id: 'btn-multi-select', text: 'Multi-Select: OFF' });

        // Transform modes
        this.buttons.translate = HTML.create({ tag: 'button', id: 'btn-translate', text: 'Move (G)', class: 'active'}); // Default active
        this.buttons.rotate = HTML.create({ tag: 'button', id: 'btn-rotate', text: 'Rotate (R)' });
        this.buttons.scale = HTML.create({ tag: 'button', id: 'btn-scale', text: 'Scale (S)' });

        this.element = HTML.create({
            tag: 'div',
            id: 'toolbar',
            class: 'panel top', // Added 'top' class assuming it's styled that way
            children: [
                this.buttons.undo,
                this.buttons.redo,
                HTML.create({ tag: 'span', class:'separator'}),
                this.buttons.createPrimitive,
                this.buttons.primitiveSelect,
                this.buttons.loadGLB,
                HTML.create({ tag: 'span', class:'separator'}),
                this.buttons.group,
                this.buttons.ungroup,
                this.buttons.delete,
                 this.buttons.multiSelect,
                 HTML.create({ tag: 'span', class:'separator'}),
                 this.buttons.translate,
                 this.buttons.rotate,
                 this.buttons.scale,
            ]
        });

        // Add basic separator style if not in CSS
        this.element.querySelectorAll('.separator').forEach(el => {
            el.style.margin = '0 8px';
            el.style.borderLeft = '1px solid #555';
            el.style.display = 'inline-block';
            el.style.height = '20px';
            el.style.verticalAlign = 'middle';
        });
    }

     _setupEventListeners() {
         this.eventEmitter.on('historyChanged', this.updateHistoryButtons.bind(this));

        this.buttons.createPrimitive.addEventListener('click', () => {
            const type = this.buttons.primitiveSelect.value;
            this.eventEmitter.emit('createPrimitiveRequest', type); // Pass selected type
        });

        // loadGLB listener seems okay

         this.buttons.group.addEventListener('click', () => this.eventEmitter.emit('groupSelectedRequest'));
         this.buttons.ungroup.addEventListener('click', () => this.eventEmitter.emit('ungroupSelectedRequest'));
         this.buttons.delete.addEventListener('click', () => this.eventEmitter.emit('deleteSelectedRequest'));

         // Multi-Select Toggle
         this.buttons.multiSelect.addEventListener('click', () => {
             this.isMultiSelectActive = !this.isMultiSelectActive; // Toggle state
             this.buttons.multiSelect.classList.toggle('active', this.isMultiSelectActive);
             this.buttons.multiSelect.textContent = `Multi-Select: ${this.isMultiSelectActive ? 'ON' : 'OFF'}`;
             this.eventEmitter.emit('toggleMultipleSelection', this.isMultiSelectActive); // Emit state change
         });

         // Transform Modes listeners seem okay

         this.eventEmitter.on('selectionChanged', (selectedUUIDs) => {
             const count = selectedUUIDs.length;
             this.buttons.delete.disabled = count === 0;
             this.buttons.group.disabled = count < 2;

             // Can ungroup only if exactly one object is selected AND it has selectable children
             if (count === 1) {
                 const obj = this.objectManager.getObjectByUUID(selectedUUIDs[0]);
                 // Check if it has any children that are marked selectable by the object manager
                 const hasSelectableChildren = obj && obj.children.some(child => child.userData?.isSelectable);
                 this.buttons.ungroup.disabled = !hasSelectableChildren;
             } else {
                 this.buttons.ungroup.disabled = true;
             }
         });
         
         
         
         

const transformButtons = [this.buttons.translate, this.buttons.rotate, this.buttons.scale];
const setTransformMode = (mode, clickedButton) => {
    this.eventEmitter.emit('setTransformMode', mode);
    transformButtons.forEach(button => {
        button.classList.toggle('active', button === clickedButton);
    });
};

this.buttons.translate.addEventListener('click', (e) => setTransformMode('translate', e.currentTarget));
this.buttons.rotate.addEventListener('click', (e) => setTransformMode('rotate', e.currentTarget));
this.buttons.scale.addEventListener('click', (e) => setTransformMode('scale', e.currentTarget));
// --- END OF NEW BLOCK ---

this.eventEmitter.on('selectionChanged', (selectedUUIDs) => {
    // ... the rest of the method is correct
     }

     updateHistoryButtons({ canUndo, canRedo }) {
         this.buttons.undo.disabled = !canUndo;
         this.buttons.redo.disabled = !canRedo;
     }

    getElement() {
        return this.element;
    }
}