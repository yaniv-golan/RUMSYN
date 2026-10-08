import React,{useEffect,useRef} from 'react';
import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {attachmentStart,wallEndpoints} from '../model/room.js';
import {wallParts} from '../geometry/wall-parts.js';
import {furnitureParts,partCentre} from '../geometry/furniture-parts.js';
const cm=v=>v*.01;
function dispose(group){group.traverse(o=>{o.geometry?.dispose();if(Array.isArray(o.material))o.material.forEach(m=>m.dispose());else o.material?.dispose();});group.clear();}
export function Scene({state,selected,onSelect,label,cameraMemory,cutaway=true,fitRequest=0}){
 const cutawayRef=useRef(cutaway);cutawayRef.current=cutaway;
 const host=useRef(null),context=useRef(null),selectRef=useRef(onSelect);selectRef.current=onSelect;
 useEffect(()=>{
  const element=host.current;let renderer;try{renderer=new THREE.WebGLRenderer({antialias:true});}catch(e){element.textContent=`3D unavailable: ${e.message}. Use the 2D view and object list.`;return;}
  const scene=new THREE.Scene();scene.background=new THREE.Color('#eef1f4');renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.shadowMap.enabled=true;element.append(renderer.domElement);
  const camera=new THREE.PerspectiveCamera(45,1,.01,1000),controls=new OrbitControls(camera,renderer.domElement),group=new THREE.Group();controls.enableDamping=true;scene.add(group);
  scene.add(new THREE.HemisphereLight('#ffffff','#746652',2));const light=new THREE.DirectionalLight('#fff6e6',3);light.position.set(3,7,5);light.castShadow=true;scene.add(light);
  const ctx={scene,renderer,camera,controls,group,projectId:null,pickables:[]};context.current=ctx;
  const resize=()=>{const {width,height}=element.getBoundingClientRect();renderer.setSize(width,height);camera.aspect=width/Math.max(height,1);camera.updateProjectionMatrix();};const observer=new ResizeObserver(resize);observer.observe(element);resize();
  let start;const down=e=>{start=[e.clientX,e.clientY];};const up=e=>{if(!start||Math.hypot(e.clientX-start[0],e.clientY-start[1])>5)return;const rect=renderer.domElement.getBoundingClientRect(),ray=new THREE.Raycaster();ray.params.Line.threshold=.04;ray.setFromCamera(new THREE.Vector2((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1),camera);const hit=ray.intersectObjects(ctx.pickables.filter(o=>!o.userData.faded))[0];if(hit)selectRef.current(hit.object.userData.id);};renderer.domElement.addEventListener('pointerdown',down);renderer.domElement.addEventListener('pointerup',up);
  let frame;const draw=()=>{controls.update();group.traverse(o=>{if(o.userData.wallView){const {centre,normal}=o.userData.wallView;const near=cutawayRef.current&&normal[0]*(camera.position.x-centre[0])+normal[1]*(camera.position.z-centre[1])>0;if(o.isMesh){o.userData.faded=near;o.material.opacity=near?.25:o.userData.baseOpacity;o.material.transparent=near||o.userData.baseOpacity<1;o.material.depthWrite=!o.material.transparent;}}});renderer.render(scene,camera);if(cameraMemory&&ctx.projectId!==null)cameraMemory.current={projectId:ctx.projectId,position:camera.position.toArray(),target:controls.target.toArray()};frame=requestAnimationFrame(draw);};draw();
  return()=>{cancelAnimationFrame(frame);observer.disconnect();controls.dispose();renderer.domElement.removeEventListener('pointerdown',down);renderer.domElement.removeEventListener('pointerup',up);dispose(group);renderer.dispose();renderer.domElement.remove();context.current=null;};
 },[]);
 useEffect(()=>{
  const ctx=context.current;if(!ctx||!state.room)return;const {group,camera,controls}=ctx;dispose(group);ctx.pickables=[];
  const mesh=(geometry,color,id,transparent=false)=>{const o=new THREE.Mesh(geometry,new THREE.MeshStandardMaterial({color,roughness:.8,side:THREE.DoubleSide,transparent,opacity:transparent ? 0.25 : 1,depthWrite:!transparent}));o.userData={id,baseColor:color,baseOpacity:transparent?.25:1};o.castShadow=!transparent;o.receiveShadow=true;group.add(o);if(id)ctx.pickables.push(o);return o;};
  const shape=new THREE.Shape(state.room.vertices.map(([x,y])=>new THREE.Vector2(cm(x),cm(y))));const floor=mesh(new THREE.ShapeGeometry(shape),'#ddd0b6');floor.rotation.x=-Math.PI/2;
  for(const wall of state.walls){const [a,b]=wallEndpoints(state,wall.id),angle=Math.atan2(b[1]-a[1],b[0]-a[0]),openings=state.attachments.filter(o=>o.wallId===wall.id);
   const part=(start,length,bottom,height,id,color,transparent=false)=>{if(length<=0||height<=0)return;const o=mesh(new THREE.BoxGeometry(cm(length),cm(height),cm(wall.thickness)),color,id,transparent),centre=start+length/2,normal=state.room.orientation==='clockwise'?1:-1;o.position.set(cm(a[0]+Math.cos(angle)*centre-normal*Math.sin(angle)*wall.thickness/2),cm(bottom+height/2),-cm(a[1]+Math.sin(angle)*centre+normal*Math.cos(angle)*wall.thickness/2));o.rotation.y=angle;o.userData.wallView={centre:[cm((a[0]+b[0])/2),-cm((a[1]+b[1])/2)],normal:[-normal*Math.sin(angle),-normal*Math.cos(angle)]};if(!transparent){const edges=new THREE.LineSegments(new THREE.EdgesGeometry(o.geometry),new THREE.LineBasicMaterial({color:'#66717d'}));edges.position.copy(o.position);edges.rotation.copy(o.rotation);edges.userData={id,baseColor:'#66717d'};group.add(edges);ctx.pickables.push(edges);}};
   for(const p of wallParts(wall,openings))part(p.start,p.length,p.bottom,p.height,wall.id,wall.materialFaces.inside.color);
   for(const o of openings)part(attachmentStart(wall,o),o.width,o.bottom,o.height,o.id,'#67b3ad',true);
  }
  for(const f of state.furniture??[]){for(const p of furnitureParts(f)){const o=mesh(new THREE.BoxGeometry(cm(p.w),cm(p.h),cm(p.d)),f.product?.color??'#bb925f',f.id),centre=partCentre(f,p);o.position.set(cm(centre.x),cm(centre.elevation),-cm(centre.y));o.rotation.y=f.rotation*Math.PI/180;}}
  if(ctx.projectId!==state.id){const saved=cameraMemory?.current;if(saved?.projectId===state.id){camera.position.fromArray(saved.position);controls.target.fromArray(saved.target);}else{const box=new THREE.Box3().setFromObject(group),centre=box.getCenter(new THREE.Vector3()),size=box.getSize(new THREE.Vector3()),extent=Math.max(size.x,size.y,size.z,1);controls.target.copy(centre);camera.position.set(centre.x+extent,centre.y+extent*1.3,centre.z+extent*1.5);}ctx.projectId=state.id;}
  ctx.fit=()=>{const box=new THREE.Box3().setFromObject(group),centre=box.getCenter(new THREE.Vector3()),size=box.getSize(new THREE.Vector3()),extent=Math.max(size.x,size.y,size.z,1);controls.target.copy(centre);camera.position.set(centre.x+extent,centre.y+extent*1.3,centre.z+extent*1.5);controls.update();};
 },[state]);
 useEffect(()=>{if(fitRequest)context.current?.fit?.();},[fitRequest]);
 useEffect(()=>{context.current?.group.traverse(o=>{if(o.material&&o.userData.id)o.material.color.set(o.userData.id===selected?'#ed9679':o.userData.baseColor);});},[selected,state]);
 return <div className="scene" ref={host} role="img" aria-label={label}/>;
}
