// B"H
import * as THREE from 'three';
import { HTML } from '../Core/HTML.js';
import { BasePanel } from './BasePanel.js';
import { Utils } from '../Core/Utils.js';
import { Track } from '../Timeline/Track.js';
import { SetPropertyCommand } from '../History/Commands/SetPropertyCommand.js';

export class PropertiesPanel extends BasePanel {
    constructor(eventEmitter, objectManager, timelineManager, historyManager) {
        super('properties-panel', 'Properties', eventEmitter);
        this.objectManager = objectManager;
        this.timelineManager = timelineManager;
        this.historyManager = historyManager; // Now correctly passed
        this.currentSelectionUUIDs = [];
        this.boundUpdateFields = Utils.debounce(this._updateFields.bind(this), 50);

        this.populateContent();

        this.eventEmitter.on('selectionChanged', this.handleSelectionChange.bind(this));
        this.eventEmitter.on('objectTransformed', this.boundUpdateFields);
        // Redraw everything on time change to correctly update keyframe button states
        this.eventEmitter.on('timeChanged', () => this.updateProperties());
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
        if (this.currentSelectionUUIDs.length !== 1) {
            this.setContent(HTML.create({ tag: 'div', text: this.currentSelectionUUIDs.length > 1 ? `${this.currentSelectionUUIDs.length} objects selected.` : 'Select an object.' }));
            return;
        }
        const object = this.objectManager.getObjectByUUID(this.currentSelectionUUIDs[0]);
        if (object) {
            this.displaySingleObjectProperties(object);
        }
    }

    displaySingleObjectProperties(object) {
        const content = [];
        content.push(this._createPropertyGroup('Transform', [
            this._createVector3Input(object, 'position', 'Position'),
            this._createVector3Input(object, 'rotation', 'Rotation'),
            this._createVector3Input(object, 'scale', 'Scale'),
        ]));

        if (object.material) {
            const matProps = [];
            if (object.material.color !== undefined) matProps.push(this._createColorInput(object, 'material.color', 'Color'));
            if (object.material.opacity !== undefined) matProps.push(this._createNumberInput(object, 'material.opacity', 'Opacity', { min: 0, max: 1, step: 0.01 }));
            if (object.material.roughness !== undefined) matProps.push(this._createNumberInput(object, 'material.roughness', 'Roughness', { min: 0, max: 1, step: 0.01 }));
            if (object.material.metalness !== undefined) matProps.push(this._createNumberInput(object, 'material.metalness', 'Metalness', { min: 0, max: 1, step: 0.01 }));
            content.push(this._createPropertyGroup(`Material (${object.material.type})`, matProps));
        }
        this.setContent(content);
    }

    _createPropertyGroup(title, children) {
        return HTML.create({ tag: 'div', class: 'property-group', children: [
            HTML.create({ tag: 'h4', class: 'property-group-title', text: title }),
            ...children
        ]});
    }

    _createKeyframeButton(object, propertyPath) {
        const layer = this.timelineManager.getLayer(object.uuid);
        const hasKeyframe = layer?.getTrack(propertyPath)?.getKeyframeAt(this.timelineManager.getCurrentTime()) !== null;
        return HTML.create({
            tag: 'button', class: ['keyframe-btn', hasKeyframe ? 'active' : ''], text: '◆',
            on: { click: () => {
                const value = Track.getObjectPropertyValue(object, propertyPath);
                if (value !== undefined) {
                    this.eventEmitter.emit('createKeyframeRequest', { objectUUID: object.uuid, propertyPath, value });
                }
            }}
        });
    }

    _createVector3Input(object, property, label) {
        const value = object[property] || new THREE.Vector3();
        const createInput = (axis) => HTML.create({
            tag: 'input', attrs: { type: 'number', step: '0.01', 'data-path': `${property}.${axis}`, value: value[axis].toFixed(3) },
            on: { change: (e) => this._handleInputChange(e, object.uuid) }
        });
        return HTML.create({ tag: 'div', class: 'property-item vector-item', children: [
            HTML.create({ tag: 'label', text: label }), createInput('x'), createInput('y'), createInput('z'), this._createKeyframeButton(object, property)
        ]});
    }

    _createNumberInput(object, path, label, attrs = {}) {
        const value = Track.getObjectPropertyValue(object, path);
        return HTML.create({ tag: 'div', class: 'property-item', children: [
            HTML.create({ tag: 'label', text: label }),
            HTML.create({ tag: 'input', attrs: { type: 'number', 'data-path': path, value: value, ...attrs }, on: { change: (e) => this._handleInputChange(e, object.uuid) } }),
            this._createKeyframeButton(object, path)
        ]});
    }

    _createColorInput(object, path, label) {
        const value = Track.getObjectPropertyValue(object, path) || new THREE.Color(0xffffff);
        return HTML.create({ tag: 'div', class: 'property-item', children: [
            HTML.create({ tag: 'label', text: label }),
            HTML.create({ tag: 'input', attrs: { type: 'color', 'data-path': path, value: `#${value.getHexString()}` }, on: { input: (e) => this._handleInputChange(e, object.uuid) } }),
            this._createKeyframeButton(object, path)
        ]});
    }

    _handleInputChange(event, objectUUID) {
        const input = event.target;
        const path = input.getAttribute('data-path');
        if (!path) return;
        const object = this.objectManager.getObjectByUUID(objectUUID);
        if (!object) return;

        const oldValue = Track.getObjectPropertyValue(object, path);
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

        this.contentElement.querySelectorAll('input[data-path]').forEach(input => {
            if (document.activeElement === input) return;
            const path = input.getAttribute('data-path');
            const currentValue = Track.getObjectPropertyValue(object, path);
            if (currentValue !== undefined) {
                if (input.type === 'number') input.value = currentValue.toFixed(3);
                else if (input.type === 'color' && currentValue instanceof THREE.Color) input.value = `#${currentValue.getHexString()}`;
                else input.value = currentValue;
            }
        });
    }
}