//B"H
import System from "./system.js"
import ResizableWindow from "./windows.js"
import {
    programs,
    programsByExtensionDefaults,
    getDefaultProgram
} from "./basicPrograms.js"

export default class WindowHandler {
    windows = [];
    constructor() {

    }
    getExtension(title) {
        var l = title.lastIndexOf(".")
        if(l > -1) {
            return title.substring(l)
        }
        return ".js";
    }
    addWindow({title, content, path, os}) {
        var ext = this.getExtension(title);
        var prog = programsByExtensionDefaults[ext];
    
        var program = getDefaultProgram(ext)
        if(program) {
            var system = new System({path, os})
            program = program({
                os:system.os,
                path,
                title,
                fileName: title, 
                content, 
                system,
                extension:ext
            })
            content = program?.div;
        }
        
        var wind = new ResizableWindow({
            title, content,
            handler: this
        });
        wind.onresize = e => {
            program?.onresize?.(e)
        }
        
        program?.init?.();
        this.windows.push(wind);
    }

    onactive(w)  {
        console.log("ACTIVATING",w)
        this.windows.forEach(wn => {
            if(w == wn) return console.log("SELF")
            wn?.makeInactive?.();
        });
    }

    onclose(w) {
        console.log("CLOSED window",w)
        var ind = this.windows.indexOf(w);
        if(ind > -1) {
            this.windows.splice(ind, 1);
        }
    }

}
