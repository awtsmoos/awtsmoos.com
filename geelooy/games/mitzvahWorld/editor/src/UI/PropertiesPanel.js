// B"H
import * as THREE from 'three';
import { HTML } from '../Core/HTML.js';
import { BasePanel } from './BasePanel.js';
import { Utils } from '../Core/Utils.js'; // For debounce
import { Track } from '../Timeline/Track.js'; // For static get/set property

export class PropertiesPanel extends BasePanel {
    constructor(eventEmitter, objectManager, timelineManager) {
        super('properties-panel', 'Properties', eventEmitter);
        this.objectManager = objectManager;
        this.timelineManager = timelineManager;
        this.currentSelectionUUIDs = [];
        this.boundUpdateFields = Utils.debounce(this._updateFields.bind(this), 50); // Debounce updates during transform drag

        this.populateContent(); // <--- ADD THIS LINE HERE
        // Listen for changes
        this.eventEmitter.on('selectionChanged', this.handleSelectionChange.bind(this));
        this.eventEmitter.on('objectTransforming', this.boundUpdateFields); // Update during drag (debounced)
        this.eventEmitter.on('objectTransformed', this.boundUpdateFields); // Final update after drag/command
         this.eventEmitter.on('timelineDataChanged', this.boundUpdateFields); // Update keyframe buttons
         this.eventEmitter.on('timeChanged', this.boundUpdateFields); // Update keyframe buttons based on current time
    }

    populateContent() {
        this.setContent(HTML.create({ tag: 'div', text: 'Select an object to see its properties.' }));
    }

    handleSelectionChange(selectedUUIDs) {
        this.currentSelectionUUIDs = selectedUUIDs || [];
        this.updateProperties();
    }

    updateProperties() {
        HTML.clear(this.contentElement);

        if (this.currentSelectionUUIDs.length === 0) {
            this.setContent(HTML.create({ tag: 'div', text: 'Select an object to see its properties.' }));
            return;
        }

        if (this.currentSelectionUUIDs.length > 1) {
            this.displayMultiSelectProperties();
        } else {
            const object = this.objectManager.getObjectByUUID(this.currentSelectionUUIDs[0]);
            if (object) {
                this.displaySingleObjectProperties(object);
            } else {
                this.setContent(HTML.create({ tag: 'div', text: 'Selected object not found.' }));
            }
        }
    }

     // --- Property Field Creation ---

     _createKeyframeButton(objectUUID, propertyPath) {
        const layer = this.timelineManager.getLayer(objectUUID);
        const track = layer?.getTrack(propertyPath);
        const hasKeyframe = track?.getKeyframeAt(this.timelineManager.getCurrentTime()) !== null;

         return HTML.create({
             tag: 'button',
             class: ['keyframe-btn', hasKeyframe ? 'active' : ''],
             text: '◆', // Diamond symbol
             title: `Add/Remove Keyframe for ${propertyPath} at ${this.timelineManager.getCurrentTime().toFixed(2)}s`,
             style: { marginLeft: '5px', padding: '0 4px', fontSize: '14px', lineHeight: '1', cursor: 'pointer' },
             on: {
                 click: () => {
                     // TODO: Handle removing keyframes if 'active'
                     if (hasKeyframe) {
                         console.log("Remove keyframe TBD");
                         // Need RemoveKeyframeCommand
                         // this.eventEmitter.emit('removeKeyframeRequest', { objectUUID, propertyPath, time: this.timelineManager.getCurrentTime() });
                     } else {
                         const object = this.objectManager.getObjectByUUID(objectUUID);
                         const value = Track.getObjectPropertyValue(object, propertyPath);
                          if (value !== undefined) {
                              this.eventEmitter.emit('createKeyframeRequest', {
                                  objectUUID,
                                  propertyPath,
                                  value: value // Get current value
                              });
                          } else {
                              console.warn(`Could not get value for ${propertyPath} to create keyframe.`);
                          }
                     }
                 }
             }
         });
     }

     _createVector3Input(object, property, label, pathPrefix = '') {
        const fullPath = pathPrefix ? `${pathPrefix}.${property}` : property;
        const value = Track.getObjectPropertyValue(object, fullPath) || new THREE.Vector3();
         const createInput = (axis, val) => HTML.create({
             tag: 'input',
             attrs: { type: 'number', step: '0.01', 'data-axis': axis, 'data-path': `${fullPath}.${axis}`, value: val.toFixed(3) },
             on: { change: (e) => this._handleInputChange(e, object.uuid) }
         });

         return HTML.create({ tag: 'div', class: 'property-item', children: [
             HTML.create({ tag: 'label', text: label }),
             HTML.create({ tag: 'div', class: 'vector-input', children: [
                 createInput('x', value.x),
                 createInput('y', value.y),
                 createInput('z', value.z),
             ]}),
              this._createKeyframeButton(object.uuid, `${fullPath}.x`),
              this._createKeyframeButton(object.uuid, `${fullPath}.y`),
              this._createKeyframeButton(object.uuid, `${fullPath}.z`),
         ]});
     }

