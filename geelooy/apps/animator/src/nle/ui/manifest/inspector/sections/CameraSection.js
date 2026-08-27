// B"H
import { InspectorInput } from '../components/InspectorInput.js';
import { SaveUtils } from '../utils/SaveUtils.js';

export class CameraSection {
  static render(event, state, app) {
    const children = [];
    children.push(InspectorInput.render('From X', event.from?.x || 0, (val) => { if (!event.from) event.from = {}; event.from.x = parseFloat(val); SaveUtils.resave(event, state, app); }));
    children.push(InspectorInput.render('From Y', event.from?.y || 0, (val) => { if (!event.from) event.from = {}; event.from.y = parseFloat(val); SaveUtils.resave(event, state, app); }));
    children.push(InspectorInput.render('From Zoom', event.from?.zoom || 1, (val) => { if (!event.from) event.from = {}; event.from.zoom = parseFloat(val); SaveUtils.resave(event, state, app); }));
    children.push(InspectorInput.render('To X', event.to?.x || 0, (val) => { if (!event.to) event.to = {}; event.to.x = parseFloat(val); SaveUtils.resave(event, state, app); }));
    children.push(InspectorInput.render('To Y', event.to?.y || 0, (val) => { if (!event.to) event.to = {}; event.to.y = parseFloat(val); SaveUtils.resave(event, state, app); }));
    children.push(InspectorInput.render('To Zoom', event.to?.zoom || 1, (val) => { if (!event.to) event.to = {}; event.to.zoom = parseFloat(val); SaveUtils.resave(event, state, app); }));
    return { tag: 'div', children };
  }
}