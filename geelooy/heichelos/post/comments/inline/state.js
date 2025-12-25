
//B"H
import { updateQueryStringParameter } from "../../functions/utils.js";
import { loadedInlineVerses } from "../state.js";

var inlineComments = {};

export function getInlineAliases() {
  var url = new URL(window.location);
  var inlineParam = url.searchParams.get("inline");
  try {
    var p = JSON.parse(inlineParam);
    if(p && Array.isArray(p)) return p;
    else return [];
  } catch(e) { return []; }
}

export function isAliasInline(alias) {
    return getInlineAliases().includes(alias);
}

export function hideCommentsInline(alias) {
    if(inlineComments[alias]) inlineComments[alias] = null;
    
    // Remove DOM elements (Logic moved here for cohesion with state update)
    document.querySelectorAll(".commentator.inline[data-alias='" + alias + "']").forEach(w=>w.parentNode.removeChild(w));
    
    var p = getInlineAliases();
    if(!p.length) updateQueryStringParameter("inline", null);
    else {
        var idx = p.indexOf(alias);
        if(idx > -1) {
            p.splice(idx, 1);
            updateQueryStringParameter("inline", JSON.stringify(p));
        }
    }
    const verseKeyPrefix = `${alias}-`;
    Object.keys(loadedInlineVerses).forEach(k => { if(k.startsWith(verseKeyPrefix)) delete loadedInlineVerses[k]; });
}
