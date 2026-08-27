// B"H
import { HTML } from '../Core/HTML.js';

export class Toolbar {
    constructor(eventEmitter, historyManager, objectManager) {
        this.eventEmitter = eventEmitter;
        this.historyManager = historyManager;
        this.objectManager = objectManager;

        this.element = null;
        this.buttons = {};
        this.objectModeToolbar = null;
        this.editModeToolbar = null;
        this.isInEditMode = false;

        this._createElement();
        this._setupEventListeners();
    }

    _createElement() {
        // --- Object Mode Buttons ---
        const objectModeButtons = [
            HTML.create({ tag: 'button', id: 'btn-undo', text: 'Undo', attrs: { disabled: true, title: 'Ctrl+Z' } }),
            HTML.create({ tag: 'button', id: 'btn-redo', text: 'Redo', attrs: { disabled: true, title: 'Ctrl+Y' } }),
            HTML.create({ tag: 'span', class:'separator'}),
            HTML.create({ tag: 'button', id: 'btn-create', text: 'Add', attrs: { title: 'Shift+A' } }),
            HTML.create({ tag: 'select', id: 'select-primitive', children: ['Box', 'Sphere', 'Plane', 'Cylinder', 'Cone', 'Torus'].map(type => ({ tag: 'option', attrs: { value: type }, text: type }))}),
            HTML.create({ tag: 'button', id: 'btn-load-glb', text: 'Load GLB' }),
            HTML.create({ tag: 'button', id: 'btn-export-glb', text: 'Export GLB', attrs: { disabled: true } }),
            HTML.create({ tag: 'span', class:'separator'}),
            HTML.create({ tag: 'button', id: 'btn-group', text: 'Parent', attrs: { disabled: true, title: 'Ctrl+P' } }),
            HTML.create({ tag: 'button', id: 'btn-ungroup', text: 'Unparent', attrs: { disabled: true, title: 'Alt+P' } }),
            HTML.create({ tag: 'button', id: 'btn-delete', text: 'Delete', attrs: { disabled: true, title: 'Del/Backspace' } }),
        ];
        this.objectModeToolbar = HTML.create({tag: 'div', class: 'toolbar-section', children: objectModeButtons });

        // --- B"H: Edit Mode Buttons Updated ---
        const editModeButtons = [
            HTML.create({ tag: 'button', id: 'btn-edit-vertex', text: 'Vertex (1)', class: 'active' }),
            HTML.create({ tag: 'button', id: 'btn-edit-edge', text: 'Edge (2)' }),
            HTML.create({ tag: 'button', id: 'btn-edit-face', text: 'Face (3)' }),
            HTML.create({ tag: 'span', class:'separator'}),
            HTML.create({ tag: 'button', id: 'btn-subdivide', text: 'Subdivide', attrs: { disabled: true } }),
        ];
        this.editModeToolbar = HTML.create({tag: 'div', class: 'toolbar-section', style: { display: 'none' }, children: editModeButtons });

        // --- Common Buttons (Visible in both modes) ---
        const commonButtons = [
             HTML.create({ tag: 'button', id: 'btn-toggle-edit-mode', text: 'Object Mode', attrs: { disabled: true } }),
             HTML.create({ tag: 'span', class:'separator'}),
             HTML.create({ tag: 'button', id: 'btn-translate', text: 'Move (G)', class: 'active'}),
             HTML.create({ tag: 'button', id: 'btn-rotate', text: 'Rotate (R)' }),
             HTML.create({ tag: 'button', id: 'btn-scale', text: 'Scale (S)' }),
             HTML.create({ tag: 'span', class:'separator'}),
             HTML.create({ tag: 'button', id: 'btn-multi-select', text: 'Sticky Multi-Select' }),
        ];

        this.element = HTML.create({
            tag: 'div', id: 'toolbar', class: 'panel top',
            children: [
                this.objectModeToolbar,
                this.editModeToolbar,
                HTML.create({tag: 'div', class: 'toolbar-section', children: commonButtons })
            ]
        });
        
        this.element.querySelectorAll('button[id], select[id]').forEach(el => {
            let key = el.id.replace(/^(btn|select)-/, '');
            key = key.replace(/-([a-z])/g, g => g[1].toUpperCase());
            if (key) this.buttons[key] = el;
        });
    }

