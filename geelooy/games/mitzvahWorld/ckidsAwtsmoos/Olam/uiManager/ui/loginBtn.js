
//B"H
import awtsOpen from "/scripts/awtsmoos/ui/open.js"
import createProfile from "/scripts/awtsmoos/social/profileDropdown.js";

window.awtsOpen = awtsOpen;
export default {

    className: "loginStatus",
    
    ready(me, $) {
        console.log("HI",window.a=me)
        if(this.createProfile)
            createProfile(me);
        else {
            console.log("no profile!")
        }
    }
}