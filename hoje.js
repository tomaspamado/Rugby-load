// ---------- Hoje: decisão do dia, comparação com a equipa e detalhe em blocos que abrem ----------
(function(){
  const pg = document.getElementById('pg-hoje'), hero = pg && pg.querySelector('.hero'); if(!hero) return;
  const lc = document.getElementById('loadcard'), sc = document.getElementById('s-carga'), ss = document.getElementById('s-sessao');
  const s = last, match = s.type==='Match', heavy = s.rd > HEAVY;
  const ratio = meanRd(28,s) ? meanRd(7,s)/meanRd(28,s) : null;
  const weight = (typeof BODY!=='undefined' && BODY.length) ? BODY[BODY.length-1].weight : 80;
  const c1 = Math.round(weight*7), c2 = Math.round(weight*8);
  const dd = Math.max(0, Math.floor((Date.now() - new Date(s.date+'T00:00:00').getTime())/DAY));
  const when = dd===0 ? 'Hoje' : 'Última sessão · '+dshort(s.date)+(dd===1?' (ontem)':' (há '+dd+' d)');

  // decisão do dia (as regras do teu plano: jogo ou dia pesado = recuperação completa + carb-up)
  let D;
  if(match) D = {k:'warn', t:'Dia de jogo: recupera', s:'Recuperação completa e carb-up de 7–8 g/kg ('+c1+'–'+c2+' g de hidratos de carbono no teu peso).'};
  else if(heavy) D = {k:'warn', t:'Dia pesado: recupera', s:'Recuperação completa e carb-up de 7–8 g/kg ('+c1+'–'+c2+' g de hidratos de carbono no teu peso).'};
  else if(ratio!=null && ratio>1.5) D = {k:'bad', t:'Poupa o próximo treino', s:'Semana muito acima do teu habitual: recupera bem.'};
  else if(ratio!=null && ratio>1.3) D = {k:'warn', t:'Carga alta: cuida da recuperação', s:'Acima do teu habitual: sono, comida e recuperação.'};
  else if(ratio!=null && ratio<0.8) D = {k:'info', t:'Há margem para mais', s:'Carga abaixo do habitual: podes treinar mais, se te sentires bem.'};
  else D = {k:'good', t:'Dia normal', s:'Refeições habituais, sem carb-up extra.'};
  const col = {good:'#5CC48A', warn:'#F2B84B', bad:'#FF6B6B', info:'#8FB4E8'}[D.k];

  // frase-resumo e três pontos de estado, lidos do cartão da última sessão
  const vEl = document.querySelector('#latest .verdict'), verdict = vEl ? vEl.textContent : '';
  const L = [...document.querySelectorAll('#latest .light')].slice(0,3), pre = ['Sessão','Semana',''];
  const dot = {good:'#5CC48A', warn:'#F2B84B', bad:'#FF6B6B', info:'#8FB4E8'};
  const pills = L.map((el,i)=>{ const k=(el.className.match(/s-(\w+)/)||[])[1]||'info', b=el.querySelector('b'); return '<span class="pl"><i style="background:'+dot[k]+'"></i>'+(pre[i]?pre[i]+': ':'')+(b?b.textContent:'')+'</span>'; }).join('');

  const pos = ratio==null?0:Math.max(0,Math.min(100,ratio/1.5*100));
  const wkSp = Math.max(...SESSIONS.filter(x=>x.week===s.week).map(x=>x.maxSpeed)), goal = MAXREF*0.95, cw = wkTot(s.week);
  const T = window.TROFEUS || {level:'-',pts:0,medals:[]};
  const fresh = T.medals.filter(m=>m.date===s.date).length;
  const stat = (v,u,l)=>'<div><b>'+v+(u?'<em>'+u+'</em>':'')+'</b><small>'+l+'</small></div>';
  const trophy = '<button type="button" class="tt" data-go="trofeus"><b>'+T.level+'</b><small>'+T.pts+' pontos'+(fresh?' · '+fresh+(fresh===1?' medalha nova':' medalhas novas'):'')+'</small><small class="lk">Ver troféus ›</small></button>';
  // mini barras: últimas 12 sessões (jogo a vermelho, última a dourado), linha de dia pesado
  const R = SESSIONS.slice(-12), mx = Math.max(HEAVY, ...R.map(x=>x.rd)), W = 300, H = 56, bw = W/R.length;
  const bars = R.map((x,i)=>{ const h = Math.max(2, x.rd/mx*(H-4)); return '<rect x="'+(i*bw+3).toFixed(1)+'" y="'+(H-h).toFixed(1)+'" width="'+(bw-6).toFixed(1)+'" height="'+h.toFixed(1)+'" rx="3" fill="'+(x.type==='Match'?'#FF6B6B':(i===R.length-1?'#D9981A':'rgba(255,255,255,.45)'))+'"/>'; }).join('');
  const hy = (H-(HEAVY/mx*(H-4))).toFixed(1);

  const sec = document.createElement('section'); sec.id = 's-resumo'; sec.className = 'rsp';
  sec.innerHTML = '<small>'+when+'</small><div class="rt" style="color:'+col+'">'+D.t+'</div><small class="ds">'+D.s+'</small>'
   +(verdict?'<div class="vd">'+verdict+'</div>':'')
   +'<div class="pls">'+pills+'</div>'
   +'<div class="rs-g"><i style="left:'+pos.toFixed(1)+'%"></i><u style="left:53.3%"></u><u style="left:86.7%"></u></div><div class="rs-gl"><span>0</span><span style="left:53.3%">0,8</span><span style="left:86.7%">1,3</span><span style="right:0">1,5+</span></div><small>Carga desta semana vs. o teu habitual: '+(ratio?ratio.toFixed(2).replace('.',','):'-')+' (0,8 a 1,3 é a zona segura)</small>'
   +'<div class="g c3 rs-st">'+stat(f1(cw.rd/1000),'km','Semana '+s.week)+stat(f1(wkSp),'km/h','Vel. máx. '+(wkSp>=goal?'· meta ✓':'· meta '+f1(goal)))+trophy+'</div>'
   +'<svg class="rs-bars" viewBox="0 0 '+W+' '+H+'" preserveAspectRatio="none" role="img" aria-label="Distância das últimas 12 sessões"><line x1="0" x2="'+W+'" y1="'+hy+'" y2="'+hy+'" stroke="rgba(255,255,255,.35)" stroke-dasharray="3 4"/>'+bars+'</svg><div class="cap">Últimas 12 sessões · tracejado: dia pesado (3500 m) · vermelho: jogo</div>';
  hero.after(sec);
  sec.querySelector('.tt').addEventListener('click',()=>showTab('trofeus'));

  // como me comparo: tu vs. os outros scrum-halves vs. os 3/4 da equipa de jogo (relatório semanal)
  const P = (typeof POSWK46!=='undefined' && POSWK46.rows) ? POSWK46 : (typeof POSWK!=='undefined' ? POSWK : null);
  let comp = null;
  if(P && P.rows){
    const me = P.rows.find(r=>r.me), nine = P.rows.filter(r=>r.sh&&!r.me), bk = P.rows.filter(r=>r.g==='in');
    if(me && nine.length && bk.length){
      const av = (xs,k)=>xs.reduce((a,r)=>a+r[k],0)/xs.length;
      const M = [['rd','Distância',v=>f1(v/1000),' km'],['hsr','Corrida rápida',f0,' m'],['acc','Acelerações',f0,''],['sp','Vel. máx.',f1,' km/h']];
      const firsts = M.filter(([k])=>nine.every(r=>me[k]>r[k])).length;
      const row = ([k,n,f,u])=>{ const best = nine.every(r=>me[k]>r[k]) && me[k]>=av(bk,k); const dv = (me[k]/av(bk,k)-1)*100;
        return '<div class="cr"><span>'+n+'</span><b class="'+(best?'ok':'')+'">'+f(me[k])+'<i>'+u+'</i></b><span>'+f(av(nine,k))+'</span><span>'+f(av(bk,k))+'<small class="'+(dv>=5?'up':dv<=-5?'dn':'')+'">'+(dv>=0?'+':'')+Math.round(dv)+'%</small></span></div>'; };
      comp = document.createElement('section'); comp.id = 's-comp';
      comp.innerHTML = '<div class="card"><span class="tag">Como me comparo · semana '+P.week+(P.final?' (final)':' (parcial)')+'</span>'
       +'<p class="cvd">'+(firsts?'Primeiro dos '+(nine.length+1)+' scrum-halves em '+firsts+' de 4 métricas.':'Atrás dos outros scrum-halves nas 4 métricas.')+'</p>'
       +'<div class="cr ch"><span></span><span>Tu</span><span>Outros 9</span><span>3/4</span></div>'+M.map(row).join('')
       +'<div class="sub" style="margin-top:8px">Outros 9: média de '+nine.length+' scrum-halves. 3/4: média de '+bk.length+' backs da equipa de jogo; a percentagem é a tua diferença para eles. Os valores deles incluem o jogo.</div>'
       +'<button type="button" class="more-btn" data-go="semana">Ver a semana completa</button></div>';
      sec.after(comp);
      comp.querySelector('.more-btn').addEventListener('click',()=>showTab('semana'));
    }
  }

  const css = document.createElement('style');
  css.textContent = '#s-resumo .rt{font-size:32px}#s-resumo .ds{opacity:.85;margin-top:4px;font-size:13px}#s-resumo .vd{margin-top:12px;font-size:15px;line-height:1.35;font-weight:500}'
   +'#s-resumo .pls{display:flex;flex-wrap:wrap;gap:6px;margin-top:12px}#s-resumo .pl{display:inline-flex;align-items:center;gap:6px;font-size:12px;background:rgba(255,255,255,.1);border-radius:99px;padding:5px 10px}#s-resumo .pl i{width:8px;height:8px;border-radius:50%;display:inline-block}'
   +'#s-resumo .rs-g{position:relative;height:10px;border-radius:5px;margin-top:16px;background:linear-gradient(90deg,rgba(143,180,232,.35) 0 53.3%,rgba(92,196,138,.55) 53.3% 86.7%,rgba(242,184,75,.5) 86.7%)}#s-resumo .rs-g u{position:absolute;top:0;bottom:0;width:2px;background:rgba(255,255,255,.5)}#s-resumo .rs-g i{position:absolute;top:-4px;width:4px;height:18px;margin-left:-2px;border-radius:2px;background:#fff;z-index:1}#s-resumo .rs-gl{position:relative;height:14px;margin-top:4px;font-size:11px;opacity:.75}#s-resumo .rs-gl span{position:absolute;transform:translateX(-50%)}#s-resumo .rs-gl span:first-child{left:0;transform:none}#s-resumo .rs-gl span[style*="right"]{transform:none}'
   +'#s-resumo .rs-st small{margin-top:5px;font-size:11px}#s-resumo .tt{font:inherit;color:#fff;text-align:left;background:rgba(255,255,255,.08);border:0;border-radius:10px;padding:10px;min-width:0;cursor:pointer;min-height:44px}#s-resumo .tt b{font-family:"Barlow Condensed",sans-serif;font-size:26px;font-weight:600;line-height:1;display:block;color:#D9981A}#s-resumo .tt .lk{opacity:.9;text-decoration:underline}'
   +'#s-resumo .rs-bars{display:block;width:100%;height:56px;margin-top:14px}'
   +'#s-comp{margin-top:14px}#s-comp .cvd{font-size:18px;font-weight:600;margin:6px 0 10px;line-height:1.3}#s-comp .cr{display:grid;grid-template-columns:minmax(0,1.3fr) minmax(0,1fr) minmax(0,1fr) minmax(0,1fr);gap:6px;align-items:baseline;padding:10px 0;border-top:1px solid var(--line);font-size:13px;font-variant-numeric:tabular-nums}#s-comp .cr>span:first-child{font-weight:500}#s-comp .cr b{font-family:"Barlow Condensed",sans-serif;font-size:21px;font-weight:700}#s-comp .cr b{white-space:nowrap}#s-comp .cr b i{font:500 11px Inter,sans-serif;margin-left:2px}#s-comp .cr b.ok{color:#1F5A2B}#s-comp .cr small{display:block;font-size:11px;color:var(--ink-muted)}#s-comp .cr small.up{color:#1F5A2B}#s-comp .cr small.dn{color:#7A5300}#s-comp .cr.ch{border-top:0;padding:0 0 4px;font-size:12px;color:var(--ink-muted)}'
   +'#s-carga.dt{margin-top:0}#s-carga.dt>h2{display:none}#s-carga.dt details.fold{margin-top:12px}#s-sessao.dt{margin-top:0}#s-sessao.dt details.fold{margin-top:12px}#wktrend{display:none}';
  document.head.appendChild(css);

  // detalhes recolhidos: a sessão (com seletor das outras sessões) e a carga
  if(ss){ const d = document.createElement('details'); d.className='fold'; d.innerHTML='<summary><span>Sessão em detalhe e outras sessões</span></summary>'; [...ss.children].forEach(n=>d.appendChild(n)); ss.classList.add('dt'); ss.appendChild(d); }
  if(sc && lc){ const d = document.createElement('details'); d.className='fold'; d.innerHTML='<summary><span>Carga e recuperação: detalhe</span></summary>'; d.appendChild(lc); sc.classList.add('dt'); sc.innerHTML=''; sc.appendChild(d); }
  const after = comp || sec;
  if(ss){ after.after(ss); if(sc) ss.after(sc); } else if(sc){ after.after(sc); }
})();
