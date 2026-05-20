// B"H
const catalog = require('./aiTemplateCatalog.js');

function parseVars(payload) {
  if (payload.vars && typeof payload.vars === 'object') return payload.vars;
  if (payload.vars && typeof payload.vars === 'string') { try { return JSON.parse(payload.vars); } catch {} }
  if (payload.params && typeof payload.params === 'string') { try { return JSON.parse(payload.params); } catch {} }
  return {};
}

function templateName(payload) {
  const name = payload.name || payload.templateName || payload.presetName;
  if (!name) throw new Error('missing template name');
  return String(name);
}

function buildAiTemplateActions(ctx, buildActions) {
  const { config, payload, ws } = ctx;
  const runAction = async next => {
    const actions = buildActions(config, next, ws);
    if (!actions[next.action]) throw new Error('Unknown template action: ' + next.action);
    return await actions[next.action]();
  };
  return {
    async aiTemplateList() { return { ok: true, action: payload.action, names: catalog.names(), templates: catalog.templates }; },
    async aiTemplateGet() { const name = templateName(payload); return { ok: !!catalog.get(name), action: payload.action, name, template: catalog.get(name) }; },
    async aiTemplateRender() {
      const name = templateName(payload), tpl = catalog.get(name);
      if (!tpl) return { ok: false, action: payload.action, error: 'unknown_template', name };
      const rendered = { ...catalog.render(tpl.template, parseVars(payload)), action: tpl.action };
      return { ok: true, action: payload.action, name, rendered };
    },
    async aiTemplateRun() {
      const rendered = await this.aiTemplateRender();
      if (!rendered.ok || payload.dryRun) return rendered;
      return { ok: true, action: payload.action, name: rendered.name, rendered: rendered.rendered, result: await runAction(rendered.rendered) };
    }
  };
}
module.exports = { buildAiTemplateActions };
