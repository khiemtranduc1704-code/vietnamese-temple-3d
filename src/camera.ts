import * as T from 'three';
// Apply after smoothing, too: clear endpoints alone do not make the interpolated orbit safe.
export function clampCameraPosition(look:T.Vector3,desired:T.Vector3,objects:T.Object3D[],ignored:T.Object3D,camera:T.Camera,padding=.18){
 const delta=desired.clone().sub(look),distance=delta.length();if(distance<.001)return desired.clone();
 const ray=new T.Raycaster(look,delta.normalize(),0,distance);ray.camera=camera;
 const hit=ray.intersectObjects(objects,true).find(h=>{
  if(h.object instanceof T.Sprite)return false;
  for(let o:T.Object3D|null=h.object;o;o=o.parent)if(o===ignored||!o.visible||o.userData.cameraTransparent)return false;
  return true;
 });
 return hit?look.clone().addScaledVector(delta,Math.max(.03,hit.distance-padding)):desired.clone();
}
