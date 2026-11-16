// ---------- Registos feitos na app: sessões adicionadas, próximo jogo e cópia de segurança ----------
// Carrega depois de data.js e antes de app.js: as sessões que adicionas entram em SESSIONS antes de tudo ser desenhado.
// Guarda só no telemóvel: 'extra_sessions' e 'next_match'. A cópia de segurança junta todas as chaves da app.
(function(){
  const ld = (k,d) => { try{ const v = JSON.parse(localStorage.getItem(k)); return v==null ? d : v; }catch(e){ return d; } };
  const sv = (k,v) => { try{ localStorage.setItem(k, JSON.stringify(v)); return true; }catch(e){ return false; } };
  const isoWeek = s => { const d = new Date(s+'T00:00:00Z'), n = (d.getUTCDay()+6)%7; d.setUTCDate(d.getUTCDate()-n+3); const y = new Date(Date.UTC(d.getUTCFullYear(),0,4)); return 1+Math.round(((d-y)/864e5-3+((y.getUTCDay()+6)%7))/7); };

  // sessões adicionadas na app
  const EXTRA = ld('extra_sessions', []).filter(x => x && /^\d{4}-\d{2}-\d{2}$/.test(x.date) && x.rd>0);
  EXTRA.forEach(x => {
    const s = Object.assign({}, x, {week:isoWeek(x.date), added:true, rhie:null, avgRhie:null});
    s.maxPct = s.maxSpeed/33.4;
    if(!(s.avgRd>0)) s.avgRd = s.rd; if(!(s.avgHsr>0)) s.avgHsr = s.hsr; if(!(s.avgAccel>0)) s.avgAccel = s.accel;
    if(!(s.avgMaxPct>0)) s.avgMaxPct = s.maxPct;
    if(!x.hasAvg) s.groupLabel = s.groupLabel || 'grupo (sem relatório)';
    SESSIONS.push(s);
  });
  SESSIONS.sort((a,b) => a.date.localeCompare(b.date));

  // próximo jogo (para planear a véspera)
  window.NEXT_MATCH = (() => { const m = ld('next_match', null); if(!m || !m.date) return null; const t = new Date(); t.setHours(0,0,0,0); return new Date(m.date+'T00:00:00') >= t ? m : null; })();

  // chaves que a cópia de segurança leva
  const KEYS = ['targets','lang','extra_sessions','next_match','body_extra','coach_log','coach_custom','coach_plank_pb','coach_target','coach_seed1','coach_seed2'];
  window.REG = {isoWeek, KEYS, ld, sv};

  addEventListener('DOMContentLoaded', () => {
    const {en: EN, t: T} = I18N;
    const esc = s => String(s==null?'':s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
    const num = v => { const n = parseFloat(String(v).replace(/\s/g,'').replace(',','.')); return isFinite(n) ? n : NaN; };
    const back = id => { try{ sessionStorage.setItem('goMais','1'); sessionStorage.setItem('goReg', id); }catch(e){} try{ window.name += ';goMais'; }catch(e){} location.reload(); };
    const mp = document.getElementById('pg-mais'), defs = document.getElementById('defs');
    if(!mp) return;

    // ---------- Adicionar sessão (na secção Todas as sessões) ----------
    const logSec = document.getElementById('logBody') && document.getElementById('logBody').closest('section');
    if(logSec){
      const today = new Date().toISOString().slice(0,10);
      const f = document.createElement('details'); f.className = 'fold'; f.id = 'addsess';
      f.innerHTML = '<summary><span>'+T('Adicionar uma sessão','Add a session')+'</span></summary><div class="card frm">'
        +'<p class="sub">'+T('Para dias sem relatório (por exemplo treinos nos Lusitanos sem GPS). Se não souberes a média do grupo, deixa em branco: a sessão conta na carga e nos gráficos, mas não é comparada com o grupo.','For days without a report (for example club sessions without GPS). If you do not know the group average, leave it blank: the session counts for load and charts but is not compared with the group.')+'</p>'
        +'<div class="fr2"><label>'+T('Data','Date')+'<input type="date" id="as-date" value="'+today+'" max="'+today+'"></label>'
        +'<label>'+T('Tipo','Type')+'<select id="as-type"><option value="Training">'+T('Treino','Training')+'</option><option value="Match">'+T('Jogo','Match')+'</option></select></label></div>'
        +'<div class="fr2"><label>'+T('Equipa','Team')+'<select id="as-team"><option>Seleção</option><option>Lusitanos</option></select></label>'
        +'<label class="as-m" hidden>'+T('Adversário','Opponent')+'<input type="text" id="as-opp" maxlength="30"></label></div>'
        +'<div class="fr2"><label>'+T('Distância (m)','Distance (m)')+'<input inputmode="numeric" id="as-rd"></label><label>'+T('Corrida rápida (m)','Fast running (m)')+'<input inputmode="numeric" id="as-hsr"></label></div>'
        +'<div class="fr2"><label>'+T('Acelerações','Accelerations')+'<input inputmode="numeric" id="as-acc"></label><label>'+T('Velocidade máx. (km/h)','Top speed (km/h)')+'<input inputmode="decimal" id="as-sp"></label></div>'
        +'<div class="fr2 as-m" hidden><label>'+T('Minutos em campo','Minutes on the pitch')+'<input inputmode="numeric" id="as-min"></label><span></span></div>'
        +'<details class="more"><summary>'+T('Média do grupo (opcional)','Group average (optional)')+'</summary><div class="fr2"><label>'+T('Distância (m)','Distance (m)')+'<input inputmode="numeric" id="as-ard"></label><label>'+T('Corrida rápida (m)','Fast running (m)')+'<input inputmode="numeric" id="as-ahsr"></label></div><div class="fr2"><label>'+T('Acelerações','Accelerations')+'<input inputmode="numeric" id="as-aacc"></label><label>'+T('Velocidade máx. (% do máximo)','Top speed (% of max)')+'<input inputmode="decimal" id="as-asp"></label></div></details>'
        +'<label class="chk"><input type="checkbox" id="as-est"> '+T('Valores estimados (sem GPS)','Estimated values (no GPS)')+'</label>'
        +'<label>'+T('Nota (opcional)','Note (optional)')+'<input type="text" id="as-note" maxlength="140"></label>'
        +'<div class="tgbtns"><button type="button" class="pri" id="as-save">'+T('Guardar sessão','Save session')+'</button></div><div class="tgmsg" id="as-msg" role="status" aria-live="polite"></div>'
        +(EXTRA.length?'<h3>'+T('Sessões que adicionaste','Sessions you added')+'</h3>'+EXTRA.slice().sort((a,b)=>b.date.localeCompare(a.date)).map(x=>'<div class="arow"><span><b>'+esc(x.date.split('-').reverse().slice(0,2).join('/'))+'</b> · '+(x.type==='Match'?T('Jogo','Match'):T('Treino','Training'))+' · '+Math.round(x.rd)+' m'+(x.est?' · ~':'')+'</span><button type="button" data-del="'+esc(x.id)+'">'+T('Apagar','Delete')+'</button></div>').join(''):'')
        +'</div>';
      logSec.appendChild(f);
      const q = s => f.querySelector(s), msg = q('#as-msg');
      q('#as-type').addEventListener('change', e => f.querySelectorAll('.as-m').forEach(n => n.hidden = e.target.value!=='Match'));
      q('#as-save').addEventListener('click', () => {
        const date = q('#as-date').value, type = q('#as-type').value, rd = num(q('#as-rd').value), hsr = num(q('#as-hsr').value), acc = num(q('#as-acc').value), sp = num(q('#as-sp').value);
        const bad = !date ? T('Falta a data.','Date missing.') : !(rd>0 && rd<20000) ? T('Distância inválida.','Invalid distance.') : !(hsr>=0 && hsr<10000) ? T('Corrida rápida inválida.','Invalid fast running.') : !(acc>=0 && acc<500) ? T('Acelerações inválidas.','Invalid accelerations.') : !(sp>5 && sp<45) ? T('Velocidade inválida (km/h).','Invalid speed (km/h).') : '';
        if(bad){ msg.className = 'tgmsg err'; msg.textContent = bad; return; }
        const ard = num(q('#as-ard').value), ahsr = num(q('#as-ahsr').value), aacc = num(q('#as-aacc').value), asp = num(q('#as-asp').value), est = q('#as-est').checked;
        const x = {id:'s'+Date.now().toString(36), date, type, team:q('#as-team').value, rd, hsr, accel:acc, maxSpeed:sp, notes:(est?'approx · ':'')+(q('#as-note').value||T('Adicionada na app.','Added in the app.')), est};
        if(ard>0 && ahsr>=0 && aacc>=0 && asp>0){ Object.assign(x, {hasAvg:true, avgRd:ard, avgHsr:ahsr, avgAccel:aacc, avgMaxPct:asp>1?asp/100:asp}); }
        if(type==='Match'){ x.opponent = q('#as-opp').value || T('adversário','opponent'); const m = num(q('#as-min').value); if(m>0) x.fieldTimeMin = m; }
        const all = ld('extra_sessions', []); all.push(x);
        if(!sv('extra_sessions', all)){ msg.className = 'tgmsg err'; msg.textContent = T('Não consegui guardar neste navegador.','Could not save in this browser.'); return; }
        back('addsess');
      });
      f.addEventListener('click', e => { const b = e.target.closest('[data-del]'); if(!b) return; sv('extra_sessions', ld('extra_sessions', []).filter(x => x.id!==b.dataset.del)); back('addsess'); });
    }

    // ---------- Definições: próximo jogo e cópia de segurança ----------
    if(defs){
      const lang = document.getElementById('langseg');
      const nm = ld('next_match', null) || {};
      const c1 = document.createElement('div'); c1.className = 'card'; c1.id = 'nextmatch'; c1.style.padding = '14px 16px';
      c1.innerHTML = '<h3 style="margin-top:0">'+T('Próximo jogo','Next match')+'</h3><div class="sub">'+T('Com a data do jogo, o Hoje e o Coach planeiam a véspera (dia mais leve) e não só o dia seguinte.','With the match date, Today and Coach plan the day before (a lighter day), not just the day after.')+'</div>'
        +'<div class="frm"><div class="fr2"><label>'+T('Data','Date')+'<input type="date" id="nm-date" value="'+esc(nm.date||'')+'"></label><label>'+T('Adversário','Opponent')+'<input type="text" id="nm-opp" maxlength="30" value="'+esc(nm.opp||'')+'"></label></div></div>'
        +'<div class="tgbtns"><button type="button" class="pri" id="nm-save">'+T('Guardar','Save')+'</button>'+(nm.date?'<button type="button" id="nm-clear">'+T('Limpar','Clear')+'</button>':'')+'</div>';
      const c2 = document.createElement('div'); c2.className = 'card'; c2.id = 'backup'; c2.style.padding = '14px 16px';
      c2.innerHTML = '<h3 style="margin-top:0">'+T('Cópia de segurança','Backup')+'</h3><div class="sub">'+T('Os teus registos (Coach, prancha, alvos, sessões e medições que adicionaste) ficam só neste telemóvel e neste endereço. Copia o código e guarda-o numa nota; para recuperar noutro telemóvel, cola-o aqui.','Your records (Coach, plank, targets, sessions and measurements you added) live only on this phone and this address. Copy the code and keep it in a note; to recover on another phone, paste it here.')+'</div>'
        +'<div class="tgbtns"><button type="button" class="pri" id="bk-copy">'+T('Copiar código','Copy code')+'</button><button type="button" id="bk-file">'+T('Guardar ficheiro','Save file')+'</button></div>'
        +'<div class="frm"><label>'+T('Recuperar: cola o código','Restore: paste the code')+'<textarea id="bk-in" rows="3" spellcheck="false"></textarea></label></div>'
        +'<div class="tgbtns"><button type="button" id="bk-load">'+T('Recuperar','Restore')+'</button><label class="filebtn">'+T('Abrir ficheiro','Open file')+'<input type="file" id="bk-up" accept=".json,application/json,text/plain" hidden></label></div>'
        +'<div class="tgmsg" id="bk-msg" role="status" aria-live="polite"></div>';
      if(lang) { lang.before(c1); lang.before(c2); } else { defs.appendChild(c1); defs.appendChild(c2); }
      const g = s => document.getElementById(s);
      g('nm-save').addEventListener('click', () => { const d = g('nm-date').value; if(!d){ g('nm-date').focus(); return; } sv('next_match', {date:d, opp:g('nm-opp').value.trim()}); back('nextmatch'); });
      if(g('nm-clear')) g('nm-clear').addEventListener('click', () => { try{ localStorage.removeItem('next_match'); }catch(e){} back('nextmatch'); });
      const pack = () => { const o = {app:'carga', v:1, at:new Date().toISOString(), data:{}}; KEYS.forEach(k => { try{ const v = localStorage.getItem(k); if(v!=null) o.data[k] = v; }catch(e){} }); return JSON.stringify(o); };
      const bm = g('bk-msg'), say = (t, err) => { bm.className = 'tgmsg'+(err?' err':''); bm.textContent = t; };
      g('bk-copy').addEventListener('click', () => {
        const txt = pack();
        const fallback = () => { const ta = g('bk-in'); ta.value = txt; ta.focus(); ta.select(); say(T('Não deu para copiar sozinho: o código está na caixa, seleciona e copia.','Could not copy automatically: the code is in the box, select and copy it.'), true); };
        try{ navigator.clipboard.writeText(txt).then(() => say(T('✓ Código copiado. Guarda-o numa nota.','✓ Code copied. Keep it in a note.')), fallback); }catch(e){ fallback(); }
      });
      g('bk-file').addEventListener('click', () => {
        try{ const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([pack()], {type:'application/json'})); a.download = 'carga-backup-'+new Date().toISOString().slice(0,10)+'.json'; document.body.appendChild(a); a.click(); a.remove();
          say(T('Se nada descarregou (acontece dentro do Claude), usa Copiar código.','If nothing downloaded (happens inside Claude), use Copy code.')); }catch(e){ say(T('Não deu: usa Copiar código.','Not possible here: use Copy code.'), true); }
      });
      const restore = txt => {
        let o; try{ o = JSON.parse(txt); }catch(e){ say(T('Código inválido.','Invalid code.'), true); return; }
        if(!o || o.app!=='carga' || !o.data){ say(T('Este código não é desta app.','This code is not from this app.'), true); return; }
        try{ Object.keys(o.data).forEach(k => { if(KEYS.includes(k)) localStorage.setItem(k, o.data[k]); }); }catch(e){ say(T('Não consegui guardar neste navegador.','Could not save in this browser.'), true); return; }
        back('backup');
      };
      g('bk-load').addEventListener('click', () => restore(g('bk-in').value.trim()));
      g('bk-up').addEventListener('change', e => { const fl = e.target.files && e.target.files[0]; if(!fl) return; const r = new FileReader(); r.onload = () => restore(String(r.result)); r.readAsText(fl); });
    }

    // ---------- Corpo: adicionar uma medição ----------
    const cp = document.getElementById('s-corpo');
    if(cp){
      const today = new Date().toISOString().slice(0,10), mine = ld('body_extra', []);
      const f = document.createElement('details'); f.className = 'fold'; f.id = 'addbody';
      f.innerHTML = '<summary><span>'+T('Adicionar uma medição','Add a measurement')+'</span></summary><div class="card frm">'
        +'<p class="sub">'+T('Peso é obrigatório; o resto vem do relatório ISAK, se o tiveres. Com duas ou mais medições aparece a variação face à anterior.','Weight is required; the rest comes from the ISAK report if you have it. With two or more measurements you see the change from the previous one.')+'</p>'
        +'<div class="fr2"><label>'+T('Data','Date')+'<input type="date" id="ab-date" value="'+today+'" max="'+today+'"></label><label>'+T('Peso (kg)','Weight (kg)')+'<input inputmode="decimal" id="ab-w"></label></div>'
        +'<div class="fr2"><label>'+T('Σ8 pregas (mm)','Σ8 skinfolds (mm)')+'<input inputmode="decimal" id="ab-s8"></label><label>'+T('Massa gorda (%)','Body fat (%)')+'<input inputmode="decimal" id="ab-f"></label></div>'
        +'<div class="fr2"><label>LMI<input inputmode="decimal" id="ab-l"></label><label>'+T('Equipa','Team')+'<select id="ab-team"><option>Seleção</option><option>Lusitanos</option></select></label></div>'
        +'<div class="tgbtns"><button type="button" class="pri" id="ab-save">'+T('Guardar medição','Save measurement')+'</button></div><div class="tgmsg" id="ab-msg" role="status" aria-live="polite"></div>'
        +(mine.length?'<h3>'+T('Medições que adicionaste','Measurements you added')+'</h3>'+mine.map(x=>'<div class="arow"><span><b>'+esc(x.date.split('-').reverse().slice(0,2).join('/'))+'</b> · '+String(x.weight).replace('.',EN?'.':',')+' kg'+(x.s8!=null?' · Σ8 '+x.s8:'')+'</span><button type="button" data-delb="'+esc(x.date)+'">'+T('Apagar','Delete')+'</button></div>').join(''):'')
        +'</div>';
      cp.appendChild(f);
      const q = s2 => f.querySelector(s2), msg = q('#ab-msg'), opt = v => { const n = num(v); return isFinite(n) && n>0 ? n : null; };
      q('#ab-save').addEventListener('click', () => {
        const date = q('#ab-date').value, w = num(q('#ab-w').value);
        if(!date || !(w>40 && w<160)){ msg.className = 'tgmsg err'; msg.textContent = T('Põe a data e um peso entre 40 e 160 kg.','Enter the date and a weight between 40 and 160 kg.'); return; }
        const all = ld('body_extra', []).filter(x => x.date!==date);
        all.push({date, weight:w, s8:opt(q('#ab-s8').value), fatPct:opt(q('#ab-f').value), lmi:opt(q('#ab-l').value), team:q('#ab-team').value});
        all.sort((a,b) => a.date.localeCompare(b.date)); sv('body_extra', all);
        try{ sessionStorage.setItem('goReg','addbody'); sessionStorage.setItem('goCorpo','1'); }catch(e){} location.reload();
      });
      f.addEventListener('click', e => { const b = e.target.closest('[data-delb]'); if(!b) return; sv('body_extra', ld('body_extra', []).filter(x => x.date!==b.dataset.delb)); try{ sessionStorage.setItem('goReg','addbody'); sessionStorage.setItem('goCorpo','1'); }catch(e2){} location.reload(); });
      let gc = null; try{ gc = sessionStorage.getItem('goCorpo'); sessionStorage.removeItem('goCorpo'); }catch(e){}
      if(gc) try{ showTab('corpo'); }catch(e){}
    }

    // depois de guardar: volta ao cartão certo e confirma
    let go = null; try{ go = sessionStorage.getItem('goReg'); sessionStorage.removeItem('goReg'); }catch(e){}
    if(go) setTimeout(() => { const el = document.getElementById(go); if(!el) return; if(el.tagName==='DETAILS') el.open = true; el.scrollIntoView({block:'start'}); const m = el.querySelector('.tgmsg'); if(m) m.textContent = T('✓ Guardado.','✓ Saved.'); }, 60);
  });
})();