    _createTextInput(object, property, label, pathPrefix = '') {
         const fullPath = pathPrefix ? `${pathPrefix}.${property}` : property;
         const value = Track.getObjectPropertyValue(object, fullPath) || '';
         return HTML.create({ tag: 'div', class: 'property-item', children: [
             HTML.create({ tag: 'label', text: label }),
             HTML.create({ tag: 'input', attrs: { type: 'text', 'data-path': fullPath, value: value }, on: { change: (e) => this._handleInputChange(e, object.uuid) } }),
             // No keyframe button for name typically
         ]});
     }

     _createNumberInput(object, property, label, pathPrefix = '', attrs = {}) {
         const fullPath = pathPrefix ? `${pathPrefix}.${property}` : property;
         const value = Track.getObjectPropertyValue(object, fullPath);
          const inputAttrs = { type: 'number', step: '0.01', 'data-path': fullPath, value: value?.toFixed(3) ?? 0, ...attrs };
         return HTML.create({ tag: 'div', class: 'property-item', children: [
             HTML.create({ tag: 'label', text: label }),
             HTML.create({ tag: 'input', attrs: inputAttrs, on: { change: (e) => this._handleInputChange(e, object.uuid) } }),
              this._createKeyframeButton(object.uuid, fullPath),
         ]});
     }

     _createColorInput(object, property, label, pathPrefix = '') {
          const fullPath = pathPrefix ? `${pathPrefix}.${property}` : property;
          let value = Track.getObjectPropertyValue(object, fullPath);
          if (!(value instanceof THREE.Color)) value = new THREE.Color(0xffffff); // Default white

         return HTML.create({ tag: 'div', class: 'property-item', children: [
             HTML.create({ tag: 'label', text: label }),
             HTML.create({
                 tag: 'input',
                 attrs: { type: 'color', 'data-path': fullPath, value: `#${value.getHexString()}` },
                 on: { input: (e) => this._handleInputChange(e, object.uuid, 'color') } // Use input for live color update
             }),
              this._createKeyframeButton(object.uuid, `${fullPath}.r`), // Keyframe individual components?
              this._createKeyframeButton(object.uuid, `${fullPath}.g`),
              this._createKeyframeButton(object.uuid, `${fullPath}.b`),
         ]});
     }


     _createPropertyGroup(title, children) {
         return HTML.create({tag: 'div', class: 'property-group', children: [
             HTML.create({tag: 'div', class: 'property-group-title', text: title}),
             ...children
         ]});
     }

    // --- Display Logic ---

    displaySingleObjectProperties(object) {
        const content = [];

        // Basic Info
         content.push(this._createPropertyGroup('Object', [
            this._createTextInput(object, 'name', 'Name'),
            HTML.create({tag:'div', class:'property-item', children: [ // Read-only UUID
                 HTML.create({tag:'label', text: 'UUID'}),
                 HTML.create({tag:'span', text: object.uuid, style: {fontSize: '0.8em', overflowWrap: 'break-word'}})
            ]}),
             HTML.create({tag:'div', class:'property-item', children: [ // Read-only Type
                 HTML.create({tag:'label', text: 'Type'}),
                 HTML.create({tag:'span', text: object.constructor.name})
            ]})
         ]));

        // Transform
        content.push(this._createPropertyGroup('Transform', [
            this._createVector3Input(object, 'position', 'Position'),
            this._createVector3Input(object, 'rotation', 'Rotation'), // Euler in degrees maybe? Need conversion
            this._createVector3Input(object, 'scale', 'Scale'),
        ]));

        // Material (if applicable)
        if (object.material) {
             const mat = object.material;
             const matProps = [];
             if (mat.color !== undefined) matProps.push(this._createColorInput(mat, 'color', 'Color', `material`));
             if (mat.opacity !== undefined) matProps.push(this._createNumberInput(mat, 'opacity', 'Opacity', `material`, { min: 0, max: 1, step: 0.01 }));
             if (mat.roughness !== undefined) matProps.push(this._createNumberInput(mat, 'roughness', 'Roughness', `material`, { min: 0, max: 1, step: 0.01 }));
             if (mat.metalness !== undefined) matProps.push(this._createNumberInput(mat, 'metalness', 'Metalness', `material`, { min: 0, max: 1, step: 0.01 }));
             // Add more material properties as needed... (wireframe, visible, etc.)

             if (matProps.length > 0) {
                  content.push(this._createPropertyGroup(`Material (${mat.type})`, matProps));
             }
        }

        // Add more sections for Lights, Cameras, etc. based on object type

        this.setContent(content);
    }

