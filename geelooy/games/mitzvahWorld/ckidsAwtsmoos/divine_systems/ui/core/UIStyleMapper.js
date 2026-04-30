
// B"H
/**
 * @class UIStyleMapper
 * @description
 * 🎨 THE WEAVER OF COLORS 🎨
 * 
 * Transforms an object map of styles into a valid inline CSS string.
 */
export default class UIStyleMapper {
    static map(styleObject) {
        if (!styleObject) return "";
        let str = "";
        for (const[key, value] of Object.entries(styleObject)) {
            // Convert camelCase to kebab-case
            const kebab = key.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
            str += `${kebab}: ${value}; `;
        }
        return str;
    }
}
