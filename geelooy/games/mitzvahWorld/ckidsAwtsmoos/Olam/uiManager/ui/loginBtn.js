
//B"H
import awtsOpen from "/scripts/awtsmoos/ui/open.js"
import createProfile from "/scripts/awtsmoos/social/profileDropdown.js";

window.awtsOpen = awtsOpen;
export default {

    className: "loginStatus",
    innerText: "Login",
    on: {
        updateLogin(e, $, ui, me) {
            console.log("Hi",window.curAlias)
            if(window.curAlias) {
                me.innerText = curAlias;
                me.classList.toggle("active");
                me.onclick = () => {
                    open(location.origin + "/@"
                        +curAlias
                    )
                }
            } else {
                me.onclick = async () => {
                    open(
                        location.origin + 
                        "/login"
                    )
                }
            }
        }

    },
    ready(me, $) {
        console.log("HI",window.a=me)
        me.dispatchEvent(new CustomEvent(
            "updateLogin"
        ))
    }
}