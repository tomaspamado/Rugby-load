// ---------- Coach: prehab, recuperação, mental e progresso numa só página ----------
// Sem check-in: o plano do dia vem da tua carga real (jogo, dia pesado, carga vs. habitual).
// Guarda só no teu telemóvel (localStorage 'coach_log' e 'coach_plank').
(function(){
  const pg = document.getElementById('pg-coach'); if(!pg) return;
  const EN = document.documentElement.lang === 'en', T = (pt,en) => EN ? en : pt;
  const reduce = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  const esc = s => String(s==null?'':s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const iso = d => d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
  const parse = s => new Date(s+'T00:00:00');
  const DAYMS = 864e5;
  const fmt = s => parse(s).toLocaleDateString(EN?'en-GB':'pt-PT', {day:'numeric', month:'short'}).replace('.','');
  const km = m => (m/1000).toFixed(1).replace('.', EN?'.':',');
  const num1 = v => String(Math.round(v*10)/10).replace('.', EN?'.':',');

  // ---------- conteúdo (PT / EN) ----------
  // [id, nome PT, nome EN, duração, como PT, como EN, difícil?]
  const PRE = [
    ['hip','Flexor da anca','Hip flexor','8 min','Meio-ajoelhado: joelho de trás no chão, empurra a anca para a frente e aperta o glúteo da perna de trás. 90 s cada lado. Os 9 têm os flexores curtos de tanto estar agachados no ruck.','Half-kneeling: back knee down, drive hips forward and squeeze the back-leg glute. 90 s each side. Nines get short hip flexors from crouching at rucks.',0],
    ['nordic','Nordic curl (descida lenta)','Nordic curl (slow lowering)','10 min','De joelhos, alguém segura os tornozelos. Desce o mais devagar possível (5 s ou mais), amortece com as mãos e volta a subir. 3 × 5. Reduz lesões nos isquiotibiais em cerca de metade (Petersen).','Kneel with someone holding your ankles. Lower as slowly as you can (5 s or more), catch with your hands and push back up. 3 × 5. Cuts hamstring injuries by about half (Petersen).',1],
    ['ankle','Estabilidade do tornozelo','Ankle stability','8 min','Em apoio num pé, olhos fechados, 30 s cada lado. Depois 10 saltos pequenos a aterrar em silêncio. Aterragem ruidosa é absorver com o osso, não com o músculo.','Single-leg stand, eyes closed, 30 s each side. Then 10 small hops landing silently. A loud landing means absorbing with bone, not muscle.',0],
    ['cope','Copenhagen plank','Copenhagen plank','8 min','Prancha lateral com a perna de cima num banco e a de baixo solta. 3 × 20 s cada lado. Reduz lesões nos adutores em cerca de 41% (Harøy).','Side plank, top leg on a bench, bottom leg free. 3 × 20 s each side. Cuts adductor injuries by about 41% (Harøy).',1],
    ['dead','Dead bug (lombar)','Dead bug (lower back)','8 min','De costas, braços para cima, joelhos a 90°. Baixa braço e perna opostos mantendo a lombar colada ao chão. 3 × 8 cada lado. Protege a lombar quando rodas e carregas cansado.','On your back, arms up, knees at 90°. Lower opposite arm and leg while keeping your lower back on the floor. 3 × 8 each side. Protects the lower back when rotating and loading tired.',0],
    ['bird','Bird dog (lombar)','Bird dog (lower back)','8 min','De quatro, estende braço e perna opostos, segura 3 s e volta sem tocar no chão. 3 × 10 cada lado. Devagar: a pausa é que constrói estabilidade.','On all fours, extend opposite arm and leg, hold 3 s and return without touching the floor. 3 × 10 each side. Go slow: the pause builds stability.',0],
    ['bridge','Ponte de glúteo, uma perna','Single-leg glute bridge','8 min','De costas, um pé no chão e a outra perna esticada. Empurra a anca pelo calcanhar e segura 2 s no topo. 3 × 12 cada lado. Glúteos fracos obrigam a lombar a compensar.','On your back, one foot down, other leg extended. Drive hips up through the heel and hold 2 s at the top. 3 × 12 each side. Weak glutes make the lower back compensate.',0],
    ['9090','Mobilidade 90/90 da anca','90/90 hip mobility','6 min','Sentado com a perna da frente a 90° e a de trás a 90°. Inclina-te sobre a canela da frente. 2 min cada lado. A rotação interna da anca costuma estar presa em quem vive agachado.','Sit with the front leg at 90° and the back leg at 90°. Lean over the front shin. 2 min each side. Internal hip rotation is usually restricted in players who live crouched.',0],
    ['pallof','Pallof press','Pallof press','6 min','Banda à altura do peito, de lado. Empurra a direito, segura 2 s e volta. 3 × 10 cada lado. Anti-rotação: o que um 9 precisa para absorver contacto e rodar para passar.','Band at chest height, standing side-on. Press straight out, hold 2 s, return. 3 × 10 each side. Anti-rotation: what a nine needs to absorb contact and spin to pass.',0],
    ['hollow','Hollow body','Hollow body hold','6 min','De costas, cola a lombar ao chão, levanta ombros e pernas pouco. Segura 3 × 30 s. Se a lombar arquear, levanta mais as pernas.','On your back, press your lower back down, lift shoulders and legs slightly. Hold 3 × 30 s. If your back arches, raise your legs higher.',0]
  ];
  const REC = [
    ['ice','Banho de gelo','Ice bath','12 min','Imersão a 10–15 °C durante 10–12 min. Reduz dor e inflamação logo a seguir ao jogo. Fica quieto e respira: mexer aumenta a sensação de frio.','Immersion at 10–15 °C for 10–12 min. Reduces soreness and inflammation right after a match. Stay still and breathe: moving makes it feel colder.','same'],
    ['contrast','Banhos de contraste','Contrast baths','20 min','3 min quente (38–42 °C), 1 min frio (10–15 °C), 4 ciclos, a acabar no frio. Sem banheira: duche quente e frio, mesmo tempo.','3 min hot (38–42 °C), 1 min cold (10–15 °C), 4 cycles, finishing cold. No tub: hot and cold shower, same timing.','same,next'],
    ['boots','Botas de compressão','Compression boots','30 min','60–80 mmHg durante 20–30 min, pernas elevadas a 30°. Respira devagar: o sistema nervoso relaxa ao mesmo tempo. Aproveita para fazer visualização.','60–80 mmHg for 20–30 min, legs raised 30°. Breathe slowly: your nervous system relaxes at the same time. Good moment for visualisation.','same,next,high,normal'],
    ['ems','Eletroestimulação (EMS)','Electrostimulation (EMS)','20 min','Modo recuperação (1–10 Hz), intensidade suave: sentes uma contração leve, sem dor. Quadricípites, isquiotibiais ou gémeos. Não cria fadiga nova.','Recovery mode (1–10 Hz), gentle intensity: a light contraction, no pain. Quads, hamstrings or calves. Does not add new fatigue.','same,high,normal'],
    ['sauna','Sauna','Sauna','20 min','70–90 °C durante 15–20 min, 24–48 h depois do jogo, quando a inflamação aguda já passou. Bebe 500 ml antes e sai se te sentires tonto. Acaba com duche fresco antes de dormir.','70–90 °C for 15–20 min, 24–48 h after the match when acute inflammation has settled. Drink 500 ml before and leave if dizzy. Finish with a cool shower before bed.','next,high'],
    ['hot','Banho quente','Hot bath','20 min','38–40 °C durante 15–20 min, com sais de Epsom. Melhora o fluxo de sangue e o sono se o fizeres 90 min antes de deitar. Não é para logo a seguir ao gelo.','38–40 °C for 15–20 min with Epsom salts. Improves blood flow and sleep if taken 90 min before bed. Not right after the ice bath.','next,high,normal'],
    ['massage','Massagem','Massage','60 min','Trabalho profissional de tecidos moles: flexores da anca, isquiotibiais, lombar, antebraços (passe). Cerca de 48 h depois do jogo reduz as dores musculares.','Professional soft-tissue work: hip flexors, hamstrings, lower back, forearms (passing load). About 48 h after a match it reduces soreness.','next,high'],
    ['roller','Foam roller','Foam roller','15 min','Rola devagar (2 s por polegada) em quadricípites, isquiotibiais, banda iliotibial, gémeos e dorsal. Pára 20–30 s nos pontos sensíveis. Rola sempre em direção ao coração.','Roll slowly (2 s per inch) on quads, hamstrings, IT band, calves and upper back. Pause 20–30 s on tender spots. Always roll toward the heart.','next,high,normal'],
    ['gun','Pistola de massagem','Massage gun','10 min','Velocidade média, 90–120 s por grupo muscular. Nunca em articulações, coluna ou ossos. Move devagar sobre o ventre do músculo e respira em ritmo lento.','Medium speed, 90–120 s per muscle group. Never on joints, spine or bone. Move slowly over the muscle belly and breathe slowly.','normal']
  ];
  const P = {vis:['Visualização','Visualisation','🎬'], conf:['Confiança','Confidence','💪'], foc:['Foco','Focus','🎯'], self:['Diálogo interno','Self-talk','🗣️'], rot:['Rotina','Routine','⚡'], adv:['Adversidade','Adversity','🔥'], comp:['Competição','Competition','🏆']};
  // [id, pilar, duração, título PT, título EN, texto PT, texto EN]
  const MEN = [
    ['ruck','vis','5 min','Sequência completa de ruck','Full ruck sequence','Fecha os olhos. Chegas a um ruck a 10 m. Vês a linha defensiva e contas os defensores. A bola sai: olhas esquerda, olhas direita, fazes a chamada e executas em menos de 0,5 s. Repete 10 vezes, a sentir a bola nas mãos.','Close your eyes. You arrive at a ruck 10 m out. See the defensive line and count them. The ball is out: scan left, scan right, make the call and execute in under 0.5 s. Run it 10 times, feeling the ball in your hands.'],
    ['pressure','vis','5 min','Momento de pressão, outra vez','Pressure moment, replayed','Escolhe um momento de pressão do último jogo e repete-o na cabeça. Desta vez chegas cedo, comunicas claro e executas limpo. 5 repetições, até a versão boa parecer mais real do que a que aconteceu.','Pick one pressure moment from your last game and replay it. This time you arrive early, communicate clearly and execute cleanly. 5 reps, until the good version feels more real than what happened.'],
    ['box','vis','4 min','Box kick perfeito, 10 repetições','Perfect box kick, 10 reps','Chegas ao ruck com a pressão a subir. Sentes a bola nas mãos, os pés a assentar e o arco do pontapé a passar a defesa e a cair dentro dos 22. Mesma técnica sempre. 10 repetições.','You reach the ruck with the rush coming. Feel the ball, your feet setting, the kick arcing over the defence and landing inside the 22. Same technique every time. 10 reps.'],
    ['proof','conf','5 min','Registo de provas','Evidence log','Escreve 5 momentos concretos dos últimos 30 dias em que jogaste bem sob pressão: quando, onde, o que fizeste. A confiança constrói-se com provas. Lê-as devagar.','Write 5 specific moments from the last 30 days when you played well under pressure: when, where, what you did. Confidence is built on proof. Read them back slowly.'],
    ['identity','conf','4 min','Frase de identidade','Identity statement','Diz em voz alta, 3 vezes, devagar: "Sou um 9 calmo e decidido. Leio o jogo depressa. Confio na minha primeira decisão." Acrescenta uma força que um treinador já te reconheceu.','Say out loud, 3 times, slowly: "I am a composed, decisive nine. I read the game fast. I back my first decision." Add one strength a coach has acknowledged.'],
    ['controls','foc','5 min','Três controláveis de hoje','Three controllables for today','Escreve três coisas que dependem 100% de ti hoje. Comportamentos, não resultados: "ver os dois lados antes de cada recolha", "chamar a jogada antes de a bola sair". Confirma-as ao intervalo.','Write three things that are 100% in your control today. Behaviours, not outcomes: "scan both sides before every pick-up", "call the play before the ball is out". Check them at half-time.'],
    ['reset','foc','4 min','Reset de atenção, 90 segundos','90-second attention reset','Cronómetro a 90 s. Respira devagar e foca só na sensação da expiração. Quando a mente fugir, nota e volta. É a mesma capacidade de que precisas para recomeçar depois de um erro.','Timer on 90 s. Breathe slowly and focus only on the feeling of the exhale. When your mind drifts, notice it and return. It is the same skill you need to reset after a mistake.'],
    ['cue','foc','4 min','Palavra-chave de hoje','Cue word for today','Escolhe uma palavra para o teu melhor jogo: afiado, decidido, calmo, incansável. Escreve-a no pulso. Sempre que sentires pressão, diz essa palavra por dentro. Uma palavra, uma respiração, depois ação.','Pick one word for how you want to compete: sharp, decisive, composed, relentless. Write it on your wrist. When pressure hits, say it internally. One word, one breath, then act.'],
    ['critic','self','5 min','Reformula o crítico interno','Reframe your inner critic','Escreve a coisa mais dura que dizes a ti próprio depois de um erro. Reescreve-a como um treinador que acredita em ti: honesto, mas a olhar em frente. "Foi lento" passa a "vê mais cedo, confia na primeira leitura".','Write the harshest thing you say to yourself after a mistake. Rewrite it as a coach who believes in you would: honest, forward-looking. "That was slow" becomes "scan earlier, trust the first read".'],
    ['script','self','4 min','Guião do ruck','Ruck script','Escreve uma frase de 10 palavras para cada ruck: "Bola fora, vê, decide, vai." Decora e usa em todos os rucks do treino. À 20.ª repetição já é automático.','Write a 10-word script for every ruck: "Ball\'s out, scan, decide, go." Memorise it and use it at every ruck in training. By rep 20 it is automatic.'],
    ['error','self','5 min','Protocolo pós-erro','Error response protocol','Define a tua rotina depois de um erro: um gesto (uma palma), uma frase ("próxima jogada") e uma respiração. Treina 5 vezes agora. Um protocolo fixo impede a espiral. Os melhores 9 recuperam em menos de 3 segundos.','Design your post-mistake routine: one gesture (a clap), one phrase ("next play") and one breath. Practise it 5 times now. A fixed protocol stops the spiral. The best nines recover in under 3 seconds.'],
    ['breath','rot','4 min','Respiração 4-7-8','4-7-8 breathing','4 ciclos: inspira 4, segura 7, expira 8. Depois 10 expirações curtas e fortes pelo nariz. Ativa o parassimpático e afia a atenção em cerca de 90 segundos. Repete antes do treino.','4 cycles: inhale 4, hold 7, exhale 8. Then 10 sharp exhales through the nose. Activates the parasympathetic system and sharpens attention within about 90 seconds. Repeat before training.'],
    ['intent','rot','4 min','Define a intenção','Set your intention','Escreve uma frase com a forma como queres competir hoje. Não é um objetivo, é uma intenção: "Hoje treino como o jogador em que me estou a tornar." Lê em voz alta antes de sair de casa.','Write one sentence on how you intend to compete today. Not a goal, an intention: "Today I train like the player I am becoming." Read it out loud before you leave.'],
    ['debrief','adv','4 min','Debrief de erro em 3 perguntas','3-question error debrief','Pensa no último erro num jogo. O que aconteceu exatamente? O que me diz tecnicamente? O que faço diferente? Sem emoção nem castigo, só análise.','Think of the last mistake in a game. What exactly happened? What does it tell me technically? What will I do differently? No emotion, no punishment, just analysis.'],
    ['inoculate','adv','5 min','Vacina contra a pressão','Pressure inoculation','Imagina o pior cenário realista do próximo jogo e vê-o acontecer. Agora vê-te a responder: uma respiração, palma, comunicas, foco na jogada seguinte. 5 vezes, até a calma parecer natural.','Imagine the worst realistic scenario in your next match and watch it happen. Now see yourself respond: one breath, clap, communicate, focus on the next play. 5 times, until the calm feels natural.'],
    ['standards','comp','5 min','Os teus padrões de excelência','Your standards of excellence','Escreve o que é "excelente" em três áreas concretas: "90% de precisão na bola de ruck", "chamar cada alinhamento 5 s antes". Avalia a última sessão. Essa diferença é o alvo de hoje.','Write what "excellent" looks like in three specific areas: "90% accuracy at ruck ball", "call every lineout 5 s early". Score your last session. That gap is today\'s target.']
  ];
  const WHY = {
    prehab:[ 'Cobres cerca de 7 km por jogo agachado ao nível do ruck. Dois exercícios por sessão: um que roda e a prancha. Faz 2–3 vezes por semana.', 'You cover about 7 km a match crouched at ruck level. Two exercises a session: one that rotates, plus the plank. Do it 2–3 times a week.' ],
    recovery:[ 'O corpo adapta-se no descanso, não na carga. Um método de cada vez, escolhido pelo tipo de dia.', 'Your body adapts during rest, not load. One method at a time, chosen by the type of day.' ],
    mental:[ 'O cérebro treina com o que imagina como treina com o que faz. Uma tarefa curta por dia, escolhida pelo tipo de dia.', 'The brain trains on what it vividly imagines almost like what it does. One short task a day, chosen by the type of day.' ]
  };
  const TARGET = {p:3, r:2, m:5};

  // ---------- estado ----------
  const load = (k, d) => { try{ const v = JSON.parse(localStorage.getItem(k)); return v==null ? d : v; }catch(e){ return d; } };
  const save = (k, v) => { try{ localStorage.setItem(k, JSON.stringify(v)); }catch(e){} };
  let LOG = load('coach_log', {}), PLANK = load('coach_plank', {sec:45});
  const commit = () => { save('coach_log', LOG); save('coach_plank', PLANK); };
  let tab = 'prehab', ctxOverride = null, todayOverride = null;
  const todayKey = () => todayOverride || iso(new Date());
  const day = k => (LOG[k] = LOG[k] || {p:{done:[], swap:0}, r:{done:false, swap:0}, m:{done:false, swap:0, rating:0, note:''}});

  // ---------- contexto vindo da carga real ----------
  function context(){
    const t = todayKey(), s = last;
    const dd = Math.max(0, Math.round((parse(t) - parse(s.date)) / DAYMS));
    const hard = s.type==='Match' || s.rd > HEAVY;
    const m7 = meanRd(7, s), m28 = meanRd(28, s), ratio = m28 ? m7/m28 : null;
    let k = 'normal';
    if(hard && dd<=0) k = 'same'; else if(hard && dd===1) k = 'next'; else if(ratio!=null && ratio>1.3) k = 'high';
    if(ctxOverride) k = ctxOverride;
    const lastTxt = fmt(s.date)+' · '+(s.rd||0).toLocaleString(EN?'en-GB':'pt-PT')+' m'+(s.type==='Match'?T(' (jogo)',' (match)'):'');
    return {k, dd, ratio, lastTxt};
  }
  const CTX = {
    same:  {t:['Dia de jogo ou pesado: protege e recupera','Match or heavy day: protect and recover'], s:['Prehab leve (sem exercícios excêntricos duros), recuperação completa e mental curto.','Light prehab (no hard eccentric work), full recovery and short mental work.'], c:'#D9981A'},
    next:  {t:['Dia seguinte: recuperação ativa','Day after: active recovery'], s:['Calor, massagem e mobilidade. Prehab leve e mental para processar o jogo.','Heat, massage and mobility. Light prehab and mental work to process the game.'], c:'#8FB4E8'},
    high:  {t:['Carga alta: dá prioridade à recuperação','High load: prioritise recovery'], s:['A tua semana vai acima do habitual. Prehab leve, recuperação a sério e sono.','Your week is above usual. Light prehab, proper recovery and sleep.'], c:'#F2B84B'},
    normal:{t:['Dia normal: trabalho completo de prevenção','Normal day: full prevention work'], s:['Carga dentro do habitual: é o dia certo para prehab a sério (nordic e copenhagen incluídos).','Load within usual: the right day for proper prehab (nordics and Copenhagens included).'], c:'#5CC48A'}
  };

  // ---------- escolha do dia (o que foi feito há mais tempo, sem repetir) ----------
  function lastDone(kind, ids, t){
    const m = {}; ids.forEach(i => m[i] = -1e9);
    Object.keys(LOG).forEach(k => { if(k>=t) return; const d = LOG[k]; if(!d) return;
      const list = kind==='p' ? (d.p && d.p.done || []) : kind==='r' ? (d.r && d.r.done && d.r.id ? [d.r.id] : []) : (d.m && d.m.done && d.m.id ? [d.m.id] : []);
      list.forEach(i => { if(i in m) m[i] = Math.max(m[i], parse(k).getTime()/DAYMS); }); });
    return m;
  }
  const doy = t => Math.floor((parse(t) - new Date(parse(t).getFullYear(),0,0)) / DAYMS);
  function ranked(kind, pool, t){
    const m = lastDone(kind, pool.map(x=>x[0]), t), off = doy(t);
    return pool.map((x,i) => ({x, i})).sort((a,b) => (m[a.x[0]]-m[b.x[0]]) || (((a.i+off)%pool.length)-((b.i+off)%pool.length))).map(o => o.x);
  }
  function plan(ctx){
    const t = todayKey(), d = day(t), k = ctx.k, easy = k!=='normal';
    const prePool = PRE.filter(x => !(easy && x[6]));
    const preList = ranked('p', prePool, t);
    const pre = preList[d.p.swap % preList.length];
    const recPool = REC.filter(x => x[6].split(',').includes(k));
    const recList = ranked('r', recPool, t);
    const rec = recList[d.r.swap % recList.length];
    const pil = {same:['rot','foc'], next:['adv','self'], high:['foc','rot'], normal:Object.keys(P)}[k];
    const menPool = MEN.filter(x => pil.includes(x[1]));
    const menList = ranked('m', menPool, t);
    const men = menList[d.m.swap % menList.length];
    d.p.id = pre[0]; d.r.id = rec[0]; d.m.id = men[0];
    return {pre, rec, men, d, t};
  }

  // ---------- estatísticas ----------
  const mondayOf = s => { const d = parse(s), w = (d.getDay()+6)%7; d.setDate(d.getDate()-w); return iso(d); };
  const addDays = (s,n) => { const d = parse(s); d.setDate(d.getDate()+n); return iso(d); };
  const preDone = d => !!(d && d.p && d.p.done && d.p.id && d.p.done.includes(d.p.id) && d.p.done.includes('plank'));
  const dayAny = d => !!(d && (preDone(d) || (d.r && d.r.done) || (d.m && d.m.done)));
  function weekStats(mon){
    let p=0, r=0, m=0;
    for(let i=0;i<7;i++){ const d = LOG[addDays(mon,i)]; if(!d) continue; if(preDone(d)) p++; if(d.r && d.r.done) r++; if(d.m && d.m.done) m++; }
    let rd=0; SESSIONS.forEach(s => { if(s.date>=mon && s.date<=addDays(mon,6)) rd += s.rd||0; });
    return {p, r, m, rd};
  }
  function streak(){
    let n = 0, t = todayKey(); if(!dayAny(LOG[t])) t = addDays(t,-1);
    while(dayAny(LOG[t])){ n++; t = addDays(t,-1); }
    return n;
  }

  // ---------- CSS ----------
  const css = document.createElement('style');
  css.textContent = ''
   +'#pg-coach .ch{display:flex;flex-direction:column;gap:14px}'
   +'#pg-coach .cx{background:var(--navy,#0E1A2E);color:#fff;border-radius:16px;padding:16px;display:flex;flex-direction:column;gap:6px}'
   +'#pg-coach .cx small{color:rgba(255,255,255,.7);font-size:12px}#pg-coach .cx .ct{font:700 22px/1.15 "Barlow Condensed",Inter,sans-serif;letter-spacing:.01em}#pg-coach .cx p{margin:0;font-size:14px;line-height:1.4;color:rgba(255,255,255,.88)}'
   +'#pg-coach .cx .cs{display:flex;gap:8px;margin-top:6px;flex-wrap:wrap}#pg-coach .cx .cs span{font-size:12px;font-weight:600;background:rgba(255,255,255,.12);border-radius:99px;padding:4px 10px;display:inline-flex;gap:6px;align-items:center}#pg-coach .cx .cs span.ok{background:#2E7D4A}'
   +'#pg-coach .cseg{display:grid;grid-template-columns:repeat(4,1fr);gap:6px}'
   +'#pg-coach .cseg button{font:600 13px Inter,system-ui,sans-serif;min-height:44px;border:0;border-radius:12px;background:rgba(14,26,46,.07);color:var(--ink,#0E1A2E);cursor:pointer;padding:0 4px;transition:transform .16s cubic-bezier(.34,1.56,.64,1),background .2s}'
   +'#pg-coach .cseg button[aria-pressed=true]{background:#0E1A2E;color:#fff}#pg-coach .cseg button:active,#pg-coach .cb:active,#pg-coach .cchk:active,#pg-coach .crate button:active{transform:scale(.93);transition-duration:.07s}'
   +'#pg-coach .cc{background:var(--surface,#fff);border:1px solid var(--line);border-radius:16px;padding:16px;display:flex;flex-direction:column;gap:12px;box-shadow:var(--shadow)}'
   +'#pg-coach .cc h3{margin:0;font:700 18px "Barlow Condensed",Inter,sans-serif;letter-spacing:.02em;text-transform:uppercase}#pg-coach .cc p.w{margin:0;color:var(--ink-muted);font-size:13px;line-height:1.45}'
   +'#pg-coach .crow{display:grid;grid-template-columns:48px 1fr;gap:10px;align-items:start;padding-top:12px;border-top:1px solid var(--line)}#pg-coach .crow:first-of-type{border-top:0;padding-top:0}'
   +'#pg-coach .cchk{width:48px;height:48px;border-radius:50%;border:2px solid var(--line);background:var(--surface,#fff);color:#fff;display:grid;place-items:center;cursor:pointer;transition:transform .16s cubic-bezier(.34,1.56,.64,1),background .2s,border-color .2s;padding:0}'
   +'#pg-coach .cchk svg{width:24px;height:24px;opacity:0;transform:scale(.4);transition:opacity .15s,transform .25s cubic-bezier(.34,1.56,.64,1)}#pg-coach .cchk[aria-checked=true]{background:#2E7D4A;border-color:#2E7D4A}#pg-coach .cchk[aria-checked=true] svg{opacity:1;transform:none}'
   +'#pg-coach details summary{list-style:none;cursor:pointer;min-height:48px;display:flex;flex-direction:column;justify-content:center}#pg-coach details summary::-webkit-details-marker{display:none}'
   +'#pg-coach summary b{font-size:16px}#pg-coach summary small{color:var(--ink-muted);font-size:12px}#pg-coach details[open] summary small::after{content:" · ▲"}#pg-coach details:not([open]) summary small::after{content:" · ▼"}'
   +'#pg-coach details p{margin:4px 0 0;font-size:14px;line-height:1.5;color:var(--ink)}'
   +'#pg-coach .cb{font:700 15px Inter,system-ui,sans-serif;min-height:52px;border:0;border-radius:14px;background:rgba(14,26,46,.07);color:var(--ink,#0E1A2E);padding:0 20px;cursor:pointer;transition:transform .16s cubic-bezier(.34,1.56,.64,1)}'
   +'#pg-coach .cb.pri{background:#0E1A2E;color:#fff}#pg-coach .cb.ok{background:#2E7D4A;color:#fff}'
   +'#pg-coach .cr2{display:grid;grid-template-columns:1fr 1fr;gap:8px}'
   +'#pg-coach .crate{display:grid;grid-template-columns:repeat(5,1fr);gap:6px}#pg-coach .crate button{min-height:48px;border:0;border-radius:12px;background:rgba(14,26,46,.07);font:700 16px Inter,sans-serif;color:var(--ink,#0E1A2E);cursor:pointer;transition:transform .16s cubic-bezier(.34,1.56,.64,1)}#pg-coach .crate button[aria-pressed=true]{background:#D9981A!important;color:#fff!important;border-color:#D9981A!important}'
   +'#pg-coach textarea{width:100%;box-sizing:border-box;min-height:72px;border:1px solid var(--line);border-radius:12px;padding:10px 12px;font:15px/1.4 Inter,system-ui,sans-serif;color:var(--ink);background:var(--surface,#fff);resize:vertical}'
   +'#pg-coach .cpl{display:flex;align-items:center;justify-content:space-between;gap:10px;background:var(--surface-2,#f4f4f1);border-radius:12px;padding:8px 8px 8px 14px}#pg-coach .cpl b{font:700 24px "Barlow Condensed",sans-serif}#pg-coach .cpl div{display:flex;gap:6px}#pg-coach .cpl button{width:48px;height:48px;border:0;border-radius:12px;background:var(--surface,#fff);font:700 20px Inter,sans-serif;color:var(--ink);cursor:pointer;transition:transform .16s cubic-bezier(.34,1.56,.64,1)}#pg-coach .cpl button:active{transform:scale(.93)}'
   +'#pg-coach .pill{display:inline-flex;align-self:flex-start;font-size:12px;font-weight:700;border-radius:99px;padding:3px 10px;background:rgba(217,152,26,.16);color:#8a5d06}'
   +'#pg-coach .cbar{height:10px;border-radius:99px;background:var(--surface-2,#eee);overflow:hidden}#pg-coach .cbar i{display:block;height:100%;border-radius:99px;background:#2E7D4A;width:0;transition:width .52s cubic-bezier(.34,1.56,.64,1)}'
   +'#pg-coach .cmod{display:grid;grid-template-columns:90px 1fr 44px;gap:10px;align-items:center;font-size:14px}#pg-coach .cmod span:last-child{text-align:right;font-weight:700}'
   +'#pg-coach .cwk{display:grid;grid-template-columns:54px 1fr 54px;gap:10px;align-items:center;font-size:13px;padding:8px 0;border-top:1px solid var(--line)}#pg-coach .cwk:first-of-type{border-top:0}#pg-coach .cwk .dots{display:flex;gap:10px;flex-wrap:wrap}#pg-coach .cwk .dots span{white-space:nowrap}#pg-coach .cwk small{color:var(--ink-muted);text-align:right}'
   +'#pg-coach .cst{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}#pg-coach .cst div{background:var(--surface-2,#f4f4f1);border-radius:12px;padding:12px;display:flex;flex-direction:column}#pg-coach .cst b{font:700 28px "Barlow Condensed",sans-serif;line-height:1}#pg-coach .cst small{color:var(--ink-muted);font-size:12px;margin-top:4px}'
   +'#pg-coach .cnt{border-left:3px solid #D9981A;padding:2px 0 2px 10px;font-size:14px;line-height:1.4}#pg-coach .cnt small{display:block;color:var(--ink-muted);font-size:12px}'
   +'#pg-coach .cpan{animation:ux-rise .26s cubic-bezier(.2,.8,.2,1) backwards;display:flex;flex-direction:column;gap:12px}'
   +'#pg-coach .cchk.pop{animation:ux-pop .4s cubic-bezier(.2,.8,.2,1)}'
   +'.more-link{display:flex;align-items:center;justify-content:space-between;width:100%}';
  document.body.appendChild(css);

  // ---------- componentes ----------
  const CHECK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
  const L = (o,i) => EN ? o[i+1] : o[i];
  function item(kind, id, name, dur, how, done, extra){
    return '<div class="crow"><button type="button" class="cchk" role="checkbox" data-act="tick" data-k="'+kind+'" data-id="'+id+'" aria-checked="'+done+'" aria-label="'+esc(name)+': '+T('feito','done')+'">'+CHECK+'</button>'
      +'<details><summary><b>'+esc(name)+'</b><small>'+dur+(extra?' · '+extra:'')+'</small></summary><p>'+esc(how)+'</p></details></div>';
  }
  const weekWord = n => n+(EN?'':'×');
  function panelPrehab(pl, ctx, ws){
    const {pre, d} = pl, sec = PLANK.sec, plDone = d.p.done.includes('plank'), preD = d.p.done.includes(pre[0]);
    const both = preD && plDone;
    return '<div class="cpan"><div class="cc"><span class="pill">'+T('Esta semana: ','This week: ')+ws.p+T(' de ',' of ')+TARGET.p+'</span><h3>'+T('Prehab de hoje','Today\'s prehab')+'</h3><p class="w">'+L(WHY.prehab,0)+'</p>'
      +item('p', pre[0], T(pre[1],pre[2]), pre[3], T(pre[4],pre[5]), preD, ctx.k==='normal'?'':T('versão leve','light option'))
      +item('p', 'plank', T('Prancha progressiva','Progressive plank'), '4 min', T('3 séries de '+sec+' s, corpo em linha, sem a lombar cair. Quando fizeres as 3 séries bem, sobe 5 s.','3 sets of '+sec+' s, body in a straight line, lower back not sagging. When all 3 sets are clean, add 5 s.'), plDone)
      +'<div class="cpl"><span>'+T('Prancha de hoje','Today\'s plank')+' <b>'+sec+' s</b></span><div><button type="button" data-act="plank" data-v="-5" aria-label="'+T('menos 5 s','minus 5 s')+'">−</button><button type="button" data-act="plank" data-v="5" aria-label="'+T('mais 5 s','plus 5 s')+'">+</button></div></div>'
      +'<div class="cr2"><button type="button" class="cb" data-act="swap" data-k="p">'+T('Trocar exercício','Swap exercise')+'</button><button type="button" class="cb '+(both?'ok':'pri')+'" data-act="all" data-k="p">'+(both?T('Feito ✓','Done ✓'):T('Marcar tudo','Mark all'))+'</button></div></div></div>';
  }
  function panelRecovery(pl, ctx, ws){
    const {rec, d} = pl;
    return '<div class="cpan"><div class="cc"><span class="pill">'+T('Esta semana: ','This week: ')+ws.r+T(' de ',' of ')+TARGET.r+'</span><h3>'+T('Recuperação de hoje','Today\'s recovery')+'</h3><p class="w">'+L(WHY.recovery,0)+'</p>'
      +item('r', rec[0], T(rec[1],rec[2]), rec[3], T(rec[4],rec[5]), d.r.done, '')
      +'<div class="cr2"><button type="button" class="cb" data-act="swap" data-k="r">'+T('Outra opção','Other option')+'</button><button type="button" class="cb '+(d.r.done?'ok':'pri')+'" data-act="all" data-k="r">'+(d.r.done?T('Feito ✓','Done ✓'):T('Marcar feito','Mark done'))+'</button></div>'
      +'<p class="w">'+(ctx.k==='same'||ctx.k==='next'?T('Hidratos de carbono e proteína nas 2 h a seguir, e dorme 8 h ou mais.','Carbs and protein within 2 h, and sleep 8 h or more.'):T('Dormir 8 h ou mais é a parte inegociável da recuperação.','Sleeping 8 h or more is the non-negotiable part of recovery.'))+'</p></div></div>';
  }
  function panelMental(pl, ctx, ws){
    const {men, d} = pl, m = d.m, p = P[men[1]];
    const rate = [1,2,3,4,5].map(n => '<button type="button" data-act="rate" data-v="'+n+'" aria-pressed="'+(m.rating===n)+'" aria-label="'+n+' / 5">'+n+'</button>').join('');
    return '<div class="cpan"><div class="cc"><span class="pill">'+T('Esta semana: ','This week: ')+ws.m+T(' de ',' of ')+TARGET.m+'</span><h3>'+p[2]+' '+T(men[3],men[4])+'</h3><p class="w">'+L(p,0)+' · '+men[2]+'</p>'
      +'<p style="margin:0;font-size:15px;line-height:1.55">'+esc(T(men[5],men[6]))+'</p>'
      +'<div><small class="sub">'+T('Como correu? (opcional)','How did it go? (optional)')+'</small></div><div class="crate">'+rate+'</div>'
      +'<textarea id="cnote" placeholder="'+T('Uma nota para ti, se quiseres…','A note to yourself, if you like…')+'" aria-label="'+T('Nota','Note')+'">'+esc(m.note)+'</textarea>'
      +'<div class="cr2"><button type="button" class="cb" data-act="swap" data-k="m">'+T('Outra tarefa','Other task')+'</button><button type="button" class="cb '+(m.done?'ok':'pri')+'" data-act="all" data-k="m">'+(m.done?T('Feito ✓','Done ✓'):T('Concluir','Complete'))+'</button></div></div></div>';
  }
  function panelProgress(ctx, ws){
    const t = todayKey(), mon = mondayOf(t), s = streak();
    const bar = (lbl, v, tg) => '<div class="cmod"><span>'+lbl+'</span><div class="cbar"><i data-w="'+Math.min(100,Math.round(v/tg*100))+'"></i></div><span>'+v+'/'+tg+'</span></div>';
    let rows = '';
    for(let i=0;i<8;i++){ const m0 = addDays(mon,-7*i), w = weekStats(m0);
      rows += '<div class="cwk"><span>'+fmt(m0)+'</span><div class="dots"><span>🛠️ '+w.p+'</span><span>🔄 '+w.r+'</span><span>🧘 '+w.m+'</span></div><small>'+(w.rd?km(w.rd)+' km':'–')+'</small></div>'; }
    const rated = Object.keys(LOG).filter(k => LOG[k].m && LOG[k].m.done && LOG[k].m.rating && k > addDays(t,-14));
    const avg = rated.length ? rated.reduce((a,k)=>a+LOG[k].m.rating,0)/rated.length : null;
    const notes = Object.keys(LOG).sort().reverse().filter(k => LOG[k].m && LOG[k].m.note && LOG[k].m.note.trim()).slice(0,3)
      .map(k => '<div class="cnt">'+esc(LOG[k].m.note.trim())+'<small>'+fmt(k)+'</small></div>').join('');
    let total = 0; Object.keys(LOG).forEach(k => { const d = LOG[k]; if(preDone(d)) total++; if(d.r&&d.r.done) total++; if(d.m&&d.m.done) total++; });
    return '<div class="cpan"><div class="cst"><div><b>'+s+'</b><small>'+(s===1?T('dia seguido','day in a row'):T('dias seguidos','days in a row'))+'</small></div><div><b>'+total+'</b><small>'+T('sessões feitas','sessions done')+'</small></div><div><b>'+(avg==null?'–':num1(avg))+'</b><small>'+T('mental, média 14 d','mental, 14-day avg')+'</small></div></div>'
      +'<div class="cc"><h3>'+T('Esta semana','This week')+'</h3>'+bar('🛠️ Prehab', ws.p, TARGET.p)+bar('🔄 '+T('Recup.','Recov.'), ws.r, TARGET.r)+bar('🧘 Mental', ws.m, TARGET.m)+'</div>'
      +'<div class="cc"><h3>'+T('8 semanas, com a tua carga','8 weeks, with your load')+'</h3><p class="w">'+T('Para ver se a prevenção acompanha as semanas pesadas.','To check that prevention keeps up with heavy weeks.')+'</p>'+rows+'</div>'
      +(notes?'<div class="cc"><h3>'+T('As tuas notas','Your notes')+'</h3>'+notes+'</div>':'')+'</div>';
  }

  // ---------- render ----------
  function render(){
    const ctx = context(), pl = plan(ctx), ws = weekStats(mondayOf(pl.t)), c = CTX[ctx.k];
    const ok = {p: preDone(pl.d), r: pl.d.r.done, m: pl.d.m.done};
    const chip = (key, lbl) => '<span class="'+(ok[key]?'ok':'')+'">'+(ok[key]?'✓ ':'')+lbl+'</span>';
    const lr = ctx.ratio==null ? '' : ' · '+T('carga vs. habitual ','load vs usual ')+num1(ctx.ratio);
    let html = '<section class="ch"><h2>Coach</h2><div class="sub">'+T('Prehab, recuperação, mental e progresso, ajustados à tua carga.','Prehab, recovery, mental and progress, adjusted to your load.')+'</div>'
      +'<div class="cx" style="border-left:6px solid '+c.c+'"><small>'+T('Última sessão ','Last session ')+esc(ctx.lastTxt)+lr+'</small><div class="ct">'+L(c.t,0)+'</div><p>'+L(c.s,0)+'</p><div class="cs">'+chip('p','Prehab')+chip('r',T('Recuperação','Recovery'))+chip('m','Mental')+'</div></div>'
      +'<div class="cseg" role="group" aria-label="Coach">'+[['prehab','Prehab'],['recovery',T('Recuperação','Recovery')],['mental','Mental'],['progress',T('Progresso','Progress')]].map(a=>'<button type="button" data-tab="'+a[0]+'" aria-pressed="'+(tab===a[0])+'">'+a[1]+'</button>').join('')+'</div>'
      +'<div id="cpanel">'+(tab==='prehab'?panelPrehab(pl,ctx,ws):tab==='recovery'?panelRecovery(pl,ctx,ws):tab==='mental'?panelMental(pl,ctx,ws):panelProgress(ctx,ws))+'</div></section>';
    pg.innerHTML = html;
    requestAnimationFrame(() => requestAnimationFrame(() => pg.querySelectorAll('.cbar i').forEach(i => { i.style.width = i.dataset.w+'%'; })));
    commit();
  }

  // ---------- ações ----------
  pg.addEventListener('click', e => {
    const tb = e.target.closest('[data-tab]'); if(tb){ tab = tb.dataset.tab; render(); return; }
    const b = e.target.closest('[data-act]'); if(!b) return;
    const t = todayKey(), d = day(t), act = b.dataset.act, k = b.dataset.k;
    if(act==='tick'){
      const id = b.dataset.id;
      if(k==='p'){ const i = d.p.done.indexOf(id); if(i<0) d.p.done.push(id); else d.p.done.splice(i,1); }
      else if(k==='r') d.r.done = !d.r.done;
      commit(); render(); const nb = pg.querySelector('.cchk[data-id="'+id+'"]'); if(nb && nb.getAttribute('aria-checked')==='true' && !reduce()) nb.classList.add('pop');
    } else if(act==='all'){
      if(k==='p'){ const need = [d.p.id,'plank']; const all = need.every(x => d.p.done.includes(x)); d.p.done = all ? [] : need.slice(); }
      else if(k==='r') d.r.done = !d.r.done;
      else { d.m.note = (pg.querySelector('#cnote')||{}).value || d.m.note; d.m.done = !d.m.done; }
      commit(); render();
    } else if(act==='swap'){ d[k].swap++; if(k==='m'){ d.m.rating = 0; d.m.done = false; } commit(); render(); }
    else if(act==='plank'){ PLANK.sec = Math.max(20, Math.min(240, PLANK.sec + (+b.dataset.v))); commit(); render(); }
    else if(act==='rate'){ const v = +b.dataset.v; d.m.rating = d.m.rating===v ? 0 : v; d.m.note = (pg.querySelector('#cnote')||{}).value || d.m.note; commit(); render(); }
  });
  pg.addEventListener('input', e => { if(e.target.id==='cnote'){ day(todayKey()).m.note = e.target.value; commit(); } });
  new MutationObserver(() => { if(pg.classList.contains('on')) render(); }).observe(pg, {attributes:true, attributeFilter:['class']});
  // "Corpo" saiu da barra: abre a partir de "Mais" e tem o seu botão de voltar
  const mais = document.getElementById('pg-mais'), corpo = document.getElementById('pg-corpo');
  if(mais){ const bt = document.createElement('button'); bt.type = 'button'; bt.className = 'more-btn more-link'; bt.dataset.go = 'corpo';
    bt.innerHTML = '<span>'+T('Composição corporal','Body composition')+'</span><span aria-hidden="true">›</span>';
    bt.addEventListener('click', () => showTab('corpo')); mais.insertBefore(bt, mais.firstChild); }
  if(corpo){ const bk = document.createElement('button'); bk.type = 'button'; bk.className = 'more-btn'; bk.style.cssText = 'min-height:36px;padding:0 14px;border-radius:12px;font-size:14px;align-self:flex-start;width:auto;margin-bottom:8px';
    bk.textContent = T('‹ Mais','‹ More'); bk.addEventListener('click', () => history.back()); corpo.insertBefore(bk, corpo.firstChild); }
  render();
  window.COACH = {render, setCtx:v => { ctxOverride = v; render(); }, setToday:v => { todayOverride = v; render(); }, reset:() => { LOG = {}; PLANK = {sec:45}; commit(); render(); }, setTab:v => { tab = v; render(); }};
})();
