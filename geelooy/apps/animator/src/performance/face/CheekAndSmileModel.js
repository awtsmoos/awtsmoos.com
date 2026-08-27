// B"H
export class CheekAndSmileModel { static from(mouth={}){return {raise:Math.max(0,Number(mouth.smile||0)*.55),blush:Math.max(0,Number(mouth.smile||0)*.18)};} }
