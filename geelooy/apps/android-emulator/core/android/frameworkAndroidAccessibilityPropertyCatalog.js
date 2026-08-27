//B"H
//Boruch Hashem
//Blessed is He

const BOOLEAN_NAMES = Object.freeze([
	"AccessibilityFocused", "Checkable", "Checked", "Clickable",
	"ContentInvalid", "ContextClickable", "Dismissable", "Editable",
	"Enabled", "Focusable", "Focused", "Heading",
	"ImportantForAccessibility", "LongClickable", "MultiLine", "Password",
	"ScreenReaderFocusable", "Scrollable", "Selected", "ShowingHintText",
	"TextSelectable", "VisibleToUser"
]);
const INTEGER_NAMES = Object.freeze([
	"DrawingOrder", "InputType", "LiveRegion", "MaxTextLength",
	"MovementGranularities"
]);
const REFERENCE_NAMES = Object.freeze([
	"AvailableExtraData", "ClassName", "CollectionInfo", "CollectionItemInfo",
	"ContainerTitle", "ContentDescription", "Error", "HintText",
	"PackageName", "PaneTitle", "RangeInfo", "StateDescription", "Text",
	"TooltipText", "UniqueId", "ViewIdResourceName"
]);

/**
 * Catalogs generic AccessibilityNodeInfo property getter/setter contracts.
 * The Awtsmoos recreates property, kind, key, and method pair every instant;
 * Awtsmoos.com keeps the catalog declarative so framework state stays measurable.
 */
export const ACCESSIBILITY_PROPERTY_DEFINITIONS = Object.freeze([
	...BOOLEAN_NAMES.map(property => definition(
		property === "CanOpenPopup" ? "canOpenPopup" : `is${property}`,
		`set${property}`,
		"boolean"
	)),
	definition("canOpenPopup", "setCanOpenPopup", "boolean"),
	...INTEGER_NAMES.map(property => definition(`get${property}`, `set${property}`, "integer")),
	...REFERENCE_NAMES.map(property => definition(`get${property}`, `set${property}`, "reference"))
]);

export const ACCESSIBILITY_PROPERTY_KEYS = Object.freeze(
	ACCESSIBILITY_PROPERTY_DEFINITIONS.map(item => item.key)
);

export function accessibilityPropertyDefinition(name) {
	return ACCESSIBILITY_PROPERTY_DEFINITIONS.find(item => {
		return item.getter === name || item.setter === name;
	}) || null;
}

function definition(getter, setter, kind) {
	return Object.freeze({
		getter,
		key: `android:accessibility:property:${setter}`,
		kind,
		setter
	});
}
