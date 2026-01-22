
/**
 * B"H
 */
export default class ShlichusActions {
    constructor() {
        this.isDone = false;
        this.eventsSet = [];
    }

    update(sh) {
        if(sh.isActive) this.setTimer(sh);
    }

    setTimer(sh) {
        if(!sh) return;
        var id = sh.id;
        var curTime = Date.now();
        
        if (curTime - sh.lastUpdateTime >= 100) {
            var maxTime = sh.timeLimitRaw;
            var startTime = sh.startTime;
            var diff = curTime - startTime;
            var inSeconds = Math.floor(diff/1000);
            var timeLeft = maxTime - inSeconds;
            var time = formatTime(timeLeft);
            sh.currentTimeRemaining = time;
            sh.currentTimeElapsed = diff;

            sh.olam.htmlAction({
                shaym: "shlichus time "+id,
                properties: { textContent: "Time left: " + time }
            });

            sh.lastUpdateTime = curTime;
        }
    }

    finish(sh) {
        var id = sh.id;
        sh.isActive = false;
        sh.olam.htmlAction({ shaym: "shlichus time "+id, methods: { classList: { remove: "active", add: "hidden" } } });
        sh.olam.htmlAction({ shaym:"shlichus progress info "+id, methods: { classList: { remove: "active", add: "hidden" } } });
    }

    setEvents(sh) {
        this._setupClickHandler(sh);
        this._bindOlamEvents(sh);
    }
    
    _setupClickHandler(sh) {
        var id = sh.id;
        sh.olam.htmlAction({
            shaym: "shlichus progress info "+id,
            properties: {
                onclick: function(e,$,ui) {
                    var shl = searchForProperty(e, "shlichusID", true);
                    var id = shl.shlichusID;
                    var isInfo = searchForProperty(e, "isInfo");
                    var selected = shl.classList.contains("selected");

                    if(isInfo) {
                        if(id) ui.peula($("shlichus information"), { shlichusInfo: id });
                    } else if(!selected) {
                         Array.from(document.querySelectorAll(".shlichusProgress")).forEach(f=> {
                            f.classList.remove("selected");
                            ui.peula(f, { setSelected: { id: f.shlichusID, selected: false } });
                        });
                        shl.classList.add("selected");
                        ui.peula(shl, { setSelected: { id, selected: true } });
                    } else {
                         Array.from(document.querySelectorAll(".shlichusProgress")).forEach(f=> f.classList.remove("selected"));
                         ui.peula(shl, { setSelected: { id, selected: false } });
                    }
                }
            }
        });
    }

    _bindOlamEvents(sh) {
         if(this.eventsSet.includes(sh)) this._clearOldEvents(sh);
         this.eventsSet.push(sh);

         sh.olam.on("htmlPeula shlichusInfo", (id) => this._onShlichusInfo(sh, id));
         sh.olam.on("htmlPeula setSelected", ({id, selected}) => { if(id === sh.id) sh.on?.setActive(sh, selected); });
         sh.olam.on("htmlPeula dropShlichus", ({id}) => { 
             if(id === sh.id) {
                 showFail({ sh, msg: `You have officially dropped the Shlichus ${sh.shaym}` });
                 sh.olam.showingImportantMessage = false;
             }
         });
         sh.olam.on("htmlPeula returnStage", (id) => { if(id == sh.id) sh.on?.returnStage(sh); });
         
         sh.olam.on("htmlPeula resetShlichus", (name) => this._onResetShlichus(sh, name), true);
         sh.olam.on("htmlPeula startShlichus", (name) => this._onStartShlichus(sh, name), true);
    }
    
    _clearOldEvents(sh) {
        // Logic to clear specific bound functions would require storing references.
        // For simplicity in this refactor, we assume simple replacement or ignore.
        this.eventsSet.splice(this.eventsSet.indexOf(sh), 1);
    }
    
    _onShlichusInfo(sh, id) {
        if(id != sh.id) return;
        sh.olam.htmlAction({ shaym: "shlichus information", properties: { currentShlichusID: id }, methods: { classList: { remove: "hidden" } } });
        sh.olam.htmlAction({ shaym: "sa shlichus info name", properties: { textContent: sh.shaym } });
        sh.olam.htmlAction({ shaym: "sa info details", properties: { textContent: sh.objective } });
    }
    
    async _onResetShlichus(sh, name) {
        sh.olam.showingImportantMessage = false;
        if(name != sh.shaym) return;
        sh.olam.htmlAction({ shaym: "failed alert shlichus", methods: { classList: { add: "hidden" } } });
        await sh.reset(sh);
    }
    
