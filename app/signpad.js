export class SignPad {
  constructor(canvas){
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.isDown = false;
    this.last = null;
    this._bind();
    this.clear();
  }
  _pos(evt){
    const rect = this.canvas.getBoundingClientRect();
    const x = (evt.clientX - rect.left) * (this.canvas.width / rect.width);
    const y = (evt.clientY - rect.top) * (this.canvas.height / rect.height);
    return {x,y};
  }
  _bind(){
    const c = this.canvas;
    const down = (e)=>{
      this.isDown = true;
      this.last = this._pos(e);
      c.setPointerCapture?.(e.pointerId);
    };
    const move = (e)=>{
      if(!this.isDown) return;
      const p = this._pos(e);
      this.ctx.beginPath();
      this.ctx.moveTo(this.last.x, this.last.y);
      this.ctx.lineTo(p.x, p.y);
      this.ctx.stroke();
      this.last = p;
    };
    const up = ()=>{ this.isDown=false; this.last=null; };

    c.addEventListener('pointerdown', down);
    c.addEventListener('pointermove', move);
    c.addEventListener('pointerup', up);
    c.addEventListener('pointercancel', up);
    c.addEventListener('pointerleave', up);
  }
  clear(){
    this.ctx.fillStyle = '#fff';
    this.ctx.fillRect(0,0,this.canvas.width,this.canvas.height);
    this.ctx.strokeStyle = '#111';
    this.ctx.lineWidth = 2;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
  }
  toDataURL(){
    // If blank? detect by checking pixel data - cheap sample
    const img = this.ctx.getImageData(0,0,this.canvas.width,this.canvas.height).data;
    let nonWhite = 0;
    for(let i=0;i<img.length;i+=40){
      if(img[i] !== 255 || img[i+1] !== 255 || img[i+2] !== 255){ nonWhite++; break; }
    }
    if(nonWhite===0) return '';
    return this.canvas.toDataURL('image/png');
  }
}
