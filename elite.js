// ---------- Alto rendimento, simples ----------
// Check-in de 10 segundos, RPE de cada treino, testes de skills, feedback do treinador, plano até ao Mundial,
// exposição a velocidade máxima, revisão de jogos e semanas de exames. Sem separadores novos:
// Mundial mostra só o essencial; o resto vive numa página "Plano" com secções fechadas.
(function(){
  const {en: EN, t: T} = I18N;
  const ld = (k,d) => { try{ const v = JSON.parse(localStorage.getItem(k)); return v==null ? d : v; }catch(e){ return d; } };
  const sv = (k,v) => { try{ localStorage.setItem(k, JSON.stringify(v)); }catch(e){} };
  const KEYS = ['el_ck','el_rpe','el_sk','el_fb','el_mr','el_ex','el_ph'];
  if(window.REG && REG.KEYS) KEYS.forEach(k => { if(!REG.KEYS.includes(k)) REG.KEYS.push(k); });
  const esc = s => String(s==null?'':s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const today = TODAY;
  const addD = (s, n) => { const d = new Date(s+'T12:00:00'); d.setDate(d.getDate()+n); return isoDay(d); };
  const diff = (a, b) => Math.round((new Date(a+'T12:00:00') - new Date(b+'T12:00:00'))/864e5);
  const dS = s => new Date(s+'T12:00:00').toLocaleDateString(EN?'en-GB':'pt-PT',{day:'numeric',month:'short'}).replace('.','');
  const f1 = v => String(Math.round(v*10)/10).replace('.',EN?'.':',');
  const num = v => parseFloat(String(v).replace(',','.'));

  // ---------- 1. check-in (sem sono: isso já está nos pontos) ----------
  const CKQ = [['fat',T('Fadiga','Fatigue'),T('fresco','fresh'),T('exausto','exhausted')],
               ['sore',T('Dores musculares','Muscle soreness'),T('nada','none'),T('muitas','a lot')],
               ['str',T('Stress','Stress'),T('calmo','calm'),T('muito','high')],
               ['mood',T('Humor','Mood'),T('ótimo','great'),T('em baixo','low')]];
  const AREAS = [['ham',T('Isquiotibiais','Hamstring')],['add',T('Adutores','Groin')],['calf',T('Gémeos','Calf')],['quad',T('Quadríceps','Quad')],['back',T('Lombar','Lower back')],['sh',T('Ombro','Shoulder')],['knee',T('Joelho','Knee')],['ank',T('Tornozelo','Ankle')],['neck',T('Pescoço','Neck')]];
  const SEV = ['',T('leve','mild'),T('atrapalha','limits me'),T('não treino a 100%','can\'t go 100%')];
  const CK = ld('el_ck', {});
  const ready = c => { if(!c || CKQ.some(([k])=>!c[k])) return null;
    const s = CKQ.reduce((a,[k])=>a+c[k],0), nig = Math.max(0, ...Object.values(c.nig||{}));
    let r = Math.round(100-(s-4)/16*100); if(nig>=2) r = Math.min(r, 60); if(nig>=3) r = Math.min(r, 40); return {r, nig}; };
  const verdict = c => { const x = ready(c); if(!x) return null;
    const lvl = x.r>=70 ? 'g' : x.r>=50 ? 'a' : 'r';
    const txt = lvl==='g' ? T('Pronto. Treina como planeado.','Ready. Train as planned.')
      : lvl==='a' ? T('Treina, mas sem picos: qualidade sim, volume extra não.','Train, but no spikes: keep quality, cut extra volume.')
      : T('Dia leve. Diz ao treinador ou ao fisio como estás antes do treino.','Light day. Tell the coach or physio how you feel before training.');
    const n = c.nig||{}, extra = [];
    if((n.ham||0)>=2) extra.push(T('Nada de sprints máximos hoje.','No max sprints today.'));
    if((n.add||0)>=2) extra.push(T('Poucos pontapés hoje.','Keep kicking low today.'));
    return {lvl, r:x.r, txt:txt+(extra.length?' '+extra.join(' '):'')}; };

  // ---------- 2. RPE de cada treino ----------
  const RPE = ld('el_rpe', {});
  const TYPES = [['club',T('Clube','Club')],['nat',T('Seleção','National team')],['gym',T('Ginásio','Gym')],['skill',T('Skills','Skills')],['game',T('Jogo','Match')],['other',T('Outro','Other')]];
  const RPEW = r => r<=2?T('muito leve','very easy'):r<=4?T('leve','easy'):r<=6?T('moderado','moderate'):r<=8?T('duro','hard'):r<=9?T('muito duro','very hard'):T('máximo','max');
  const dayLoad = d => (RPE[d]||[]).reduce((a,s)=>a+s.min*s.rpe,0);
  const sumLoad = (end, n) => { let a = 0; for(let i=0;i<n;i++) a += dayLoad(addD(end,-i)); return a; };
  const internal = () => { const a = sumLoad(today,7), ch = sumLoad(today,28)/4, days = Object.keys(RPE).filter(d => (RPE[d]||[]).length).sort();
    const span = days.length ? diff(today, days[0]) : 0;
    return {a, ch, ratio: span>=21 && ch>0 ? a/ch : null}; };

  // ---------- 3. velocidade perto do máximo ----------
  const speed = () => { const S = SESSIONS.filter(s => s.date<=today && s.maxPct!=null);
    const recent = S.filter(s => diff(today, s.date) <= 10);
    const hits = S.filter(s => s.maxPct >= .9), last = hits.length ? hits[hits.length-1].date : null;
    return {gps: recent.length, last, since: last ? diff(today, last) : null}; };

  // ---------- 4. plano até ao Mundial ----------
  const PH0 = [
    ['2026-11-01',T('Base e skills','Base and skills'),T('Volume de passes e pontapés, força, terminar o curso. Ganhar a confiança do treinador nos treinos.','Pass and kick volume, strength, finish the degree. Earn the coach\'s trust in training.')],
    ['2027-02-01',T('Janela de testes','Test window'),T('Os jogos da seleção: é aqui que se ganham minutos. Prontidão alta nos dias de jogo e revê cada jogo.','National team matches: this is where minutes are won. Be ready on match days and review every game.')],
    ['2027-04-01',T('Construção','Build'),T('Velocidade e potência. Fechar as lacunas que o treinador apontou.','Speed and power. Close the gaps the coach named.')],
    ['2027-07-01',T('Testes de verão e estágio','Summer tests and camp'),T('Mostrar no estágio o que treinaste. Zero lesões evitáveis.','Show in camp what you trained. Zero avoidable injuries.')],
    ['2027-08-16',T('Preparação final','Final preparation'),T('Afinar, não acumular. Os 33 são anunciados.','Sharpen, don\'t pile on. The 33 are named.')],
    ['2027-10-04',T('Mundial','World Cup'),T('Irlanda, Uruguai, Escócia.','Ireland, Uruguay, Scotland.')]];
  const phases = () => { const o = ld('el_ph', {}); return PH0.map((p,i) => ({i, d:o[i]||p[0], n:p[1], w:p[2]})); };
  const curPh = () => { const P = phases(); let c = P[0]; P.forEach(p => { if(p.d <= today) c = p; }); const nx = P.find(p => p.d > today); return {c, nx}; };

  // ---------- 5–8. listas ----------
  const SK = ld('el_sk', []), FB = ld('el_fb', []), MR = ld('el_mr', []), EX = ld('el_ex', []);
  const sortD = a => a.sort((x,y) => x.d < y.d ? 1 : -1);
  const exam = () => EX.find(e => e.from <= today && today <= e.to);
  const focus = () => { const f = sortD(FB.slice())[0]; return f && diff(today, f.d) <= 28 ? f : null; };
  const lastGame = () => { const g = SESSIONS.filter(s => /match|jogo|game/i.test(s.type||'') && s.date<=today && diff(today,s.date)<=10).map(s=>s.date);
    Object.keys(RPE).forEach(d => { if(diff(today,d)<=10 && d<=today && RPE[d].some(s=>s.t==='game')) g.push(d); });
    const nm = ld('next_match', null); if(nm && nm.date && nm.date<=today && diff(today,nm.date)<=10) g.push(nm.date);
    g.sort(); const d = g[g.length-1]; return d && !MR.some(m => m.d===d) ? d : null; };

  // ---------- o próximo passo: UMA coisa de cada vez ----------
  const nextStep = () => {
    const v = verdict(CK[today]);
    if(v && v.lvl==='r') return {t:v.txt, go:null};
    const g = lastGame(); if(g) return {t:T('Revê o jogo de ','Review the match of ')+dS(g)+T(': nota, o que correu bem, o que melhorar.',': rating, what went well, what to improve.'), go:'mr'};
    if(!focus()) return {t:T('Pergunta ao treinador o que te falta para jogar e regista aqui.','Ask the coach what you need to get picked and log it here.'), go:'fb'};
    const ls = sortD(SK.slice())[0]; if(!ls || diff(today, ls.d) >= 7) return {t:T('Teste de skills da semana: 10 passes de cada lado e 5 box kicks (5 minutos).','Weekly skill test: 10 passes each side and 5 box kicks (5 minutes).'), go:'sk'};
    const s = speed(), hm = ((CK[today]||{}).nig||{}).ham||0; if(hm < 2 && s.gps && (s.since==null || s.since > 7)) return {t:T('Há ','')+(s.since==null?T('muito tempo','a long time'):s.since+T(' dias',' days'))+T(' sem correr a 90% do teu máximo. Faz 3 sprints de 30–40 m no próximo treino (não na véspera de jogo).',' since you ran at 90% of your max. Do 3 sprints of 30–40 m next session (not the day before a match).'), go:null};
    const ex = exam(); if(ex) return {t:T('Semana de exames: o stress também é carga. Mantém prehab e skills curtas, não aumentes o volume.','Exam week: stress is load too. Keep prehab and short skills, don\'t add volume.'), go:'ex'};
    return {t:T('Foco: ','Focus: ')+esc(focus().focus||focus().txt), go:'fb'}; };

  // ---------- estilos ----------
  const st = document.createElement('style');
  st.textContent = `
#pg-mundial .wc-gm,#pg-mundial .wc-sel,.wc-fab[hidden],.el-hid,.el-pg[hidden]{display:none!important}
.el-q{grid-template-columns:92px minmax(0,1fr);align-items:center}
.el-q.nb{grid-template-columns:1fr}
.el-menu{display:grid;margin:0 0 14px;border:1px solid var(--line);border-radius:14px;background:var(--surface);overflow:hidden}
.el-menu button{display:flex;align-items:center;justify-content:space-between;gap:10px;min-height:56px;padding:10px 16px;border:0;border-top:1px solid var(--line);background:none;color:var(--ink);text-align:left;cursor:pointer;font:inherit}
.el-menu button:first-child{border-top:0}
.el-menu b{display:block;font:700 16px var(--font-body)}
.el-menu small{display:block;margin-top:2px;font-size:13px;color:var(--ink-muted)}
.el-menu i{font-style:normal;font-size:22px;color:var(--ink-muted)}
.el-pg{position:fixed;inset:0;z-index:70;display:flex;flex-direction:column;background:var(--bg)}
.el-pg-h{display:flex;align-items:center;gap:6px;padding:calc(env(safe-area-inset-top,0px) + 6px) 8px 6px;border-bottom:1px solid var(--line);background:var(--bg)}
.el-pg-h b{font:700 19px var(--font-display);min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.el-pg-b{min-height:44px;padding:0 10px;border:0;background:none;color:var(--ink);font:600 16px var(--font-body);cursor:pointer;flex:none}
.el-pg-c{flex:1;overflow-y:auto;overscroll-behavior:contain;-webkit-overflow-scrolling:touch;padding:12px 16px calc(24px + env(safe-area-inset-bottom,0px))}
.el-pg-c > section > h2:first-child{display:none}
.el-sc{display:grid;gap:10px;margin-top:10px}
.el-q{display:grid;gap:4px}
.el-q > span{font-size:14px;font-weight:600}
.el-seg{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:6px}
.el-seg button{min-height:44px;border-radius:10px;border:1px solid var(--line);background:var(--surface-2);color:var(--ink);font:700 16px var(--font-body);cursor:pointer}
.el-seg button.on{background:var(--navy,#0E1A2E);color:#fff;border-color:transparent}
.el-ends{display:flex;justify-content:space-between;font-size:12px;color:var(--ink-muted)}
.el-chips{display:flex;flex-wrap:wrap;gap:6px}
.el-chips button{min-height:40px;padding:0 12px;border-radius:999px;border:1px solid var(--line);background:var(--surface);color:var(--ink);font:600 14px var(--font-body);cursor:pointer}
.el-chips button[data-s="1"]{background:rgba(217,152,26,.18);border-color:#D9981A}
.el-chips button[data-s="2"]{background:rgba(215,38,61,.15);border-color:#D7263D}
.el-chips button[data-s="3"]{background:#D7263D;color:#fff;border-color:#D7263D}
.el-v{display:grid;grid-template-columns:auto 1fr;gap:12px;align-items:center;padding:12px 14px;border-radius:12px;font-size:14px;line-height:1.4}
.el-v b{font:700 26px var(--font-display);font-variant-numeric:tabular-nums}
.el-v.g{background:rgba(22,163,74,.12)} .el-v.g b{color:#16A34A}
.el-v.a{background:rgba(217,152,26,.16)} .el-v.a b{color:#B7791F}
.el-v.r{background:rgba(215,38,61,.12)} .el-v.r b{color:#D7263D}
.el-lk{background:none;border:0;padding:8px 0 0;min-height:44px;color:var(--ink-muted);font:600 14px var(--font-body);text-decoration:underline;cursor:pointer}
.el-nx{display:flex;flex-direction:column;gap:6px}
.el-nx p{margin:0;font-size:15px;line-height:1.45}
.el-f{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin-top:10px}
.el-f label{display:grid;gap:4px;font-size:13px;color:var(--ink-muted);min-width:0}
.el-f .w{grid-column:1/-1}
.el-f input,.el-f select,.el-f textarea{width:100%;box-sizing:border-box;min-height:44px;border-radius:10px;border:1px solid var(--line);background:var(--surface);color:var(--ink);padding:8px 10px;font:15px var(--font-body)}
.el-rpe{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:6px}
.el-rpe button{min-height:44px;border-radius:10px;border:1px solid var(--line);background:var(--surface-2);color:var(--ink);font:700 16px var(--font-body);cursor:pointer}
.el-rpe button.on{background:#D7263D;color:#fff;border-color:transparent}
.el-li{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:8px;align-items:start;padding:10px 0;border-top:1px solid var(--line);font-size:14px;line-height:1.4}
.el-li:first-child{border-top:0}
.el-li small{color:var(--ink-muted)}
.el-x{min-width:44px;min-height:44px;border:0;background:none;color:var(--ink-muted);font:700 20px var(--font-body);cursor:pointer}
.el-ph{display:grid;gap:0}
.el-ph div{display:grid;grid-template-columns:72px 1fr;gap:10px;padding:10px 0;border-top:1px solid var(--line);font-size:14px;line-height:1.4}
.el-ph div:first-child{border-top:0}
.el-ph div.on{background:rgba(215,38,61,.07);border-radius:10px;padding:10px 8px;margin:0 -8px}
.el-ph small{color:var(--ink-muted);font-variant-numeric:tabular-nums}
.el-ph b{display:block}
#pg-plano details.fold{margin:0 0 10px}
#pg-plano details.fold > summary{display:flex;justify-content:space-between;gap:8px;align-items:center;min-height:52px;padding:0 14px;border:1px solid var(--line);border-radius:14px;background:var(--surface);font:700 17px var(--font-display);cursor:pointer;list-style:none}
#pg-plano details.fold > summary::-webkit-details-marker{display:none}
#pg-plano details.fold > summary em{font:500 13px var(--font-body);font-style:normal;color:var(--ink-muted);text-align:right}
#pg-plano details.fold[open] > summary{border-radius:14px 14px 0 0;border-bottom:0}
#pg-plano details.fold > .wc-card{border-radius:0 0 14px 14px;margin:0}
.wc-sh-c .wc-item h3{cursor:pointer;margin:0}
.wc-sh-c .wc-item h3::after{content:"▾";margin-left:6px;color:var(--ink-muted);font-size:14px}
.wc-sh-c .wc-item.cl h3::after{content:"▸"}
.wc-sh-c .wc-item.cl > :not(h3){display:none}
`;
  document.head.appendChild(st);

  // ---------- caixas persistentes (as páginas redesenham-se; estas voltam a entrar) ----------
  const mkBox = cls => { const b = document.createElement('section'); b.className = 'wc-card '+(cls||''); return b; };
  const ckBox = mkBox('el-ck'), nxBox = mkBox('el-nxc'), cgBox = mkBox('el-cg'), rpeBox = mkBox('el-rpec');
  let ckEdit = false, ckNig = false;

  function renderCk(){
    const c = CK[today] || {}, v = verdict(c);
    if(v && !ckEdit){
      const wk = []; for(let i=6;i>=0;i--){ const x = ready(CK[addD(today,-i)]); wk.push(x ? x.r : null); }
      ckBox.innerHTML = '<h2>'+T('Como estás','How you feel')+'</h2><div class="el-v '+v.lvl+'"><b>'+v.r+'</b><span>'+v.txt+'</span></div>'
        +'<button type="button" class="el-lk" data-ed="1">'+T('Mudar o check-in','Change the check-in')+'</button>';
      return;
    }
    ckBox.innerHTML = '<h2>'+T('Como estás hoje?','How do you feel today?')+'</h2><div class="sub">'+T('10 segundos. 1 = ótimo, 5 = mau.','10 seconds. 1 = great, 5 = bad.')+'</div><div class="el-sc">'
      + CKQ.map(([k,n,lo,hi]) => '<div class="el-q"><span>'+n+'</span><div class="el-seg" data-ckq="'+k+'">'+[1,2,3,4,5].map(i=>'<button type="button" data-v="'+i+'"'+(c[k]===i?' class="on"':'')+'>'+i+'</button>').join('')+'</div></div>').join('')
      + (!ckNig && !Object.keys(c.nig||{}).length ? '<button type="button" class="el-lk" data-nig="1">+ '+T('Tenho uma dor ou mazela','I have a pain or niggle')+'</button>' : '<div class="el-q nb"><span>'+T('Onde? Toca outra vez para mudar a gravidade.','Where? Tap again to change how bad.')+'</span><div class="el-chips">'+AREAS.map(([k,n]) => { const s = (c.nig||{})[k]||0; return '<button type="button" data-a="'+k+'" data-s="'+s+'">'+n+(s?' · '+SEV[s]:'')+'</button>'; }).join('')+'</div></div>')+'</div>'
      + (v ? '<button type="button" class="wc-go" data-ok="1">'+T('Feito','Done')+'</button>' : '');
  }
  ckBox.addEventListener('click', e => {
    const c = CK[today] = CK[today] || {};
    const b = e.target.closest('button'); if(!b) return;
    if(b.dataset.nig){ ckNig = true; ckEdit = true; renderCk(); return; }
    if(b.dataset.ed){ ckEdit = true; renderCk(); return; }
    if(b.dataset.ok){ ckEdit = false; renderCk(); renderAll(); return; }
    if(b.dataset.v){ const q = b.parentElement.dataset.ckq; c[q] = +b.dataset.v; sv('el_ck', CK);
      b.parentElement.querySelectorAll('button').forEach(x => x.classList.toggle('on', x===b));
      ckEdit = true; if(ready(c) && !ckBox.querySelector('[data-ok]')) renderCk(); return; }
    if(b.dataset.a){ ckEdit = true; c.nig = c.nig || {}; const s = ((c.nig[b.dataset.a]||0)+1)%4; if(s) c.nig[b.dataset.a] = s; else delete c.nig[b.dataset.a]; sv('el_ck', CK);
      b.dataset.s = s; b.textContent = AREAS.find(a=>a[0]===b.dataset.a)[1]+(s?' · '+SEV[s]:''); }
  });

  function renderNx(){
    const n = nextStep(), {c, nx} = curPh();
    nxBox.innerHTML = '<h2>'+T('Próximo passo','Next step')+'</h2><div class="el-nx"><p>'+n.t+'</p></div>'
      + '<div class="sub" style="margin-top:8px">'+T('Fase: ','Phase: ')+'<b>'+c.n+'</b>'+(nx?' · '+nx.n+T(' em ',' in ')+diff(nx.d,today)+T(' dias',' days'):'')+'</div>'
      + '<button type="button" class="wc-go alt" data-plan="'+(n.go||'')+'">'+T('Plano até ao Mundial','Plan to the World Cup')+' ›</button>';
  }
  nxBox.addEventListener('click', e => { const b = e.target.closest('[data-plan]'); if(b) openPlan(b.dataset.plan); });

  // Carga: prontidão + carga interna + velocidade, num só cartão
  function renderCg(){
    const v = verdict(CK[today]), L = internal(), s = speed();
    const rt = L.ratio==null ? T('precisa de 3 semanas de registos','needs 3 weeks of logs') : f1(L.ratio)+(L.ratio>1.5?T(' · subida brusca, cuidado',' · sharp rise, careful'):L.ratio<.8?T(' · abaixo do habitual',' · below usual'):T(' · dentro do habitual',' · within usual'));
    cgBox.innerHTML = '<h2>'+T('Corpo e carga hoje','Body and load today')+'</h2>'
      + (v ? '<div class="el-v '+v.lvl+'"><b>'+v.r+'</b><span>'+v.txt+'</span></div>' : '<div class="sub">'+T('Faz o check-in no Mundial para ver a prontidão de hoje.','Do the check-in on the World Cup page to see today\'s readiness.')+'</div>')
      + '<div class="wc-big"><div><b>'+Math.round(L.a)+'</b><small>'+T('carga interna 7 dias (RPE × min)','internal load 7 days (RPE × min)')+'</small></div><div><b>'+Math.round(L.ch)+'</b><small>'+T('média semanal (4 semanas)','weekly average (4 weeks)')+'</small></div><div><b>'+(s.since==null?'–':s.since)+'</b><small>'+T('dias desde ≥90% da vel. máx.','days since ≥90% top speed')+'</small></div></div>'
      + '<div class="sub" style="margin-top:8px">'+T('Rácio: ','Ratio: ')+rt+'. '+T('Regista cada treino (com ou sem GPS) em "+ Registar".','Log every session (with or without GPS) in "+ Log".')+'</div>';
  }

  // folha Registar: treinos com RPE no topo
  let rpeSel = 6, rpeDate = today;
  function renderRpe(){
    const L = RPE[rpeDate] || [];
    rpeBox.innerHTML = '<h2>'+T('Treinos','Sessions')+'</h2><div class="sub">'+T('Cada treino: tipo, minutos e quão duro foi (RPE 1–10).','Each session: type, minutes and how hard it was (RPE 1–10).')+'</div>'
      + (L.length ? '<div style="margin-top:8px">'+L.map((s,i)=>'<div class="el-li"><span>'+(TYPES.find(t=>t[0]===s.t)||TYPES[5])[1]+' · '+s.min+' min · RPE '+s.rpe+' <small>= '+s.min*s.rpe+'</small></span><button type="button" class="el-x" data-rx="'+i+'" aria-label="'+T('Apagar','Delete')+'">×</button></div>').join('')+'</div>' : '')
      + '<div class="el-f"><label>'+T('Dia','Day')+'<input type="date" data-rd value="'+rpeDate+'" max="'+today+'"></label><label>'+T('Tipo','Type')+'<select data-rt>'+TYPES.map(([k,n])=>'<option value="'+k+'">'+n+'</option>').join('')+'</select></label>'
      + '<label class="w">'+T('Minutos','Minutes')+'<input inputmode="numeric" data-rm placeholder="60"></label>'
      + '<label class="w">RPE · <span data-rw>'+rpeSel+' '+RPEW(rpeSel)+'</span><div class="el-rpe">'+[1,2,3,4,5,6,7,8,9,10].map(i=>'<button type="button" data-r="'+i+'"'+(i===rpeSel?' class="on"':'')+'>'+i+'</button>').join('')+'</div></label></div>'
      + '<button type="button" class="wc-go" data-radd="1">'+T('Adicionar treino','Add session')+'</button>';
  }
  rpeBox.addEventListener('click', e => {
    const b = e.target.closest('button'); if(!b) return;
    if(b.dataset.r){ rpeSel = +b.dataset.r; rpeBox.querySelectorAll('[data-r]').forEach(x=>x.classList.toggle('on', x===b)); rpeBox.querySelector('[data-rw]').textContent = rpeSel+' '+RPEW(rpeSel); return; }
    if(b.dataset.rx!=null){ (RPE[rpeDate]||[]).splice(+b.dataset.rx,1); if(RPE[rpeDate] && !RPE[rpeDate].length) delete RPE[rpeDate]; sv('el_rpe', RPE); renderRpe(); renderAll(); return; }
    if(b.dataset.radd){ const m = Math.round(num(rpeBox.querySelector('[data-rm]').value)); const inp = rpeBox.querySelector('[data-rm]');
      if(!(m>0 && m<=300)){ inp.focus(); inp.style.borderColor = '#D7263D'; return; }
      (RPE[rpeDate] = RPE[rpeDate] || []).push({t:rpeBox.querySelector('[data-rt]').value, min:m, rpe:rpeSel}); sv('el_rpe', RPE); renderRpe(); renderAll(); }
  });
  rpeBox.addEventListener('change', e => { if(e.target.matches('[data-rd]') && e.target.value){ rpeDate = e.target.value > today ? today : e.target.value; renderRpe(); } });

  // ---------- página Plano ----------
  const pP = document.createElement('div'); pP.className = 'pg'; pP.id = 'pg-plano';
  (document.getElementById('pg-rivais') || document.getElementById('pg-hoje')).after(pP);
  const sec = (id, title, sum, body) => '<section class="wc-card" data-sec="'+id+'" data-elk="'+esc(title)+'" data-sum="'+esc(String(sum).replace(/<[^>]*>/g,''))+'"><h2>'+title+'</h2>'+body+'</section>';
  function renderP(){
    const P = phases(), {c} = curPh(), f = focus(), sk = sortD(SK.slice()), mr = sortD(MR.slice()), fb = sortD(FB.slice()), ex = EX.slice().sort((a,b)=>a.from<b.from?-1:1);
    const sel = ld('wc_sel', null);
    const skTxt = s => T('Passes ','Passes ')+s.pl+'/10 '+T('esq.','L')+' · '+s.pr+'/10 '+T('dir.','R')+' · '+T('box kick ','box kick ')+f1(s.hang)+' s';
    pP.innerHTML = '<header class="ph"><button type="button" class="ph-bk" data-back="1">‹ '+T('Mundial','World Cup')+'</button><small class="ph-k">'+T('Mundial 2027','World Cup 2027')+'</small><h1>'+T('Plano','Plan')+'</h1><div class="ph-s">'+T('Fase atual: ','Current phase: ')+c.n+'</div></header>'
      + sec('ph', T('Fases até ao Mundial','Phases to the World Cup'), c.n,
          '<div class="el-ph">'+P.map(p=>'<div class="'+(p.i===c.i?'on':'')+'"><small>'+dS(p.d)+'</small><span><b>'+p.n+'</b>'+p.w+'</span></div>').join('')+'</div>'
          + '<div class="sub" style="margin-top:8px">'+T('Datas aproximadas: muda-as quando sair o calendário oficial.','Approximate dates: change them when the official calendar is out.')+'</div>'
          + '<div class="el-f">'+P.slice(1,5).map(p=>'<label>'+p.n+'<input type="date" data-phd="'+p.i+'" value="'+p.d+'"></label>').join('')
          + '<label class="w">'+T('Anúncio dos 33','Squad of 33 named')+'<input type="date" data-sel value="'+esc(sel||'')+'"></label></div>')
      + sec('fb', T('Feedback do treinador','Coach feedback'), f ? esc(f.focus||f.txt).slice(0,40) : T('nenhum ainda','none yet'),
          '<div class="sub">'+T('O que o treinador diz que te falta. O mais recente é o teu foco da semana.','What the coach says you lack. The latest is your focus for the week.')+'</div>'
          + '<div class="el-f"><label>'+T('Data','Date')+'<input type="date" data-fd value="'+today+'" max="'+today+'"></label><label>'+T('Quem','Who')+'<input data-fw maxlength="40" placeholder="'+T('treinador','coach')+'"></label>'
          + '<label class="w">'+T('O que disse','What they said')+'<textarea rows="2" data-ft maxlength="300"></textarea></label><label class="w">'+T('O que vou treinar','What I will train')+'<input data-ff maxlength="120"></label></div>'
          + '<button type="button" class="wc-go" data-fadd="1">'+T('Guardar','Save')+'</button>'
          + (fb.length ? '<div style="margin-top:10px">'+fb.map(x=>'<div class="el-li"><span><small>'+dS(x.d)+(x.who?' · '+esc(x.who):'')+'</small><br>'+esc(x.txt)+(x.focus?'<br><b>→ '+esc(x.focus)+'</b>':'')+'</span><button type="button" class="el-x" data-del-fb="'+FB.indexOf(x)+'" aria-label="'+T('Apagar','Delete')+'">×</button></div>').join('')+'</div>' : ''))
      + sec('sk', T('Teste de skills','Skill test'), sk[0] ? dS(sk[0].d) : T('por fazer','not done'),
          '<div class="sub">'+T('Uma vez por semana, cansado no fim do treino: 10 passes de cada lado para um alvo a 10 m, e 5 box kicks com o cronómetro do telemóvel (do pé à receção).','Once a week, tired at the end of training: 10 passes each side to a target 10 m away, and 5 box kicks timed on your phone (boot to catch).')+'</div>'
          + '<div class="el-f"><label>'+T('Acertos esquerda (0–10)','Hits left (0–10)')+'<input inputmode="numeric" data-sl></label><label>'+T('Acertos direita (0–10)','Hits right (0–10)')+'<input inputmode="numeric" data-sr></label>'
          + '<label class="w">'+T('Tempo de voo médio do box kick (s)','Average box kick hang time (s)')+'<input inputmode="decimal" data-sh placeholder="4,5"></label></div>'
          + '<button type="button" class="wc-go" data-skadd="1">'+T('Guardar teste','Save test')+'</button>'
          + (sk.length ? '<div style="margin-top:10px">'+(sk.length>1?'<div class="sub">'+T('Desde o primeiro teste: ','Since the first test: ')+T('passes ','passes ')+((sk[0].pl+sk[0].pr)-(sk[sk.length-1].pl+sk[sk.length-1].pr)>=0?'+':'')+((sk[0].pl+sk[0].pr)-(sk[sk.length-1].pl+sk[sk.length-1].pr))+' · '+T('tempo de voo ','hang time ')+(sk[0].hang-sk[sk.length-1].hang>=0?'+':'')+f1(sk[0].hang-sk[sk.length-1].hang)+' s</div>':'')
              + sk.map(x=>'<div class="el-li"><span><small>'+dS(x.d)+'</small><br>'+skTxt(x)+'</span><button type="button" class="el-x" data-del-sk="'+SK.indexOf(x)+'" aria-label="'+T('Apagar','Delete')+'">×</button></div>').join('')+'</div>' : ''))
      + sec('mr', T('Revisão de jogos','Match reviews'), mr[0] ? dS(mr[0].d)+' · '+mr[0].rate+'/10' : T('nenhuma ainda','none yet'),
          '<div class="sub">'+T('Depois de cada jogo, a frio no dia seguinte.','After every match, calmly the next day.')+'</div>'
          + '<div class="el-f"><label>'+T('Data','Date')+'<input type="date" data-md value="'+(lastGame()||today)+'" max="'+today+'"></label><label>'+T('Adversário','Opponent')+'<input data-mo maxlength="40"></label>'
          + '<label>'+T('Minutos','Minutes')+'<input inputmode="numeric" data-mm></label><label>'+T('Nota (1–10)','Rating (1–10)')+'<input inputmode="numeric" data-mn></label>'
          + '<label class="w">'+T('O que correu bem','What went well')+'<textarea rows="2" data-mg maxlength="300"></textarea></label><label class="w">'+T('O que melhorar','What to improve')+'<textarea rows="2" data-mf maxlength="300"></textarea></label>'
          + '<label class="w">'+T('Link do vídeo (opcional)','Video link (optional)')+'<input type="url" data-mc maxlength="300" placeholder="https://"></label></div>'
          + '<button type="button" class="wc-go" data-madd="1">'+T('Guardar revisão','Save review')+'</button>'
          + (mr.length ? '<div style="margin-top:10px">'+mr.map(x=>'<div class="el-li"><span><small>'+dS(x.d)+(x.opp?' · '+esc(x.opp):'')+(x.min?' · '+x.min+' min':'')+'</small><br><b>'+x.rate+'/10</b>'+(x.good?' · + '+esc(x.good):'')+(x.fix?'<br>→ '+esc(x.fix):'')+(x.clip && /^https?:\/\//.test(x.clip)?'<br><a href="'+esc(x.clip)+'" target="_blank" rel="noopener">'+T('Ver vídeo','Watch clip')+'</a>':'')+'</span><button type="button" class="el-x" data-del-mr="'+MR.indexOf(x)+'" aria-label="'+T('Apagar','Delete')+'">×</button></div>').join('')+'</div>' : ''))
      + sec('ex', T('Semanas de exames','Exam weeks'), exam() ? T('agora','now') : (ex.find(e=>e.from>today) ? dS(ex.find(e=>e.from>today).from) : T('nenhuma','none')),
          '<div class="sub">'+T('Marca as semanas de exames: a app avisa para não somares volume nesses dias.','Mark exam weeks: the app will remind you not to add volume on those days.')+'</div>'
          + '<div class="el-f"><label>'+T('De','From')+'<input type="date" data-ef></label><label>'+T('Até','To')+'<input type="date" data-et></label></div>'
          + '<button type="button" class="wc-go" data-eadd="1">'+T('Adicionar','Add')+'</button>'
          + (ex.length ? '<div style="margin-top:10px">'+ex.map(x=>'<div class="el-li"><span>'+dS(x.from)+' – '+dS(x.to)+'</span><button type="button" class="el-x" data-del-ex="'+EX.indexOf(x)+'" aria-label="'+T('Apagar','Delete')+'">×</button></div>').join('')+'</div>' : ''));
  }
  const q = s => (cur && cur.page===pP ? pgC : pP).querySelector(s), val = s => (q(s)||{}).value || '';
  const bad = s => { const e = q(s); if(e){ e.style.borderColor = '#D7263D'; e.focus(); } };
    const pClick = e => {
    const b = e.target.closest('button'); if(!b) return;
    if(b.dataset.back){ history.length > 1 ? history.back() : showTab('mundial'); return; }
    const del = Object.keys(b.dataset).find(k => k.startsWith('del'));
    if(del){ const L = {delFb:[FB,'el_fb'], delSk:[SK,'el_sk'], delMr:[MR,'el_mr'], delEx:[EX,'el_ex']}[del]; if(L){ L[0].splice(+b.dataset[del],1); sv(L[1], L[0]); renderP(); renderAll(); } return; }
    if(b.dataset.fadd){ const t = val('[data-ft]').trim(); if(!t) return bad('[data-ft]'); FB.push({d:val('[data-fd]')||today, who:val('[data-fw]').trim(), txt:t, focus:val('[data-ff]').trim()}); sv('el_fb', FB); renderP(); renderAll(); return; }
    if(b.dataset.skadd){ const l = Math.round(num(val('[data-sl]'))), r = Math.round(num(val('[data-sr]'))), h = num(val('[data-sh]'));
      if(!(l>=0 && l<=10)) return bad('[data-sl]'); if(!(r>=0 && r<=10)) return bad('[data-sr]'); if(!(h>0 && h<10)) return bad('[data-sh]');
      SK.push({d:today, pl:l, pr:r, hang:h}); sv('el_sk', SK); renderP(); renderAll(); return; }
    if(b.dataset.madd){ const n = Math.round(num(val('[data-mn]'))); if(!(n>=1 && n<=10)) return bad('[data-mn]');
      const m = Math.round(num(val('[data-mm]'))); MR.push({d:val('[data-md]')||today, opp:val('[data-mo]').trim(), min:m>0?m:null, rate:n, good:val('[data-mg]').trim(), fix:val('[data-mf]').trim(), clip:val('[data-mc]').trim()}); sv('el_mr', MR); renderP(); renderAll(); return; }
    if(b.dataset.eadd){ const f = val('[data-ef]'), t = val('[data-et]'); if(!f) return bad('[data-ef]'); if(!t || t < f) return bad('[data-et]'); EX.push({from:f, to:t}); sv('el_ex', EX); renderP(); renderAll(); return; }
  };
  const pChange = e => {
    const t = e.target;
    if(t.dataset.phd!=null && t.value){ const o = ld('el_ph', {}); o[t.dataset.phd] = t.value; sv('el_ph', o); renderP(); renderAll(); }
    if(t.matches('[data-sel]')){ sv('wc_sel', t.value || null); }
  };
  pP.addEventListener('click', pClick); pP.addEventListener('change', pChange);
  function openPlan(sec){ renderP(); showTab('plano'); if(sec) setTimeout(() => { const d = pP.querySelector('[data-sec="'+sec+'"]'); if(d) openSec(d, pP); }, 320); }
  window.OPENPLAN = openPlan;

  // ---------- encaixar nas páginas existentes (e voltar a encaixar quando elas se redesenham) ----------
  const pM = document.getElementById('pg-mundial'), pH = document.getElementById('pg-hoje'), shC = document.querySelector('.wc-sh-c');
  function place(){
    if(pM){ const hero = pM.querySelector('.wc-hero'), day = pM.querySelector(':scope > .wc-card:not(.el-ck):not(.el-nxc)');
      if(hero && hero.nextElementSibling!==ckBox) hero.after(ckBox);
      if(day && day.nextElementSibling!==nxBox) day.after(nxBox);
      // Mundial simples: contagem, check-in, pontos de hoje, próximo passo. O resto está em Rivais, Carga e Plano.
      const cg = [...pM.querySelectorAll(':scope > .wc-card')].find(c => c.querySelector('[data-go="hoje"]')); if(cg) cg.remove(); }
    if(pH){ const lk = pH.querySelector('.wc-links'); if(lk && lk.nextElementSibling!==cgBox) lk.after(cgBox); }
    if(shC){ const nav = shC.querySelector('.wc-dnav'); if(nav && nav.nextElementSibling!==rpeBox) nav.after(rpeBox);
      shC.querySelectorAll('.wc-item:not([data-el])').forEach(it => { it.dataset.el = '1'; it.classList.add('cl'); }); }
  }
  // na folha: cada bloco abre ao tocar no título (fica mais curta)
  if(shC) shC.addEventListener('click', e => { const h = e.target.closest('.wc-item h3'); if(h) h.parentElement.classList.toggle('cl'); });
  let busy = false;
  const obs = new MutationObserver(() => { if(busy) return; busy = true; place(); busy = false; });
  [pM, pH, shC].forEach(p => { if(p) obs.observe(p, {childList:true}); });
  // ---------- páginas escondidas: secções longas viram botões que abrem uma página por cima ----------
  const PG = document.createElement('div'); PG.className = 'el-pg'; PG.hidden = true; PG.setAttribute('role','dialog'); PG.setAttribute('aria-modal','true');
  PG.innerHTML = '<div class="el-pg-h"><button type="button" class="el-pg-b">‹ '+T('Voltar','Back')+'</button><b></b></div><div class="el-pg-c"></div>';
  document.body.appendChild(PG);
  const pgC = PG.querySelector('.el-pg-c'), pgT = PG.querySelector('.el-pg-h b');
  let cur = null;
  const reduceM = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  function openSec(node, page){
    if(cur) closeSec();
    const ph = document.createComment('el'); node.before(ph); node.classList.remove('el-hid'); pgC.appendChild(node);
    node.querySelectorAll('details').forEach(d => d.open = true); if(node.tagName==='DETAILS') node.open = true;
    cur = {node, ph, page, key:node.dataset.elk}; pgT.textContent = node.dataset.elk; PG.hidden = false; document.body.style.overflow = 'hidden'; pgC.scrollTop = 0;
    try{ history.pushState({n:(history.state||{}).n, g:1, elp:1}, ''); }catch(e){}
    if(!reduceM()) PG.animate([{transform:'translateX(100%)'},{transform:'none'}], {duration:280, easing:'cubic-bezier(.2,.8,.2,1)'});
    setTimeout(() => dispatchEvent(new Event('resize')), 300);
  }
  function closeSec(){
    if(!cur) return; const {node, ph} = cur; cur = null;
    if(ph.isConnected){ node.classList.add('el-hid'); ph.replaceWith(node); } else node.remove();
    PG.hidden = true; document.body.style.overflow = '';
  }
  const pgBack = () => { if(history.state && history.state.elp) history.back(); else closeSec(); };
  addEventListener('popstate', () => { if(cur) closeSec(); });
  PG.querySelector('.el-pg-b').addEventListener('click', pgBack);
  pgC.addEventListener('click', e => { if(cur && cur.page===pP) pClick(e); }); pgC.addEventListener('change', e => { if(cur && cur.page===pP) pChange(e); });
  addEventListener('keydown', e => { if(e.key==='Escape' && cur) pgBack(); });
  // deslizar para a direita fecha (no iPhone a app instalada não tem gesto de voltar)
  let sx = null, sy = 0;
  PG.addEventListener('touchstart', e => { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, {passive:true});
  PG.addEventListener('touchend', e => { if(sx==null) return; const t = e.changedTouches[0], dx = t.clientX - sx, dy = Math.abs(t.clientY - sy); sx = null; if(dx > 90 && dy < 50) pgBack(); }, {passive:true});
  const TITLES = {'s-comp':T('Como me comparo','How I compare'), 's-speed':T('Velocidade','Speed'), 's-sessao':T('Sessões em detalhe','Sessions in detail'), 's-carga':T('Carga e recuperação','Load and recovery'), 's-jogos':T('Jogos','Matches')};
  const titleOf = k => TITLES[k.id] || ((k.querySelector('h2,h3,summary > span,summary')||{}).textContent||T('Mais','More')).trim().slice(0,40);
  const DR = [];
  function drawer(page, keep){ if(!page) return; DR.push([page, keep]); new MutationObserver(() => draw(page, keep)).observe(page, {childList:true}); draw(page, keep); }
  function draw(page, keep){
    let menu = page.querySelector(':scope > .el-menu');
    [...page.children].forEach(k => { if(k===menu || k.matches('header,footer,style,script') || keep(k)) return; if(!k.dataset.elk) k.dataset.elk = titleOf(k); k.classList.add('el-hid'); });
    const items = [...page.children].filter(k => k.classList.contains('el-hid'));
    if(!items.length){ if(menu) menu.remove(); }
    else {
      if(!menu){ menu = document.createElement('nav'); menu.className = 'el-menu'; menu.addEventListener('click', e => { const b = e.target.closest('button'); if(b && menu._it[+b.dataset.i]) openSec(menu._it[+b.dataset.i], page); }); }
      const html = items.map((k,i) => '<button type="button" data-i="'+i+'"><span><b>'+esc(k.dataset.elk)+'</b>'+(k.dataset.sum?'<small>'+esc(k.dataset.sum)+'</small>':'')+'</span><i aria-hidden="true">›</i></button>').join('');
      if(menu._h!==html){ menu.innerHTML = html; menu._h = html; } menu._it = items;
      const kept = [...page.children].filter(k => k!==menu && !k.classList.contains('el-hid')), last = kept[kept.length-1];
      if(last){ if(last.nextElementSibling!==menu) last.after(menu); } else if(page.firstElementChild!==menu) page.prepend(menu);
    }
    // a página redesenhou-se com a secção aberta: troca pela versão nova
    if(cur && cur.page===page && !cur.ph.isConnected){ const nn = items.find(k => k.dataset.elk===cur.key);
      if(nn){ const ph = document.createComment('el'); nn.before(ph); nn.classList.remove('el-hid'); cur.node.replaceWith(nn); cur.node = nn; cur.ph = ph; } }
  }
  const byId = id => document.getElementById('pg-'+id);
  function setupDrawers(){
    drawer(byId('mundial'), k => k.matches('.wc-hero,.el-ck,.el-nxc') || k===byId('mundial').querySelector(':scope > .wc-card:not(.el-ck):not(.el-nxc)'));
    drawer(byId('rivais'), k => k===byId('rivais').querySelector(':scope > .wc-card'));
    drawer(byId('hoje'), k => k.matches('.wc-links,.el-cg,#s-resumo'));
    drawer(byId('evol'), k => k.matches('#s-evol'));
    drawer(pP, () => false);
  }

  function renderAll(){ renderCk(); renderNx(); renderCg(); if(pP.classList.contains('on')) renderP(); }
  renderCk(); renderRpe(); renderAll(); renderP(); place();
  if(document.readyState==='loading') addEventListener('DOMContentLoaded', setupDrawers); else setupDrawers();
  document.addEventListener('visibilitychange', () => { if(!document.hidden) renderAll(); });
})();
