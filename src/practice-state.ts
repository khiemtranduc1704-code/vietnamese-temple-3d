export type PracticeMode='beads'|'mok'|'book';
export class PracticeState {
 total=0; strikes=0;page=0;lastBead=-Infinity; paced=false;readonly pageCount=10;
 constructor(total=0,page=0){this.total=Number.isSafeInteger(total)&&total>=0?total:0;this.page=Math.max(0,Math.min(this.pageCount-1,Number.isInteger(page)?page:0));}
 bead(now:number){if(this.paced&&now-this.lastBead<900)return false;this.total++;this.lastBead=now;return true;}
 turn(direction:number){const next=Math.max(0,Math.min(this.pageCount-1,this.page+Math.sign(direction)));const changed=next!==this.page;this.page=next;return changed;}
 get progress(){return this.total%108;}get rounds(){return Math.floor(this.total/108);}
}
