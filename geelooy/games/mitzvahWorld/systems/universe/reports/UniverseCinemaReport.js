// B"H
export function universeCinemaReport(movie = {}) { return { hasMovie:Boolean(movie), cameraCommands:movie?.camera?.length || 0, dialogueBeats:movie?.dialogue?.length || 0 }; }