    async _onStartShlichus(sh, name) {
        sh.olam.showingImportantMessage = false;
        if(name != sh.shaym) return alert("That's not a real shlichus to start!");
        sh.startTime = Date.now();
        var id = sh.id;

        const show = (s) => sh.olam.htmlAction({ shaym: s, methods: { classList: { remove: "hidden" } } });
        show("shlichus sidebar");
        show("shlichus progress info "+id);

        sh.olam.htmlAction({ shaym: "shlichus description "+id, properties: { textContent: sh.progressDescription } });
        sh.olam.htmlAction({ shaym: "si num "+id, properties: { textContent: sh.collected + "/" + sh.totalCollectedObjects } });
        sh.olam.htmlAction({ shaym: "si frnt "+id, properties: { style: { width: "0%" } } });
        sh.olam.htmlAction({ shaym: "shlichus progress info "+id, methods: { click: true } });
        
        sh.start();
    }

    creation(sh) {
        var id = sh.id;
        sh.lastUpdateTime = 0;
        sh.olam.showingImportantMessage = true;
        
        const activate = (s) => sh.olam.htmlAction({ shaym: s, methods: { classList: { add: "active" } } });
        const show = (s) => sh.olam.htmlAction({ shaym: s, methods: { classList: { remove: "hidden" } } });
        
        activate("shlichus progress info "+id);
        sh.olam.htmlAction({ shaym: "shlichus time "+id, methods: { classList: { add: "active", remove: "hidden" } } });
        sh.olam.htmlAction({ shaym: "sa mainTxt", properties:{ innerText: "Shlichus Accepted: " }, methods:{ classList: { add: "active" } } });

        sh.olam.htmlAction({ shaym: "sa shlichus name", properties: { textContent: sh.shaym } });
        show("shlichus accept");
        sh.olam.htmlAction({ shaym: "sa details", properties: { textContent: sh.objective } });
        sh.olam.htmlAction({ shaym: "shlichus title "+id, properties: { textContent: sh.shaym } });

        this.setEvents(sh);
    }

    delete(sh) {
        sh.olam.htmlAction({ shaym: "shlichus progress info " + sh.id, methods: { remove: true } });
    }

    async progress(sh) {
        var id = sh.id;
        var percent = sh.collected / sh.totalCollectedObjects;

        if(sh.collected < sh.totalCollectedObjects) {
            sh.olam.htmlAction({ shaym: "si num "+id, properties: { textContent: sh.collected + "/" + sh.totalCollectedObjects } });
            sh.olam.htmlAction({ shaym: "si frnt "+id, properties: { style: { width: (percent*100) + "%" } } });
        } else {
            sh.completed = true;
            sh.complete();
            sh.olam.showingImportantMessage = true;
            sh.olam.htmlAction({ shaym: "si num "+id, properties: { textContent: sh.collected + "/" + sh.totalCollectedObjects } });
            sh.olam.htmlAction({ shaym: "si frnt "+id, properties: { style: { width: "100%" } } });
            sh.olam.htmlAction({ shaym: "shlichus description "+id, properties: { textContent: sh.completeText } });
            sh.olam.htmlAction({ shaym: "congrats message", properties: { textContent: sh.completeText } });
            sh.olam.htmlAction({ shaym: "ribbon text", properties: { textContent: "Congrats!", shlichusID: sh.id } });
            sh.olam.htmlAction({ shaym: "congrats shlichus", methods: { classList: { remove: "hidden" } } });
        }
    }

    returnStage(sh) {
        try {
            sh.completedProgress(sh);
            sh.olam.showingImportantMessage = false;
            if(sh.returnTimeLimit) sh.setTime(sh.returnTimeLimit);
        } catch(e) { console.log("Couldnt do event: ",e,sh); }
    }

    setTime(sh, info={minutes:0,seconds:0}) {
        var minutes=info.minutes||0;
        var seconds = info.seconds||0;
        sh.startTime = Date.now();
        sh.timeLimitRaw = minutes*60  + seconds;
        clearInterval(sh.timeout);
        sh.timeout = setTimeout(() => { sh.on?.timeUp?.(sh); }, sh.timeLimitRaw * 1000);
    }

    timeUp(sh) {
        showFail({ sh, msg: "The time ran OUT! It's okay, failure is a step to success. Find the giver to reset." });
    }
}

function showFail({ sh, msg }) {
    sh.olam.htmlAction({ shaym: "failed alert shlichus", methods: { classList: { remove: "hidden" } } });
    sh.dropShlichus();
    sh.olam.htmlAction({ shaym: "failed message", properties: { textContent: msg } });
}

function formatTime(seconds) {
    var minutes = Math.floor(seconds / 60);
    var remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}
