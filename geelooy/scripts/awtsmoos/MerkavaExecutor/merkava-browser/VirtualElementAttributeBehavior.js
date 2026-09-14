//B"H
//Boruch Hashem
//Blessed be He

(function(root, factory) {
	if (typeof module === "object" && module.exports) {
		module.exports = factory();
	} else {
		root.Merkava = root.Merkava || {};
		Object.assign(root.Merkava, factory());
	}
})(typeof self !== "undefined" ? self : this, function() {
	/** Installs attribute reflection and dataset behavior on VirtualElement. */
	function installVirtualElementAttributeBehavior(prototype) {
		prototype.setAttribute = setAttribute;
		prototype.getAttribute = getAttribute;
		prototype.hasAttribute = hasAttribute;
		prototype.removeAttribute = removeAttribute;
	}

	/** Stores and reflects one HTML attribute into the element state. */
	function setAttribute(name, value) {
		const key = String(name).toLowerCase();
		const oldValue = this.attributes[key] ?? null;
		const text = String(value);
		this.attributes[key] = text;
		reflectAttribute(this, key, text);
		this.__notify("attributes", {
			attributeName: key,
			oldValue
		});
	}

	function getAttribute(name) {
		return this.attributes[String(name).toLowerCase()] ?? null;
	}

	function hasAttribute(name) {
		return Object.prototype.hasOwnProperty.call(this.attributes, String(name).toLowerCase());
	}

	/** Removes one attribute and restores canvas defaults where required. */
	function removeAttribute(name) {
		const key = String(name).toLowerCase();
		const oldValue = this.attributes[key] ?? null;
		delete this.attributes[key];
		if (key === "id") this.id = "";
		if (key === "class") this.className = "";
		if (key === "width" && this.localName === "canvas") this.width = 300;
		if (key === "height" && this.localName === "canvas") this.height = 150;
		this.__notify("attributes", {
			attributeName: key,
			oldValue
		});
	}

	/** Reflects attributes that expose direct DOM properties. */
	function reflectAttribute(element, key, value) {
		if (key === "id") element.id = value;
		if (key === "class") element.className = value;
		if (key === "style") element.style.assignText(value);
		if (key === "value") element.value = value;
		if (key === "name") element.name = value;
		if (key === "type") element.type = value;
		if (key === "tabindex") element.tabIndex = Number(value);
		if (key === "width") element.width = value;
		if (key === "height") element.height = value;
		if (key === "checked") element.checked = true;
		if (key === "selected") element.selected = true;
		if (key === "hidden") element.hidden = true;
		if (key === "disabled") element.disabled = true;
		if (key.startsWith("data-")) {
			element.dataset[dataKey(key.slice(5))] = value;
		}
	}

	function dataKey(name) {
		let output = "";
		let uppercase = false;
		for (const character of name) {
			if (character === "-") {
				uppercase = true;
				continue;
			}
			output += uppercase ? character.toUpperCase() : character;
			uppercase = false;
		}
		return output;
	}

	return { installVirtualElementAttributeBehavior };
});
