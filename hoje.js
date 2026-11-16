// ---------- Hoje: decisão do dia, comparação com a equipa e detalhe em blocos que abrem ----------
(function(){
  const pg = document.getElementById('pg-hoje'), hero = pg && pg.querySelector('.hero'); if(!hero) return;
  const lc = document.getElementById('loadcard'), sc = document.getElementById('s-carga'), ss = document.getElementById('s-sessao');
  const {en: EN, t: TT} = I18N;
  const P0 = dayPlan(), s = P0.s, ratio = P0.ratio;
  const weight = (typeof BODY!=='undefined' && BODY.length) ? BODY[BODY.length-1].weight : 80;
  const c1 = Math.round(weight*7), c2 = Math.round(weight*8), carb = TT('carb-up de 7–8 g/kg ('+c1+'–'+c2+' g de hidratos no teu peso)','a 7–8 g/kg carb-up ('+c1+'–'+c2+' g of carbs at your weight)');
  const dd = P0.dd;
  const when = (dd===0 ? TT('Hoje','Today') : TT('Última sessão ','Last session ')+dshort(s.date)+(dd===1?TT(' (ontem)',' (yesterday)'):TT(' (há '+dd+' d)',' ('+dd+' d ago)')))
    + (P0.nm && P0.dm!=null && P0.dm>0 ? ' · '+TT('jogo','match')+(P0.nm.opp?' vs '+P0.nm.opp:'')+' '+(P0.dm===1?TT('amanhã','tomorrow'):TT('em '+P0.dm+' dias','in '+P0.dm+' days')) : '');
  // decisão do dia: a mesma regra que o Coach usa (dayPlan, em app.js)
  const SUB = {
    match: TT('Carb-up de manhã e recuperação completa depois do jogo.','Carb-up in the morning and full recovery after the match.'),
    same: TT((s.type==='Match'?'Jogo':'Mais de 3500 m')+': recuperação completa e '+carb+'.',(s.type==='Match'?'Match':'Over 3,500 m')+': full recovery and '+carb+'.'),
    next: TT('Calor, massagem e mobilidade. Refeições habituais.','Heat, massage and mobility. Usual meals.'),
    pre: TT('Prehab leve, sem volume extra, e '+carb+'.','Light prehab, no extra volume, and '+carb+'.'),
    over: TT('Semana muito acima do teu habitual: recupera bem.','Week well above your usual: recover well.'),
    high: TT('Acima do teu habitual: sono, comida e recuperação.','Above your usual: sleep, food and recovery.'),
    low: TT('Carga abaixo do habitual: podes treinar mais, se te sentires bem.','Load below your usual: you can do more if you feel good.'),
    normal: TT('Refeições habituais, sem carb-up extra.','Usual meals, no extra carb-up.')
  };
  const DT = DAYTXT[P0.k], D = {k:DT[0], t:TT(DT[1],DT[2]), s:SUB[P0.k]};
  const col = {good:'#5CC48A', warn:'#F2B84B', bad:'#FF6B6B', info:'#8FB4E8'}[D.k];
  const pos = ratio==null?0:Math.max(0,Math.min(100,ratio/1.5*100));
  const wkSp = Math.max(...SESSIONS.filter(x=>x.week===last.week).map(x=>x.maxSpeed)), goal = MAXREF*spdPct(), cw = wkTot(last.week);
  const T = window.TROFEUS || {level:'-',pts:0,medals:[]};
  const fresh = T.medals.filter(m=>m.date===last.date).length;
  const stat = (v,u,l)=>'<div><b>'+v+(u?'<em>'+u+'</em>':'')+'</b><small>'+l+'</small></div>';
  const trophy = '<button type="button" class="tt" data-go="trofeus"><b>'+T.level+'</b><small>'+T.pts+' pontos'+(fresh?' · '+fresh+(fresh===1?' medalha nova':' medalhas novas'):'')+'</small><small class="lk">Ver troféus ›</small></button>';
  // mini barras: últimas 12 sessões (jogo a vermelho, última a dourado), linha de dia pesado
  const R = SESSIONS.slice(-12), mx = Math.max(HEAVY, ...R.map(x=>x.rd)), W = 300, H = 56, bw = W/R.length;
  const bars = R.map((x,i)=>{ const h = Math.max(2, x.rd/mx*(H-4)); return '<rect x="'+(i*bw+3).toFixed(1)+'" y="'+(H-h).toFixed(1)+'" width="'+(bw-6).toFixed(1)+'" height="'+h.toFixed(1)+'" rx="3" fill="'+(x.type==='Match'?'#FF6B6B':(i===R.length-1?'#D9981A':'rgba(255,255,255,.45)'))+'"/>'; }).join('');
  const hy = (H-(HEAVY/mx*(H-4))).toFixed(1);

  const sec = document.createElement('section'); sec.id = 's-resumo'; sec.className = 'rsp';
  sec.innerHTML = '<small>'+when+'</small><div class="rt" style="color:'+col+'">'+D.t+'</div><small class="ds">'+D.s+'</small>'
   +'<div class="hc" id="hcoach" role="group" aria-label="Coach"></div>'
   +'<div class="rs-g"><i style="left:'+pos.toFixed(1)+'%"></i><u style="left:53.3%"></u><u style="left:86.7%"></u></div><div class="rs-gl"><span>0</span><span style="left:53.3%">0,8</span><span style="left:86.7%">1,3</span><span style="right:0">1,5+</span></div><small>'+TT('Carga vs. habitual: ','Load vs. usual: ')+(ratio?ratio.toFixed(2).replace('.',EN?'.':','):'-')+TT(' (0,8 a 1,3 é a zona segura)',' (0.8 to 1.3 is the safe zone)')+'</small>'
   +'<div class="g c3 rs-st">'+stat(f1(cw.rd/1000),'km',TT('Semana ','Week ')+last.week)+stat(f1(wkSp),'km/h',TT('Velocidade máx. · ','Top speed · ')+(wkSp>=goal?TT('alvo ✓','target ✓'):TT('alvo ','target ')+f1(goal)))+trophy+'</div>'
   +'<svg class="rs-bars" viewBox="0 0 '+W+' '+H+'" preserveAspectRatio="none" role="img" aria-label="Distância das últimas 12 sessões"><line x1="0" x2="'+W+'" y1="'+hy+'" y2="'+hy+'" stroke="rgba(255,255,255,.35)" stroke-dasharray="3 4"/>'+bars+'</svg><div class="cap">'+TT('Últimas 12 sessões · tracejado: dia pesado (3500 m) · vermelho: jogo','Last 12 sessions · dashed: heavy day (3,500 m) · red: match')+'</div>';
  hero.after(sec);
  sec.querySelector('.tt').addEventListener('click',()=>showTab('trofeus'));
  // o que o Coach tem para hoje: toca para abrir
  const fillCoach = () => { const el = document.getElementById('hcoach'); if(!el || !window.COACH || !COACH.status) return; const st = COACH.status();
    el.innerHTML = '<small>'+TT('Coach de hoje','Coach today')+'</small><div>'+st.map(x=>'<button type="button" data-tab="'+x.tab+'" class="'+(x.done?'ok':'')+'">'+(x.done?'✓ ':'')+x.name+'</button>').join('')+'</div>'; };
  sec.addEventListener('click', e => { const b = e.target.closest('#hcoach [data-tab]'); if(!b) return; showTab('coach'); if(window.COACH) COACH.setTab(b.dataset.tab); });
  addEventListener('DOMContentLoaded', fillCoach);
  new MutationObserver(() => { if(pg.classList.contains('on')) fillCoach(); }).observe(pg, {attributes:true, attributeFilter:['class']});

  // como me comparo: tu vs. os outros scrum-halves vs. os 3/4 da equipa de jogo (relatório semanal)
  const P = typeof posWeek==='function' ? posWeek() : null;
  let comp = null;
  if(P && P.rows){
    const me = P.rows.find(r=>r.me), nine = P.rows.filter(r=>r.sh&&!r.me), bk = P.rows.filter(r=>r.g==='in');
    if(me && nine.length && bk.length){
      const av = (xs,k)=>xs.reduce((a,r)=>a+r[k],0)/xs.length;
      const M = [['rd','Distância',v=>f1(v/1000),' km'],['hsr','Corrida rápida',f0,' m'],['acc','Acelerações',f0,''],['sp','Velocidade máx.',f1,' km/h']];
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

  // estilos: em style.css (secção Hoje)

  // detalhes recolhidos: a sessão (com seletor das outras sessões) e a carga
  if(ss){ const d = document.createElement('details'); d.className='fold'; d.innerHTML='<summary><span>Sessão em detalhe e outras sessões</span></summary>'; [...ss.children].forEach(n=>d.appendChild(n)); ss.classList.add('dt'); ss.appendChild(d); }
  if(sc && lc){ const d = document.createElement('details'); d.className='fold'; d.innerHTML='<summary><span>Carga e recuperação: detalhe</span></summary>'; d.appendChild(lc); sc.classList.add('dt'); sc.innerHTML=''; sc.appendChild(d); }
  const after = comp || sec;
  if(ss){ after.after(ss); if(sc) ss.after(sc); } else if(sc){ after.after(sc); }
})();
