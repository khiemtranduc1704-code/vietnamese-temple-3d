import * as T from 'three';
import {RitualState,denominations,type RitualMode} from './ritual-state';
export const ritualStations=[
 {x:7.7,z:-4.5,radius:1.3,label:'Thùng công đức · E để mở',action:'palms' as const,kind:'donation'},
 {x:-7.7,z:-4.5,radius:1.3,label:'Bàn xin xăm · E để xin quẻ',action:'palms' as const,kind:'fortune'},
 {x:0,z:-.95,radius:.9,label:'Lư hương sân · E để thắp hương',action:'palms' as const,kind:'incense'},
 {x:0,z:-14.45,radius:.8,label:'Lư hương chánh điện · E để thắp hương',action:'palms' as const,kind:'incense'},
 {x:13,z:-8.8,radius:1.6,label:'Bàn cúng sao · E để cầu an',action:'palms' as const,kind:'stars'}
];
const fortunes=[
 ['Chậm một nhịp','Trước một việc quan trọng, dành một hơi thở để nhìn lại điều mình thực sự cần.'],
 ['Lắng nghe','Một cuộc trò chuyện sẽ dễ chịu hơn khi ta nghe hết câu trước khi đáp lại.'],
 ['Bền bỉ','Chọn một việc nhỏ có ích và làm đều đặn mỗi ngày.'],
 ['Biết đủ','Ghi nhận một điều đang có thay vì chỉ nghĩ về điều còn thiếu.'],
 ['Thiện ý','Gửi một lời hỏi thăm chân thành đến người bạn đang nghĩ tới.'],
 ['Nghỉ ngơi','Cho mình một khoảng nghỉ khi mệt, rồi trở lại với việc cần làm.'],
 ['Gọn lại','Dọn một góc nhỏ quanh mình để có thêm khoảng trống cho tâm trí.'],
 ['Từ tốn','Không phải mọi chuyện đều cần giải quyết trong cùng một ngày.'],
 ['Cởi mở','Thử nhìn một vấn đề từ góc nhìn của người đối diện.'],
 ['Nhớ ơn','Nghĩ đến một người đã giúp mình và tìm cách nói lời cảm ơn.'],
 ['Chia sẻ','Một việc nhỏ để giúp người khác cũng có thể làm ngày hôm nay ấm hơn.'],
 ['Hiện tại','Chú tâm vào việc ở ngay trước mắt, làm từng bước một.'],
 ['Nhẹ lời','Chọn lời nói rõ ràng và hiền hòa, nhất là khi có bất đồng.'],
 ['Kiên nhẫn','Cho bản thân thời gian học một điều chưa quen.'],
 ['Thành thật','Nhìn nhận điều mình chưa biết là một cách bắt đầu tốt.'],
 ['Buông nhẹ','Có những điều không cần mang theo vào ngày mới.'],
 ['Gieo lành','Làm một việc tốt mà không cần chờ được ghi nhận.'],
 ['Đồng hành','Tìm đến một người tin cậy khi cần cùng suy nghĩ về một việc khó.'],
 ['Cân bằng','Dành thời gian cho cả công việc, nghỉ ngơi và những người thân.'],
 ['Bắt đầu','Một bước nhỏ hôm nay vẫn là một bước tiến.'],
 ['Tôn trọng','Mỗi người có một nhịp sống; hãy dành cho nhau sự tôn trọng.'],
 ['Quan sát','Nhìn kỹ một bông hoa, một bóng cây, hay chuyển động của hơi thở.'],
 ['Giữ lời','Chỉ hứa điều mình có thể làm và cố gắng thực hiện.'],
 ['Bao dung','Đối xử với một lỗi nhỏ của mình bằng sự bình tĩnh.'],
 ['Học hỏi','Đặt một câu hỏi tử tế trước điều mình chưa hiểu.'],
 ['Vừa sức','Chia việc lớn thành những phần nhỏ có thể bắt tay làm.'],
 ['An trú','Dừng một lát, thả lỏng vai và cảm nhận bàn chân đang chạm đất.'],
 ['Kết nối','Dành trọn một cuộc trò chuyện cho người đối diện, gác màn hình sang bên.'],
 ['Đơn giản','Một lựa chọn rõ ràng đôi khi tốt hơn nhiều kế hoạch chưa thể bắt đầu.'],
 ['Thấu hiểu','Không vội kết luận khi chưa biết hết câu chuyện.'],
 ['Mỉm cười','Nhớ lại một khoảnh khắc nhỏ đã làm mình vui hôm nay.'],
 ['Trở về','Dù ngày qua thế nào, vẫn có thể bắt đầu lại bằng một hơi thở nhẹ.']
];
export function createRituals(scene:T.Scene,solid:(x:number,z:number,w:number,d:number)=>void,hooks:{onOpen:()=>boolean;onClose:()=>void;onComplete?:(type:string,options:Record<string,unknown>)=>void}){
 let saved={};try{saved=JSON.parse(localStorage.getItem('anlac-rituals-v5')||'{}');}catch{}const state=new RitualState(saved||{});
 let sharedWorld:{hall:number;courtyard:number;stars:number}|null=null;
 let opened=false,mode:RitualMode='donation',selected=10000,sticks=3,intention='Bình an',pending:{mode:RitualMode;elapsed:number;value:number;hall:boolean}|null=null,nearHall=false;
 const root=new T.Group();scene.add(root);const materials=new Map<string,T.MeshStandardMaterial>();
 function material(color:string){if(!materials.has(color))materials.set(color,new T.MeshStandardMaterial({color,roughness:.64}));return materials.get(color)!;}
 function add(g:T.BufferGeometry,c:string,x:number,y:number,z:number,p:T.Object3D=root){const m=new T.Mesh(g,material(c));m.position.set(x,y,z);m.castShadow=m.receiveShadow=true;p.add(m);return m;}
 const box=(x:number,y:number,z:number,w:number,h:number,d:number,c:string,p:T.Object3D=root)=>add(new T.BoxGeometry(w,h,d),c,x,y,z,p);
 const cyl=(x:number,y:number,z:number,r:number,h:number,c:string,p:T.Object3D=root,r2=r)=>add(new T.CylinderGeometry(r,r2,h,20),c,x,y,z,p);
 const ball=(x:number,y:number,z:number,r:number,c:string,p:T.Object3D=root)=>add(new T.SphereGeometry(r,16,12),c,x,y,z,p);
 function plaque(text:string,x:number,y:number,z:number,w:number,p:T.Object3D=root){const c=document.createElement('canvas');c.width=512;c.height=192;const g=c.getContext('2d')!;g.fillStyle='#6e2725';g.fillRect(0,0,512,192);g.strokeStyle='#d8b66a';g.lineWidth=9;g.strokeRect(8,8,496,176);g.fillStyle='#f1d38a';g.font='bold 37px serif';g.textAlign='center';g.textBaseline='middle';g.fillText(text,256,96);const texture=new T.CanvasTexture(c);texture.colorSpace=T.SRGBColorSpace;const mesh=new T.Mesh(new T.PlaneGeometry(w,w*192/512),new T.MeshStandardMaterial({map:texture}));mesh.position.set(x,y,z);p.add(mesh);return mesh;}
 function table(x:number,z:number,w=2,d=1.3){box(x,.92,z,w,.18,d,'#694329');for(const side of [-1,1])for(const zz of [-1,1])box(x+side*(w/2-.16),.47,z+zz*(d/2-.12),.14,.88,.14,'#49301f');solid(x,z,w,d);}
 // Donation chest, slot and a stylized game voucher (no reproduction of legal currency).
 box(7.7,.7,-6,1.25,1.3,.9,'#783830');box(7.7,1.37,-6,1.35,.12,1,'#ab874c');box(7.7,1.435,-6,.6,.015,.065,'#271c19');plaque('CÔNG ĐỨC',7.7,.89,-5.54,1.05);solid(7.7,-6,1.4,1.05);
 const note=box(7.7,2.25,-6,.46,.012,.22,'#b0c4a1');note.visible=false;
 // Fortune tube and 32 bamboo slips, with a single animated drawn slip.
 table(-7.7,-6);const tube=new T.Group();tube.position.set(-7.7,1.02,-6);root.add(tube);cyl(0,.3,0,.25,.6,'#8d382a',tube);cyl(0,.62,0,.27,.06,'#d2ae60',tube);for(let i=0;i<32;i++){const a=i*2.4,r=.04+(i%4)*.045;const stick=box(Math.sin(a)*r,.8+(i%3)*.025,Math.cos(a)*r,.025,.65,.025,'#d7b477',tube);stick.rotation.z=Math.sin(i)*.08;}plaque('XIN XĂM',-7.7,.83,-5.32,1.25);
 const slip=box(-7.7,1.5,-6,.07,.8,.025,'#efcc83');slip.visible=false;
 // Outdoor star-offering table and a decorative nine-lamp arrangement.
 table(13,-11,4,2);box(13,1.08,-11,3.85,.08,1.9,'#8a2e28');plaque('BÀN CÚNG SAO',13,.77,-9.97,2.8);const board=plaque('CẦU AN',13,1.8,-11.7,1.2);
 for(const x of [11.5,14.5]){cyl(x,1.24,-11,.19,.32,'#c0a46b');ball(x,1.52,-11,.21,'#f1d6bb');}
 for(let i=0;i<5;i++){ball(12.6+i*.2,1.25,-10.35,.1,i%2?'#dba943':'#8ba05c');}
 const flames:T.Mesh[]=[];for(let i=0;i<9;i++){const a=i*Math.PI*2/9;const x=13+Math.sin(a)*1.05,z=-11+Math.cos(a)*.55;cyl(x,1.3,z,.055,.37,'#e9d6a2');const f=ball(x,1.54,z,.07,'#ffc45a');f.scale.set(.6,1.7,.6);f.visible=state.stars>0;flames.push(f);}
 const starGlow=new T.PointLight('#ffbd61',state.stars?2:0,5,2);starGlow.position.set(13,2,-11);root.add(starGlow);
 // A moving lit bundle and capped persistent incense in both existing burners.
 const bundle=new T.Group();root.add(bundle);bundle.visible=false;for(const x of [-.12,0,.12]){cyl(x,0,0,.012,.9,'#ab4934',bundle);ball(x,.46,0,.025,'#f8a344',bundle);}
 const planted:T.Group[]=[];function incenseVisuals(){for(const g of planted){g.removeFromParent();g.traverse(o=>{if(o instanceof T.Mesh)o.geometry.dispose();});}planted.length=0;for(const inHall of [true,false]){const count=Math.min(sharedWorld?(inHall?sharedWorld.hall:sharedWorld.courtyard):(inHall?state.hallIncense:state.incense-state.hallIncense),30);for(let i=0;i<count;i++){const g=new T.Group();g.position.set(Math.sin(i*2.4)*.3,inHall?1.3:1.65,(inHall?-16.1:-3)+Math.cos(i*2.4)*.2);root.add(g);cyl(0,0,0,.009,.7,'#954e37',g);ball(0,.36,0,.02,'#e77b41',g);planted.push(g);}}}incenseVisuals();
 document.querySelector('#app')!.insertAdjacentHTML('beforeend',`<button id="ritual-launch" class="ritual-launch">Nghi lễ & công đức · N</button><section id="rituals" class="rituals hidden" role="dialog" aria-modal="true" aria-label="Nghi lễ trong chùa"><article class="ritual-card"><header><span>CHÙA AN LẠC · NGHI LỄ TRONG GAME</span><button id="ritual-close">Đóng · Esc</button></header><nav>${(['donation','fortune','incense','stars'] as const).map((m,i)=>`<button data-ritual-tab="${m}">${['Công đức','Xin xăm','Thắp hương','Cúng sao'][i]}</button>`).join('')}</nav><div class="ritual-columns"><div id="ritual-stage" class="ritual-stage" aria-hidden="true"></div><div id="ritual-form"></div></div><p id="ritual-feedback" role="status" aria-live="polite"></p></article></section>`);
 const overlay=document.querySelector<HTMLElement>('#rituals')!,stage=document.querySelector<HTMLElement>('#ritual-stage')!,form=document.querySelector<HTMLElement>('#ritual-form')!;
 const money=(n:number)=>n.toLocaleString('vi-VN')+' ₫';function save(){try{localStorage.setItem('anlac-rituals-v5',JSON.stringify(state.snapshot()));}catch{}}
 function feedback(text:string){document.querySelector('#ritual-feedback')!.textContent=text;}
 function result(){if(!state.fortune)return '';const f=fortunes[state.fortune-1];return `<div class="fortune-result"><span>QUẺ SỐ ${String(state.fortune).padStart(2,'0')}</span><h3>${f[0]}</h3><p>${f[1]}</p></div>`;}
 function render(){document.querySelectorAll<HTMLButtonElement>('[data-ritual-tab]').forEach(b=>{b.classList.toggle('active',b.dataset.ritualTab===mode);b.disabled=!!pending;});stage.className='ritual-stage '+mode+(pending?' busy':'');
  if(mode==='donation'){
   stage.innerHTML=`<div class="game-note"><small>AN LẠC · PHIẾU MÔ PHỎNG</small><strong>${money(selected)}</strong><span>THIỆN TÂM</span></div><div class="donation-illustration"><i></i><strong>CÔNG ĐỨC</strong></div>`;
   form.innerHTML=`<div class="eyebrow">GỬI MỘT CHÚT THIỆN TÂM</div><h2>Thùng công đức</h2><p class="simulation-note">Tiền mô phỏng trong game · không giao dịch tiền thật.</p><div class="denominations">${denominations.map(n=>`<button data-money="${n}" class="${n===selected?'active':''}">${money(n)}</button>`).join('')}</div><p>Đã gửi: <b>${money(state.donated)}</b> · ${state.offerings} lần</p><button id="ritual-perform" class="primary">Bỏ ${money(selected)} vào thùng</button>`;
   document.querySelectorAll<HTMLButtonElement>('[data-money]').forEach(b=>b.onclick=()=>{if(pending)return;selected=Number(b.dataset.money);render();});
  }else if(mode==='fortune'){
   stage.innerHTML=`<div class="fortune-tube">${Array.from({length:9},(_,i)=>`<i style="--i:${i}"></i>`).join('')}<strong>AN LẠC</strong></div><div class="drawn-slip">${state.fortune?String(state.fortune).padStart(2,'0'):'?'}</div>`;
   form.innerHTML=`<div class="eyebrow">MỘT LỜI NHẮC AN LÀNH</div><h2>Xin một quẻ xăm</h2><p>Lắc ống, rút một thẻ và đọc lời nhắc dành cho hôm nay.</p>${result()}<button id="ritual-perform" class="primary">Lắc ống & xin quẻ</button><small>Các quẻ do game biên soạn để chiêm nghiệm, không dự đoán tương lai.</small>`;
  }else if(mode==='incense'){
   stage.innerHTML=`<div class="incense-sticks">${Array.from({length:sticks},(_,i)=>`<i style="--i:${i}"><b></b></i>`).join('')}<span class="incense-mist"></span></div><div class="censer-illustration">AN LẠC</div>`;
   form.innerHTML=`<div class="eyebrow">MỘT NÉN HƯƠNG THÀNH KÍNH</div><h2>Thắp hương</h2><p>Chọn số nén hương, châm lửa rồi đặt vào lư hương trong cảnh 3D.</p><div class="ritual-choices"><button data-incense="1" class="${sticks===1?'active':''}">1 nén</button><button data-incense="3" class="${sticks===3?'active':''}">3 nén</button></div><p>Đã dâng: <b>${state.incense} nén hương</b></p><button id="ritual-perform" class="primary">Châm & dâng ${sticks} nén hương</button>`;
   document.querySelectorAll<HTMLButtonElement>('[data-incense]').forEach(b=>b.onclick=()=>{if(pending)return;sticks=Number(b.dataset.incense);render();});
  }else{
   stage.innerHTML=`<div class="star-board">CẦU AN</div><div class="star-lamps">${Array.from({length:9},(_,i)=>`<i style="--a:${i*40}deg" class="${state.stars>0?'lit':''}"></i>`).join('')}</div><div class="offering-cloth"></div>`;
   form.innerHTML=`<div class="eyebrow">BÀN CÚNG SAO · CẦU AN</div><h2>Gửi một lời nguyện lành</h2><p>Bàn lễ có hoa, trái cây, bài vị và chín ngọn đèn trang trí.</p><div class="ritual-choices">${['Bình an','Sức khỏe','Gia đình','Học tập'].map(v=>`<button data-intention="${v}" class="${intention===v?'active':''}">${v}</button>`).join('')}</div><p>Đã thắp đèn: <b>${state.stars} lần</b></p><button id="ritual-perform" class="primary">Thắp đèn · ${intention}</button><small>Nghi lễ mô phỏng trong game, không tính sao hạn hay hứa hẹn kết quả.</small>`;
   document.querySelectorAll<HTMLButtonElement>('[data-intention]').forEach(b=>b.onclick=()=>{if(pending)return;intention=b.dataset.intention!;render();});
  }
  document.querySelector<HTMLButtonElement>('#ritual-perform')!.onclick=perform;document.querySelectorAll<HTMLButtonElement>('#ritual-form button').forEach(b=>b.disabled=!!pending);
  if(pending)document.querySelector('#ritual-perform')!.textContent='Đang thực hiện…';
 }
 function perform(){if(pending)return;let value=selected;if(mode==='fortune'){const bytes=new Uint32Array(1);crypto.getRandomValues(bytes);value=bytes[0]%32+1;slip.visible=true;slip.position.y=1.5;}if(mode==='incense'){value=sticks;bundle.visible=true;bundle.children.forEach((o,i)=>o.visible=sticks===3||i<2);bundle.position.set(0,2.2,nearHall?-14.6:-1.4);}if(mode==='donation'){note.visible=true;note.position.set(7.7,2.25,-6);}pending={mode,elapsed:0,value,hall:nearHall};feedback(mode==='fortune'?'Đang lắc ống xăm…':mode==='incense'?'Châm lửa, thành kính dâng hương…':mode==='stars'?'Đang thắp từng ngọn đèn…':'Đang gửi phiếu công đức mô phỏng…');render();}
 function open(next:RitualMode,hall=false){if(!opened){if(!hooks.onOpen())return;opened=true;}nearHall=hall;mode=pending?.mode??next;overlay.classList.remove('hidden');render();feedback(pending?'Đang thực hiện…':'');document.querySelector<HTMLButtonElement>('#ritual-close')!.focus();}
 function close(){if(!opened)return;opened=false;overlay.classList.add('hidden');hooks.onClose();}
 document.querySelector<HTMLButtonElement>('#ritual-launch')!.onclick=()=>open('donation');document.querySelector<HTMLButtonElement>('#ritual-close')!.onclick=close;
 document.querySelectorAll<HTMLButtonElement>('[data-ritual-tab]').forEach(b=>b.onclick=()=>{if(pending)return;mode=b.dataset.ritualTab as RitualMode;render();feedback('');});
 window.addEventListener('keydown',e=>{if(!opened)return;e.stopImmediatePropagation();if(e.key==='Escape'||e.key.toLowerCase()==='r'){e.preventDefault();close();}else if(e.code==='Space'){e.preventDefault();if(!e.repeat)perform();}},true);
 function update(dt:number){const now=performance.now()/1000;flames.forEach((f,i)=>f.scale.y=1.55+Math.sin(now*5+i)*.18);if(!pending)return;pending.elapsed+=dt;const t=Math.min(1,pending.elapsed/1.8);
  if(pending.mode==='donation'){note.position.y=2.25-t*.85;note.scale.z=1-t*.92;}
  if(pending.mode==='fortune'){tube.rotation.z=Math.sin(t*35)*(1-t)*.14;slip.position.y=1.5+Math.max(0,(t-.5)*2)*.9;}
  if(pending.mode==='incense'){bundle.position.y=2.2-t*(pending.hall?.9:.55);bundle.position.z=T.MathUtils.lerp(pending.hall?-14.6:-1.4,pending.hall?-16.1:-3,t);}
  if(pending.mode==='stars'){flames.forEach((f,i)=>f.visible=i<Math.ceil(t*9));starGlow.intensity=t*2;const lamps=stage.querySelectorAll('.star-lamps i');lamps.forEach((l,i)=>l.classList.toggle('lit',i<Math.ceil(t*9)));}
  if(t<1)return;const done=pending;pending=null;let message='';
  if(done.mode==='donation'){state.donate(done.value);note.visible=false;note.scale.z=1;message=`Đã bỏ ${money(done.value)} mô phỏng vào thùng công đức.`;}
  if(done.mode==='fortune'){state.draw(done.value);tube.rotation.z=0;message=`Đã rút quẻ số ${String(state.fortune).padStart(2,'0')}.`;}
  if(done.mode==='incense'){state.burn(done.value,done.hall);bundle.visible=false;incenseVisuals();message=`Đã dâng ${done.value} nén hương.`;}
  if(done.mode==='stars'){state.lightStars();message=`Đã thắp đèn cầu an · ${intention}.`;}
  save();hooks.onComplete?.(done.mode,{hall:done.hall,count:done.value,value:done.value});if(opened){render();feedback(message);}
 }
 return {open,close,update,setSharedWorld:(value:{hall:number;courtyard:number;stars:number}|null)=>{if(JSON.stringify(sharedWorld)===JSON.stringify(value))return;sharedWorld=value;incenseVisuals();const lit=(sharedWorld?.stars??state.stars)>0;flames.forEach(f=>f.visible=lit);starGlow.intensity=lit?2:0;},get isOpen(){return opened;},snapshot:()=>state.snapshot()};
}
