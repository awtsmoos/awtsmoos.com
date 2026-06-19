// B"H

/**
 * @file ChromeSchema.js
 * @description
 * ============================================================================
 * CHAPTER: THE DATA TABLE OF RETRACTABLE VESSELS
 * ============================================================================
 *
 * UI should not be a pile of random buttons. It should be a data map: stage,
 * editor, time, properties, play, hide. Each vessel has a name, an icon, an
 * action, and a panel. From this table the desktop rail and mobile dock are
 * born without duplicated logic.
 *
 * The Awtsmoos creates multiplicity from unity. This schema is a tiny mirror:
 * many buttons, one source; many panels, one controller; many gestures, one
 * intention.
 */

export const CHROME_ACTIONS = [
  {
    id: 'stage',
    label: 'Stage',
    icon: '◉',
    panel: 'stage',
    title: 'Show only the living canvas'
  },
  {
    id: 'editor',
    label: 'Edit',
    icon: '✎',
    panel: 'editor',
    title: 'Open or close the editor/sidebar'
  },
  {
    id: 'time',
    label: 'Time',
    icon: '▰',
    panel: 'time',
    title: 'Open or close the timeline'
  },
  {
    id: 'props',
    label: 'Props',
    icon: '◇',
    panel: 'props',
    title: 'Open or close properties'
  },
  {
    id: 'play',
    label: 'Play',
    icon: '▶',
    panel: 'play',
    title: 'Play or pause the scene'
  },
  {
    id: 'hide',
    label: 'Hide',
    icon: '⌄',
    panel: 'hide',
    title: 'Retract all UI'
  }
];