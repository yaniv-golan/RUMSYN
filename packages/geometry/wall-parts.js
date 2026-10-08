import {attachmentStart} from '../model/room.js';
export function wallParts(wall,openings){
 const holes=openings.map(o=>({x:attachmentStart(wall,o),w:o.width,z:o.bottom,h:o.height}));
 const xs=[...new Set([0,wall.length.value,...holes.flatMap(h=>[h.x,h.x+h.w])])].sort((a,b)=>a-b),zs=[...new Set([0,wall.height,...holes.flatMap(h=>[h.z,h.z+h.h])])].sort((a,b)=>a-b);
 const parts=[];for(let i=0;i<xs.length-1;i++)for(let j=0;j<zs.length-1;j++){const x=(xs[i]+xs[i+1])/2,z=(zs[j]+zs[j+1])/2;if(holes.some(h=>x>h.x&&x<h.x+h.w&&z>h.z&&z<h.z+h.h))continue;parts.push({start:xs[i],length:xs[i+1]-xs[i],bottom:zs[j],height:zs[j+1]-zs[j]});}return parts;
}
