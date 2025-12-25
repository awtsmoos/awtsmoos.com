//B"H
/**
 * ShlichusActions - Pure logic for mission tracking.
 * Directs all UI manifestations through the Olam's event system.
 */
export default class ShlichusActions {
    constructor() {}

    update(sh) {
        if (sh.isActive) {
            this.setTimer(sh);
        }
    }

    setTimer(sh) {
        if (!sh || !sh.olam) return;
        const id = sh.id;
        const curTime = Date.now();

        if (curTime - sh.lastUpdateTime >= 100) {
            const maxTime = sh.timeLimitRaw;
            const startTime = sh.startTime;
            const diff = curTime - startTime;

            const inSeconds = Math.floor(diff / 1000);
            const timeLeft = Math.max(0, maxTime - inSeconds);
            const timeStr = formatTime(timeLeft);
            sh.currentTimeRemaining = timeStr;
            sh.currentTimeElapsed = diff;

            sh.olam.htmlAction({
                shaym: `shlichus time ${id}`,
                properties: { textContent: `Time left: ${timeStr}` }
            });

            sh.lastUpdateTime = curTime;
        }
    }

    finish(sh) {
        if (!sh.olam) return;
        const id = sh.id;
        sh.isActive = false;
        
        sh.olam.htmlAction({
            shaym: `shlichus time ${id}`,
            methods: { classList: { remove: "active", add: "hidden" } }
        });
        
        sh.olam.htmlAction({
            shaym: `shlichus progress info ${id}`,
            methods: { classList: { remove: "active", add: "hidden" } }
        });
    }

    setEvents(sh) {
        const id = sh.id;
        const olam = sh.olam;

        olam.htmlAction({
            shaym: `shlichus progress info ${id}`,
            properties: {
                onclick: `/*B"H*/ function(e, $, ui) {
                    const el = e.target.closest('[shlichusID]');
                    if (!el) return;
                    const shID = el.shlichusID;
                    const isInfo = e.target.closest('.infoIcon') || e.target.classList.contains('infoIcon');
                    
                    if (isInfo) {
                        ui.peula($('shlichus information'), { shlichusInfo: shID });
                    } else {
                        const isSelected = el.classList.toggle('selected');
                        ui.peula(el, { setSelected: { id: shID, selected: isSelected } });
                    }
                }`
            }
        });

        const handleSetSelected = async ({ id: targetId, selected }) => {
            if (targetId !== sh.id) return;
            if (sh.on?.setActive) sh.on.setActive(sh, selected);
        };

        const handleStart = (shName) => {
            if (shName !== sh.shaym) return;
            sh.olam.showingImportantMessage = false;
            sh.startTime = Date.now();
            
            sh.olam.htmlActions([
                { shaym: "shlichus sidebar", methods: { classList: { remove: "hidden" } } },
                { shaym: `shlichus progress info ${id}`, methods: { classList: { remove: "hidden" } } },
                { shaym: `si num ${id}`, properties: { textContent: `${sh.collected}/${sh.totalCollectedObjects}` } },
                { shaym: `si frnt ${id}`, properties: { style: { width: "0%" } } }
            ]);
            
            sh.start();
        };

        olam.on("htmlPeula setSelected", handleSetSelected);
        olam.on("htmlPeula startShlichus", handleStart, true);
    }

    creation(sh) {
        const id = sh.id;
        const olam = sh.olam;
        sh.lastUpdateTime = 0;
        olam.showingImportantMessage = true;
        
        olam.htmlActions([
            { shaym: `shlichus progress info ${id}`, methods: { classList: { add: "active" } } },
            { shaym: `shlichus time ${id}`, methods: { classList: { add: "active", remove: "hidden" } } },
            { shaym: "sa mainTxt", properties: { innerText: "Shlichus Accepted: " }, methods: { classList: { add: "active" } } },
            { shaym: "sa shlichus name", properties: { textContent: sh.shaym } },
            { shaym: "shlichus accept", methods: { classList: { remove: "hidden" } } },
            { shaym: `shlichus title ${id}`, properties: { textContent: sh.shaym } }
        ]);

        this.setEvents(sh);
    }

    progress(sh) {
        const id = sh.id;
        const percent = Math.min(1, sh.collected / sh.totalCollectedObjects);

        if (sh.collected < sh.totalCollectedObjects) {
            sh.olam.htmlActions([
                { shaym: `si num ${id}`, properties: { textContent: `${sh.collected}/${sh.totalCollectedObjects}` } },
                { shaym: `si frnt ${id}`, properties: { style: { width: `${percent * 100}%` } } }
            ]);
        } else {
            sh.completed = true;
            sh.complete();
            sh.olam.showingImportantMessage = true;
            
            sh.olam.htmlActions([
                { shaym: `si num ${id}`, properties: { textContent: `${sh.collected}/${sh.totalCollectedObjects}` } },
                { shaym: `si frnt ${id}`, properties: { style: { width: "100%" } } },
                { shaym: "congrats message", properties: { textContent: sh.completeText } },
                { shaym: "congrats shlichus", methods: { classList: { remove: "hidden" } } }
            ]);
        }
    }
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}
