// B"H
export function skyWeatherLighting({timeOfDay='morning',weather='clear',humidity=.35,dust=.15}={}){const warm={morning:.75,noon:.35,evening:.95,night:.1}[timeOfDay]??.5;const storm=weather==='storm';return{skyColor:storm?'#506078':timeOfDay==='night'?'#142033':timeOfDay==='evening'?'#f4b06a':'#91c7ff',sunWarmth:warm,blueHour:timeOfDay==='night'||timeOfDay==='morning',fogDensity:Math.min(.6,humidity*.35+(storm?.22:0)+dust*.18),groundBounce:timeOfDay==='evening'?'#c98542':'#a98055',shadowSoftness:storm?.9:.45+humidity*.25}}
export default skyWeatherLighting;
