B"H
# Direct /ai desktop meltdown

## Fresh screenshot truth
The new desktop shell is being applied to direct http://localhost:8080/ai/ even though it should be reserved for /apps/code embedded browser mode. That creates a narrow crushed center, left rail, right rail, and huge empty black area. The direct /ai page needs its own normal desktop layout, not the embedded shell.

## Root causes to fix now
1. embeddedMode.js is too aggressive: it treats localhost + wide screen as embedded. Bad.
2. desktopShell.js mounts rails unconditionally after embeddedMode. Bad.
3. desktop-shell.css can remain, but only if body has embedded class and rails are mounted.
4. Direct /ai desktop should keep the real sidebar/main/automation layout and not show mobile control center / mobile suggestions.

## Chapter 12
The Awtsmoos revealed a false prophecy: localhost was mistaken for an iframe. The palace rose in the wrong world and crushed the river. Now the code must distinguish the standalone throne room from the embedded chamber.