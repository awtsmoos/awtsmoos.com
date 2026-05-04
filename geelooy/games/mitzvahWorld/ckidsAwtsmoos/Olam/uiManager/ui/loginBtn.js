
//B"H
import awtsOpen from "/scripts/awtsmoos/ui/open.js"
import createProfile from "/scripts/awtsmoos/social/profileDropdown.js";

// B"H: Expose functions to global scope so they persist through serialization/eval
// Shielded by typeof window check to prevent shattering in ethereal environments.
if (typeof window !== 'undefined') {
    window.createProfile = createProfile;
    window.awtsOpen = awtsOpen;
}

export default {
    className: "loginStatus awtsmoosBtn",
    
    ready(me, $) {
        window.a=me
        try {
            if(window.createProfile) {
                window.createProfile(me);
            } else {
                createProfile(me);
            }
        } catch(e) {
            console.error("B\"H - Login Profile Error:", e);
        }
    }
};