    _setupEventListeners() {
	    this.eventEmitter.on('historyChanged', this.updateHistoryButtons.bind(this));
	    this.eventEmitter.on('selectionChanged', this.updateSelectionBasedButtons.bind(this));
	    this.eventEmitter.on('transformModeChanged', this.updateTransformButtons.bind(this));
	    this.eventEmitter.on('editModeEntered', () => this.setMode('edit'));
	    this.eventEmitter.on('editModeExited', () => this.setMode('object'));
	    this.eventEmitter.on('editSelectionModeChanged', this.updateEditModeButtons.bind(this));
	    
	    this.buttons.toggleEditMode.addEventListener('click', () => this.eventEmitter.emit('toggleEditModeRequest'));
	    this.buttons.create.addEventListener('click', () => this.eventEmitter.emit('createPrimitiveRequest', this.buttons.primitive.value));
	    this.buttons.loadGlb.addEventListener('click', this._handleLoadGLB.bind(this));
	    this.buttons.exportGlb.addEventListener('click', () => this.eventEmitter.emit('exportGLBRequest'));
	    this.buttons.group.addEventListener('click', () => this.eventEmitter.emit('groupSelectedRequest'));
	    this.buttons.ungroup.addEventListener('click', () => this.eventEmitter.emit('ungroupSelectedRequest'));
	    this.buttons.delete.addEventListener('click', () => this.eventEmitter.emit('deleteSelectedRequest'));
	    this.buttons.multiSelect.addEventListener('click', this._toggleMultiSelect.bind(this));
	    
	    // B"H FIX: Add the missing click listener for the subdivide button
	    if (this.buttons.subdivide) {
	        this.buttons.subdivide.addEventListener('click', () => this.eventEmitter.emit('subdivideRequest'));
	    }
	    
	    const setTransformMode = (mode) => this.eventEmitter.emit('setTransformMode', mode);
	    this.buttons.translate.addEventListener('click', () => setTransformMode('translate'));
	    this.buttons.rotate.addEventListener('click', () => setTransformMode('rotate'));
	    this.buttons.scale.addEventListener('click', () => setTransformMode('scale'));
	
	    const setEditSelectionMode = (mode) => this.eventEmitter.emit('setEditSelectionMode', mode);
	    this.buttons.editVertex.addEventListener('click', () => setEditSelectionMode('VERTEX'));
	    this.buttons.editEdge.addEventListener('click', () => setEditSelectionMode('EDGE'));
	    this.buttons.editFace.addEventListener('click', () => setEditSelectionMode('FACE'));
	}
    
    _handleLoadGLB() {
        const fileInput = HTML.create({ tag: 'input', attrs: { type: 'file', accept: '.glb,.gltf' }, style: { display: 'none' }, on: { change: (e) => {
            const file = e.target.files[0];
            if (file) this.eventEmitter.emit('loadGLBRequest', URL.createObjectURL(file));
            document.body.removeChild(fileInput);
        }}});
        document.body.appendChild(fileInput); fileInput.click();
    }
    
    _toggleMultiSelect() {
        const isActive = this.buttons.multiSelect.classList.toggle('active');
        this.eventEmitter.emit('toggleMultipleSelection', isActive);
    }
     
    updateHistoryButtons({ canUndo, canRedo }) {
        if(this.buttons.undo) this.buttons.undo.disabled = !canUndo;
        if(this.buttons.redo) this.buttons.redo.disabled = !canRedo;
    }

    
	updateSelectionBasedButtons(selectedUUIDs) {
    if (this.isInEditMode) {
        this.buttons.toggleEditMode.disabled = false;
        
        // B"H FIX: Enable subdivide button if any implicit or explicit faces are selected
        const em = window.MWA.editModeManager;
        const selectedFaces = em._getCurrentlySelectedFaces();
        const canSubdivide = em.isActive && selectedFaces.size > 0;
        if (this.buttons.subdivide) this.buttons.subdivide.disabled = !canSubdivide;

    } else {
        const count = selectedUUIDs.length;
        const canEnterEditMode = count === 1 && this.objectManager.getObjectByUUID(selectedUUIDs[0])?.isMesh;
        this.buttons.toggleEditMode.disabled = !canEnterEditMode;

        if(this.buttons.delete) this.buttons.delete.disabled = count === 0;
        if(this.buttons.exportGlb) this.buttons.exportGlb.disabled = count !== 1;
        if(this.buttons.group) this.buttons.group.disabled = count < 2;

        const selectedObjects = this.objectManager.getObjectsByIds(selectedUUIDs);
        const canUngroup = selectedObjects.some(obj => obj.parent && obj.parent !== this.objectManager.scene);
        if(this.buttons.ungroup) this.buttons.ungroup.disabled = !canUngroup;
        
        if(this.buttons.subdivide) this.buttons.subdivide.disabled = true;
    }
}

    updateTransformButtons(mode) {
        this.buttons.translate.classList.toggle('active', mode === 'translate');
        this.buttons.rotate.classList.toggle('active', mode === 'rotate');
        this.buttons.scale.classList.toggle('active', mode === 'scale');
    }
    
    // B"H: New method to update edit mode button highlights
    updateEditModeButtons(mode) {
        this.buttons.editVertex.classList.toggle('active', mode === 'VERTEX');
        this.buttons.editEdge.classList.toggle('active', mode === 'EDGE');
        this.buttons.editFace.classList.toggle('active', mode === 'FACE');
    }

    setMode(mode) {
        this.isInEditMode = (mode === 'edit');
        if (this.isInEditMode) {
            this.objectModeToolbar.style.display = 'none';
            this.editModeToolbar.style.display = 'flex';
            this.buttons.toggleEditMode.textContent = 'Edit Mode';
            this.buttons.toggleEditMode.classList.add('active');
            this.buttons.toggleEditMode.disabled = false;
        } else {
            this.objectModeToolbar.style.display = 'flex';
            this.editModeToolbar.style.display = 'none';
            this.buttons.toggleEditMode.textContent = 'Object Mode';
            this.buttons.toggleEditMode.classList.remove('active');
            this.updateSelectionBasedButtons(this.objectManager.getSelectedObjectUUIDs());
        }
    }

    getElement() { return this.element; }
}