// ---------- Alvos semanais: editáveis em Mais > Definições, com estado claro semana a semana ----------
// Guardados no telemóvel (localStorage 'targets'). A velocidade é uma % do máximo pessoal (app.js lê o mesmo valor em spdPct()).
(function(){
  const {en: EN, t: T} = I18N;
  const nfx = (v,d) => (EN ? v.toFixed(d) : v.toFixed(d).replace('.',','));
  const withSep = n => EN ? Math.round(n).toLocaleString('en-US') : Math.round(n).toLocaleString('pt-PT').replace(/\s/g,'.');

  // Sugestões a partir das tuas semanas completas (mediana ~ semana normal, arredondada).
  const DEF = {rd:9500, hsr:2500, accel:160, sp:95};
  const KEYS = [
    {k:'rd',    n:T('Distância','Distance'),         u:'km',   min:2,  max:30,  step:.5, to:v=>v/1000, from:v=>v*1000, fmt:v=>nfx(v/1000,1)},
    {k:'hsr',   n:T('Corrida rápida','Fast running'), u:'m',    min:100,max:8000,step:50, to:v=>v,      from:v=>v,      fmt:v=>withSep(v)},
    {k:'accel', n:T('Acelerações','Accelerations'),   u:'',     min:10, max:500, step:5,  to:v=>v,      from:v=>v,      fmt:v=>String(Math.round(v))},
    {k:'sp',    n:T('Velocidade máx.','Top speed'),   u:'% '+T('do máximo','of max'), min:50, max:100, step:1, to:v=>v, from:v=>v, fmt:v=>String(Math.round(v))}
  ];
  const load = () => { try{ const o = JSON.parse(localStorage.getItem('targets')||'{}'); const r = Object.assign({}, DEF); KEYS.forEach(c => { const v = +o[c.k]; if(v>=c.from(c.min) && v<=c.from(c.max)) r[c.k] = v; }); return r; }catch(e){ return Object.assign({}, DEF); } };
  const save = o => { try{ localStorage.setItem('targets', JSON.stringify(o)); return true; }catch(e){ return false; } };
  const goalKmh = o => MAXREF*o.sp/100;

  // valor da semana até ao mesmo dia (semana corrente) ou semana completa
  function weekVal(w){
    const cut = weekCut(w), t = wkTot(w,cut); if(!t) return null;
    const acc = SESSIONS.filter(x=>x.week===w && dow(x.date)<=cut).reduce((a,x)=>a+x.accel,0);
    return {rd:t.rd, hsr:t.hsr, accel:acc, sp:t.sp, n:t.n, open:w===CUR_WEEK, gap:SESSIONS.some(x=>x.week===w && x.gpsGap)};
  }
  // estado de um indicador: ok / open (semana em curso) / miss / na (sem GPS completo)
  // distância e corrida rápida: o alvo é o P75 da exigência da semana (demandOf, em relatorios.js); sem relatório, o alvo fixo
  function status(w, k, tg){
    const v = weekVal(w); if(!v) return null;
    tg = tg || load();
    const D = (k==='rd' || k==='hsr') ? demandOf(w) : null;
    const val = k==='sp' ? v.sp : v[k], goal = D ? D[k].p75 : k==='sp' ? goalKmh(tg) : tg[k], p50 = D ? D[k].p50 : null;
    const ok = val >= goal, mid = p50!=null && val >= p50;
    const st = ok ? 'ok' : v.gap ? 'na' : v.open ? 'open' : mid ? 'mid' : 'miss';
    return {st, val, goal, p50, mid, D, left:Math.max(0, goal-val), pct:Math.min(100, val/goal*100), gap:v.gap};
  }
  const WORD = {ok:T('cumprido','met'), mid:T('acima da mediana','above the median'), miss:T('não cumprido','not met'), open:T('em curso','in progress'), na:T('sem GPS completo','incomplete GPS')};
  const ICON = {ok:'✓', mid:'≈', miss:'✕', open:'…', na:'–'};
  const fmtVal = (c, v) => c.k==='sp' ? nfx(v,1) : c.fmt(v);
  const unitOf = c => c.k==='sp' ? 'km/h' : (c.u||'');
  const goalTxt = (c, tg) => c.k==='sp' ? nfx(goalKmh(tg),1)+' km/h' : c.fmt(tg[c.k])+(c.u?' '+c.u:'');
  const leftTxt = (c, s) => c.k==='sp' ? nfx(s.left,1)+' km/h' : (c.k==='rd' ? nfx(s.left/1000,1)+' km' : Math.round(s.left)+(c.u?' '+c.u:''));

  // texto do alvo: P75 (e P50) da semana quando há relatório, senão o alvo fixo
  const sTxt = (c, tg, s) => s && s.D ? 'P75 '+fmtVal(c, s.goal)+' '+unitOf(c)+' · P50 '+fmtVal(c, s.p50) : goalTxt(c, tg);
  window.TG = {load, status, weekVal, KEYS, WORD, ICON, DEF, goalKmh};

  // estilos: em style.css (secção Alvos semanais e Definições)

  // ---------- Semana: estado em cada quadrado + resumo + quadro ----------
  const wk = document.getElementById('s-wk');
  function decorate(){
    if(!wk) return;
    const panel = wk.querySelector('.rsp'); if(!panel) return;
    const g = panel.querySelector('.g'); if(!g || g.dataset.tg) return;
    const tiles = g.children; if(tiles.length !== 4) return;
    const w = selWeek, tg = load(); let hit = 0, tot = 0, open = false;
    g.dataset.tg = '1';
    KEYS.forEach((c,i) => {
      const s = status(w, c.k, tg); if(!s) return; tot++; if(s.st==='ok') hit++; if(s.st==='open') open = true;
      const el = tiles[i];
      const g = s.D ? sTxt(c,tg,s) : T('Alvo ','Target ')+goalTxt(c,tg);
      const txt = s.st==='ok' ? ICON.ok+' '+g+' · '+(s.D?T('top 25%','top 25%'):WORD.ok)
        : s.st==='open' ? ICON.open+' '+g+' · '+T('faltam ','')+leftTxt(c,s)+T('',' to go')+(s.D&&s.mid?T(' (P50 ✓)',' (P50 ✓)'):'')
        : s.st==='mid' ? ICON.mid+' '+g+' · '+WORD.mid+', '+T('faltaram ','missed P75 by ')+leftTxt(c,s)+T(' para o P75','')
        : s.st==='miss' ? ICON.miss+' '+g+' · '+(s.D?T('abaixo da mediana','below the median'):T('faltaram ','missed by ')+leftTxt(c,s))
        : ICON.na+' '+g+' · '+WORD.na;
      el.insertAdjacentHTML('beforeend', '<small class="tg '+s.st+'">'+txt+'</small><i class="tgb '+s.st+'" aria-hidden="true"><u style="width:'+s.pct.toFixed(0)+'%"></u></i>');
    });
    if(tot){
      const all = hit===tot, cls = all ? 'ok' : (open ? '' : 'miss');
      const lbl = open ? T('Alvos da semana (em curso): ','Weekly targets (in progress): ')+hit+T(' de ',' of ')+tot+T(' cumpridos até agora',' met so far')
                       : T('Alvos da semana: ','Weekly targets: ')+hit+T(' de ',' of ')+tot+T(' cumpridos',' met');
      g.insertAdjacentHTML('beforebegin', '<small class="tgsum '+cls+'">'+(all?'✓ ':'')+lbl+'</small>');
    }
    const D = demandOf(w);
    if(D) g.insertAdjacentHTML('afterend', '<small class="tgsrc">'+T('Distância e corrida rápida: alvo = percentil 75 dos '+D.n+' backs do relatório da semana '+D.week+(D.own?'':' (a última semana da equipa)')+'. P75 = top 25%, pronto para as exigências; P50 = mediana.','Distance and fast running: target = 75th percentile of the '+D.n+' backs in the week '+D.week+' report'+(D.own?'':' (the team\'s latest week)')+'. P75 = top 25%, ready for the demands; P50 = median.')+'</small>');
  }
  function histTable(){
    const tg = load(), weeks = [...new Set(SESSIONS.map(x=>x.week))].sort((a,b)=>a-b).reverse();
    const SH = {rd:T('Dist.','Dist.'), hsr:T('Rápida','Fast'), accel:T('Acel.','Acc.'), sp:T('Vel.','Speed')};
    const th = KEYS.map(c => '<th scope="col" title="'+c.n+'">'+SH[c.k]+'<small>'+((c.k==='rd'||c.k==='hsr') ? T('alvo P75','target P75') : T('alvo ','target ')+(c.k==='sp'?nfx(goalKmh(tg),1):c.fmt(tg[c.k])))+'</small></th>').join('');
    const rows = weeks.map(w => {
      if(!weekVal(w)) return '';
      const cells = KEYS.map(c => { const s = status(w,c.k,tg); return '<td class="'+s.st+'" aria-label="'+WORD[s.st]+'">'+ICON[s.st]+' '+fmtVal(c,s.val)+(s.D?'<small>P75 '+fmtVal(c,s.goal)+'</small>':'')+'</td>'; }).join('');
      return '<tr'+(w===CUR_WEEK?' class="cur"':'')+'><td>'+T('S','W')+w+(w===CUR_WEEK?'<small>'+T('em curso','in progress')+'</small>':'')+'</td>'+cells+'</tr>';
    }).join('');
    return '<div class="scroll"><table class="tgt"><thead><tr><th scope="col">'+T('Semana','Week')+'</th>'+th+'</tr></thead><tbody>'+rows+'</tbody></table></div>'
      +'<div class="tgcap">'+T('Dist. = distância em km, Rápida = corrida rápida em metros, Acel. = acelerações, Vel. = velocidade máx. em km/h. Distância e corrida rápida: alvo = P75 (top 25%) dos backs no relatório dessa semana; a semana em curso usa o último relatório; semanas sem relatório usam o alvo fixo. A semana em curso conta só até ao mesmo dia. ✓ cumprido, ≈ acima da mediana (P50), ✕ não cumprido, … em curso, – semana com treinos sem GPS.','Dist. = distance in km, Fast = fast running in metres, Acc. = accelerations, Speed = top speed in km/h. Distance and fast running: target = P75 (top 25%) of the backs in that week\'s report; the current week uses the latest report; weeks without a report use the fixed target. The current week only counts up to the same weekday. ✓ met, ≈ above the median (P50), ✕ not met, … in progress, – week with training that had no GPS.')+'</div>';
  }
  function addHist(){
    if(!wk || document.getElementById('tghist')) return;
    const d = document.createElement('details'); d.className = 'fold'; d.id = 'tghist';
    d.innerHTML = '<summary><span>'+T('Alvos semana a semana','Targets week by week')+'</span></summary><div class="tgbody"></div>';
    d.querySelector('.tgbody').innerHTML = histTable();
    const anchor = wk.querySelector('details.fold'); if(anchor) anchor.after(d); else wk.appendChild(d);
  }
  if(wk){
    decorate(); addHist();
    new MutationObserver(() => decorate()).observe(wk, {childList:true, subtree:true});
  }

  // ---------- legenda do gráfico de velocidade no separador Evolução/Hoje (texto fixo do HTML) ----------
  const cs = document.getElementById('cSpd');
  if(cs){ const p = cs.closest('.card') && cs.closest('.card').querySelector('p'); if(p){ const o = load(); p.textContent = T('km/h. Tracejado: máximo pessoal (~33,4). Linha verde: alvo semanal de '+o.sp+'% ('+nfx(goalKmh(o),1)+').','km/h. Dashed: personal max (~33.4). Green line: weekly target of '+o.sp+'% ('+nfx(goalKmh(o),1)+').'); } }

  // ---------- Mais > Definições (idioma + os meus alvos) ----------
  const mp = document.getElementById('pg-mais');
  function buildDefs(){
    if(!mp || document.getElementById('defs')) return;
    const tg = load();
    const s = document.createElement('section'); s.id = 'defs'; s.className = 'defs';
    s.innerHTML = '<h2>'+T('Definições','Settings')+'</h2>'
      +'<div class="card" style="padding:14px 16px"><h3 style="margin-top:0">'+T('Os meus alvos semanais','My weekly targets')+'</h3>'
      +'<div class="sub">'+T('Muda estes valores se o treinador te der outros. Contam por semana (até ao mesmo dia na semana em curso) e aparecem na página Semana.','Change these if your coach gives you different ones. They count per week (up to the same weekday in the current week) and show on the Week page.')+'</div>'
      +KEYS.map(c => '<div class="tgrow"><label for="tg-'+c.k+'">'+c.n+'</label><span class="inp"><input id="tg-'+c.k+'" type="text" inputmode="decimal" autocomplete="off" value="'+(c.k==='rd'?nfx(c.to(tg.rd),1):String(Math.round(tg[c.k])))+'" aria-describedby="tgh-'+c.k+'"><span>'+(c.k==='sp'?'%':c.u)+'</span></span>'
         +'<div class="hint" id="tgh-'+c.k+'">'+(c.k==='sp' ? T('Percentagem do teu máximo pessoal ('+nfx(MAXREF,1)+' km/h). Agora: ','Percentage of your personal max ('+nfx(MAXREF,1)+' km/h). Now: ')+'<b class="spk">'+nfx(goalKmh(tg),1)+' km/h</b>. '+T('Sugerido: ','Suggested: ')+DEF.sp+'%'
            : (c.k==='rd'||c.k==='hsr' ? T('Só para semanas sem relatório da equipa: com relatório, o alvo é o P75 dos backs. ','Only for weeks without a team report: with a report, the target is the backs\' P75. ') : '')+T('Sugerido: ','Suggested: ')+(c.k==='rd'?nfx(DEF.rd/1000,1):c.fmt(DEF[c.k]))+' '+c.u+' '+T('(uma semana normal tua).','(a normal week for you).'))+'</div></div>').join('')
      +'<div class="tgbtns"><button type="button" class="pri" id="tgsave">'+T('Guardar alvos','Save targets')+'</button><button type="button" id="tgreset">'+T('Repor sugeridos','Reset to suggested')+'</button></div>'
      +'<div class="tgmsg" id="tgmsg" role="status" aria-live="polite"></div></div>'
      +'<div class="card" id="langcard" style="padding:14px 16px"></div>';
    const foot = mp.querySelector('.foot'); foot ? foot.before(s) : mp.appendChild(s);
    // mover o seletor de idioma (criado em traducao.js) para aqui
    const ls = document.getElementById('langseg');
    if(ls){ const lc = s.querySelector('#langcard'); const h = ls.querySelector('h2'); if(h){ const h3 = document.createElement('h3'); h3.style.marginTop = '0'; h3.textContent = h.textContent; h.replaceWith(h3); } while(ls.firstChild) lc.appendChild(ls.firstChild); ls.remove(); lc.id = 'langseg'; }
    const msg = s.querySelector('#tgmsg');
    // Postel: aceita "9,5", "9.5", "9 500", "9.500", "9,5 km", "2500 m", "95%", "31,7 km/h"
    const num = raw => { let t = String(raw).toLowerCase().replace(/[^\d.,]/g,''); if(/^\d{1,3}([.,]\d{3})+$/.test(t)) t = t.replace(/[.,]/g,''); else t = t.replace(',','.'); return parseFloat(t); };
    const read = c => { let v = num(s.querySelector('#tg-'+c.k).value); if(c.k==='rd' && v>=200) v = v/1000; if(c.k==='sp' && v>=20 && v<50) v = Math.round(v/MAXREF*1000)/10; return isFinite(v) ? c.from(v) : NaN; };
    s.querySelector('#tgsave').addEventListener('click', () => {
      const o = {}; let bad = null;
      KEYS.forEach(c => { const v = read(c); if(!(v >= c.from(c.min) && v <= c.from(c.max))) bad = bad || c; else o[c.k] = v; });
      msg.className = 'tgmsg';
      if(bad){ msg.className = 'tgmsg err'; msg.textContent = T('Valor inválido em '+bad.n+': usa um número entre '+(bad.k==='rd'?bad.min+' e '+bad.max+' km':bad.min+' e '+bad.max)+'.','Invalid value for '+bad.n+': use a number between '+bad.min+' and '+bad.max+(bad.k==='rd'?' km':'')+'.'); s.querySelector('#tg-'+bad.k).focus(); return; }
      if(!save(o)){ msg.className = 'tgmsg err'; msg.textContent = T('Não consegui guardar neste navegador.','Could not save in this browser.'); return; }
      try{ sessionStorage.setItem('goMais','1'); sessionStorage.setItem('goTg','1'); }catch(e){} try{ window.name += ';goMais;goTg'; }catch(e){}
      location.reload();
    });
    s.querySelector('#tgreset').addEventListener('click', () => {
      KEYS.forEach(c => { s.querySelector('#tg-'+c.k).value = c.k==='rd' ? nfx(DEF.rd/1000,1) : String(DEF[c.k]); });
      msg.className = 'tgmsg'; msg.textContent = T('Valores sugeridos postos. Carrega em Guardar alvos para aplicar.','Suggested values filled in. Press Save targets to apply.');
    });
    s.querySelector('#tg-sp').addEventListener('input', e => { const v = parseFloat(e.target.value.replace(',','.')); const k = s.querySelector('.spk'); if(k && v>=50 && v<=100) k.textContent = nfx(MAXREF*v/100,1)+' km/h'; });
  }
  buildDefs();

  // depois de guardar: volta à secção e confirma
  let goTg = false; try{ goTg = sessionStorage.getItem('goTg'); sessionStorage.removeItem('goTg'); }catch(e){}
  if(!goTg && /;goTg/.test(window.name||'')) goTg = true;
  try{ window.name = (window.name||'').replace(/;goTg/g,''); }catch(e){}
  if(goTg) addEventListener('DOMContentLoaded', () => { try{ const d = document.getElementById('defs'); if(d){ d.scrollIntoView({block:'start'}); const m = d.querySelector('#tgmsg'); m.textContent = T('✓ Alvos guardados.','✓ Targets saved.'); } }catch(e){} });
})();
