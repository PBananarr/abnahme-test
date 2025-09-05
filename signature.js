(function(){
  function SigPad(canvas){
    const ctx = canvas.getContext('2d');
    ctx.lineWidth = 2; ctx.lineCap = 'round';
    let drawing = false; let prev = null;
    const pos = e => {
      const r = canvas.getBoundingClientRect();
      const touch = e.touches && e.touches[0];
      const x = (touch? touch.clientX : e.clientX) - r.left;
      const y = (touch? touch.clientY : e.clientY) - r.top;
      return {x, y};
    };
    const start = e => { drawing = true; prev = pos(e); e.preventDefault(); };
    const move = e => { if(!drawing) return; const p = pos(e); ctx.beginPath(); ctx.moveTo(prev.x, prev.y); ctx.lineTo(p.x, p.y); ctx.stroke(); prev = p; e.preventDefault(); };
    const end = e => { drawing = false; e.preventDefault(); };
    canvas.addEventListener('mousedown', start); canvas.addEventListener('mousemove', move); window.addEventListener('mouseup', end);
    canvas.addEventListener('touchstart', start, {passive:false}); canvas.addEventListener('touchmove', move, {passive:false}); canvas.addEventListener('touchend', end);
    this.clear = () => { ctx.clearRect(0,0,canvas.width,canvas.height); };
    this.toDataURL = () => canvas.toDataURL('image/png');
  }
  window.SimpleSignaturePad = SigPad;
})();