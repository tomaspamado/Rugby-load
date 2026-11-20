// ---------- Hoje: decisão do dia, comparação com a equipa e detalhe em blocos que abrem ----------
(function(){
  const pg = document.getElementById('pg-hoje'), hero = pg && pg.querySelector('.hero'); if(!hero) return;
  const lc = document.getElementById('loadcard'), sc = document.getElementById('s-carga'), ss = document.getElementById('s-sessao');
  const {en: EN, t: TT} = I18N;
  const P0 = dayPlan(), s = P0.s, ratio = P0.ratio;
  // peso para o carb-up: média de 7 dias da balança, se houver pesagens recentes; senão a última medição ISAK
  const weight = (window.SCALE && SCALE.weight()) || ((typeof BODY!=='undefined' && BODY.length) ? BODY[BODY.length-1].weight : 80);
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
  const wkSp = Math.max(0, ...SESSIONS.filter(x=>x.week===CUR_WEEK).map(x=>x.maxSpeed)), goal = MAXREF*spdPct(), cw = wkTot(CUR_WEEK) || {rd:0};
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
   +'<div class="g c3 rs-st">'+stat(f1(cw.rd/1000),'km',TT('Semana ','Week ')+CUR_WEEK)+stat(wkSp?f1(wkSp):'–',wkSp?'km/h':'',TT('Velocidade máx. · ','Top speed · ')+(wkSp>=goal?TT('alvo ✓','target ✓'):TT('alvo ','target ')+f1(goal)))+trophy+'</div>'
   +'<svg class="rs-bars" viewBox="0 0 '+W+' '+H+'" preserveAspectRatio="none" role="img" aria-label="Distância das últimas 12 sessões"><line x1="0" x2="'+W+'" y1="'+hy+'" y2="'+hy+'" stroke="rgba(255,255,255,.35)" stroke-dasharray="3 4"/>'+bars+'</svg><div class="cap">'+TT('Últimas 12 sessões · tracejado: dia pesado (3500 m) · vermelho: jogo','Last 12 sessions · dashed: heavy day (3,500 m) · red: match')+'</div>';
  hero.after(sec);
  sec.querySelector('.tt').addEventListener('click',()=>showTab('trofeus'));
  // a linha da carga abre a carga dia a dia (gráfico em ponto grande)
  (function(){
    const g = sec.querySelector('.rs-g'), gl = sec.querySelector('.rs-gl'), cap = gl && gl.nextElementSibling; if(!g || !gl || !cap) return;
    const box = document.createElement('div'); box.setAttribute('role','button'); box.tabIndex = 0; box.style.cursor = 'pointer';
    box.setAttribute('aria-label', TT('Abrir a carga dia a dia','Open daily load'));
    g.before(box); box.append(g, gl, cap);
    cap.insertAdjacentHTML('beforeend', '<br><span style="opacity:.85;font-weight:600">'+TT('Ver dia a dia ›','See day by day ›')+'</span>');
    const open = () => openLoad(box);
    box.addEventListener('click', open); box.addEventListener('keydown', e => { if(e.key==='Enter' || e.key===' '){ e.preventDefault(); open(); } });
  })();
  function openLoad(card){
    if(!window.GSHEET || !window.Chart) return;
    const reduce = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
    // um ponto por dia: carga vs. habitual = soma dos últimos 7 dias / (soma dos últimos 28 dias / 4), a mesma regra do resto da app
    const byDay = {}; SESSIONS.forEach(x => { (byDay[x.date] = byDay[x.date] || []).push(x); });
    // dias de calendário (setDate, para não escorregar na mudança de hora); começa quando já há 4 semanas de histórico
    const days = [], dd0 = new Date(SESSIONS[0].date+'T12:00:00'); dd0.setDate(dd0.getDate()+27);
    for(const d = dd0; isoDay(d) <= TODAY; d.setDate(d.getDate()+1)) days.push(isoDay(d));
    const rows = days.map(d => { const ref = {date:d}, xs = byDay[d] || [];
      return {d, r: loadRatio(ref), gap: GAP_WEEKS.has(REG.isoWeek(d)), rd: xs.reduce((a,x)=>a+x.rd,0), match: xs.some(x=>x.type==='Match'), xs}; });
    const st = {v:'ratio', range:30, sel:0};
    const html = '<h2>'+TT('Carga dia a dia','Daily load')+'</h2><div class="sub2">'+TT('Carga vs. habitual: últimos 7 dias ÷ média semanal das últimas 4 semanas. Zona segura 0,8 a 1,3.','Load vs. usual: last 7 days ÷ weekly average of the last 4 weeks. Safe zone 0.8 to 1.3.')+'</div>'
      +'<div class="gr" aria-live="polite"><small class="r1"></small><div class="gv"></div><div class="gd r3"></div><small class="r4"></small></div>'
      +'<div class="gflt"><div class="seg" role="group" aria-label="'+TT('Vista','View')+'"><button type="button" data-lv="ratio">'+TT('Carga vs. habitual','Load vs. usual')+'</button><button type="button" data-lv="rd">'+TT('Distância por dia','Distance per day')+'</button></div>'
      +'<div class="seg" role="group" aria-label="'+TT('Período','Period')+'">'+[[30,TT('30 dias','30 days')],[90,TT('90 dias','90 days')],[0,TT('Tudo','All')]].map(([r,l])=>'<button type="button" data-lr="'+r+'">'+l+'</button>').join('')+'</div></div>'
      +'<div class="cbox"><canvas tabindex="0" role="img"></canvas></div><div class="gl"></div><p class="gh"></p>';
    window.GSHEET(card, TT('Carga dia a dia','Daily load'), html, root => {
      let ch = null, R = [];
      const q = x => root.querySelector(x), canvas = q('canvas');
      const zone = r => r==null ? ['nt', TT('Sem dados','No data')] : r>1.5 ? ['dn', TT('Muito acima do habitual','Well above usual')] : r>1.3 ? ['dn', TT('Acima da zona segura','Above the safe zone')] : r<0.8 ? ['nt', TT('Abaixo do habitual','Below usual')] : ['up', TT('Na zona segura','In the safe zone')];
      const read = () => { const x = R[st.sel]; if(!x){ q('.r1').textContent=''; q('.gv').innerHTML=''; q('.r3').innerHTML=''; q('.r4').textContent=''; return; }
        q('.r1').textContent = dlong(x.d);
        if(st.v==='ratio'){ const z = zone(x.r); q('.gv').innerHTML = x.r==null ? '–' : x.r.toFixed(2).replace('.', EN?'.':','); q('.r3').innerHTML = '<span class="'+z[0]+'">'+z[1]+'</span>'; }
        else { q('.gv').innerHTML = x.rd ? f0(x.rd)+'<em>m</em>' : TT('Descanso','Rest'); q('.r3').innerHTML = x.rd ? '<span class="'+(x.match?'dn':x.rd>HEAVY?'dn':'nt')+'">'+(x.match?TT('Jogo','Match'):x.rd>HEAVY?TT('Dia pesado','Heavy day'):TT('Treino','Training'))+'</span>' : ''; }
        q('.r4').textContent = x.gap ? TT('Semana sem GPS (Agronomia): conta como uma semana normal tua','Week without GPS: counted as one of your normal weeks') : x.xs.length ? x.xs.map(s=>(s.type==='Match'?TT('Jogo','Match'):TT('Treino','Training'))+' '+f0(s.rd)+' m').join(' · ') : TT('Sem sessão com GPS','No GPS session'); };
      const setSel = i => { if(i===st.sel || !R[i]) return; st.sel = i; read(); if(ch) ch.update('none'); };
      const draw = () => {
        R = st.range ? rows.slice(-st.range) : rows; st.sel = R.length-1;
        root.querySelectorAll('[data-lv]').forEach(b => b.setAttribute('aria-pressed', b.dataset.lv===st.v));
        root.querySelectorAll('[data-lr]').forEach(b => b.setAttribute('aria-pressed', +b.dataset.lr===st.range));
        const ratio = st.v==='ratio', labels = R.map(x => dshort(x.d));
        const band = {id:'lband', beforeDatasetsDraw(c){ const a = c.chartArea, y = c.scales.y, g = c.ctx; g.save();
          if(ratio){ const y1 = y.getPixelForValue(1.3), y0 = y.getPixelForValue(0.8); g.fillStyle = 'rgba(92,196,138,.16)'; g.fillRect(a.left, Math.max(a.top,y1), a.right-a.left, Math.min(a.bottom,y0)-Math.max(a.top,y1)); }
          else { const yh = y.getPixelForValue(HEAVY); if(yh>a.top && yh<a.bottom){ g.strokeStyle = 'rgba(255,255,255,.4)'; g.setLineDash([4,4]); g.beginPath(); g.moveTo(a.left,yh); g.lineTo(a.right,yh); g.stroke(); } }
          g.restore(); },
          afterDatasetsDraw(c){ const el = c.getDatasetMeta(0).data[st.sel]; if(!el) return; const a = c.chartArea, g = c.ctx; g.save(); g.strokeStyle = '#fff'; g.globalAlpha = .55; g.lineWidth = 1.5; g.setLineDash([4,4]); g.beginPath(); g.moveTo(el.x,a.top); g.lineTo(el.x,a.bottom); g.stroke(); g.restore();
            if(ratio && R[st.sel].r!=null){ g.save(); g.fillStyle = '#D9981A'; g.strokeStyle = '#0E1A2E'; g.lineWidth = 2.5; g.beginPath(); g.arc(el.x, el.y, 6, 0, 7); g.fill(); g.stroke(); g.restore(); } }};
        const ds = ratio
          ? [{data:R.map(x=>x.r), borderColor:'#FFFFFF', borderWidth:2.5, pointRadius:0, pointHoverRadius:0, tension:.3, spanGaps:true}]
          : [{type:'bar', data:R.map(x=>x.rd||null), backgroundColor:R.map((x,i)=>i===st.sel?'#D9981A':x.match?'#FF6B6B':'rgba(255,255,255,.6)'), borderRadius:4, borderSkipped:false, maxBarThickness:18}];
        if(ch) ch.destroy();
        ch = new Chart(canvas, {type: ratio?'line':'bar', data:{labels, datasets:ds}, plugins:[band], options:{responsive:true, maintainAspectRatio:false, animation:{duration:reduce()?0:400},
          events:['mousemove','mouseout','click','touchstart','touchmove'], interaction:{mode:'index', intersect:false, axis:'x'},
          onHover:(e,els)=>{ if(els && els.length) { setSel(els[0].index); if(!ratio){ ch.data.datasets[0].backgroundColor = R.map((x,i)=>i===st.sel?'#D9981A':x.match?'#FF6B6B':'rgba(255,255,255,.6)'); ch.update('none'); } } },
          plugins:{legend:{display:false}, tooltip:{enabled:false}},
          scales:{x:{ticks:{color:'rgba(255,255,255,.7)', maxRotation:0, autoSkip:true, maxTicksLimit:6, font:{size:11}}, grid:{display:false}},
                  y:{min:0, suggestedMax: ratio?1.6:4000, ticks:{color:'rgba(255,255,255,.7)', font:{size:11}, maxTicksLimit:5, callback:v => ratio ? v.toFixed(1).replace('.', EN?'.':',') : f1(v/1000)+' km'}, grid:{color:'rgba(255,255,255,.12)', drawTicks:false}, border:{display:false}}}}});
        q('.gl').innerHTML = ratio
          ? '<span><i style="background:#fff;height:3px;width:16px;border-radius:2px;vertical-align:3px"></i>'+TT('Carga vs. habitual','Load vs. usual')+'</span><span><i style="background:rgba(92,196,138,.5)"></i>'+TT('Zona segura 0,8–1,3','Safe zone 0.8–1.3')+'</span>'
          : '<span><i style="background:rgba(255,255,255,.6)"></i>'+TT('Treino','Training')+'</span><span><i style="background:#FF6B6B"></i>'+TT('Jogo','Match')+'</span><span>'+TT('Tracejado: dia pesado (3500 m)','Dashed: heavy day (3,500 m)')+'</span>';
        q('.gh').textContent = ratio
          ? TT('Cada ponto é um dia. Sobe nos dias com treino e desce nos dias de descanso. Acima de 1,3 a carga está a subir depressa demais; abaixo de 0,8 estás a treinar menos do que o teu habitual. Toca e arrasta o dedo para ver cada dia.','Each point is a day. It rises on training days and falls on rest days. Above 1.3 load is rising too fast; below 0.8 you are training less than usual. Touch and drag to see each day.')
          : TT('Metros corridos em cada dia (soma das sessões com GPS). Dias sem barra: descanso ou sem GPS.','Metres run each day (sum of GPS sessions). Days without a bar: rest or no GPS.');
        canvas.setAttribute('aria-label', TT('Carga dia a dia','Daily load'));
        read();
      };
      root.addEventListener('click', e => { const v = e.target.closest('[data-lv]'), r = e.target.closest('[data-lr]');
        if(v){ st.v = v.dataset.lv; draw(); } if(r){ st.range = +r.dataset.lr; draw(); } });
      canvas.addEventListener('keydown', e => { if(e.key==='ArrowLeft'){ e.preventDefault(); setSel(st.sel-1); } else if(e.key==='ArrowRight'){ e.preventDefault(); setSel(st.sel+1); } });
      draw();
      return () => { if(ch) ch.destroy(); };
    });
  }
  // o que o Coach tem para hoje: toca para abrir
  const fillCoach = () => { const el = document.getElementById('hcoach'); if(!el || !window.COACH || !COACH.status) return; const st = COACH.status();
    el.innerHTML = '<small>'+TT('Coach de hoje','Coach today')+'</small><div>'+st.map(x=>'<button type="button" data-tab="'+x.tab+'" class="'+(x.done?'ok':'')+'">'+(x.done?'✓ ':'')+x.name+'</button>').join('')+'</div>'; };
  sec.addEventListener('click', e => { const b = e.target.closest('#hcoach [data-tab]'); if(!b) return; showTab('coach'); if(window.COACH) COACH.setTab(b.dataset.tab); });
  addEventListener('DOMContentLoaded', fillCoach);
  new MutationObserver(() => { if(pg.classList.contains('on')) fillCoach(); }).observe(pg, {attributes:true, attributeFilter:['class']});

  // como me comparo: tu vs. os outros scrum-halves vs. os 3/4 (relatório semanal; durante a semana, a soma dos relatórios diários)
  const P = typeof posWeek==='function' ? posWeek() : null;
  let comp = null;
  if(P && P.rows){
    const me = P.rows.find(r=>r.me), nine = P.rows.filter(r=>r.sh&&!r.me), bk = P.rows.filter(r=>r.g==='in'&&!r.me);
    if(me && nine.length && bk.length){
      const av = (xs,k)=>xs.reduce((a,r)=>a+r[k],0)/xs.length;
      const M = [['rd','Distância',v=>f1(v/1000),' km'],['hsr','Corrida rápida',f0,' m'],['acc','Acelerações',f0,''],['sp','Velocidade máx.',f1,' km/h']];
      const firsts = M.filter(([k])=>nine.every(r=>me[k]>r[k])).length;
      const row = ([k,n,f,u])=>{ const best = nine.every(r=>me[k]>r[k]) && me[k]>=av(bk,k); const dv = (me[k]/av(bk,k)-1)*100;
        return '<div class="cr"><span>'+n+'</span><b class="'+(best?'ok':'')+'">'+f(me[k])+'<i>'+u+'</i></b><span>'+f(av(nine,k))+'</span><span>'+f(av(bk,k))+'<small class="'+(dv>=5?'up':dv<=-5?'dn':'')+'">'+(dv>=0?'+':'')+Math.round(dv)+'%</small></span></div>'; };
      const tag = P.live ? 'em curso · '+P.days+(P.days===1?' treino':' treinos') : P.final ? 'final' : 'parcial';
      const foot = P.live
        ? 'Soma dos treinos de equipa desta semana, os mesmos para todos. Outros 9: média de '+nine.length+' scrum-halves. 3/4: média dos outros '+bk.length+' backs do relatório; a percentagem é a tua diferença para eles. Atualiza a cada relatório diário.'
        : 'Outros 9: média de '+nine.length+' scrum-halves. 3/4: média de '+bk.length+' backs da equipa de jogo; a percentagem é a tua diferença para eles. O relatório semanal é dos treinos (sai antes do jogo).';
      // quanto tens de correr a mais do que o 9 titular, que ainda vai somar o jogo
      let race = '', raceLine = '';
      const SG = typeof starterGame==='function' ? starterGame() : null, st = SG && P.rows.find(r=>r.n===SG.name);
      if(SG && st){
        const gm = P.game && P.game.sh.find(x=>x.n===SG.name), gRd = gm ? gm.rd : SG.rd, gHsr = gm ? gm.hsr : SG.hsr, est = !gm;
        const kmS = v => (v>=0?'+':'−')+f1(Math.abs(v)/1000)+' km', mS = v => (v>=0?'+':'−')+f0(Math.abs(v))+' m';
        // os teus jogos desta semana (quando estás nos 23) também contam para ti
        const myG = SESSIONS.filter(x => x.week===P.week && x.type==='Match'), myRd = myG.reduce((a,x)=>a+x.rd,0), myHsr = myG.reduce((a,x)=>a+x.hsr,0);
        const needRd = st.rd + gRd - me.rd - myRd, needHsr = st.hsr + gHsr - me.hsr - myHsr;
        const left = P.live ? Math.max(1, 3 - P.days) : 0;   // nas últimas semanas houve 2 a 3 treinos de equipa antes do relatório
        const first = SG.name.split(' ')[0];
        const head = P.live
          ? (needRd > 0 ? 'Para acabar a semana à frente do '+first+', precisas de ~'+f1(needRd/1000)+' km a mais do que ele nos treinos que faltam.' : 'Já tens distância para acabar a semana à frente do '+first+', mesmo com o jogo dele.')
          : (needRd > 0 ? 'Semana '+P.week+': ficaste a ~'+f1(needRd/1000)+' km do '+first+', contando com o jogo dele.' : 'Semana '+P.week+': acabaste à frente do '+first+', mesmo contando com o jogo dele.');
        race = '<div class="mb" style="margin-top:14px"><span class="tag">Corrida ao 9 titular · '+SG.name+'</span><p class="cvd">'+head+'</p>'
          +'<div class="cr ch"><span></span><span>Tu</span><span>'+first+'</span><span>Diferença</span></div>'
          +'<div class="cr"><span>Treinos'+(P.live?' até agora':'')+'</span><b>'+f1(me.rd/1000)+'<i> km</i></b><span>'+(P.live?'':'~')+f1(st.rd/1000)+' km</span><span>'+kmS(me.rd-st.rd)+'</span></div>'
          +'<div class="cr"><span>Jogo'+(est?' (estimado)':'')+'</span><b>'+(myRd?f1(myRd/1000)+'<i> km</i>':'–')+'</b><span>'+(est?'~':'')+f1(gRd/1000)+' km</span><span>'+kmS(myRd-gRd)+'</span></div>'
          +'<div class="cr"><span>Semana</span><b>'+f1((me.rd+myRd)/1000)+'<i> km</i></b><span>'+f1((st.rd+gRd)/1000)+' km</span><span><b class="'+(needRd<=0?'ok':'')+'" style="font-size:17px">'+kmS(-needRd)+'</b></span></div>'
          +'<div class="cr"><span>Corrida rápida, semana</span><b>'+f0(me.hsr+myHsr)+'<i> m</i></b><span>'+f0(st.hsr+gHsr)+' m</span><span>'+mS(-needHsr)+'</span></div>'
          +'<div class="sub" style="margin-top:8px">'+(est
            ? 'Jogo estimado: média do 9 que jogou 60 min ou mais nos últimos '+SG.n+' jogos ('+SG.games.map(g=>g.r.n.split(' ')[1]+' '+f1(g.r.rd/1000)+' km, '+g.date.split(' vs ')[1]).join('; ')+'). '
              +(needRd>0 && left ? 'Se faltarem '+left+' treino'+(left>1?'s':'')+' de equipa, são ~'+f1(needRd/left/1000)+' km a mais do que ele em cada um'+(needHsr>0?', e ~'+f0(needHsr/left)+' m de corrida rápida':'')+'. Os teus treinos extra contam se tiverem GPS.' : '')
            : 'Jogo real do '+first+' ('+P.game.date+'). Os treinos do relatório semanal são os mesmos para os dois.')+(myRd?' Inclui o teu jogo desta semana.':'')+'</div></div>';
        // a frase que fica sempre à vista: o que fazer a seguir
        raceLine = '<p class="rc-line"><b>'+TT('Corrida ao 9 titular','Race to the starting 9')+' ('+first+'):</b> '+(P.live
          ? (needRd>0 ? 'faltam ~'+f1(needRd/1000)+' km na semana → no próximo treino tenta ~'+f1(needRd/left/1000)+' km a mais do que ele'+(needHsr>0?' (e ~'+f0(needHsr/left)+' m de corrida rápida)':'')+'.' : 'já estás à frente dele na semana, mesmo com o jogo. Mantém.')
          : (needRd>0 ? 'na semana '+P.week+' ficaste a ~'+f1(needRd/1000)+' km.' : 'na semana '+P.week+' acabaste à frente.'))+'</p>';
      }
      comp = document.createElement('section'); comp.id = 's-comp';
      comp.innerHTML = '<div class="card"><span class="tag">Como me comparo · semana '+P.week+' ('+tag+')</span>'
       +'<p class="cvd">'+(firsts?'Primeiro dos '+(nine.length+1)+' scrum-halves em '+firsts+' de 4 métricas.':'Atrás dos outros scrum-halves nas 4 métricas.')+'</p>'+raceLine
       +'<details class="fold rc-fold"><summary><span>'+TT('Ver os números','See the numbers')+'</span></summary>'
       +'<div class="cr ch"><span></span><span>Tu</span><span>Outros 9</span><span>3/4</span></div>'+M.map(row).join('')
       +'<div class="sub" style="margin-top:8px">'+foot+'</div>'+race+'</details>'
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
