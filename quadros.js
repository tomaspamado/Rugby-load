// ---------- Todos os painéis: cada quadrado abre o gráfico da evolução ----------
// Junta gráficos aos quadrados que ainda não tinham: Hoje (km da semana, velocidade máx.), Jogos (intensidade e minutos),
// medição da nutricionista (peso, Σ8, massa gorda, LMI) e Mais (sessões e jogos). Usa a mesma folha grande (GSHEET) do resto da app.
(function(){
  const {en: EN, t: T} = I18N;
  const nfx = (v,d) => v==null || isNaN(v) ? '–' : (EN ? v.toFixed(d) : v.toFixed(d).replace('.',','));
  const esc = v => String(v).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const reduce = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

  // folha com um gráfico: pts = [{lab, sub, v, txt}], ref = {v, lab, up} (linha de alvo/referência; up = mais é melhor)
  function openSeries(card, o){
    if(!window.GSHEET || !window.Chart) return;
    const pts = o.pts.filter(p => p.v!=null && !isNaN(p.v)), st = {sel: pts.length-1};
    const html = '<h2>'+esc(o.title)+'</h2><div class="sub2">'+esc(o.sub)+'</div>'
      +'<div class="gr" aria-live="polite"><small class="r1"></small><div class="gv"></div><div class="gd r3"></div><small class="r4"></small></div>'
      +'<div class="cbox"><canvas tabindex="0" role="img"></canvas></div><div class="gl"></div><p class="gh"></p>';
    window.GSHEET(card, o.title, html, root => {
      let ch = null; const q = x => root.querySelector(x), canvas = q('canvas');
      const f = v => nfx(v, o.dec||0)+(o.unit ? '<em>'+o.unit+'</em>' : '');
      const read = () => { const p = pts[st.sel]; if(!p){ q('.gv').innerHTML = '–'; q('.r4').textContent = T('Ainda sem dados.','No data yet.'); return; }
        const prev = pts[st.sel-1], r = o.ref;
        q('.r1').textContent = p.sub || p.lab; q('.gv').innerHTML = f(p.v);
        let t = '';
        if(r){ const ok = r.up===false ? p.v<=r.v : p.v>=r.v; t += '<span class="'+(ok?'up':'nt')+'">'+(ok ? '✓ ' : '')+esc(r.lab)+' '+nfx(r.v,o.dec||0)+(o.unit?' '+o.unit:'')+'</span>'; }
        if(p.partial) t += (t?' · ':'')+'<span class="nt">'+T('semana em curso','week in progress')+'</span>';
        else if(prev){ const d = p.v-prev.v, good = r && r.up===false ? d<=0 : d>=0; t += (t?' · ':'')+'<span class="'+(good?'up':'dn')+'">'+(d>=0?'+':'−')+nfx(Math.abs(d),o.dec||0)+(o.unit?' '+o.unit:'')+T(' vs. anterior',' vs. previous')+'</span>'; }
        q('.r3').innerHTML = t; q('.r4').textContent = p.txt || ''; };
      const setSel = i => { if(i===st.sel || !pts[i]) return; st.sel = i; read(); if(ch){ if(o.bar) ch.data.datasets[0].backgroundColor = colors(); ch.update('none'); } };
      const colors = () => pts.map((p,i) => i===st.sel ? '#D9981A' : (p.hot ? '#FF6B6B' : 'rgba(255,255,255,.6)'));
      const sel = {id:'qsel', afterDatasetsDraw(c){ const el = c.getDatasetMeta(0).data[st.sel]; if(!el) return; const a = c.chartArea, x = c.ctx; x.save(); x.strokeStyle = '#fff'; x.globalAlpha = .5; x.lineWidth = 1.5; x.setLineDash([4,4]); x.beginPath(); x.moveTo(el.x,a.top); x.lineTo(el.x,a.bottom); x.stroke(); x.restore();
        if(!o.bar){ x.save(); x.fillStyle = '#D9981A'; x.strokeStyle = '#0E1A2E'; x.lineWidth = 2.5; x.beginPath(); x.arc(el.x, el.y, 6, 0, 7); x.fill(); x.stroke(); x.restore(); } }};
      const vals = pts.map(p => p.v), all = o.ref ? vals.concat(o.ref.v) : vals, lo = Math.min(...all), hi = Math.max(...all), pad = (hi-lo)*.2 || Math.max(1, Math.abs(hi)*.05);
      const ds = [o.bar ? {type:'bar', data:vals, backgroundColor:colors(), borderRadius:4, maxBarThickness:22}
                        : {type:'line', data:vals, borderColor:'#fff', backgroundColor:'#fff', borderWidth:2.5, pointRadius:3.5, pointHoverRadius:3.5, tension:.15}];
      if(o.ref) ds.push({type:'line', data:pts.map(() => o.ref.v), borderColor:'#5CC48A', borderWidth:2, borderDash:[6,5], pointRadius:0, pointHoverRadius:0});
      ch = new Chart(canvas, {data:{labels:pts.map(p => p.lab), datasets:ds}, plugins:[sel], options:{responsive:true, maintainAspectRatio:false, animation:{duration:reduce()?0:400},
        events:['mousemove','mouseout','click','touchstart','touchmove'], interaction:{mode:'index', intersect:false, axis:'x'},
        onHover:(e, els) => { if(els && els.length) setSel(els[0].index); },
        plugins:{legend:{display:false}, tooltip:{enabled:false}},
        scales:{x:{ticks:{color:'rgba(255,255,255,.7)', maxRotation:0, autoSkip:true, maxTicksLimit:6, font:{size:11}}, grid:{display:false}},
                y:{beginAtZero:!!o.bar, suggestedMin:o.bar?0:lo-pad, suggestedMax:hi+pad, ticks:{color:'rgba(255,255,255,.7)', font:{size:11}, maxTicksLimit:5, callback:v => nfx(v, (o.dec && hi-lo<5) ? 1 : 0)}, grid:{color:'rgba(255,255,255,.12)', drawTicks:false}, border:{display:false}}}}});
      q('.gl').innerHTML = '<span><i style="background:#fff;height:3px;width:16px;border-radius:2px;vertical-align:3px"></i>'+esc(o.title)+'</span>'+(o.ref ? '<span><i style="background:#5CC48A;height:3px;width:16px;border-radius:2px;vertical-align:3px"></i>'+esc(o.ref.lab)+' '+nfx(o.ref.v,o.dec||0)+(o.unit?' '+o.unit:'')+'</span>' : '')+(o.legend||'');
      q('.gh').textContent = pts.length<2 ? T('Com mais registos aparece aqui a linha da evolução.','With more entries the trend shows here.') : T('Toca e arrasta o dedo para ver cada ponto.','Touch and drag to see each point.');
      canvas.setAttribute('aria-label', o.title); read();
      canvas.addEventListener('keydown', e => { if(e.key==='ArrowLeft'){ e.preventDefault(); setSel(st.sel-1); } else if(e.key==='ArrowRight'){ e.preventDefault(); setSel(st.sel+1); } });
      return () => { if(ch) ch.destroy(); };
    });
  }
  window.QSERIES = openSeries;

  // ---- dados ----
  const weeks = () => [...new Set(SESSIONS.map(s => s.week).concat(CUR_WEEK))].sort((a,b) => a-b);
  const wkLab = w => T('Sem. ','Wk ')+(REG.wkLabel ? REG.wkLabel(w) : w);
  const games = () => SESSIONS.filter(s => s.type==='Match' && s.fieldTimeMin);
  const gLab = s => dshort(s.date), gSub = s => dlong(s.date)+' · vs '+s.opponent+(s.est ? ' ('+T('estimado','estimated')+')' : '');
  const body = () => (typeof BODY!=='undefined' ? BODY : []).slice().sort((a,b) => a.date.localeCompare(b.date));
  const avg = a => a.length ? a.reduce((x,y)=>x+y,0)/a.length : null;

  const DEF = {
    wkkm: () => ({title:T('Distância por semana','Distance per week'), sub:T('Soma dos metros com GPS em cada semana (a semana atual vai até hoje).','Sum of GPS metres each week (the current week runs to today).'), unit:'km', dec:1, bar:true,
      pts: weeks().map(w => { const xs = SESSIONS.filter(s => s.week===w); return {lab:wkLab(w), sub:T('Semana ','Week ')+(REG.wkLabel?REG.wkLabel(w):w)+(w===CUR_WEEK?T(' (em curso)',' (in progress)'):''), v:xs.reduce((a,s)=>a+s.rd,0)/1000, hot:w===CUR_WEEK, partial:w===CUR_WEEK, txt:xs.length+(xs.length===1?T(' sessão',' session'):T(' sessões',' sessions'))+(xs.some(s=>s.gpsGap)?T(' · semana sem GPS (Agronomia)',' · week without GPS'):'')}; })}),
    wksp: () => ({title:T('Velocidade máxima por semana','Top speed per week'), sub:T('A ponta mais alta de cada semana, contra o teu alvo.','Highest top speed each week, against your goal.'), unit:'km/h', dec:1,
      ref:{v:MAXREF*spdPct(), lab:T('alvo','goal')},
      pts: weeks().filter(w => SESSIONS.some(s => s.week===w)).map(w => { const xs = SESSIONS.filter(s => s.week===w && !s.est), m = xs.length ? Math.max(...xs.map(s=>s.maxSpeed)) : null; const b = xs.find(s => s.maxSpeed===m);
        return {lab:wkLab(w), sub:T('Semana ','Week ')+(REG.wkLabel?REG.wkLabel(w):w)+(w===CUR_WEEK?T(' (em curso)',' (in progress)'):''), v:m, partial:w===CUR_WEEK, txt:b ? dshort(b.date)+' · '+(b.type==='Match'?T('jogo','match'):T('treino','training')) : ''}; })}),
    gmpm: () => { const g = games(), a = avg(g.map(s=>s.rd/s.fieldTimeMin)); return {title:T('Intensidade por jogo','Intensity per match'), sub:T('Metros por minuto em campo, jogo a jogo.','Metres per minute on the pitch, match by match.'), unit:'m/min', dec:0,
      ref:{v:a, lab:T('média','average')}, pts:g.map(s => ({lab:gLab(s), sub:gSub(s), v:s.rd/s.fieldTimeMin, txt:Math.round(s.fieldTimeMin)+' min · '+nfx(s.hsr/s.fieldTimeMin,1)+T(' m/min rápidos',' m/min fast running')}))}; },
    gmin: () => ({title:T('Minutos por jogo','Minutes per match'), sub:T('Tempo em campo em cada jogo.','Time on the pitch in each match.'), unit:'min', dec:0, bar:true,
      pts:games().map(s => ({lab:gLab(s), sub:gSub(s), v:s.fieldTimeMin, txt:nfx(s.rd/1000,1)+' km · '+Math.round(s.rd/s.fieldTimeMin)+' m/min'}))}),
    bw: () => ({title:T('Peso (nutricionista)','Weight (nutritionist)'), sub:T('Peso em cada medição ISAK.','Weight at each ISAK measurement.'), unit:'kg', dec:1, pts:body().map(b => ({lab:dshort(b.date), sub:dlong(b.date), v:b.weight, txt:b.team||''}))}),
    s8: () => ({title:'Σ8', sub:T('Soma de 8 pregas em cada medição (menos é menos gordura).','Sum of 8 skinfolds at each measurement (lower is leaner).'), unit:'mm', dec:1, ref:{v:78, lab:T('alvo abaixo de','goal under'), up:false}, pts:body().filter(b=>b.s8!=null).map(b => ({lab:dshort(b.date), sub:dlong(b.date), v:b.s8, txt:b.team||''}))}),
    fat: () => ({title:T('Massa gorda','Body fat'), sub:T('Percentagem de gordura em cada medição ISAK.','Body fat % at each ISAK measurement.'), unit:'%', dec:1, pts:body().filter(b=>b.fatPct!=null).map(b => ({lab:dshort(b.date), sub:dlong(b.date), v:b.fatPct, txt:b.fatKg ? nfx(b.fatKg,1)+' kg' : ''}))}),
    lmi: () => ({title:T('Índice de massa magra (LMI)','Lean mass index (LMI)'), sub:T('Músculo para a tua altura, em cada medição.','Muscle for your height, at each measurement.'), dec:1, ref:{v:54.8, lab:T('referência do grupo','group reference')}, pts:body().filter(b=>b.lmi!=null).map(b => ({lab:dshort(b.date), sub:dlong(b.date), v:b.lmi, txt:b.ffm ? T('massa magra ','lean mass ')+nfx(b.ffm,1)+' kg' : ''}))}),
    sess: () => ({title:T('Sessões por semana','Sessions per week'), sub:T('Treinos e jogos com GPS em cada semana.','GPS sessions and matches each week.'), dec:0, bar:true,
      pts: weeks().map(w => { const xs = SESSIONS.filter(s => s.week===w); return {lab:wkLab(w), sub:T('Semana ','Week ')+(REG.wkLabel?REG.wkLabel(w):w), v:xs.length, hot:xs.some(s=>s.type==='Match'), partial:w===CUR_WEEK, txt:xs.filter(s=>s.type==='Match').length ? T('com jogo','with a match') : ''}; }),
      legend:'<span><i style="background:#FF6B6B"></i>'+T('semana com jogo','week with a match')+'</span>'})
  };

  // ---- ligar os quadrados ----
  function hook(el, key){
    if(!el || el.dataset.q) return;
    el.dataset.q = key; el.removeAttribute('data-go'); el.removeAttribute('role'); el.classList.remove('go'); el.classList.add('gt');
    el.setAttribute('role','button'); el.tabIndex = 0; el.setAttribute('aria-label', T('Abrir gráfico: ','Open chart: ')+DEF[key]().title);
  }
  const byLabel = (root, txt) => root ? [...root.querySelectorAll('.g > div')].find(d => { const s = d.querySelector('small'); return s && s.textContent.trim().startsWith(txt); }) : null;
  function wire(){
    const hoje = document.querySelector('#s-resumo .rs-st');
    if(hoje){ const t = hoje.querySelectorAll(':scope > div'); hook(t[0], 'wkkm'); hook(t[1], 'wksp'); }
    const evo = [...document.querySelectorAll('#pg-evol .rsp')].find(r => /jogos/i.test(r.querySelector('.rt')?.textContent||''));
    if(evo){ const t = evo.querySelectorAll('.g > div'); hook(t[0], 'gmpm'); hook(t[1], 'gmpm'); hook(t[2], 'gmin'); }
    const isak = document.querySelector('#s-corpo .rsp');
    if(isak){ const t = isak.querySelectorAll('.g > div'); hook(t[0], 'bw'); hook(t[1], 's8'); hook(t[2], 'fat'); hook(t[3], 'lmi'); }
    const mais = document.querySelector('#pg-mais .rsp');
    if(mais){ hook(byLabel(mais, T('Sessões','Sessions')), 'sess'); hook(byLabel(mais, T('Jogos','Matches')), 'gmpm'); }
  }
  // abrir: apanha o toque antes dos outros (os quadrados do Hoje eram ligações para outras páginas)
  const open = el => openSeries(el, DEF[el.dataset.q]());
  document.addEventListener('click', e => { const el = e.target.closest('[data-q]'); if(el){ e.stopPropagation(); e.preventDefault(); open(el); } }, true);
  document.addEventListener('keydown', e => { const el = e.target.closest && e.target.closest('[data-q]'); if(el && (e.key==='Enter' || e.key===' ')){ e.preventDefault(); e.stopPropagation(); open(el); } }, true);
  if(document.readyState==='loading') addEventListener('DOMContentLoaded', () => setTimeout(wire, 0)); else setTimeout(wire, 0);
})();
