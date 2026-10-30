import * as THREE from 'three';
import type {Pose} from './animation';
export function createAvatar(wood:THREE.Material){
const materials=new Map<string,THREE.MeshStandardMaterial>();const mat=(color:string)=>{if(!materials.has(color))materials.set(color,new THREE.MeshStandardMaterial({color,roughness:.85}));return materials.get(color)!;};
function mesh(g:THREE.BufferGeometry,m:THREE.Material,p:THREE.Object3D){const o=new THREE.Mesh(g,m);o.castShadow=o.receiveShadow=true;p.add(o);return o;}
function box(x:number,y:number,z:number,w:number,h:number,d:number,m:THREE.Material,p:THREE.Object3D){const o=mesh(new THREE.BoxGeometry(w,h,d),m,p);o.position.set(x,y,z);return o;}
function ball(x:number,y:number,z:number,r:number,m:THREE.Material,p:THREE.Object3D){const o=mesh(new THREE.IcosahedronGeometry(r,1),m,p);o.position.set(x,y,z);return o;}
// Articulated visitor: local +Z is forward; hips, knees, shoulders, elbows all move.
const player=new THREE.Group();player.rotation.y=Math.PI;const pelvis=new THREE.Group();player.add(pelvis);const torso=new THREE.Group();pelvis.add(torso);const shirt=mat('#afbfbc'),pants=mat('#9eafab'),skin=mat('#bd855e'),hair=mat('#352e28');box(0,.36,0,.55,.67,.32,shirt,torso);const head=new THREE.Group();head.position.y=.82;torso.add(head);mesh(new THREE.SphereGeometry(.32,24,18),skin,head);for(const side of [-1,1])ball(side*.30,-.01,0,.055,skin,head);for(const s of [-1,1])ball(s*.09,.015,.225,.022,hair,head);
// Saffron outer robe and stitched diagonal kasaya sash, following the torso.
const sash=box(.04,.36,.182,.24,.72,.045,mat('#e0c255'),torso);sash.rotation.z=-.42;const backSash=box(-.04,.36,-.182,.28,.72,.045,mat('#e0c255'),torso);backSash.rotation.z=.42;
for(let i=0;i<4;i++)box(-.2+i*.13,.33,-.178,.014,.6,.018,mat('#879b96'),torso);
const waist=box(0,.04,0,.60,.1,.38,shirt,pelvis);
const hips:THREE.Group[]=[],knees:THREE.Group[]=[],shoulders:THREE.Group[]=[],elbows:THREE.Group[]=[],feet:THREE.Mesh[]=[];
for(const s of [-1,1]){const hip=new THREE.Group();hip.position.set(s*.155,0,0);pelvis.add(hip);hips.push(hip);box(0,-.22,0,.29,.46,.32,pants,hip);for(const fold of [-.09,.09])box(fold,-.22,.167,.012,.4,.012,mat('#96a9a3'),hip);const knee=new THREE.Group();knee.position.y=-.44;hip.add(knee);knees.push(knee);box(0,-.21,0,.25,.42,.28,pants,knee);feet.push(box(0,-.44,.075,.21,.12,.36,wood,knee));const shoulder=new THREE.Group();shoulder.position.set(s*.36,.62,0);torso.add(shoulder);shoulders.push(shoulder);box(0,-.18,0,.24,.38,.26,shirt,shoulder);const elbow=new THREE.Group();elbow.position.y=-.36;shoulder.add(elbow);elbows.push(elbow);box(0,-.15,0,.14,.3,.16,skin,elbow);const hand=ball(0,-.32,0,.105,skin,elbow);hand.scale.set(.65,1.1,.9);}
return {player,pelvis,torso,head,hips,knees,shoulders,elbows,feet,ownedMaterials:[...materials.values()]};
}
export type AvatarRig=ReturnType<typeof createAvatar>;
export function applyAvatarPose(rig:AvatarRig,p:Pose,moving:boolean,walkTime:number,surface:number){
const {player,pelvis,torso,head,hips,knees,shoulders,elbows,feet}=rig;
pelvis.position.y=p.height+(moving?Math.sin(walkTime*2)*.025:0);torso.rotation.x=p.body;head.rotation.x=p.head;
for(let i=0;i<2;i++){const s=i===0?-1:1;hips[i].rotation.set(p.hip+(moving?Math.sin(walkTime+i*Math.PI)*.45:0),0,s*p.spread);knees[i].rotation.x=p.knee+(moving?Math.max(0,-Math.sin(walkTime+i*Math.PI))*.55:0);shoulders[i].rotation.set(p.shoulder+(moving?-Math.sin(walkTime+i*Math.PI)*.35:0),0,-s*p.armSpread);feet[i].rotation.x=-(hips[i].rotation.x+knees[i].rotation.x);feet[i].position.z=.075*Math.cos(hips[i].rotation.x+knees[i].rotation.x);elbows[i].rotation.x=p.elbow;elbows[i].rotation.z=-s*p.armSpread*1.42;}
player.updateMatrixWorld(true);const bounds=new THREE.Box3().setFromObject(player);pelvis.position.y+=Math.max(0,surface-bounds.min.y);
}
export function disposeAvatar(rig:AvatarRig){rig.player.removeFromParent();rig.player.traverse(o=>{if(o instanceof THREE.Mesh)o.geometry.dispose();});for(const m of rig.ownedMaterials)m.dispose();}
