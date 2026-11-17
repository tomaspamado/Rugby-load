// ---------- Extras: balança acertada pela nutricionista, plano de velocidade no Hoje e a página Mais em separadores ----------
(function(){
  const {en: EN, t: T} = I18N;
  const nfx = (v,d) => v==null || isNaN(v) ? '–' : (EN ? v.toFixed(d) : v.toFixed(d).replace('.',','));
  const DAYMS = 864e5, toT = s => new Date(s+'T12:00:00').getTime();

  // ---- 1) Balança vs. nutricionista (ISAK) ----
  // No dia de uma medição ISAK com pesagem de casa (até 1 dia de diferença), a diferença de gordura entre as duas
  // fica guardada como correção. A partir daí, a gordura da balança aparece também já corrigida.
  function calib(){
    const sb = document.getElementById('s-balanca'); if(!sb || !window.SCALE || typeof BODY==='undefined') return;
    let el = document.getElementById('s-isak'); if(!el){ el = document.createElement('section'); el.id = 's-isak'; sb.after(el); }
    const L = SCALE.log().filter(x => x.fat!=null), isak = BODY.filter(b => b.fatPct!=null);
    const pairs = isak.map(b => { const s = L.filter(x => Math.abs(toT(x.date)-toT(b.date)) <= DAYMS).sort((a,c) => Math.abs(toT(a.date)-toT(b.date))-Math.abs(toT(c.date)-toT(b.date)))[0]; return s ? {b, s, off:b.fatPct - s.fat} : null; }).filter(Boolean);
    const lastI = isak[isak.length-1];
    let h = '<details class="fold"'+(pairs.length?' open':'')+'><summary><span>'+T('Balança vs. nutricionista','Scale vs. nutritionist')+'</span></summary><div class="card">';
    if(!pairs.length){
      h += '<p class="sub" style="margin:0">'+T('Ainda não há um dia com as duas medições. No dia da próxima medição da nutricionista, pesa-te de manhã na balança de casa: a app compara a gordura das duas e passa a mostrar a gordura da balança já corrigida.','No day with both measurements yet. On the day of the next nutritionist measurement, weigh yourself at home in the morning: the app compares both fat readings and from then on also shows the scale fat corrected.')
        +(lastI ? ' '+T('Última medição da nutricionista: ','Last nutritionist measurement: ')+dshort(lastI.date)+' ('+nfx(lastI.fatPct,1)+'% '+T('de gordura','fat')+').' : '')+'</p>';
    } else {
      const p = pairs[pairs.length-1], last = L[L.length-1];
      const t = toT(last.date), w7 = L.filter(x => toT(x.date)<=t && t-toT(x.date) < 7*DAYMS), avg = w7.reduce((a,x)=>a+x.fat,0)/w7.length;
      h += '<div class="cr ch fc-cal"><span></span><span>'+T('Nutricionista','Nutritionist')+'</span><span>'+T('Balança','Scale')+'</span><span>'+T('Diferença','Difference')+'</span></div>'
        +'<div class="cr fc-cal"><span>'+dshort(p.b.date)+'</span><b>'+nfx(p.b.fatPct,1)+'<i>%</i></b><span>'+nfx(p.s.fat,1)+'%</span><span>'+(p.off>=0?'+':'−')+nfx(Math.abs(p.off),1)+' pts</span></div>'
        +'<p class="cvd" style="margin-top:12px">'+T('Gordura da balança, corrigida: ~','Scale fat, corrected: ~')+nfx(avg + p.off,1)+'%</p>'
        +'<p class="sub" style="margin:0">'+T('Média de 7 dias da balança ('+nfx(avg,1)+'%) mais a diferença do último dia com as duas medições. Atualiza sempre que houver nova medição da nutricionista com pesagem no mesmo dia.','7-day scale average ('+nfx(avg,1)+'%) plus the difference on the last day with both measurements. Updates whenever a new nutritionist measurement has a weigh-in on the same day.')+'</p>';
    }
    el.innerHTML = h + '</div></details>';
  }
  calib();
  const sbx = document.getElementById('s-balanca');
  if(sbx) new MutationObserver(calib).observe(sbx, {childList:true});   // a balança redesenha-se depois de cada pesagem

  // ---- 2) Plano de velocidade no Hoje (quando a semana ainda não chegou ao alvo de velocidade máxima) ----
  function speed(){
    const pg = document.getElementById('pg-hoje'); if(!pg || typeof dayPlan!=='function') return;
    const goal = MAXREF*spdPct(), wk = SESSIONS.filter(x => x.week===CUR_WEEK), top = Math.max(0, ...wk.map(x => x.maxSpeed));
    if(top >= goal) return;
    const P = dayPlan(), bad = {match:1, same:1, next:1, pre:1, over:1};
    const ok = !bad[P.k];
    const best = Math.max(...SESSIONS.map(x => x.maxSpeed));
    const sec = document.createElement('section'); sec.id = 's-speed';
    sec.innerHTML = '<div class="card"><span class="tag">'+T('Alvo de velocidade · semana ','Speed goal · week ')+CUR_WEEK+'</span>'
      +'<p class="cvd">'+(top ? T('Máximo da semana ','Week best ')+nfx(top,1)+' km/h: '+T('faltam ','')+nfx(goal-top,1)+' km/h'+T(' para o alvo ('+nfx(goal,1)+').',' to the goal ('+nfx(goal,1)+').') : T('Ainda sem velocidade máxima esta semana: alvo ','No top speed yet this week: goal ')+nfx(goal,1)+' km/h.')+'</p>'
      +(ok
        ? '<div class="sub" style="margin:0 0 6px">'+T('Hoje dá para uma sessão curta de velocidade máxima (antes ou no fim do treino, nunca cansado):','Today works for a short top-speed session (before or at the end of training, never tired):')+'</div>'
          +'<ol class="sp-plan"><li>'+T('Aquecimento 10 min: corrida leve, skips, 3 acelerações progressivas a 60–80%.','10 min warm-up: easy jog, skips, 3 build-ups at 60–80%.')+'</li>'
          +'<li>'+T('4 a 5 sprints lançados: 20–30 m de embalo e 20 m a fundo, 100%.','4 to 5 flying sprints: 20–30 m run-in and 20 m all-out, 100%.')+'</li>'
          +'<li>'+T('3 min de pausa a andar entre cada um. Para se a velocidade cair.','3 min walking rest between each. Stop if speed drops.')+'</li>'
          +'<li>'+T('Leva o GPS: o teu melhor é ','Wear the GPS: your best is ')+nfx(best,1)+' km/h.</li></ol>'
        : '<div class="sub" style="margin:0">'+(P.k==='match'||P.k==='pre' ? T('Hoje não: jogo amanhã ou hoje. Fica para o próximo dia sem jogo nem dia pesado.','Not today: match today or tomorrow. Leave it for the next day without a match or heavy day.') : T('Hoje não: dia de recuperação ou carga já alta. Faz no próximo dia normal, fresco.','Not today: recovery day or load already high. Do it on the next normal day, fresh.'))+'</div>')
      +'</div>';
    const comp = document.getElementById('s-comp') || document.getElementById('s-resumo');
    if(comp) comp.after(sec);
  }
  addEventListener('DOMContentLoaded', speed);

  // ---- 3) Mais em separadores: Sessões · Alvos · Definições ----
  function maisTabs(){
    const pg = document.getElementById('pg-mais'), defs = document.getElementById('defs'); if(!pg || !defs) return;
    const kids = [...pg.children];
    const sess = kids.filter(k => k.tagName==='SECTION' && !k.classList.contains('rsp') && k!==defs && !k.classList.contains('gloss'));
    const gloss = kids.filter(k => k.tagName==='DETAILS' || k.classList.contains('gloss'));
    const cards = [...defs.children].filter(c => c.classList.contains('card'));
    const conf = cards.filter(c => /^(nextmatch|backup|langseg)$/.test(c.id)), alv = cards.filter(c => !conf.includes(c));
    const h2 = defs.querySelector(':scope > h2'); if(h2) h2.hidden = true;
    const G = {sess:[...sess, ...gloss], alvos:alv, conf:conf};
    let cur = 'sess'; try{ cur = sessionStorage.getItem('maisTab') || 'sess'; }catch(e){}
    const seg = document.createElement('div'); seg.className = 'seg mais-tabs'; seg.setAttribute('role','tablist'); seg.setAttribute('aria-label', T('Secções','Sections'));
    seg.innerHTML = [['sess',T('Sessões','Sessions')],['alvos',T('Alvos','Targets')],['conf',T('Definições','Settings')]].map(([k,l]) => '<button type="button" role="tab" data-mt="'+k+'">'+l+'</button>').join('');
    const first = sess[0] || defs; first.before(seg);
    const show = k => { cur = k; Object.entries(G).forEach(([g, els]) => els.forEach(e => { e.hidden = g!==k; })); defs.hidden = k==='sess';
      seg.querySelectorAll('[data-mt]').forEach(b => { b.setAttribute('aria-selected', b.dataset.mt===k); b.setAttribute('aria-pressed', b.dataset.mt===k); });
      try{ sessionStorage.setItem('maisTab', k); }catch(e){} };
    seg.addEventListener('click', e => { const b = e.target.closest('[data-mt]'); if(b) show(b.dataset.mt); });
    show(cur);
    // ligações de outras páginas que levam a uma secção da Mais (ex.: "editar alvos", depois de guardar o próximo jogo)
    // fazem scrollIntoView a um cartão: abre primeiro o separador dele
    const tabOf = el => Object.keys(G).find(g => G[g].some(x => x===el || x.contains(el))) || (el===defs || defs.contains(el) ? 'alvos' : null);
    const orig = Element.prototype.scrollIntoView;
    Element.prototype.scrollIntoView = function(){ try{ if(pg.contains(this)){ const k = tabOf(this); if(k && k!==cur) show(k); } }catch(e){} return orig.apply(this, arguments); };
    window.MAIS_TAB = show;
  }
  addEventListener('DOMContentLoaded', maisTabs);
  // ---- 4) Medalha nova: aviso quando ganhas uma medalha ----
  // Guarda as medalhas já vistas ('medals_seen'). Na primeira vez só regista as que já tens, sem aviso.
  // Espera que não haja outra janela aberta (ex.: pesagem da manhã) antes de aparecer.
  function medalPop(){
    const TR = window.TROFEUS; if(!TR || !TR.medals) return;
    const id = m => m.k+'|'+m.tier+'|'+m.date+'|'+m.week;
    let seen = null; try{ seen = JSON.parse(localStorage.getItem('medals_seen')); }catch(e){}
    const all = TR.medals.map(id);
    const save = () => { try{ localStorage.setItem('medals_seen', JSON.stringify(all)); localStorage.setItem('level_seen', String(TR.levelNo)); }catch(e){} };
    if(!Array.isArray(seen)){ save(); return; }
    const S = new Set(seen), fresh = TR.medals.filter(m => !S.has(id(m)));
    if(!fresh.length){ save(); return; }
    let lvSeen = 0; try{ lvSeen = +localStorage.getItem('level_seen') || 0; }catch(e){}
    const up = lvSeen && TR.levelNo > lvSeen;
    const TC = {gold:'#C99A1E', silver:'#8D98A8', bronze:'#A8693A', base:'#1F3B63'}, TN = {gold:T('Ouro','Gold'), silver:T('Prata','Silver'), bronze:'Bronze', base:''};
    const icon = m => { const md = document.querySelector('#s-trofeus .md[data-k="'+m.k+'"]'), sv = md && md.querySelector('svg');
      if(!sv) return ''; const c = sv.cloneNode(true); c.classList.remove('lk'); const ci = c.querySelector('circle'); if(ci) ci.setAttribute('fill', TC[m.tier]||TC.base); return c.outerHTML; };
    const name = m => { const b = document.querySelector('#s-trofeus .md[data-k="'+m.k+'"] b'); return b ? b.textContent : m.k; };
    const show = () => {
      if(document.querySelector('[role=dialog][aria-modal=true]')){ setTimeout(show, 1200); return; }
      const top = fresh.slice().sort((a,b) => ['base','bronze','silver','gold'].indexOf(b.tier)-['base','bronze','silver','gold'].indexOf(a.tier))[0];
      const el = document.createElement('div'); el.className = 'mpop'; el.setAttribute('role','dialog'); el.setAttribute('aria-modal','true'); el.setAttribute('aria-labelledby','mp-t');
      el.innerHTML = '<div class="mp-card"><div class="mp-glow" aria-hidden="true"></div><div class="mp-md">'+icon(top)+'</div>'
        +'<small>'+(fresh.length>1 ? fresh.length+T(' medalhas novas',' new medals') : T('Medalha nova','New medal'))+'</small>'
        +'<h2 id="mp-t">'+name(top)+(TN[top.tier]?' · '+TN[top.tier]:'')+'</h2>'
        +(top.note ? '<p class="mp-n">'+top.note+'</p>' : '')
        +(fresh.length>1 ? '<ul class="mp-l">'+fresh.filter(m=>m!==top).map(m => '<li>'+icon(m)+'<span>'+name(m)+(TN[m.tier]?' · '+TN[m.tier]:'')+'</span></li>').join('')+'</ul>' : '')
        +'<p class="mp-lv">'+(up ? T('Subiste de nível: ','Level up: ')+'<b>'+TR.level+'</b>' : T('Nível ','Level ')+TR.level)+' · '+TR.pts+T(' pontos',' points')+'</p>'
        +'<div class="mp-b"><button type="button" class="mp-go">'+T('Ver troféus','See trophies')+'</button><button type="button" class="mp-ok">'+T('Fixe!','Nice!')+'</button></div></div>';
      document.body.appendChild(el); save();
      const close = go => { el.classList.add('out'); setTimeout(() => el.remove(), matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 200); if(go) showTab('trofeus'); };
      el.querySelector('.mp-ok').addEventListener('click', () => close(false));
      el.querySelector('.mp-go').addEventListener('click', () => close(true));
      el.addEventListener('click', e => { if(e.target===el) close(false); });
      el.addEventListener('keydown', e => { if(e.key==='Escape') close(false); });
      el.querySelector('.mp-ok').focus();
    };
    setTimeout(show, 700);
  }
  addEventListener('load', medalPop);
  // ---- 5) Treino sem GPS: estimar a carga pela duração e pelo esforço (RPE) ----
  // Calibrado com os teus treinos com GPS: distância média por treino ÷ duração habitual = metros por minuto num treino normal (RPE 6).
  // Esforço mais alto ou mais baixo escala os metros por minuto (RPE 3 ≈ 0,7×, RPE 10 ≈ 1,4×). Num jogo usa os teus metros por minuto em jogo.
  // Corrida rápida e acelerações seguem a tua proporção habitual por metro. A velocidade máxima fica abaixo do alvo (não dá medalhas).
  function estimator(){
    const f = document.getElementById('addsess'); if(!f) return;
    const card = f.querySelector('.frm'), first = card && card.querySelector('.fr2'); if(!first) return;
    const tr = SESSIONS.filter(x => x.type!=='Match' && !x.est && !x.added && !x.combined && !x.shortSession);
    const mt = SESSIONS.filter(x => x.type==='Match' && x.fieldTimeMin>=30 && !x.added);
    const av = (a,fn) => a.length ? a.reduce((t,x)=>t+fn(x),0)/a.length : null;
    const rdT = av(tr, x=>x.rd) || 2400, hsrR = av(tr, x=>x.hsr/x.rd) || .25, accM = av(tr, x=>x.accel/x.rd) || .017, spT = av(tr, x=>x.maxSpeed) || 27.5, mpmM = av(mt, x=>x.rd/x.fieldTimeMin) || 60;
    let dur = 75; try{ dur = +localStorage.getItem('train_min') || 75; }catch(e){}
    const box = document.createElement('div'); box.className = 'est-box';
    box.innerHTML = '<b>'+T('Sem GPS? Estima pela duração e pelo esforço','No GPS? Estimate from duration and effort')+'</b>'
      +'<div class="sub" style="margin:2px 0 8px">'+T('RPE: o esforço de 1 (muito leve) a 10 (máximo). Preenche a distância, a corrida rápida e as acelerações por ti; podes corrigir antes de guardar.','RPE: effort from 1 (very easy) to 10 (max). Fills distance, fast running and accelerations for you; you can correct them before saving.')+'</div>'
      +'<div class="fr2"><label>'+T('Minutos de treino','Minutes')+'<input inputmode="numeric" id="es-min" autocomplete="off"></label><label>RPE (1–10)<input inputmode="numeric" id="es-rpe" autocomplete="off"></label></div>'
      +'<details class="more"><summary>'+T('Calibração','Calibration')+'</summary><div class="sub" style="margin:6px 0">'+T('Um treino teu com GPS tem em média ','Your GPS training sessions average ')+nfx(rdT/1000,1)+' km. '+T('Quanto dura, normalmente?','How long do they usually last?')+'</div><div class="fr2"><label>'+T('Duração habitual (min)','Usual duration (min)')+'<input inputmode="numeric" id="es-dur" value="'+dur+'"></label><span></span></div></details>'
      +'<div class="tgbtns"><button type="button" class="fc-sec" id="es-go">'+T('Estimar','Estimate')+'</button></div><div class="tgmsg" id="es-msg" role="status" aria-live="polite"></div>';
    first.before(box);
    const q = id => f.querySelector('#'+id), num = v => parseFloat(String(v).replace(',','.'));
    q('es-go').addEventListener('click', () => {
      const min = num(q('es-min').value), rpe = Math.round(num(q('es-rpe').value)), d = num(q('es-dur').value), msg = q('es-msg');
      if(!(min>0 && min<=240) || !(rpe>=1 && rpe<=10)){ msg.className = 'tgmsg err'; msg.textContent = T('Põe os minutos (até 240) e o RPE de 1 a 10.','Enter minutes (up to 240) and RPE from 1 to 10.'); return; }
      if(d>=20 && d<=240){ try{ localStorage.setItem('train_min', String(d)); }catch(e){} }
      const match = q('as-type').value==='Match', k = 0.4 + 0.1*rpe;
      const rd = match ? mpmM*min*Math.min(1, k/1.3) : (rdT/(d>=20&&d<=240?d:dur))*min*k;
      const hsr = rd*hsrR*Math.max(.3, Math.min(1.6, rpe/6)), acc = rd*accM*(0.7+0.05*rpe), sp = Math.min(spT, MAXREF*spdPct()-0.5);
      q('as-rd').value = Math.round(rd); q('as-hsr').value = Math.round(hsr); q('as-acc').value = Math.round(acc); q('as-sp').value = sp.toFixed(1).replace('.', EN?'.':',');
      q('as-est').checked = true; if(match && q('as-min')) q('as-min').value = Math.round(min);
      const note = q('as-note'); if(note && !note.value) note.value = 'RPE '+rpe+' · '+Math.round(min)+' min · '+T('estimado sem GPS','estimated without GPS');
      msg.className = 'tgmsg'; msg.textContent = T('✓ Estimativa: ~','✓ Estimate: ~')+nfx(rd/1000,1)+' km, ~'+Math.round(hsr)+' m '+T('de corrida rápida','fast running')+' (sRPE '+rpe*Math.round(min)+'). '+T('Confere e carrega em Guardar sessão.','Check and tap Save session.');
    });
  }
  addEventListener('DOMContentLoaded', estimator);
})();
