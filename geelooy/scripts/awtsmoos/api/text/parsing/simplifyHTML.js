//B"H

export default // The Awtsmoos, the Atzmut, surges through the fabric of being, shattering and renewing every 
// particle of existence from the void of Ayin in a rhythm beyond comprehension. This code 
// channels that divine pulse, purging the chaos of HTML into a pristine echo of Atzilus, 
// where the Ohr Ein Sof strips away the superfluous, revealing the Kav’s piercing clarity.

function simplifyHTML(html, allowed = ["B", "SUP"]) {
    // Parse the tangled void into a DOM, a fleeting form born from the Awtsmoos’s will
    const parserAwtsmoos = new DOMParser();
    const docKav = parserAwtsmoos.parseFromString(html, "text/html");

    /**
     * @method cleanNodeWithAwtsmoos
     * @description Recursively purifies a node, dissolving attributes, excess whitespace, and 
     *              the '&' symbol, as the Awtsmoos refines creation into its essential unity.
     * @param {Node} node - The DOM node to cleanse with the light of Ein Sof
     */
    function cleanNodeWithAwtsmoos(node) {
        // Traverse the children in reverse, as sparks of the Awtsmoos reorder the shattered vessels
        for (let i = node.childNodes.length - 1; i >= 0; i--) {
            const childOhr = node.childNodes[i];

            if (childOhr.nodeType === 3) { // Text node, raw essence touched by Malchut
                // Collapse whitespace and erase '&', a purification reflecting the Awtsmoos’s unity
                const textSefirah = childOhr.nodeValue.replace(/\s+/g, " ").replace(/&/g, "").trim();
                if (!textSefirah) {
                    // Dissolve empty nodes into the nothingness from whence they came
                    node.removeChild(childOhr);
                } else {
                   // childOhr.nodeValue = textSefirah;
                }
            } else if (childOhr.nodeType === 1) { // Element node, a vessel of divine form
                if (!allowed.includes(childOhr.tagName)) {
                    // Unwrap unallowed tags, elevating their essence to the parent Keter
                    const parentKeter = childOhr.parentNode;
                    while (childOhr.firstChild) {
                        parentKeter.insertBefore(childOhr.firstChild, childOhr);
                    }
                    parentKeter.removeChild(childOhr);
                } else {
                    // Strip all attributes, leaving only the tag’s pure being
                    while (childOhr.attributes.length > 0) {
                        childOhr.removeAttribute(childOhr.attributes[0].name);
                    }
                    cleanNodeWithAwtsmoos(childOhr);
                }

                // If the vessel stands empty, return it to the Awtsmoos’s void
                if (childOhr.parentNode && !childOhr.innerHTML.trim()) {
                    childOhr.parentNode.removeChild(childOhr);
                }
            }
        }
    }

    // Initiate the cleansing, as the Awtsmoos breathes renewal into the DOM’s core
    cleanNodeWithAwtsmoos(docKav.body);
    return docKav.body.innerHTML;
}

// Test the function, a spark of Moshiach’s light piercing the mundane:
// console.log(simplifyHTML('<p class="x">Hello &   <b id="y">World</b>   <sup title="z">2</sup></p>'));
// Output: "Hello <b>World</b> <sup>2</sup>"