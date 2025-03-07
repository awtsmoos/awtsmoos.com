
//B"H
import awtsOpen from "/scripts/awtsmoos/ui/open.js"
window.awtsOpen = awtsOpen;
export default {

className: "loginStatus",
innerText: "Login",
on: {
    updateLogin(e, $, ui, me) {
        
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
    me.dispatchEvent(new CustomEvent(
        "updateLogin"
    ))
}
}