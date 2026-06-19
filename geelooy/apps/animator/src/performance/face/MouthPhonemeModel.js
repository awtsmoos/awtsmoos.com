// B"H
export class MouthPhonemeModel { static from({talking=false,emotion='calm',time=0}={}){const smile=/happy|delighted|warm|relieved|playful|proud/.test(emotion)?.55:/skeptical/.test(emotion)?.05:.16;const open=talking?Math.max(.08,Math.sin(time*.018)*.28+Math.sin(time*.029)*.16):(/amazed|surprised/.test(emotion)?.36:.04);return{smile,open,width:smile*.35+open*.12};} }
