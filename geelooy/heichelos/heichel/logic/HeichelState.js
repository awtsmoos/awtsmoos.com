
/**
 * B"H
 * @module HeichelState
 * @description
 * Just as the Awtsmoos left a 'Reshimu' (Impression) of light after the 
 * initial Tzimtzum (Contraction) to allow for the existence of finite worlds, 
 * this module holds the raw impression of our data.
 * 
 * It remembers the coordinates of the Heichel, ensuring we always know 
 * our place within the digital Seder Histalshelus.
 */

export const HeichelState = {
    /** @type {string|null} */
    heichelID: location.pathname.split("/").filter(Boolean)[1] || null,
    
    /** @type {boolean} */
    isEditing: false,
    
    /** @type {string|null} */
    view: new URLSearchParams(location.search).get("view"),
    
    /** @type {string} */
    series: new URLSearchParams(location.search).get("series") || "root",
    
    /** @type {boolean} */
    ownsIt: false,
    
    /** @type {Object|null} */
    heichelData: null,
    
    /** @type {Array} */
    breadcrumb:[],
    
    /** @type {number} */
    POST_LENGTH: 256
};

// B"H Ensure "null" string is converted to "root"
if (HeichelState.series === "null") {
    HeichelState.series = "root";
}
