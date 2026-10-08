// Display preferences never enter canonical project geometry.
const factors={cm:1,mm:0.1,m:100,in:2.54,ft:30.48};
const scalar='(?:\\d+(?:\\.\\d+)?|\\.\\d+)';
function amount(text){const mixed=/^(\d+)\s+(\d+)\/(\d+)$/.exec(text),fraction=/^(\d+)\/(\d+)$/.exec(text);if(mixed||fraction){const m=mixed??fraction,n=Number(m[mixed?2:1]),d=Number(m[mixed?3:2]);if(!d)throw new Error('Invalid measurement');return (mixed?Number(m[1]):0)+n/d;}if(!new RegExp(`^${scalar}$`).test(text))throw new Error('Invalid measurement');return Number(text);}
export function parseMeasurement(input,unit='metric'){
 if(typeof input!=='string'||!['metric','imperial'].includes(unit))throw new Error('Invalid measurement');let text=input.trim().toLowerCase().replace(/[′’]/g,"'").replace(/[″”]/g,'"');let sign=1;if(/^[+-]/.test(text)){if(text[0]==='-')sign=-1;text=text.slice(1).trim();}
 let cm;const feet=new RegExp(`^(${scalar})\\s*(?:ft|')\\s*(.*?)\\s*(?:in|\")$`).exec(text);
 if(feet){const inches=amount(feet[2]);if(inches>=12)throw new Error('Invalid measurement');cm=Number(feet[1])*30.48+inches*2.54;}
 else {const suffix=/^(.*?)\s*(cm|mm|m|in|ft|'|")$/.exec(text);const value=amount((suffix?.[1]??text).trim()),suffixUnit=suffix?.[2];cm=value*(factors[suffixUnit==='\''?'ft':suffixUnit==='"'?'in':suffixUnit]??(unit==='imperial'?2.54:1));}
 const result=sign*cm;if(!Number.isFinite(result))throw new Error('Invalid measurement');return result;
}
function gcd(a,b){while(b)[a,b]=[b,a%b];return a;}
export function formatMeasurement(cm,unit='metric'){
 if(!Number.isFinite(cm))return '';if(unit==='metric')return cm.toFixed(2);if(unit!=='imperial')throw new Error('Unknown display unit');const sign=cm<0?'-':'',ticks=Math.round(Math.abs(cm)/2.54*16),feet=Math.floor(ticks/192),inches=Math.floor(ticks%192/16),numerator=ticks%16,divisor=numerator?gcd(numerator,16):1;return `${sign}${feet}' ${inches}${numerator?' '+numerator/divisor+'/'+16/divisor:''}"`;
}
