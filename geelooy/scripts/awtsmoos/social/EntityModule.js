// B"H
/**
 * @module EntityModule
 * @description
 * Chapter 480: The old entity manager keeps its buttons, edit flow, and view
 * links, but now it can visibly carry media from the alias vault. Root assets,
 * verses, and subsections render without changing the `/api/social` backend.
 */

import AwtsmoosSocialHandler from './AwtsmoosSocialHandler.js';
import UI from '/scripts/awtsmoos/ui/index.js';
import Awts from '../alerts.js';
import { renderStructuredMedia } from './media/renderGallery.js';

const ui = new UI();

function ensureMediaCss() {
  if (document.querySelector('link[data-bh-social-media]')) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = '/style/social/media/rendered-assets.css';
  link.dataset.bhSocialMedia = 'yes';
  document.head.appendChild(link);
}

function valueOf(entity, field) {
  const value = entity?.[field];
  if (value === undefined || value === null || value === '') return '{Empty, enter some info}';
  return typeof value === 'object' ? JSON.stringify(value) : String(value);
}

class EntityModule extends AwtsmoosSocialHandler {
  constructor(options = {}) {
    super(options.apiEndpoint, options.subPath);
    Object.assign(this, options);
    this.getFn = options.getFn || (async item => item);
    this.editableFields = options.editableFields || [];
    this.readonlyFields = options.readonlyFields || [];
    this.entityIds = options.entityIds || 'ids';
    this.viewFn = options.viewFn || (entity => {
      if (!this.viewURL) return Awts.alert('No URL specified');
      const url = this.viewURL(entity, this);
      if (typeof url !== 'string') return Awts.alert('No URL specified');
      const anchor = document.createElement('a');
      anchor.target = '_blank';
      anchor.href = url;
      anchor.click();
    });
  }

  async initialize() {
    ensureMediaCss();
    try {
      const dayuh = await this.fetchEntities(`/${this.entityType}`);
      const display = this.displayFn || this.defaultDisplayFn.bind(this);
      await display(dayuh, this.containerID, this.editHandler.bind(this));
    } catch (error) {
      this.errorFn?.call(null, error);
      console.error('B"H entity initialize failed', error);
    }
  }

  async defaultDisplayFn(dayuh, containerID, editHandler) {
    const container = document.getElementById(containerID);
    if (!container) return;
    ui.htmlAction({ html: container, properties: { innerHTML: '' } });
    const isPublic = this.viewState === 'public';
    if (!isPublic) this.renderAddButton(container);
    if (!dayuh) return this.renderMessage(container, `Server issue for ${this.entityType}`);
    if (dayuh.error) return this.renderMessage(container, `There was an error! ${JSON.stringify(dayuh.error)}`, true);
    if (!dayuh.length) return this.renderMessage(container, 'No posts yet, add one!');
    await this.renderEntities({ dayuh, container, editHandler, isPublic });
  }

  renderAddButton(container) {
    ui.html({ tag: 'button', shaym: 'addNewBtn', textContent: 'Add New', events: { click: async () => {
      if (this.createFn) await this.createFn(this);
      this.initialize();
    } }, parent: container });
  }

  renderMessage(container, textContent, error = false) {
    ui.html({ textContent, classList: error ? ['postMessage', 'error'] : ['postMessage'], parent: container });
  }

  async renderEntities({ dayuh, container, editHandler, isPublic }) {
    const entityIds = dayuh.map(entity => entity.id || entity);
    const fullDetails = await this.fetchEntities(`/${this.entityType}/details`, { method: 'POST', body: new URLSearchParams({ [this.entityIds]: JSON.stringify(entityIds) }).toString() });
    (fullDetails || []).forEach((entity, index) => this.renderEntity({ entity: { ...entity, id: entityIds[index] }, index, container, editHandler, isPublic, original: dayuh[index] }));
  }

  renderEntity({ entity, index, container, editHandler, isPublic, original }) {
    const edit = this.editableFields.map(field => this.fieldBlock(entity, field, index, editHandler, original, isPublic));
    const read = this.readonlyFields.map(field => this.fieldBlock(entity, field, index, null, original, true));
    const customHTML = typeof this.beforeHTML === 'function' ? this.beforeHTML(entity, this) : '';
    ui.html({ shaym: `entityDiv${index}`, classList: ['entity'], children: [
      customHTML ? { innerHTML: customHTML, className: 'beforeHTMl' } : null,
      { tag: 'button', textContent: 'View', events: { click: () => this.viewFn(entity, this) } },
      { innerHTML: renderStructuredMedia(entity), className: 'bh-social-entity-media' },
      ...edit,
      ...read,
      !isPublic ? { tag: 'button', textContent: 'Delete', events: { click: async () => this.deleteWithConfirm(entity.id) } } : null
    ], parent: container });
  }

  fieldBlock(entity, field, index, editHandler, original, readonly) {
    return { tag: 'div', shaym: `fieldDiv${index}${field}`, classList: ['entity-field', `field-${field}`], children: [
      { textContent: field, className: 'fieldName' },
      { textContent: valueOf(entity, field), className: 'fieldValue' },
      !readonly && editHandler ? { tag: 'button', textContent: 'Edit', events: { click: async () => this.editField({ entity, field, original, editHandler }) } } : null
    ] };
  }

  async editField({ entity, field, original, editHandler }) {
    const oldValue = entity[field] || '';
    const newValue = await Awts.prompt(`Edit ${field}:`, oldValue);
    if (newValue !== null && newValue !== oldValue) await editHandler(original, field, newValue);
    this.initialize();
  }

  async deleteWithConfirm(entityID) {
    if (!await Awts.confirm('Are you sure you want to delete this entity?')) return;
    await this.deleteEntity(`/${this.entityType}/${entityID}`);
    this.initialize();
  }

  async createEntity(data) { return super.createEntity({ entityType: this.entityType, newEntityData: data }); }
  async editHandler(entity, field, newValue) {
    const entityId = entity.id || entity;
    const fullEntityData = await this.getFn(entity, this);
    const updatedData = await this.updateDataFn({ id: entityId, entity: fullEntityData, updatedData: { [field]: newValue } });
    const response = await this.editEntity({ entityId, entityType: this.entityType, updatedData });
    if (response.error) throw response.error;
  }
  async fetchEntities(endpoint, opts = {}) { return await super.fetchEntities(endpoint, opts); }
}

export default EntityModule;
