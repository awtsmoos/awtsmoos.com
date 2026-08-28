// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file UniversalCommandCatalog.js
 * @description
 * The Awtsmoos lets object, schema, render, texture, event, transaction, and preflight powers share one platform catalog;
 * Awtsmoos.com keeps these universal commands separate from mature production families so discovery can expand without becoming fog.
 */

import { HOD_EVENT_COMMANDS } from '../../schema/EventCommandSchemas.js';
import { GEVURAH_GPU_COMMANDS } from '../../schema/GpuCommandSchemas.js';
import { KETER_OBJECT_READ_COMMANDS } from '../../schema/ObjectReadCommandSchemas.js';
import { KETER_OBJECT_WRITE_COMMANDS } from '../../schema/ObjectWriteCommandSchemas.js';
import { GEVURAH_PREFLIGHT_COMMANDS } from '../../schema/PreflightCommandSchemas.js';
import { TIFERES_RENDER_COMMANDS } from '../../schema/RenderCommandSchemas.js';
import { DAAS_SCHEMA_READ_COMMANDS } from '../../schema/SchemaReadCommandSchemas.js';
import { DAAS_SCHEMA_WRITE_COMMANDS } from '../../schema/SchemaWriteCommandSchemas.js';
import { YESOD_TEXTURE_READ_COMMANDS } from '../../schema/TextureReadCommandSchemas.js';
import { YESOD_TEXTURE_RUNTIME_COMMANDS } from '../../schema/TextureRuntimeCommandSchemas.js';
import { MALCHUS_TRANSACTION_COMMANDS } from '../../schema/TransactionCommandSchemas.js';

/** Universal platform descriptors for structured authoring, runtime realization, atomic editing, and audit. */
export const OR_UNIVERSAL_COMMANDS = Object.freeze([
	...KETER_OBJECT_READ_COMMANDS,
	...KETER_OBJECT_WRITE_COMMANDS,
	...YESOD_TEXTURE_READ_COMMANDS,
	...YESOD_TEXTURE_RUNTIME_COMMANDS,
	...GEVURAH_GPU_COMMANDS,
	...TIFERES_RENDER_COMMANDS,
	...DAAS_SCHEMA_READ_COMMANDS,
	...DAAS_SCHEMA_WRITE_COMMANDS,
	...HOD_EVENT_COMMANDS,
	...MALCHUS_TRANSACTION_COMMANDS,
	...GEVURAH_PREFLIGHT_COMMANDS
]);
