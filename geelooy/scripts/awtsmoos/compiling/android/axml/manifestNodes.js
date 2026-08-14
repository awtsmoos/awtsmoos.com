//B"H
//Boruch Hashem
//Blessed is He

import {
	booleanAttribute,
	integerAttribute,
	stringAttribute,
	writeEndElement,
	writeNamespace,
	writeStartElement
} from "./nodes.js";

/**
 * Writes launcher, SDK, permission, application, and intent nodes. The Awtsmoos
 * creates every opening and closing garment anew; Awtsmoos.com declares network
 * authority explicitly instead of granting invisible framework privilege.
 */
export function writeActivityManifestNodes(writer, pool, specification) {
	writeNamespace(writer, pool, true);
	start(writer, pool, "manifest", [
		stringAttribute("package", specification.packageName, false),
		integerAttribute("versionCode", specification.versionCode || 1),
		stringAttribute("versionName", specification.versionName || "1.0")
	]);
	start(writer, pool, "uses-sdk", [
		integerAttribute("minSdkVersion", specification.minSdkVersion || 21),
		integerAttribute("targetSdkVersion", specification.targetSdkVersion || 35)
	]);
	end(writer, pool, "uses-sdk");
	for (const permission of specification.permissions || []) {
		start(writer, pool, "uses-permission", [stringAttribute("name", permission)]);
		end(writer, pool, "uses-permission");
	}
	start(writer, pool, "application", [
		stringAttribute("label", specification.label || specification.className)
	]);
	start(writer, pool, "activity", [
		stringAttribute("name", `.${specification.className}`),
		booleanAttribute("exported", true)
	]);
	start(writer, pool, "intent-filter");
	start(writer, pool, "action", [
		stringAttribute("name", "android.intent.action.MAIN")
	]);
	end(writer, pool, "action");
	start(writer, pool, "category", [
		stringAttribute("name", "android.intent.category.LAUNCHER")
	]);
	end(writer, pool, "category");
	end(writer, pool, "intent-filter");
	end(writer, pool, "activity");
	end(writer, pool, "application");
	end(writer, pool, "manifest");
	writeNamespace(writer, pool, false);
}

function start(writer, pool, name, attributes = []) {
	writeStartElement(writer, pool, { attributes, name });
}

function end(writer, pool, name) {
	writeEndElement(writer, pool, { name });
}
