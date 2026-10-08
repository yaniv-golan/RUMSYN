import React from 'react';
import {wallEndpoints,attachmentStart} from '../model/room.js';
export function Plan({state,selected,onSelect,label}){
 if(!state.room)return <div className="empty-canvas" aria-label={label}/>;
 const points=state.room.vertices,xs=points.map(p=>p[0]),ys=points.map(p=>-p[1]);
 const minX=Math.min(...xs)-60,minY=Math.min(...ys)-60,width=Math.max(...xs)-minX+60,height=Math.max(...ys)-minY+60;
 return <svg className="plan" viewBox={`${minX} ${minY} ${width} ${height}`} role="img" aria-label={label}>
  <polygon points={points.map(([x,y])=>`${x},${-y}`).join(' ')} fill="#eee7d9"/>
  {state.walls.map((wall,i)=>{const a=points[i],b=points[(i+1)%4];return <g key={wall.id} onClick={()=>onSelect(wall.id)}><line x1={a[0]} y1={-a[1]} x2={b[0]} y2={-b[1]} stroke={wall.id===selected?'#ed673d':'#465463'} strokeWidth={wall.thickness} className="selectable"/><text x={(a[0]+b[0])/2} y={-(a[1]+b[1])/2-20} textAnchor="middle">{wall.name} · {wall.length.value.toFixed(2)} cm</text></g>;})}
  {state.attachments.map(item=>{const wall=state.walls.find(w=>w.id===item.wallId),[a,b]=wallEndpoints(state,wall.id),d=wall.length.value,offset=attachmentStart(wall,item),ux=(b[0]-a[0])/d,uy=(b[1]-a[1])/d;return <line key={item.id} x1={a[0]+ux*offset} y1={-(a[1]+uy*offset)} x2={a[0]+ux*(offset+item.width)} y2={-(a[1]+uy*(offset+item.width))} stroke="#67b3ad" strokeWidth={wall.thickness+4} onClick={()=>onSelect(item.id)}><title>{item.id}</title></line>;})}
  {(state.furniture??[]).map(f=><g key={f.id} transform={`translate(${f.x},${-f.y}) rotate(${-f.rotation})`} onClick={()=>onSelect(f.id)}><rect x={-f.width/2} y={-f.depth/2} width={f.width} height={f.depth} rx="3" fill={f.product?.color??'#bb925f'} stroke={selected===f.id?'#ed673d':'#59452f'} strokeWidth="4"/><text textAnchor="middle" y="4" fontSize="12">{f.product?'LACK':f.category}</text></g>)}
 </svg>;
}
