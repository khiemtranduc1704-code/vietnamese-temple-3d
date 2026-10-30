export const denominations=[100,200,500,1000,2000,5000,10000,20000,50000,100000,200000,500000] as const;
export type RitualMode='donation'|'fortune'|'incense'|'stars';
export class RitualState {
 donated=0;offerings=0;incense=0;hallIncense=0;fortune=0;stars=0;
 constructor(saved:Partial<RitualState>={}){for(const key of ['donated','offerings','incense','hallIncense','fortune','stars'] as const){const n=saved[key];if(typeof n==='number'&&Number.isSafeInteger(n)&&n>=0)this[key]=n;}this.hallIncense=Math.min(this.hallIncense,this.incense);if(this.fortune>32)this.fortune=0;}
 donate(value:number){if(!(denominations as readonly number[]).includes(value)||!Number.isSafeInteger(this.donated+value))return false;this.donated+=value;this.offerings++;return true;}
 burn(count:number,hall=false){if(count!==1&&count!==3)return false;this.incense+=count;if(hall)this.hallIncense+=count;return true;}
 draw(value:number){if(!Number.isInteger(value)||value<1||value>32)return false;this.fortune=value;return true;}
 lightStars(){this.stars++;}
 snapshot(){return {donated:this.donated,offerings:this.offerings,incense:this.incense,hallIncense:this.hallIncense,fortune:this.fortune,stars:this.stars};}
}
