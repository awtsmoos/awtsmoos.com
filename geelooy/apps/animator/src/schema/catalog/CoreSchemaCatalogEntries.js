// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file CoreSchemaCatalogEntries.js
 * @description
 * The Awtsmoos gathers identity, meaning, behavior, layout, style, data, and assets into one discoverable core constellation;
 * Awtsmoos.com keeps examples beside schemas so humans and AI agents can generate explicit vessels without guessing from prose narration.
 */

import { YESOD_ASSET_EXAMPLE, YESOD_ASSET_SCHEMA } from '../data/AssetSchemaData.js';
import { NETZACH_BEHAVIOR_EXAMPLE, NETZACH_BEHAVIOR_SCHEMA } from '../data/BehaviorSchemaData.js';
import { DAAS_DATASET_EXAMPLE, DAAS_DATASET_SCHEMA } from '../data/DatasetSchemaData.js';
import { HOD_EVENT_EXAMPLE, HOD_EVENT_DEFINITION_SCHEMA } from '../data/EventSchemaData.js';
import { CHOCHMAH_EXPRESSION_EXAMPLE, CHOCHMAH_EXPRESSION_SCHEMA } from '../data/ExpressionSchemaData.js';
import { CHESED_LAYOUT_EXAMPLE, CHESED_LAYOUT_SCHEMA } from '../data/LayoutSchemaData.js';
import { BINAH_PROPERTY_DEFINITION_SCHEMA, BINAH_PROPERTY_EXAMPLE } from '../data/PropertySchemaData.js';
import { DAAS_RELATIONSHIP_EXAMPLE, DAAS_RELATIONSHIP_SCHEMA } from '../data/RelationshipSchemaData.js';
import { MALCHUS_STATE_MACHINE_EXAMPLE, MALCHUS_STATE_MACHINE_SCHEMA } from '../data/StateMachineSchemaData.js';
import { TIFERES_STYLE_EXAMPLE, TIFERES_STYLE_SCHEMA } from '../data/StyleSchemaData.js';
import { KETER_THING_EXAMPLE, KETER_THING_SCHEMA } from '../data/ThingSchemaData.js';
import { BINAH_UNIT_VALUE_SCHEMA } from '../data/UnitSchemaData.js';

function entry(id, label, schema, example = null, group = 'core') {
	return Object.freeze({ id, label, group, schema, example });
}

/** Built-in world/data schema entries that require no runtime implementation to inspect or validate. */
export const KETER_CORE_SCHEMA_ENTRIES = Object.freeze([
	entry('thing', 'Universal Thing', KETER_THING_SCHEMA, KETER_THING_EXAMPLE),
	entry('property', 'Property definition', BINAH_PROPERTY_DEFINITION_SCHEMA, BINAH_PROPERTY_EXAMPLE),
	entry('relationship', 'Semantic relationship', DAAS_RELATIONSHIP_SCHEMA, DAAS_RELATIONSHIP_EXAMPLE),
	entry('behavior', 'Declarative behavior', NETZACH_BEHAVIOR_SCHEMA, NETZACH_BEHAVIOR_EXAMPLE),
	entry('state-machine', 'State machine', MALCHUS_STATE_MACHINE_SCHEMA, MALCHUS_STATE_MACHINE_EXAMPLE),
	entry('event-definition', 'Event definition', HOD_EVENT_DEFINITION_SCHEMA, HOD_EVENT_EXAMPLE),
	entry('layout', 'Responsive layout', CHESED_LAYOUT_SCHEMA, CHESED_LAYOUT_EXAMPLE),
	entry('style', 'Renderer-neutral style', TIFERES_STYLE_SCHEMA, TIFERES_STYLE_EXAMPLE),
	entry('asset', 'Project asset', YESOD_ASSET_SCHEMA, YESOD_ASSET_EXAMPLE),
	entry('dataset', 'Project dataset', DAAS_DATASET_SCHEMA, DAAS_DATASET_EXAMPLE),
	entry('unit-value', 'Semantic unit value', BINAH_UNIT_VALUE_SCHEMA),
	entry('expression', 'Safe computed expression', CHOCHMAH_EXPRESSION_SCHEMA, CHOCHMAH_EXPRESSION_EXAMPLE)
]);
