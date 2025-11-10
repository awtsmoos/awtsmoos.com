// B"H
import * as THREE from 'three';
import { HTML } from '../Core/HTML.js';
import { BasePanel } from './BasePanel.js';
import { Utils } from '../Core/Utils.js';
import { Track } from '../Timeline/Track.js';
import { SetPropertyCommand } from '../History/Commands/SetPropertyCommand.js'; // Make sure this import exists

export class PropertiesPanel extends BasePanel {
    constructor(eventEmitter, objectManager, timelineManager, historyManager) {
        super('properties-panel', 'Properties', eventEmitter);
        this.objectManager = objectManager;
        this.timelineManager = timelineManager;
        this.historyManager = historyManager; // <-- Add historyManager
        this.currentSelectionUUIDs = [];
        this.boundUpdateFields = Utils.debounce(this._updateFields.bind(this), 50);

        this.populateContent();

        this.eventEmitter.on('selectionChanged', this.handleSelectionChange.bind(this));
        this.eventEmitter.on('objectTransformed', this.boundUpdateFields);
        this.eventEmitter.on('timeChanged', () => this.updateProperties()); // Force full redraw on time change to update keyframe buttons
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
            this.populateContent();
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

    displaySingleObjectProperties(object) {
        const content = [];

        content.push(this._createPropertyGroup('Object', [
            this._createTextInput(object, 'name', 'Name')
        ]));

        content.push(this._createPropertyGroup('Transform', [
            this._createVector3Input(object, 'position', 'Position'),
            this._createVector3Input(object, 'rotation', 'Rotation'),
            this._createVector3Input(object, 'scale', 'Scale'),
        ]));

        if (object.material) {
            const mat = object.material;
            const matProps = [];
            if (mat.color !== undefined) matProps.push(this._createColorInput(object, 'color', 'Color', 'material'));
            if (mat.opacity !== undefined) matProps.push(this._createNumberInput(object, 'opacity', 'Opacity', 'material', { min: 0, max: 1, step: 0.01 }));
            if (matProps.length > 0) {
                content.push(this._createPropertyGroup(`Material (${mat.type})`, matProps));
            }
        }

        this.setContent(content);
    }
    
    displayMultiSelectProperties() {
        this.setContent(HTML.create({ tag: 'div', text: `${this.currentSelectionUUIDs.length} objects selected. Multi-edit TBD.` }));
    }

    _createPropertyGroup(title, children) {
        return HTML.create({tag: 'div', class: 'property-group', children: [
            HTML.create({tag: 'h4', class: 'property-group-title', text: title}),
            ...children
        ]});
    }

    _createKeyframeButton(objectUUID, propertyPath) {
        const layer = this.timelineManager.getLayer(objectUUID);
        const track = layer?.getTrack(propertyPath);
        const hasKeyframe = track?.getKeyframeAt(this.timelineManager.getCurrentTime()) !== null;

        return HTML.create({
            tag: 'button',
            class: ['keyframe-btn', hasKeyframe ? 'active' : ''],
            text: '◆',
            title: `Add/Remove Keyframe for ${propertyPath}`,
            on: {
                click: () => {
                    const object = this.objectManager.getObjectByUUID(objectUUID);
                    const value = Track.getObjectPropertyValue(object, propertyPath);
                    if (value !== undefined) {
                        this.eventEmitter.emit('createKeyframeRequest', {
                            objectUUID,
                            propertyPath,
                            value: value
                        });
                    }
                }
            }
        });
    }

    _createVector3Input(object, property, label) {
        const value = object[property] || new THREE.Vector3();
        const createInput = (axis) => HTML.create({
            tag: 'input',
            attrs: { type: 'number', step: '0.01', 'data-axis': axis, 'data-path': `${property}.${axis}`, value: value[axis].toFixed(3) },
            on: { change: (e) => this._handleInputChange(e, object.uuid) }
        });

        return HTML.create({ tag: 'div', class: 'property-item vector-item', children: [
            HTML.create({ tag: 'label', text: label }),
            createInput('x'),
            createInput('y'),
            createInput('z'),
            this._createKeyframeButton(object.uuid, property)
        ]});
    }

    _createTextInput(object, property, label) {
        return HTML.create({ tag: 'div', class: 'property-item', children: [
            HTML.create({ tag: 'label', text: label }),
            HTML.create({ tag: 'input', attrs: { type: 'text', 'data-path': property, value: object[property] || '' }, on: { change: (e) => this._handleInputChange(e, object.uuid) } })
        ]});
    }
    
    _createNumberInput(object, property, label, pathPrefix = '', attrs = {}) {
        const fullPath = `${pathPrefix}.${property}`;
        const value = Track.getObjectPropertyValue(object, fullPath);
        return HTML.create({ tag: 'div', class: 'property-item', children: [
            HTML.create({ tag: 'label', text: label }),
            HTML.create({ tag: 'input', attrs: { type: 'number', step: '0.01', 'data-path': fullPath, value: value, ...attrs }, on: { change: (e) => this._handleInputChange(e, object.uuid) } }),
            this._createKeyframeButton(object.uuid, fullPath)
        ]});
    }

    _createColorInput(object, property, label, pathPrefix = '') {
        const fullPath = `${pathPrefix}.${property}`;
        const value = Track.getObjectPropertyValue(object, fullPath) || new THREE.Color(0xffffff);
        return HTML.create({ tag: 'div', class: 'property-item', children: [
            HTML.create({ tag: 'label', text: label }),
            HTML.create({ tag: 'input', attrs: { type: 'color', 'data-path': fullPath, value: `#${value.getHexString()}` }, on: { input: (e) => this._handleInputChange(e, object.uuid) } }),
            this._createKeyframeButton(object.uuid, fullPath)
        ]});
    }

    _handleInputChange(event, objectUUID) {
        const input = event.target;
        const path = input.getAttribute('data-path');
        if (!path) return;

        const object = this.objectManager.getObjectByUUID(objectUUID);
        if (!object) return;

        const oldValue = Track.getObjectPropertyValue(object, path)?.clone ? Track.getObjectPropertyValue(object, path).clone() : Track.getObjectPropertyValue(object, path);
        
        let newValue;
        if (input.type === 'number') newValue = parseFloat(input.value);
        else if (input.type === 'color') newValue = new THREE.Color(input.value);
        else newValue = input.value;

        const command = new SetPropertyCommand(this.eventEmitter, objectUUID, path, oldValue, newValue);
        this.historyManager.add(command);
    }
    
    _updateFields() {
        if (this.currentSelectionUUIDs.length !== 1) return;
        const object = this.objectManager.getObjectByUUID(this.currentSelectionUUIDs[0]);
        if (!object) return;

        const inputs = this.contentElement.querySelectorAll('input[data-path]');
        inputs.forEach(input => {
            if (document.activeElement === input) return; // Don't update if user is typing
            const path = input.getAttribute('data-path');
            const currentValue = Track.getObjectPropertyValue(object, path);
            
            if (currentValue !== undefined) {
                if (input.type === 'number') {
                    input.value = currentValue.toFixed(3);
                } else if (input.type === 'color' && currentValue instanceof THREE.Color) {
                    input.value = `#${currentValue.getHexString()}`;
                } else {
                    input.value = currentValue;
                }
            }
        });
    }
}