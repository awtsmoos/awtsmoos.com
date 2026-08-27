
// B"H
// FILE: js/terminal/help-text.js

/**
 * --- THE SCROLL OF WISDOM ---
 * This vessel holds the detailed explanations of every ritual (command).
 * B"H. As the Torah explains the world, this explains the shell.
 */
export const DetailedHelp = {
    header: `<div class="terminal-welcome">Awtsmoos Terminal Help System\nRevealing the functionality of the digital vessels.</div>`,
    
    commands: {
        ls: `<b>ls [path]</b>\nList directory contents. Shows the vessels manifested in the current space.\n  -l : Detailed view (shows kind).`,
        cd: `<b>cd [path]</b>\nChange the location of being. Moves your focus to another folder vessel.\n  .. : Go to parent.\n  /  : Go to global root.`,
        pwd: `<b>pwd</b>\nIdentify your current coordinate in the digital cosmos.`,
        mkdir: `<b>mkdir [dir_name]</b>\nCreate a new directory vessel from nothingness.`,
        touch: `<b>touch [file_name]</b>\nCreate a new empty file vessel.`,
        rm: `<b>rm [path]</b>\nRetract a vessel from reality, returning its allocated space to potential.`,
        cp: `<b>cp [src] [dst]</b>\nCopy source essence to a new destination vessel.`,
        mv: `<b>mv [src] [dst]</b>\nMove or rename a vessel.`,
        cat: `<b>cat [file]</b>\nRead the inner text of a file and reveal it to the screen.`,
        echo: `<b>echo [text] [> file]</b>\nSpeak text. Use > to manifest that speech into a file vessel.`,
        stat: `<b>stat [path]</b>\nReveal the deep metadata of a vessel.`,
        git: `<b>git [subcommand]</b>\nInteract with the timeline of a repository.\n  init : Initialize a repo.\n  status : View changes.\n  commit : Open manifest UI.`,
        open: `<b>open [path]</b>\nManifest an item in its primary view (Editor or Commander).`,
        clear: `<b>clear</b>\nDissolve the history of the current view.`,
        history: `<b>history</b>\nReveal the scroll of your previous commands.`,
        whoami: `<b>whoami</b>\nReveal your current system identity.`,
        '#': `<b># [comment]</b>\nA moment of inner thought. Does not manifest as action.`
    },

    getGeneralHelp() {
        let text = this.header + "\n<b>Rituals of Manifestation:</b>\n";
        const keys = Object.keys(this.commands).sort();
        
        // Arranging the words in a pattern of four
        for (let i = 0; i < keys.length; i += 4) {
            text += "  " + keys.slice(i, i + 4).join("\t\t") + "\n";
        }
        text += "\nType <i>'help [command]'</i> to reveal the depth of a specific ritual.";
        return text;
    }
};
