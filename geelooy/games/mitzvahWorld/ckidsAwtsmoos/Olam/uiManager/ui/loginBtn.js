
//B"H
import awtsOpen from "/scripts/awtsmoos/ui/open.js"
import createProfile from "/scripts/awtsmoos/social/profileDropdown.js";

window.awtsOpen = awtsOpen;

export default {

    className: "loginStatus awtsmoosBtn",
    
    ready(me, $) {
        console.log("HI",window.a=me)
        try {
            createProfile(me);
        } catch(e) {
            console.log("no profile!",e)
        }
        
    },
    onclick(e) {
        console.log("What",window.o=e.target.children)
    }
}