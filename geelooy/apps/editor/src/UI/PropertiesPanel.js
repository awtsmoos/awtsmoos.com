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
        this.historyManager = historyManager;
        this.currentSelectionUUIDs = [];
        // Debounce the field update function to prevent excessive updates during transformations
        this.boundUpdateFields = Utils.debounce(this._updateFields.bind(this), 100);

        this.populateContent();

        // Listen for events that require the panel to update
        this.eventEmitter.on('selectionChanged', this.handleSelectionChange.bind(this));
        this.eventEmitter.on('objectTransformed', this.boundUpdateFields);
        this.eventEmitter.on('timelineDataChanged', () => this.updateProperties());
        this.eventEmitter.on('timeChanged', () => this.updateProperties()); // Update keyframe buttons
    }

    populateContent() {
        this.setContent(HTML.create({ tag: 'div', class: 'properties-placeholder', text: 'Select an object to see its properties.' }));
    }

    handleSelectionChange(selectedUUIDs) {
        this.currentSelectionUUIDs = selectedUUIDs || [];
        this.updateProperties();
    }

    updateProperties() {
        HTML.clear(this.contentElement);
        if (this.currentSelectionUUIDs.length !== 1) {
            const text = this.currentSelectionUUIDs.length > 1 ? `${this.currentSelectionUUIDs.length} objects selected.` : 'Select an object.';
            this.setContent(HTML.create({ tag: 'div', class: 'properties-placeholder', text: text }));
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
            this._createVector3Input(object, 'rotation', 'Rotation', true), // isEuler = true
            this._createVector3Input(object, 'scale', 'Scale'),
        ]));

        if (object.material && object.material.isMaterial) {
            const matProps = [];
            if (object.material.color !== undefined) matProps.push(this._createColorInput(object, 'material.color', 'Color'));
            if (object.material.opacity !== undefined) matProps.push(this._createNumberInput(object, 'material.opacity', 'Opacity', { min: 0, max: 1, step: 0.01 }));
            if (object.material.roughness !== undefined) matProps.push(this._createNumberInput(object, 'material.roughness', 'Roughness', { min: 0, max: 1, step: 0.01 }));
            if (object.material.metalness !== undefined) matProps.push(this._createNumberInput(object, 'material.metalness', 'Metalness', { min: 0, max: 1, step: 0.01 }));
            if (matProps.length > 0) {
                 content.push(this._createPropertyGroup(`Material (${object.material.type})`, matProps));
            }
        }
        this.setContent(content);
    }

    _createPropertyGroup(title, children) {
        return HTML.create({ tag: 'div', class: 'property-group', children: [
            HTML.create({ tag: 'h4', class: 'property-group-title', text: title }),
            HTML.create({ tag: 'div', class: 'property-group-content', children })
        ]});
    }

    _createKeyframeButton(object, propertyPath) {
        const layer = this.timelineManager.getLayer(object.uuid);
        const hasKeyframe = layer?.getTrack(propertyPath)?.getKeyframeAt(this.timelineManager.currentTime) !== null;
        return HTML.create({
            tag: 'button',
            //  Add the diamond character as text content **
            text: '◆',
            class: ['keyframe-btn', hasKeyframe ? 'active' : ''],
            title: `Keyframe ${propertyPath}`,
            on: { click: () => {
                const value = Track.getObjectPropertyValue(object, propertyPath);
                if (value !== undefined) {
                    this.eventEmitter.emit('createKeyframeRequest', { objectUUID: object.uuid, propertyPath, value });
                }
            }}
        });
    }

    _createVector3Input(object, property, label, isEuler = false) {
        const value = object[property];
        const step = isEuler ? '1' : '0.1';
        const toDegrees = (rad) => rad * (180 / Math.PI);
        const toRadians = (deg) => deg * (Math.PI / 180);

        const createRow = (axis) => {
            const path = `${property}.${axis}`;
            const axisValue = isEuler ? toDegrees(value[axis]).toFixed(1) : value[axis].toFixed(2);
            const input = HTML.create({ tag: 'input', attrs: { type: 'number', step, 'data-path': path, value: axisValue }});

            return HTML.create({
                tag: 'div', class: 'property-item sub-item', children: [
                    this._createKeyframeButton(object, path),
                    HTML.create({ tag: 'label', text: axis.toUpperCase() }),
                    input
                ]
            });
        };

        const onInputChange = (e) => {
            const container = e.target.closest('.property-group-content');
            const inputs = container.querySelectorAll(`[data-path^="${property}."]`);
            
            const oldValue = value.clone();
            let x = parseFloat(inputs[0].value);
            let y = parseFloat(inputs[1].value);
            let z = parseFloat(inputs[2].value);

            const newValue = isEuler
                ? new THREE.Euler(toRadians(x), toRadians(y), toRadians(z), value.order)
                : new THREE.Vector3(x, y, z);
            
            const command = new SetPropertyCommand(this.eventEmitter, object.uuid, property, oldValue, newValue);
            this.historyManager.add(command);
        };

        const mainLabel = HTML.create({ tag: 'div', class: 'property-item-header', text: label });
        const rowsContainer = HTML.create({ tag: 'div', class: 'vector-rows', on: { change: onInputChange }});
        HTML.add(rowsContainer, [createRow('x'), createRow('y'), createRow('z')]);

        return HTML.create({ tag: 'div', class: 'property-item-compound', children: [mainLabel, rowsContainer] });
    }

    _createNumberInput(object, path, label, attrs = {}) {
        const value = Track.getObjectPropertyValue(object, path);
        // ** FIX: Add the keyframe button directly here **
        return HTML.create({
            tag: 'div', class: 'property-item', children: [
                this._createKeyframeButton(object, path),
                HTML.create({ tag: 'label', text: label }),
                HTML.create({
                    tag: 'input',
                    attrs: { type: 'number', 'data-path': path, value: parseFloat(value).toFixed(3), ...attrs },
                    on: { change: (e) => this._handleValueChange(e, object.uuid) }
                }),
            ]
        });
    }

    _createColorInput(object, path, label) {
        const value = Track.getObjectPropertyValue(object, path) || new THREE.Color(0xffffff);
         // ** FIX: Add the keyframe button directly here **
        return HTML.create({
            tag: 'div', class: 'property-item', children: [
                this._createKeyframeButton(object, path),
                HTML.create({ tag: 'label', text: label }),
                HTML.create({
                    tag: 'input',
                    attrs: { type: 'color', 'data-path': path, value: `#${value.getHexString()}` },
                    on: { input: (e) => this._handleValueChange(e, object.uuid) }
                }),
            ]
        });
    }
    
    _handleValueChange(event, objectUUID) {
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

        this.contentElement.querySelectorAll('div.property-item').forEach(item => {
            const pathAttr = item.querySelector('input[data-path]');
            if (pathAttr) { // Handle single value inputs (color, number)
                const input = pathAttr;
                if (document.activeElement === input) return;
                const path = input.getAttribute('data-path');
                const value = Track.getObjectPropertyValue(object, path);
                if (value !== undefined) {
                    if (input.type === 'number') input.value = value.toFixed(3);
                    else if (input.type === 'color' && value.isColor) input.value = `#${value.getHexString()}`;
                }
            } else { // Handle vector inputs
                const property = item.dataset.property;
                if (property && object[property]) {
                    const isEuler = object[property].isEuler;
                    const inputs = item.querySelectorAll('input');
                    if (document.activeElement === inputs[0] || document.activeElement === inputs[1] || document.activeElement === inputs[2]) return;
                    
                    const toDegrees = (rad) => rad * (180 / Math.PI);
                    const getValue = (axis) => isEuler ? toDegrees(object[property][axis]).toFixed(1) : object[property][axis].toFixed(2);

                    inputs[0].value = getValue('x');
                    inputs[1].value = getValue('y');
                    inputs[2].value = getValue('z');
                }
            }
        });
    }
}