// B"H
export function generateInterior(id = "cottage_interior") { return { id, rooms:[{ id:"main_room", size:[6, 3, 6], exits:["front_door"] }], props:["table", "chair"] }; }
export default { generateInterior };
