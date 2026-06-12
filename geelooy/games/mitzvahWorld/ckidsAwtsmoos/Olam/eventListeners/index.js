/**
 * B"H
 * 
 * the difference event listeners needed
 * to make the Olam class function
 */
import userInput from "./userInput.js?v=village-polish-20260612-bh810"
import labels from "./labels.js";
import minimap from "./minimap.js";
import resizing from "./resizing.js?v=village-combat-20260611-bh805";
import destroy from "./destroy.js"
import chossidReactions from "./chossidRaections.js";
import shlichus from "./shlichus.js"
import environment from "./environment.js"
import misc from "./misc.js";

export default function() {
    
    userInput.bind(this)();
    labels.bind(this)();
    minimap.bind(this)();
    resizing.bind(this)();
    destroy.bind(this)();
    chossidReactions.bind(this)();
    shlichus.bind(this)();
    environment.bind(this)();
    misc.bind(this)();
    
    


}