    displayMultiSelectProperties() {
        this.setContent(HTML.create({ tag: 'div', text: `${this.currentSelectionUUIDs.length} objects selected. Multi-edit TBD.` }));
        // TODO: Implement multi-edit:
        // - Show common properties (e.g., Transform).
        // - If values differ, show '---' or similar.
        // - Changing a value should apply to ALL selected objects (needs a multi-object TransformCommand).
    }

    // --- Input Handling ---
    _handleInputChange(event, objectUUID, type = null) {
        const input = event.target;
        const path = input.getAttribute('data-path');
        let value = input.value;

        if (!path) return;

        const object = this.objectManager.getObjectByUUID(objectUUID);
        if (!object) return;

        // Prepare state for command
        // We need the state *before* the change for the command's start state
         // This is tricky because the input event fires *after* the input value changes.
         // A potential solution is to store the 'focus' value and use that as start state.
         // Or, structure the command to fetch the 'before' state from the object itself
         // right before applying the 'after' state. Let's try the latter.

         // Construct the target value based on type
        let targetValue;
         const axis = input.getAttribute('data-axis'); // For vectors

         if (axis) { // Part of a vector
             const vectorPath = path.substring(0, path.lastIndexOf('.'));
             targetValue = Track.getObjectPropertyValue(object, vectorPath)?.clone() || new THREE.Vector3(); // Clone existing vector
             targetValue[axis] = parseFloat(value);
         } else if (input.type === 'number') {
             targetValue = parseFloat(value);
         } else if (type === 'color') {
             targetValue = new THREE.Color(value);
         } else {
             targetValue = value; // Text or other types
         }


         // --- Create Command ---
         // The command needs the start state (current object state) and end state (the new targetValue)
         const startState = {
             uuid: objectUUID,
             value: Track.getObjectPropertyValue(object, path), // Get current value before change
             path: path
         };
         // If it's a vector component, the command needs the full vector start/end state
         if (axis) {
             const vectorPath = path.substring(0, path.lastIndexOf('.'));
              startState.value = Track.getObjectPropertyValue(object, vectorPath)?.clone();
              startState.path = vectorPath; // Command targets the whole vector
         }

          const endState = {
             uuid: objectUUID,
             value: targetValue,
             path: axis ? path.substring(0, path.lastIndexOf('.')) : path // Target vector or single property
         };

         // Use a dedicated command type? Or adapt TransformCommand?
         // Let's adapt TransformCommand slightly or create SetPropertyCommand
          // For simplicity, let's log for now, command structure needs care
         console.log("Property change request:", { objectUUID, path, newValue: targetValue });

         // TEMPORARY DIRECT CHANGE (replace with command)
         Track.setObjectPropertyValue(object, path, targetValue);
         this.eventEmitter.emit('objectTransformed', [object]); // Notify for redraw etc.

         // TODO: Replace direct change with Command:
         // const command = new SetPropertyCommand(this.eventEmitter, startState, endState);
         // this.historyManager.add(command);

    }

     _updateFields() {
        if (this.currentSelectionUUIDs.length !== 1) return; // Only update single selection for now
        const object = this.objectManager.getObjectByUUID(this.currentSelectionUUIDs[0]);
        if (!object) return;

         const inputs = this.contentElement.querySelectorAll('input[data-path]');
         inputs.forEach(input => {
             const path = input.getAttribute('data-path');
             const currentValue = Track.getObjectPropertyValue(object, path);
             const axis = input.getAttribute('data-axis');

             if (currentValue !== undefined) {
                 if (input.type === 'number') {
                      if (document.activeElement !== input) { // Don't update if user is typing
                        input.value = currentValue.toFixed(3);
                      }
                 } else if (input.type === 'text') {
                     if (document.activeElement !== input) {
                        input.value = currentValue;
                     }
                 } else if (input.type === 'color') {
                     if (currentValue instanceof THREE.Color) {
                          input.value = `#${currentValue.getHexString()}`;
                     }
                 }
             }
         });

         // Update keyframe buttons
         const kfButtons = this.contentElement.querySelectorAll('.keyframe-btn');
         kfButtons.forEach(btn => {
            // This requires parsing the path from the button or linking differently
            // For now, just forcing a full redraw on time change might be simpler
             this.updateProperties(); // Force full redraw to update buttons (inefficient but simple)
         });
     }
}