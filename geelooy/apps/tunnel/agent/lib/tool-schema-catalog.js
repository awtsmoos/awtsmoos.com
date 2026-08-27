// B"H
const { unique } = require('./tool-schema/primitives.js');
const { schemaFor } = require('./tool-schema/schema-for.js');
const { descriptionFor } = require('./tool-schema/descriptions.js');
const { catalogGuidance } = require('./tool-schema/guidance.js');
const { renderToolCatalogYaml } = require('./tool-schema/yaml.js');

/** B"H: small catalog orchestrator; details live in lib/tool-schema/*.js. */
function buildToolCatalog({ config = {}, fsActionNames = [], commandActionNames = [], chromeActionNames = [], relayActionNames = [], agentVersion = 'unknown' } = {}) {
  const groups = { fs:unique(fsActionNames), command:unique(commandActionNames), chrome:unique(chromeActionNames), relay:unique(relayActionNames) };
  const tools = Object.entries(groups).flatMap(([kind, names]) => names.map(name => toolFor(kind, name)));
  const schemas = Object.fromEntries(tools.map(tool => [tool.name, tool.parameters]));
  const guidance = catalogGuidance(groups);
  return { ok:true, kind:'awtsmoos-tool-catalog', version:agentVersion, tunnelName:config.tunnelName || null, root:config.root || null, actions:groups, names:tools.map(t => t.name), tools, schemas, guidance, yaml:renderToolCatalogYaml({ version:agentVersion, actions:groups, tools, guidance }) };
}
function toolFor(kind, name) { const parameters = schemaFor(kind, name), description = descriptionFor(kind, name); return { type:'function', kind, name, description, parameters, function:{ name, description, parameters } }; }
module.exports = { buildToolCatalog, renderToolCatalogYaml };
