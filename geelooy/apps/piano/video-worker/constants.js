/* B"H
The MP4 worker receives living symbols again: not placeholders, actual emoji vessels.
*/
self.PianoVideo = self.PianoVideo || {};
PianoVideo.NOTE_NAMES_SHARP = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
PianoVideo.HEBREW_LETTERS = ['א','ב','ג','ד','ה','ו','ז','ח','ט','י','כ','ל','מ','נ','ס','ע','פ','צ','ק','ר','ש','ת'];
PianoVideo.EMOJIS = ['🎹','✨','🔥','🌊','🌟','💎','🕯️','🌈','⚡','💫','🌀','🪄','🎶','💧','🕊️','👑'];
PianoVideo.MIDI_NOTE_START = 21;
PianoVideo.MIDI_NOTE_END = 108;
PianoVideo.RENDER_LATENCY_SECONDS = 0.35;
PianoVideo.MAX_PARTICLES = 1200;
PianoVideo.PARTICLE_DENSITY = 16;
PianoVideo.UI_STYLE = {
    BACKGROUND_COLOR:'#000000', WHITE_KEY_FILL_TOP:'#FFFFFF', WHITE_KEY_FILL_BOTTOM:'#F4F5F8', WHITE_KEY_FRONT_FACE:'#C8CDD5', WHITE_KEY_SHADOW:'rgba(0,0,0,.25)', WHITE_KEY_SHINY_BEVEL_START:'rgba(255,255,255,.9)', WHITE_KEY_SHINY_BEVEL_END:'rgba(255,255,255,0)', WHITE_KEY_INNER_SHADOW:'rgba(0,0,0,.1)',
    BLACK_KEY_GRADIENT_START:'#404248', BLACK_KEY_GRADIENT_END:'#18191C', BLACK_KEY_BEVEL_HIGHLIGHT:'rgba(255,255,255,.2)', ACTIVE_KEY_OVERLAY_COLOR:'rgba(0,255,255,.7)', TOUCH_POINT_COLOR:'rgba(0,255,255,.4)', SHOCKWAVE_COLOR:'rgba(0,255,255,.7)', PARTICLE_BORDER_COLOR:'rgba(0,0,0,.5)', LIGHTNING_COLOR:'rgba(150,220,255,.8)', BUBBLE_COLOR:'rgba(0,200,255,.3)', LABEL_COLOR_WHITE_KEY:'#707080', LABEL_COLOR_BLACK_KEY:'#a0a0b0', ACTIVE_LABEL_COLOR:'#000000'
};
