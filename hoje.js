// ---------- Hoje: resumo no topo + detalhe em blocos que abrem ----------
(function(){
  const pg = document.getElementById('pg-hoje'), hero = pg && pg.querySelector('.hero'); if(!hero) return;
  const lc = document.getElementById('loadcard'), sc = document.getElementById('s-carga'), tr = document.getElementById('s-trofeus'), ss = document.getElementById('s-sessao');
  const end = new Date(last.date+'T00:00:00').getTime(), within = d=>SESSIONS.filter(x=>{const t=new Date(x.date+'T00:00:00').getTime();return t<=end && end-t<d*DAY;});
  const a7 = within(7), c28 = within(28), ac = a7.reduce((t,x)=>t+x.rd,0), ch = c28.reduce((t,x)=>t+x.rd,0)/4, ratio = ch?ac/ch:null;
  const stEl = lc && lc.querySelector('.light b'), stTxt = stEl ? stEl.textContent.split(' · ')[0] : 'Sem dados';
  const stK = stEl ? ((stEl.className.match(/t-(\w+)/)||[])[1]||'info') : 'info';
  const col = {good:'#5CC48A', warn:'#F2B84B', bad:'#FF6B6B', info:'#8FB4E8'}[stK] || '#8FB4E8';
  const pos = ratio==null?0:Math.max(0,Math.min(100,ratio/1.5*100));
  const wkSp = Math.max(...SESSIONS.filter(x=>x.week===last.week).map(x=>x.maxSpeed)), goal = MAXREF*0.95;
  const cw = wkTot(last.week);
  const T = window.TROFEUS || {level:'-',pts:0,medals:[]};
  const fresh = T.medals.filter(m=>m.date===last.date).length;
  // mini barras: últimas 12 sessões (jogo a vermelho), linha de dia pesado
  const L = SESSIONS.slice(-12), mx = Math.max(HEAVY, ...L.map(x=>x.rd)), W = 300, H = 56, bw = W/L.length;
  const bars = L.map((x,i)=>{ const h = Math.max(2, x.rd/mx*(H-4)); return '<rect x="'+(i*bw+3).toFixed(1)+'" y="'+(H-h).toFixed(1)+'" width="'+(bw-6).toFixed(1)+'" height="'+h.toFixed(1)+'" rx="3" fill="'+(x.type==='Match'?'#FF6B6B':(i===L.length-1?'#D9981A':'rgba(255,255,255,.45)'))+'"/>'; }).join('');
  const hy = (H-(HEAVY/mx*(H-4))).toFixed(1);
  const stat = (v,u,l)=>'<div><b>'+v+(u?'<em>'+u+'</em>':'')+'</b><small>'+l+'</small></div>';
  const sec = document.createElement('section'); sec.id = 's-resumo';
  sec.innerHTML = '<div class="rs"><div class="rs-top"><div><small>Estado hoje</small><b style="color:'+col+'">'+stTxt+'</b></div><div class="rs-r"><b>'+(ratio?ratio.toFixed(2).replace('.',','):'-')+'</b><small>carga 7d vs. habitual</small></div></div>'
   +'<div class="rs-g"><i style="left:'+pos.toFixed(1)+'%"></i><u style="left:53.3%"></u><u style="left:86.7%"></u></div><div class="rs-gl"><span>0</span><span style="left:53.3%">0,8</span><span style="left:86.7%">1,3</span><span style="right:0">1,5+</span></div>'
   +'<div class="rs-st">'+stat(f1(cw.rd/1000),'km','Semana '+last.week)+stat(f1(wkSp),'km/h','Vel. máx. '+(wkSp>=goal?'· meta ✓':'· meta '+f1(goal)))+stat(T.level,'', T.pts+' pontos'+(fresh?' · '+fresh+(fresh===1?' medalha nova':' medalhas novas'):''))+'</div>'
   +'<svg class="rs-bars" viewBox="0 0 '+W+' '+H+'" preserveAspectRatio="none" role="img" aria-label="Distância das últimas 12 sessões"><line x1="0" x2="'+W+'" y1="'+hy+'" y2="'+hy+'" stroke="rgba(255,255,255,.35)" stroke-dasharray="3 4"/>'+bars+'</svg><div class="rs-cap">Últimas 12 sessões · linha tracejada: dia pesado (3500 m) · vermelho: jogo</div></div>';
  hero.after(sec);
  const css = document.createElement('style');
  css.textContent = '#s-resumo .rs{background:var(--navy,#0E1A2E);color:#fff;border-radius:14px;padding:16px;margin-top:14px}#s-resumo small{display:block;font-size:12px;opacity:.75}#s-resumo .rs-top{display:flex;justify-content:space-between;align-items:flex-end;gap:12px}#s-resumo .rs-top b{font-family:"Barlow Condensed",sans-serif;font-size:30px;font-weight:700;line-height:1.1;display:block}#s-resumo .rs-r{text-align:right}#s-resumo .rs-r b{color:#fff!important}'
   +'#s-resumo .rs-g{position:relative;height:10px;border-radius:5px;margin-top:12px;background:linear-gradient(90deg,rgba(143,180,232,.35) 0 53.3%,rgba(92,196,138,.55) 53.3% 86.7%,rgba(242,184,75,.5) 86.7%)}#s-resumo .rs-g u{position:absolute;top:0;bottom:0;width:2px;background:rgba(255,255,255,.5)}#s-resumo .rs-g i{position:absolute;top:-4px;width:4px;height:18px;margin-left:-2px;border-radius:2px;background:#fff;z-index:1}#s-resumo .rs-gl{position:relative;height:14px;margin-top:4px;font-size:11px;opacity:.7}#s-resumo .rs-gl span{position:absolute;transform:translateX(-50%)}#s-resumo .rs-gl span:first-child{left:0;transform:none}#s-resumo .rs-gl span[style*="right"]{transform:none}'
   +'#s-resumo .rs-st{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin-top:12px}#s-resumo .rs-st div{background:rgba(255,255,255,.08);border-radius:10px;padding:10px;min-width:0}#s-resumo .rs-st b{font-family:"Barlow Condensed",sans-serif;font-size:26px;font-weight:600;line-height:1;display:block}#s-resumo .rs-st em{font-style:normal;font-size:12px;margin-left:3px;opacity:.75}#s-resumo .rs-st small{margin-top:5px;font-size:11px}'
   +'#s-resumo .rs-bars{display:block;width:100%;height:56px;margin-top:14px}#s-resumo .rs-cap{font-size:11px;opacity:.65;margin-top:6px}'
   +'#s-carga.dt{margin-top:0}#s-carga.dt>h2{display:none}#s-carga.dt details.fold{margin-top:16px}';
  document.head.appendChild(css);
  // ordem: resumo, sessão, troféus, detalhe da carga (dentro de um bloco que abre)
  if(sc && lc){ const d = document.createElement('details'); d.className='fold'; d.innerHTML='<summary><span>Carga e recuperação: detalhe</span></summary>'; d.appendChild(lc); sc.classList.add('dt'); sc.innerHTML=''; sc.appendChild(d); }
  if(ss) sec.after(ss);
  if(tr && ss) ss.after(tr);
  if(sc){ (tr||ss).after(sc); }
})();
