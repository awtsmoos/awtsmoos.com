
/**
 * B"H
 * World Logic Handlers
 */
export default function worldHandlers(manager) {
    const { eved, myUi } = manager;

    return {
        downloadWorld(ob) {
            var txt = ob?.text;
            if(!txt) return;
            
            if(window?.curAlias) {
                if(!window.worldName) window.worldName = prompt("World Name?");
                if(window.worldName) {
                    fetch(`/api/social/aliases/${window?.curAlias}/fileSystem/makeFile`,  {
                        method: "POST",
                        body: new URLSearchParams({
                            path: "desktop.folder/game data.folder/worlds/" + window.worldName + ".js",
                            value: txt
                        })
                    }).then(async r => {
                        var d = await r.json();
                        if(d?.success) alert("Saved to profile");
                        else alert("Save failed");
                    });
                }
            } else {
                var a = document.createElement("a");
                a.href = URL.createObjectURL(new Blob([txt]));   
                a.download="BH_"+Date.now()+".js";
                a.click();
            }
            myUi.htmlAction({
                shaym: "Saving",
                methods: { classList: { add: "hidden" } }
            });
        },

        activeObjectAction(a) {
            // Proxy action, can be logged or extended
        },

        "game started"(a) {},

        loadedWorld() {
             if(manager.onLoadedWorld) manager.onLoadedWorld();
        },

        switchWorlds(stringifiedWorldDayuh) {}
    };
}
