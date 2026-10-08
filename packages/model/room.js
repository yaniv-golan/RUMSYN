import {measurement,dimension,TOLERANCE_CM} from './index.js';
import {validateLineTopology,topologyPoints,edgeEnds} from './topology.js';
import {solveQuadrilateral} from './solver.js';
export function emptyProject(id){return {id,schemaVersion:2,revision:0,walls:[],attachments:[],furniture:[],room:null};}
export function measuredRoom({sides,diagonal,orientation,height=240,thickness=15}){
 dimension(height);dimension(thickness);
 const solved=solveQuadrilateral({sides,diagonal,orientation});
 if(solved.status!=='solved')throw new Error(solved.reason??solved.status);
 return {walls:sides.map((v,i)=>({id:'wall-'+String.fromCharCode(65+i),name:String.fromCharCode(65+i),length:measurement(v),height,thickness,geometry:{kind:'line',startCornerId:`corner-${i+1}`,endCornerId:`corner-${(i+1)%4+1}`},materialFaces:{inside:{color:'#ebe7dc'},outside:{color:'#b9b5ac'}}})),room:{kind:'measured-quadrilateral',cornersProvenance:'derived',corners:solved.coordinates.map(([x,y],i)=>({id:`corner-${i+1}`,x,y})),diagonal:measurement(diagonal),orientation,approximate:false}};
}
export function validateRoom(state){
 if(state.room){
   if(state.schemaVersion===2)validateLineTopology(state.room,state.walls);
   if(state.room.kind==='polygon'){if(!['derived','inferred'].includes(state.room.cornersProvenance)||typeof state.room.approximate!=='boolean')throw new Error('Invalid polygon provenance');for(const wall of state.walls){dimension(wall.height);dimension(wall.thickness);for(const side of ['inside','outside'])if(!/^#(?:[a-f0-9]{3}|[a-f0-9]{6})$/i.test(wall.materialFaces?.[side]?.color??''))throw new Error('Missing or invalid wall material record');}}else{
   if(state.room.kind!=='measured-quadrilateral'||(state.schemaVersion===2?state.room.cornersProvenance:state.room.verticesProvenance)!=='derived')throw new Error('Unsupported room geometry/provenance');
   const diagonal=state.room.diagonal;dimension(diagonal?.value,'room diagonal');
   if(diagonal.unit!=='cm'||!['entered','derived','inferred','adjusted'].includes(diagonal.source))throw new Error('Invalid diagonal provenance/units');
   if(!['clockwise','counterclockwise'].includes(state.room.orientation))throw new Error('Unknown room orientation');
   const points=roomPoints(state);if(!Array.isArray(points)||points.length!==4||state.walls.length!==4)throw new Error('Expected four room corners/walls');points.forEach(p=>{if(!Array.isArray(p)||p.length!==2||!p.every(Number.isFinite))throw new Error('Invalid room coordinate');});state.walls.forEach((wall,i)=>{const a=points[i],b=points[(i+1)%4];if(Math.abs(Math.hypot(b[0]-a[0],b[1]-a[1])-wall.length.value)>TOLERANCE_CM)throw new Error('Room perimeter disagrees with measured wall');dimension(wall.height);dimension(wall.thickness);for(const side of ['inside','outside'])if(!/^#(?:[a-f0-9]{3}|[a-f0-9]{6})$/i.test(wall.materialFaces?.[side]?.color??''))throw new Error('Missing or invalid wall material record');});
   if(Math.abs(Math.hypot(points[2][0]-points[0][0],points[2][1]-points[0][1])-diagonal.value)>TOLERANCE_CM)throw new Error('Room diagonal disagrees with measured constraint');
   const turns=points.map((a,i)=>{const b=points[(i+1)%4],c=points[(i+2)%4];return (b[0]-a[0])*(c[1]-b[1])-(b[1]-a[1])*(c[0]-b[0]);});
   const sign=state.room.orientation==='clockwise'?-1:1;
   if(!turns.every(t=>sign*t>0))throw new Error('Room topology/orientation disagrees with measured constraint');
   }
 }
 if(state.room)for(const o of state.attachments)if(!Number.isFinite(o.height)||!Number.isFinite(o.bottom))throw new Error('Incomplete opening geometry');
 const ids=new Set([...state.walls,...state.attachments].map(o=>o.id));
 for(const f of state.furniture??[]){if(!f.id||ids.has(f.id))throw new Error('Invalid furniture ID');ids.add(f.id);for(const key of ['width','depth','height'])dimension(f[key]);if(![f.x,f.y,f.elevation,f.rotation].every(Number.isFinite))throw new Error('Invalid furniture placement');if(f.product){const d=f.product.dimensions;if(!d||d.unit!=='cm'||['width','depth','height'].some(k=>f[k]!==d[k]))throw new Error('Catalog product dimensions disagree with the saved source snapshot');}
    if(!['table','chair','cabinet'].includes(f.category))throw new Error('Unsupported placeholder category');}
 return state;
}
export function roomPoints(state){return state.schemaVersion===2||state.room?.corners?topologyPoints(state.room):state.room.vertices;}
export function wallEndpoints(state,id){const i=state.walls.findIndex(w=>w.id===id);if(i<0||!state.room)throw new Error('Unknown wall');return state.schemaVersion===2?edgeEnds(state.room,state.walls[i].geometry):[state.room.vertices[i],state.room.vertices[(i+1)%state.walls.length]];}
export function attachmentStart(wall,item){return item.anchor==='end'?wall.length.value-item.offset-item.width:item.offset;}

export function polygonRoom({points,entry,height=240,thickness=15,measurements}){
 dimension(height);dimension(thickness);if(!['preset','draw','perimeter'].includes(entry)||!Array.isArray(points)||points.length<3||points.length>256)throw new Error('Invalid polygon entry');
 const corners=points.map(([x,y],i)=>({id:`corner-${i+1}`,x,y})),area=points.reduce((sum,a,i)=>{const b=points[(i+1)%points.length];return sum+a[0]*b[1]-a[1]*b[0];},0)/2;
 const room={kind:'polygon',corners,cornersProvenance:entry==='perimeter'?'derived':'inferred',orientation:area<0?'clockwise':'counterclockwise',approximate:entry!=='perimeter',entry};
 const walls=points.map((a,i)=>{const b=points[(i+1)%points.length],length=Math.hypot(b[0]-a[0],b[1]-a[1]);return {id:`wall-${i+1}`,name:String.fromCharCode(65+i),length:measurement(measurements?.[i]??length,entry==='perimeter'?'entered':'derived'),height,thickness,geometry:{kind:'line',startCornerId:corners[i].id,endCornerId:corners[(i+1)%points.length].id},materialFaces:{inside:{color:'#ebe7dc'},outside:{color:'#b9b5ac'}}};});validateLineTopology(room,walls);return {room,walls};
}
