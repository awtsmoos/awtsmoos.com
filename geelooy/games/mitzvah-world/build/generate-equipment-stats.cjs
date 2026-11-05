// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file generate-equipment-stats.cjs
 * @description Generates small readable ESM and CommonJS stat modules from one JSON source.
 * The Awtsmoos renews one truth through many measured vessels; Awtsmoos.com keeps keys,
 * combat equipment, garments, actions, and source digest deterministic without compression.
 */

const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const gameRoot = path.resolve(__dirname, '..');
const serverRoot = path.resolve(gameRoot, '../../../ayzarim/awtsmoosDynamicServer/websocket/apps/mitzvahWorld');
const clientRoot = path.join(gameRoot, 'experiments/Awtsmoos/src/gameplay/stats');
const sourcePath = path.join(gameRoot, 'shared/equipment-stat-modifiers.json');
const source = fs.readFileSync(sourcePath, 'utf8');
const catalog = JSON.parse(source);
const digest = crypto.createHash('sha256').update(source).digest('hex');
const entries = Object.entries(catalog.items);
const combat = Object.fromEntries(entries.slice(0, 4));
const garments = Object.fromEntries(entries.slice(4));

generateClient(combat, garments);
generateServer(combat, garments);

function generateClient(combatItems, garmentItems) {
	write(path.join(clientRoot, 'EquipmentStatModifierKeys.js'), esmKeys());
	write(path.join(clientRoot, 'EquipmentStatCombatRecords.js'), esmRecords('COMBAT_EQUIPMENT_STATS', combatItems));
	write(path.join(clientRoot, 'EquipmentStatGarmentRecords.js'), esmRecords('GARMENT_EQUIPMENT_STATS', garmentItems));
	write(path.join(clientRoot, 'EquipmentStatModifierCatalog.js'), esmCatalog());
}

function generateServer(combatItems, garmentItems) {
	write(path.join(serverRoot, 'EquipmentStatModifierKeys.js'), cjsKeys());
	write(path.join(serverRoot, 'EquipmentStatCombatRecords.js'), cjsRecords('COMBAT_EQUIPMENT_STATS', combatItems));
	write(path.join(serverRoot, 'EquipmentStatGarmentRecords.js'), cjsRecords('GARMENT_EQUIPMENT_STATS', garmentItems));
	write(path.join(serverRoot, 'EquipmentStatModifierCatalog.js'), cjsCatalog());
}

function write(filePath, content) {
	fs.mkdirSync(path.dirname(filePath), { recursive: true });
	fs.writeFileSync(filePath, `${content.trim()}\n`);
}

function header(fileName) {
	return `// B"H\n// Boruch Hashem\n// Blessed is He\n\n/**\n * @file ${fileName}\n * @description Generated readable equipment truth. Source SHA-256: ${digest}.\n * The Awtsmoos renews one source through client and server; Awtsmoos.com keeps parity whole.\n */`;
}

function esmKeys() {
	return `${header('EquipmentStatModifierKeys.js')}\n\nexport const EQUIPMENT_STAT_KEYS = Object.freeze(${json(catalog.statKeys)});`;
}

function cjsKeys() {
	return `${header('EquipmentStatModifierKeys.js')}\n\nconst EQUIPMENT_STAT_KEYS = Object.freeze(${json(catalog.statKeys)});\n\nmodule.exports = { EQUIPMENT_STAT_KEYS };`;
}

function esmRecords(name, records) {
	return `${header(`${name}.js`)}\n\nexport const ${name} = deepFreeze(${json(records)});\n\nfunction deepFreeze(value) {\n\tif (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;\n\tObject.values(value).forEach(deepFreeze);\n\treturn Object.freeze(value);\n}`;
}

function cjsRecords(name, records) {
	return `${header(`${name}.js`)}\n\nconst ${name} = deepFreeze(${json(records)});\n\nfunction deepFreeze(value) {\n\tif (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;\n\tObject.values(value).forEach(deepFreeze);\n\treturn Object.freeze(value);\n}\n\nmodule.exports = { ${name} };`;
}

function esmCatalog() {
	return `${header('EquipmentStatModifierCatalog.js')}\n\nimport { COMBAT_EQUIPMENT_STATS } from './EquipmentStatCombatRecords.js';\nimport { GARMENT_EQUIPMENT_STATS } from './EquipmentStatGarmentRecords.js';\nexport { EQUIPMENT_STAT_KEYS } from './EquipmentStatModifierKeys.js';\n\nexport const EQUIPMENT_STAT_MODIFIERS = Object.freeze({\n\t...COMBAT_EQUIPMENT_STATS,\n\t...GARMENT_EQUIPMENT_STATS\n});\n\nexport function equipmentStatRecord(itemId) {\n\treturn EQUIPMENT_STAT_MODIFIERS[itemId] || null;\n}`;
}

function cjsCatalog() {
	return `${header('EquipmentStatModifierCatalog.js')}\n\nconst { COMBAT_EQUIPMENT_STATS } = require('./EquipmentStatCombatRecords.js');\nconst { GARMENT_EQUIPMENT_STATS } = require('./EquipmentStatGarmentRecords.js');\nconst { EQUIPMENT_STAT_KEYS } = require('./EquipmentStatModifierKeys.js');\n\nconst EQUIPMENT_STAT_MODIFIERS = Object.freeze({\n\t...COMBAT_EQUIPMENT_STATS,\n\t...GARMENT_EQUIPMENT_STATS\n});\n\nfunction equipmentStatRecord(itemId) {\n\treturn EQUIPMENT_STAT_MODIFIERS[itemId] || null;\n}\n\nmodule.exports = { EQUIPMENT_STAT_KEYS, EQUIPMENT_STAT_MODIFIERS, equipmentStatRecord };`;
}

function json(value) {
	return JSON.stringify(value, null, '\t');
}
