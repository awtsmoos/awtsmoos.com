// B"H
export class HeadroomSolver{static y(shotType,bounds={}){if(/close|insert|detail|macro/i.test(shotType))return (bounds.y||120)-12;if(/wide|group|establish/i.test(shotType))return (bounds.y||120)+26;return (bounds.y||120)+8;}}
