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
  const P = {own:['O teu','Your own','✍️'], vis:['Visualização','Visualisation','🎬'], conf:['Confiança','Confidence','💪'], foc:['Foco','Focus','🎯'], self:['Diálogo interno','Self-talk','🗣️'], rot:['Rotina','Routine','⚡'], adv:['Adversidade','Adversity','🔥'], comp:['Competição','Competition','🏆']};
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
  // Skills técnicas: [id, nome PT, nome EN, duração, como PT, como EN]
  const SK = {
    box:[
      ['tech','Técnica a parado','Standing technique','10 min','Bola de lado, pé de apoio ao lado da bola, contacto no terço inferior, acompanhamento em direção ao alvo. 3 × 8, sem pressão, só a repetir o movimento certo.','Ball held side-on, plant foot beside the ball, contact on the lower third, follow through toward the target. 3 × 8, no pressure, just grooving the right movement.'],
      ['hang','Altura e tempo de suspensão','Height and hang time','12 min','10 pontapés a apontar a uma zona. Conta o tempo de suspensão: o alvo é 4 s ou mais. Regista o melhor e tenta batê-lo.','10 kicks aiming at a zone. Time the hang: the target is 4 s or more. Note the best one and try to beat it.'],
      ['zone','Alvos por zona','Zone targets','15 min','Três cones dentro dos 22 e junto à linha lateral. 10 pontapés, conta quantos caem na zona. Muda de zona a cada 5.','Three cones inside the 22 and near the touchline. 10 kicks, count how many land in the zone. Change zone every 5.'],
      ['release','Tempo de libertação sob pressão','Release time under pressure','12 min','Bola no chão, recolhe, dois passos e chuta. Alguém cronometra: o pontapé sai em menos de 1,2 s. 8 repetições, com um defesa a avançar se tiveres ajuda.','Ball on the ground, pick up, two steps and kick. Have someone time it: the kick leaves in under 1.2 s. 8 reps, with a defender rushing if you have help.'],
      ['weak','Pé fraco','Weak foot','10 min','3 × 8 com o pé fraco, só técnica e altura. É a opção que os defesas não esperam.','3 × 8 with your weak foot, technique and height only. It is the option defenders do not expect.'],
      ['dropm','Mecânica de largada (box kick curto)','Drop mechanics (short box kick)','10 min','Largada da bola no ponto certo, sempre igual: bola à frente do pé de chuto, ponta para baixo. 3 × 8 só a largar e a chutar curto, com altura para a perseguição.','Ball drop at the same spot every time: ball in front of the kicking foot, nose down. 3 × 8 dropping and kicking short, with enough hang for the chase.'],
      ['distance','Construir distância','Distance building','12 min','Sobe a distância aos poucos: 25, 30, 35 m. 8 pontapés por distância, sem perder a altura nem a direção. Anca para a frente na passada.','Build distance gradually: 25, 30, 35 m. 8 kicks per distance, without losing height or direction. Hips forward through the stride.'],
      ['decide','Decisão: chutar ou passar','Decision: kick or pass','12 min','Com um colega a mostrar a pressão (verde, amarelo, vermelho), decides em menos de 1 s: chutar, passar ou correr. 10 repetições.','With a partner showing the pressure (green, amber, red), decide in under 1 s: kick, pass or run. 10 reps.'],
      ['clear','Clearing kick: libertação rápida','Clearing kick: quick release','10 min','Bola de uma recolha, pontapé de saída em menos de 1,5 s para a linha lateral. 8 repetições para cada lado, a deixar a bola cair alinhada com o centro do corpo.','From a pick-up, clearing kick in under 1.5 s to touch. 8 reps each side, letting the ball drop in line with the centre of your body.']
    ],
    pass:[
      ['spin','Passe de rotação','Spin pass','12 min','20 passes para cada lado, alvo à altura do peito a 8 m. Mãos atrás da bola, acompanha com os dedos em direção ao alvo.','20 passes each side, chest-height target at 8 m. Hands behind the ball, finish with fingers pointing at the target.'],
      ['dive','Passe com mergulho','Dive pass','12 min','Bola no chão, mergulha e passa sem dar passos extra. 3 × 8 para cada lado. A bola sai cedo e baixa.','Ball on the ground, dive and pass without extra steps. 3 × 8 each side. The ball leaves early and low.'],
      ['dist','Precisão a 8, 12 e 15 m','Accuracy at 8, 12 and 15 m','15 min','10 passes a cada distância para um alvo (peito de um colega ou aro). Conta os acertos e tenta chegar a 8 em 10.','10 passes at each distance at a target (a teammate\'s chest or a hoop). Count hits and aim for 8 out of 10.'],
      ['speed','Velocidade de libertação','Release speed','10 min','Do chão à bola largada em menos de 0,6 s. 3 × 6, cronometrado. A velocidade vem de apanhar e passar num só movimento.','From the ground to the ball leaving in under 0.6 s. 3 × 6, timed. Speed comes from picking up and passing in one movement.'],
      ['weakp','Lado fraco','Weak side','10 min','Todos os passes com a mão e o lado menos fortes. 3 × 10. O objetivo é igualar o alcance e a precisão.','All passes with your weaker hand and side. 3 × 10. The goal is to match range and accuracy.'],
      ['noback','Passe sem balanço','No-backswing pass','10 min','Passa sem levar a bola atrás: só rotação do tronco e extensão dos braços. 3 × 10 cada lado. Mais rápido e mais difícil de ler.','Pass without taking the ball back: just trunk rotation and arm extension. 3 × 10 each side. Faster and harder to read.']
    ],
    def:[
      ['tackle','Técnica de placagem','Tackle technique','12 min','Cabeça ao lado, ombro no alvo, braços fechados, pernas a empurrar. Em saco, 3 × 6 por cada ombro, a baixa velocidade.','Head to the side, shoulder on target, arms wrapped, legs driving. On a bag, 3 × 6 per shoulder, at low speed.'],
      ['line','Velocidade da linha','Line speed','12 min','Blitz de 10 m com a linha: sai todo ao mesmo tempo, mantém a linha reta, passos curtos no fim. 6 repetições com 40 s de pausa.','10 m blitz with the line: go all together, keep the line straight, short steps at the end. 6 reps with 40 s rest.'],
      ['cover','Cobertura de fundo','Back-field cover','12 min','Lê o pontapé, recua e posiciona-te atrás da linha. 8 repetições a chamar a tua posição em voz alta.','Read the kick, drop back and set behind the line. 8 reps calling your position out loud.'],
      ['reload','Levantar e voltar à linha','Get up and rejoin the line','10 min','Depois de placar ou de ficares no chão, levanta e volta à linha em menos de 3 s. 8 repetições. Os 9 são a linha de reposição.','After a tackle or going to ground, get up and rejoin the line in under 3 s. 8 reps. Nines are the reload line.'],
      ['ruckd','Defesa junto ao ruck','Defence around the ruck','12 min','Defende a franja do ruck: lê o 9 adversário, fecha o lado curto e empurra para o interior. 6 repetições com um colega a fazer de 9.','Defend the fringe of the ruck: read the opposing nine, shut the short side and push them inside. 6 reps with a teammate playing nine.'],
      ['angle','Ângulo de aproximação','Approach angle','10 min','Aproxima-te do atacante com um ângulo que o empurra para a linha lateral ou para os teus colegas. 8 repetições, passos curtos no fim.','Approach the attacker at an angle that pushes them toward touch or your teammates. 8 reps, short steps at the end.'],
      ['lowbody','Posição baixa mantida','Low body position hold','8 min','Mantém a posição de placagem (pernas dobradas, costas direitas, olhos à frente) durante 30 s. 4 séries. Constrói a base da placagem.','Hold the tackle position (knees bent, back straight, eyes up) for 30 s. 4 sets. Builds the base of the tackle.'],
      ['commit','Compromisso na placagem','Commitment drill','10 min','Corres 5 m, decides e placas sem hesitar, a baixa velocidade. 8 repetições. A hesitação é uma decisão: treina o compromisso.','Run 5 m, decide and tackle without hesitation at low speed. 8 reps. Hesitation is a decision: train commitment.']
    ],
    agi:[
      ['shuttle','Shuttle 5-10-5','Pro shuttle (5-10-5)','10 min','Cones a 0, 5 e 10 m. Sprint até ao cone de 5 m e toca, volta a 0 e toca, e acaba. 6 repetições com 60 s de pausa.','Cones at 0, 5 and 10 m. Sprint to the 5 m cone and touch, back to 0 and touch, then finish. 6 reps with 60 s rest.'],
      ['tdrill','T-drill','T-drill','10 min','Corrida em T: frente 10 m, lado 5 m para cada lado e volta. Passos curtos e rápidos nas mudanças. 5 repetições.','T-shaped run: forward 10 m, sideways 5 m each way and back. Short, quick steps at the changes. 5 reps.'],
      ['reactive','Agilidade reativa','Reactive agility','12 min','Um colega aponta a direção no último momento. Reage e muda em 2 passos. 8 repetições. Simples ganha sempre ao complicado.','A partner points the direction at the last moment. React and change in 2 steps. 8 reps. Simple beats complicated every time.'],
      ['step1v1','Fintas 1 contra 1','1v1 stepping','10 min','Contra um defesa passivo, fintas de dois passos para os dois lados. 6 repetições cada lado, sempre a avançar.','Against a passive defender, two-step sidesteps both ways. 6 reps each side, always moving forward.'],
      ['ballspeed','Velocidade com bola na mão','Ball-in-hand speed','10 min','Sprints de 20 m com a bola, a mudar de mão e a manter a velocidade. 6 repetições com pausa completa.','20 m sprints carrying the ball, switching hands and holding speed. 6 reps with full rest.']
    ]
  };
  const SKN = {box:['Box kick','Box kick','🦵'], pass:['Passe','Passing','🏉'], def:['Defesa','Defence','🛡️'], agi:['Agilidade','Agility','⚡']};
  const TARGET = {p:3, r:2, m:5, box:2, pass:3, def:2, agi:2};

  // ---------- estado ----------
  const load = (k, d) => { try{ const v = JSON.parse(localStorage.getItem(k)); return v==null ? d : v; }catch(e){ return d; } };
  const save = (k, v) => { try{ localStorage.setItem(k, JSON.stringify(v)); }catch(e){} };
  const SEED = {"2026-10-29":{"box":{"done":["dropm"],"ids":["dropm"],"rating":3,"set":true},"m":{"done":["imp"],"ids":[],"rating":4,"set":true},"p":{"done":["nordic","plank"],"ids":["nordic"],"rating":4,"set":true},"r":{"done":["sauna","boots"],"ids":["sauna","boots"],"rating":5,"set":true}},"2026-10-30":{"r":{"done":["ice"],"ids":["ice"],"rating":4,"set":true}},"2026-10-31":{"p":{"done":["nordic","plank"],"ids":["nordic"],"rating":4,"set":true}},"2026-11-02":{"box":{"done":["hang","clear","dropm"],"ids":["hang","clear","dropm"],"note":"[Clearing kick] Make sure ball positioning is good and kick trough the ball to target, don’t fall backwards\n[Long box kick] Make sure we’re kicking with the weigh forward and through the ball","rating":4,"set":true}},"2026-11-03":{"box":{"done":["hang"],"ids":["hang"],"rating":4,"set":true}},"2026-11-04":{"m":{"done":["imp"],"ids":[],"rating":3,"set":true},"pass":{"done":["imp"],"ids":[],"rating":3,"set":true}},"2026-11-06":{"agi":{"done":["shuttle"],"ids":["shuttle"],"note":"[Agility] Simple beats complicated every time, keep moving forward and 2 steps are usually enough","rating":4,"set":true},"box":{"done":["distance"],"ids":["distance"],"note":"[Long box kick] Make sure the ball is facing straight up before the kick","rating":4,"set":true},"def":{"done":["imp"],"ids":[],"rating":4,"set":true}},"2026-11-09":{"box":{"done":["clear","decide"],"ids":["clear","decide"],"note":"[Long box kick] If kicking a longer ball (or against the wind) move the hips forward while kicking\nAlso no need to kick at 100% kick smooth\n[Clearing kick] Kicking to the right, drop the ball further back your stance (inline with the center of the body)","rating":4,"set":true},"p":{"done":["ankle","plank"],"ids":["ankle"],"rating":4,"set":true},"pass":{"done":["weakp"],"ids":["weakp"],"note":"[Passing] On maul pass, take the ball to the hip first","rating":4,"set":true},"r":{"done":["imp"],"ids":[],"rating":5,"set":true}},"2026-11-10":{"p":{"done":["ankle","plank"],"ids":["ankle"],"rating":4,"set":true},"r":{"done":["boots"],"ids":["boots"],"rating":3,"set":true}},"2026-11-11":{"p":{"done":["hip","plank"],"ids":["hip"],"set":true},"r":{"done":["hot"],"ids":["hot"],"rating":4,"set":true}},"2026-11-12":{"m":{"done":["inoculate"],"ids":["inoculate"],"rating":5,"set":true}}};
  const KINDS = ['p','r','m','box','pass','def','agi'];
  let LOG = load('coach_log', {}), CUSTOM = load('coach_custom', {});
  // prancha progressiva: se já usaste a app RWC-coach (mesmo endereço), continua de onde ficaste
  let PB = load('coach_plank_pb', null);
  if(!PB){ const r = load('rwc_plank_pb', null); if(r && r.sessions!=null) PB = r; }
  PB = PB || {sessions:0, weightKg:0, lastTarget:0, lastDate:''};
  const commit = () => { save('coach_log', LOG); save('coach_custom', CUSTOM); save('coach_plank_pb', PB); };
  // formato antigo (uma escolha por skill) passa a lista de exercícios
  Object.keys(LOG).forEach(k => { const d = LOG[k]; if(!d) return;
    KINDS.forEach(s => { const e = d[s]; if(!e) return;
      if(!Array.isArray(e.done)){ const id = e.id; e.done = (e.done && id) ? [id] : []; if(e.chosen && id){ e.set = true; e.ids = [id]; } }
      if(e.set && !Array.isArray(e.ids)) e.ids = []; }); });
  // importação única do teu histórico (CSV da app RWC-coach, ajustado aos exercícios desta app)
  try{ if(!localStorage.getItem('coach_seed1')){
    Object.keys(SEED).forEach(dt => Object.keys(SEED[dt]).forEach(s => { LOG[dt] = LOG[dt] || {}; const cur = LOG[dt][s]; if(!cur || !(cur.done||[]).length) LOG[dt][s] = SEED[dt][s]; }));
    localStorage.setItem('coach_seed1','1'); commit(); } }catch(e){}
  let tab = 'prehab', ctxOverride = null, todayOverride = null;
  const pickOpen = {}, showForm = {};
  const todayKey = () => todayOverride || iso(new Date());
  const day = k => { const d = (LOG[k] = LOG[k] || {});
    KINDS.forEach(s => { const e = (d[s] = d[s] || {}); if(!Array.isArray(e.done)) e.done = []; if(e.rating==null) e.rating = 0; if(e.note==null) e.note = ''; }); return d; };

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

  // ---------- exercícios (incluindo os que crias) ----------
  function customList(kind){
    return (CUSTOM[kind] || []).map(c => kind==='m' ? [c.id,'own',c.dur,c.name,c.name,c.how,c.how,1]
      : kind==='r' ? [c.id,c.name,c.name,c.dur,c.how,c.how,'same,next,high,normal',1]
      : kind==='p' ? [c.id,c.name,c.name,c.dur,c.how,c.how,0,1]
      : [c.id,c.name,c.name,c.dur,c.how,c.how,1]);
  }
  const BASE = {p:PRE, r:REC, m:MEN, box:SK.box, pass:SK.pass, def:SK.def, agi:SK.agi};
  const allOf = kind => BASE[kind].concat(customList(kind));
  const isCustom = (kind, x) => (CUSTOM[kind]||[]).some(c => c.id===x[0]);
  const view = (kind, x) => kind==='m' ? {id:x[0], name:T(x[3],x[4]), dur:x[2], how:T(x[5],x[6])} : {id:x[0], name:T(x[1],x[2]), dur:x[3], how:T(x[4],x[5])};

  // ---------- escolha sugerida (o que foi feito há mais tempo) ----------
  function lastDone(kind, ids, t){
    const m = {}; ids.forEach(i => m[i] = -1e9);
    Object.keys(LOG).forEach(k => { if(k>=t) return; const e = LOG[k] && LOG[k][kind]; if(!e) return;
      (e.done || []).forEach(i => { if(i in m) m[i] = Math.max(m[i], parse(k).getTime()/DAYMS); }); });
    return m;
  }
  const doy = t => Math.floor((parse(t) - new Date(parse(t).getFullYear(),0,0)) / DAYMS);
  function ranked(kind, pool, t){
    const m = lastDone(kind, pool.map(x=>x[0]), t), off = doy(t);
    return pool.map((x,i) => ({x, i})).sort((a,b) => (m[a.x[0]]-m[b.x[0]]) || (((a.i+off)%pool.length)-((b.i+off)%pool.length))).map(o => o.x);
  }
  function recommended(kind, k){
    const easy = k!=='normal';
    if(kind==='p') return PRE.filter(x => !(easy && x[6]));
    if(kind==='r') return REC.filter(x => x[6].split(',').includes(k));
    if(kind==='m'){ const pil = {same:['rot','foc'], next:['adv','self'], high:['foc','rot'], normal:Object.keys(P)}[k]; return MEN.filter(x => pil.includes(x[1])); }
    return SK[kind];
  }
  // lista de exercícios de hoje: a que escolheste, ou a sugestão
  function todayIds(d, kind){ const e = d[kind]; return e.set ? (e.ids || []) : (e.auto ? [e.auto] : []); }
  function plan(ctx){
    const t = todayKey(), d = day(t), k = ctx.k, out = {d, t, opts:{}, list:{}};
    KINDS.forEach(kind => {
      const rec = recommended(kind, k), recList = ranked(kind, rec, t), recIds = recList.map(x=>x[0]);
      const rest = ranked(kind, allOf(kind).filter(x => !recIds.includes(x[0])), t);
      const list = recList.concat(rest), lastMap = lastDone(kind, list.map(x=>x[0]), t);
      const rec0 = recList[0]; d[kind].auto = rec0[0];
      const ids = todayIds(d, kind);
      out.list[kind] = ids.map(id => list.find(x => x[0]===id)).filter(Boolean);
      out.opts[kind] = list.map(x => ({x, sug: x===rec0, rec: recIds.includes(x[0]), ago: lastMap[x[0]] < -1e8 ? null : Math.round(parse(t)/DAYMS - lastMap[x[0]]), inList: ids.includes(x[0]), mine: isCustom(kind, x)}));
    });
    return out;
  }

  // ---------- estatísticas ----------
  const mondayOf = s => { const d = parse(s), w = (d.getDay()+6)%7; d.setDate(d.getDate()-w); return iso(d); };
  const addDays = (s,n) => { const d = parse(s); d.setDate(d.getDate()+n); return iso(d); };
  const preDone = d => { const e = d && d.p; if(!e || !(e.done||[]).includes('plank')) return false; const ids = e.set ? (e.ids||[]) : (e.auto ? [e.auto] : []); return ids.every(i => e.done.includes(i)); };
  const kDone = (d, kind) => kind==='p' ? preDone(d) : !!(d && d[kind] && (d[kind].done||[]).length);
  const dayAny = d => !!d && KINDS.some(kind => kDone(d, kind));
  function weekStats(mon){
    const o = {p:0, r:0, m:0, box:0, pass:0, def:0, agi:0, rd:0};
    for(let i=0;i<7;i++){ const d = LOG[addDays(mon,i)]; if(!d) continue; KINDS.forEach(kind => { if(kDone(d, kind)) o[kind]++; }); }
    SESSIONS.forEach(s => { if(s.date>=mon && s.date<=addDays(mon,6)) o.rd += s.rd||0; });
    return o;
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
   +'#pg-coach .cpick{border:1px solid var(--line);border-radius:12px;overflow:hidden}#pg-coach .cpick>summary{flex-direction:row;list-style:none;cursor:pointer;min-height:48px;display:flex;align-items:center;justify-content:space-between;padding:0 14px;font-weight:700;font-size:15px}#pg-coach .cpick>summary::-webkit-details-marker{display:none}#pg-coach .cpick>summary .cn{margin-left:auto;margin-right:10px;background:rgba(217,152,26,.18);color:#8a5d06;border-radius:99px;padding:1px 9px;font-size:13px}#pg-coach .cpick>summary::after{content:"▾";color:var(--ink-muted)}#pg-coach .cpick[open]>summary::after{content:"▴"}'
   +'#pg-coach .plist{display:flex;flex-direction:column;border-top:1px solid var(--line);max-height:380px;overflow:auto}#pg-coach .prow{display:flex;border-bottom:1px solid var(--line)}#pg-coach .pbtn{flex:1;min-width:0;display:flex;flex-direction:column;align-items:flex-start;text-align:left;gap:2px;min-height:52px;padding:8px 14px;border:0;background:var(--surface,#fff);color:var(--ink);font:600 15px Inter,sans-serif;cursor:pointer}'
   +'#pg-coach .pbtn small{font-weight:500;color:var(--ink-muted);font-size:12px}#pg-coach .pbtn.sel{background:rgba(217,152,26,.14)!important;color:var(--ink)!important;border-color:transparent!important}#pg-coach .pbtn.off{opacity:.62}#pg-coach .pbtn.pnew{width:100%;font-weight:700;min-height:52px;color:#8a5d06!important;background:var(--surface,#fff)!important}'
   +'#pg-coach .pdel{width:52px;border:0;border-left:1px solid var(--line);background:var(--surface,#fff);font-size:18px;cursor:pointer}'
   +'#pg-coach .cform{display:flex;flex-direction:column;gap:8px;padding:12px 14px}#pg-coach .cform input{min-height:48px;border:1px solid var(--line);border-radius:12px;padding:0 12px;font:15px Inter,system-ui,sans-serif;color:var(--ink);background:var(--surface,#fff);box-sizing:border-box;width:100%}'
   +'#pg-coach .pk{border:1px solid var(--line);border-radius:14px;padding:14px;display:flex;flex-direction:column;gap:10px;background:rgba(217,152,26,.06)}#pg-coach .pkh{display:flex;justify-content:space-between;align-items:baseline}#pg-coach .pkh span{font-size:12px;color:var(--ink-muted)}#pg-coach .pkt{display:flex;justify-content:space-between;align-items:center;gap:8px;font-size:17px}#pg-coach .pkt b{color:#8a5d06}'
   +'#pg-coach .pkr{display:flex;align-items:center;gap:14px}#pg-coach .pkb{display:flex;flex-direction:column;gap:8px;flex:1}#pg-coach .pkok{font-weight:700;color:#2E7D4A;font-size:15px}#pg-coach .plnk{align-self:flex-start;min-height:44px;border:0;background:none;color:var(--ink-muted);font:600 13px Inter,sans-serif;text-decoration:underline;cursor:pointer;padding:0 4px}#pg-coach .pkt .plnk{text-decoration:none;border:1px solid var(--line);border-radius:10px;padding:0 10px}'
   +'#pg-coach .cseg.w7{grid-template-columns:repeat(3,1fr)}#pg-coach .cseg.w7 button:last-child{grid-column:span 2}#pg-coach .cnotew{margin:0;font-size:13px;line-height:1.45;color:#8a5d06;background:rgba(217,152,26,.12);border-radius:10px;padding:8px 12px}'
   +'.more-link{display:flex;align-items:center;justify-content:space-between;width:100%}';
  document.body.appendChild(css);

  // ---------- componentes ----------
  const CHECK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
  const L = (o,i) => EN ? o[i+1] : o[i];
  function item(kind, id, name, dur, how, done, extra){
    return '<div class="crow"><button type="button" class="cchk" role="checkbox" data-act="tick" data-k="'+kind+'" data-id="'+id+'" aria-checked="'+done+'" aria-label="'+esc(name)+': '+T('feito','done')+'">'+CHECK+'</button>'
      +'<details><summary><b>'+esc(name)+'</b><small>'+esc(dur)+(extra?' · '+extra:'')+'</small></summary><p>'+esc(how||T('Sem descrição.','No description.'))+'</p></details></div>';
  }
  function picker(kind, pl, ctx){
    const ago = n => n==null ? T('nunca feito','never done') : n<=0 ? T('feito hoje','done today') : n===1 ? T('feito ontem','done yesterday') : T('feito há '+n+' dias','done '+n+' days ago');
    const off = T('menos indicado hoje','less suited today');
    const rows = pl.opts[kind].map(o => {
      const v = view(kind, o.x);
      const tag = o.sug ? T('sugerido hoje','suggested today') : (!o.rec && !o.mine && (kind==='p'||kind==='r'||kind==='m') ? off : (o.mine ? T('o teu exercício','your exercise') : ''));
      return '<div class="prow"><button type="button" class="pbtn'+(o.inList?' sel':'')+(tag===off?' off':'')+'" data-act="toggle" data-k="'+kind+'" data-id="'+o.x[0]+'" aria-pressed="'+o.inList+'"><span>'+(o.inList?'✓ ':'＋ ')+esc(v.name)+'</span><small>'+[tag, ago(o.ago)].filter(Boolean).join(' · ')+'</small></button>'
        +(o.mine?'<button type="button" class="pdel" data-act="cdel" data-k="'+kind+'" data-id="'+o.x[0]+'" aria-label="'+T('Apagar exercício','Delete exercise')+'">🗑</button>':'')+'</div>'; }).join('');
    const form = showForm[kind] ? '<div class="cform"><input id="cf-name" type="text" maxlength="60" placeholder="'+T('Nome do exercício','Exercise name')+'" aria-label="'+T('Nome','Name')+'"><input id="cf-dur" type="number" inputmode="numeric" min="1" max="180" placeholder="'+T('Minutos','Minutes')+'" aria-label="'+T('Minutos','Minutes')+'"><textarea id="cf-how" placeholder="'+T('Como se faz (opcional)','How to do it (optional)')+'" aria-label="'+T('Como se faz','How to')+'"></textarea><div class="cr2"><button type="button" class="cb" data-act="cform" data-k="'+kind+'">'+T('Cancelar','Cancel')+'</button><button type="button" class="cb pri" data-act="csave" data-k="'+kind+'">'+T('Guardar e adicionar','Save and add')+'</button></div></div>'
      : '<button type="button" class="pbtn pnew" data-act="cform" data-k="'+kind+'">＋ '+T('Criar o teu exercício','Create your own exercise')+'</button>';
    const n = pl.opts[kind].filter(o => o.inList).length;
    return '<details class="cpick" data-pk="'+kind+'"'+(pickOpen[kind]?' open':'')+'><summary>'+T('Exercícios de hoje','Today\'s exercises')+' <span class="cn">'+n+'</span></summary><div class="plist">'+rows+form+'</div></details>';
  }
  const weekPill = (n, tg) => '<span class="pill">'+T('Esta semana: ','This week: ')+n+T(' de ',' of ')+tg+'</span>';
  function ratingBlock(kind, d){
    const e = d[kind];
    const rate = [1,2,3,4,5].map(n => '<button type="button" data-act="rate" data-k="'+kind+'" data-v="'+n+'" aria-pressed="'+(e.rating===n)+'" aria-label="'+n+' / 5">'+n+'</button>').join('');
    return '<div><small class="sub">'+T('Como correu? (opcional)','How did it go? (optional)')+'</small></div><div class="crate">'+rate+'</div>'
      +'<textarea class="cnote" data-k="'+kind+'" placeholder="'+T('Uma nota para ti, se quiseres…','A note to yourself, if you like…')+'" aria-label="'+T('Nota','Note')+'">'+esc(e.note)+'</textarea>';
  }
  function exList(kind, pl, ctx){
    const d = pl.d, ex = pl.list[kind];
    if(!ex.length) return '<p class="w">'+T('Lista vazia. Abre "Exercícios de hoje" e escolhe o que queres fazer.','Empty list. Open "Today\'s exercises" and choose what you want to do.')+'</p>';
    return ex.map(x => { const v = view(kind, x); return item(kind, v.id, v.name, v.dur, v.how, d[kind].done.includes(v.id), kind==='p' && ctx.k!=='normal' && x[6] ? T('intenso para hoje','intense for today') : ''); }).join('');
  }
  function allBtn(kind, pl){
    const ids = pl.list[kind].map(x => x[0]); if(!ids.length) return '';
    const all = ids.every(i => pl.d[kind].done.includes(i));
    return '<button type="button" class="cb '+(all?'ok':'pri')+'" data-act="all" data-k="'+kind+'" style="width:100%">'+(all?T('Todos feitos ✓','All done ✓'):T('Marcar todos como feitos','Mark all as done'))+'</button>';
  }

  // ---------- prancha progressiva (a mesma da app RWC-coach) ----------
  const LEVELS = [{kg:0,s:40},{kg:10,s:45},{kg:20,s:40},{kg:30,s:35},{kg:40,s:30},{kg:50,s:25}];
  function pstate(n){
    let r = n;
    for(let i=0;i<LEVELS.length;i++){
      const {kg, s} = LEVELS[i], steps = Math.round((60-s)/5)+1;
      if(r < steps || i===LEVELS.length-1){
        const nx = LEVELS[i+1];
        return {kg, secs:Math.min(60, s+r*5), nextKg:nx?nx.kg:null, nextSecs:(r+1<steps) ? Math.min(60, s+(r+1)*5) : (nx?nx.s:null), levelUp:(r+1>=steps) && !!nx};
      }
      r -= steps;
    }
  }
  const PT = {state:'idle', rem:null, noW:false, iv:null, startAt:0, remAt:0, manual:false};
  const pfmt = s => s>=60 ? Math.floor(s/60)+'m'+(s%60?' '+(s%60)+'s':'') : s+'s';
  const pactive = () => { const st = pstate(PB.sessions); return (PT.noW && st.kg>0) ? Math.min(300, Math.round((40+PB.sessions*5)/5)*5) : st.secs; };
  const plabel = kg => kg===0 ? T('peso corporal','bodyweight') : kg+' kg';
  function plankCard(pl){
    const d = pl.d, st = pstate(PB.sessions), act = pactive(), logged = d.p.done.includes('plank');
    const next = st.levelUp ? '↑ '+st.nextKg+' kg · '+T('começa em ','start at ')+pfmt(st.nextSecs||20) : st.nextSecs ? pfmt(st.nextSecs)+(st.kg>0?' @ '+st.kg+' kg':'') : T('máximo atingido!','max reached!');
    const head = '<div class="pkh"><b>'+T('Prancha progressiva','Progressive plank')+'</b><span>'+T('sessão ','session ')+(PB.sessions+(logged?0:1))+'</span></div>';
    if(logged){
      const L2 = d.p.plank || {secs:PB.lastTarget, kg:PB.weightKg};
      return '<div class="pk">'+head+'<div class="pkok">✓ '+pfmt(L2.secs)+(L2.kg>0?' @ '+L2.kg+' kg':'')+T(' registado',' logged')+'</div><small class="sub">'+T('Próxima: ','Next: ')+next+'</small>'+(st.levelUp?'<small class="sub" style="color:#8a5d06">🏋️ '+T('Próxima sessão: primeira placa de ','Next session: first plate of ')+st.nextKg+' kg</small>':'')
        +'<button type="button" class="plnk" data-act="pundo">'+T('Desfazer registo','Undo log')+'</button></div>';
    }
    if(PT.rem==null || PT.state==='idle' && PT.rem>act) PT.rem = act;
    const cue = (PT.noW && st.kg>0) ? T('Sem placa? Segura '+pfmt(act)+' de peso corporal: carga equivalente a '+pfmt(st.secs)+' com '+st.kg+' kg.','No plate? Hold '+pfmt(act)+' bodyweight: equivalent load to '+pfmt(st.secs)+' @ '+st.kg+' kg.')
      : st.kg===0 ? (PB.sessions===0 ? T('Base. 40 s com boa forma: respira devagar, anca nivelada.','Baseline. 40 s with solid form: breathe slowly, hips level.') : PB.sessions<3 ? T('A construir base. Cada 5 s ganhos aproxima-te de uma placa.','Building base. Every 5 s earned brings a plate closer.') : T('Últimas sessões sem peso. Quase na placa.','Final bodyweight sessions. Almost at the plate.'))
      : T(st.kg+' kg nas costas. Anca nivelada: prancha com carga vale mais do que prancha longa.', st.kg+' kg on your back. Keep hips level: loaded planks beat long holds.');
    const pct = Math.round((act-PT.rem)/act*100), C = 2*Math.PI*34;
    const run = PT.state==='running', done = PT.state==='done';
    return '<div class="pk">'+head
      +'<div class="pkt"><b>'+((PT.noW&&st.kg>0)?pfmt(act)+' '+T('peso corporal','bodyweight'):pfmt(st.secs)+' · '+plabel(st.kg))+'</b>'+(st.kg>0?'<button type="button" class="plnk" data-act="pnow" aria-pressed="'+PT.noW+'">'+(PT.noW?T('🏋️ tenho peso','🏋️ have weight'):T('🏠 sem peso','🏠 no weight'))+'</button>':'')+'</div>'
      +(st.kg>0&&!PT.noW?'<small class="sub" style="color:#8a5d06;font-weight:600">'+T('Coloca a placa de '+st.kg+' kg na zona lombar','Place the '+st.kg+' kg plate on your lower back')+'</small>':'')
      +'<p class="w">'+cue+'</p>'
      +'<div class="pkr"><svg width="84" height="84" viewBox="0 0 80 80" aria-hidden="true"><circle cx="40" cy="40" r="34" fill="none" stroke="#e8e6df" stroke-width="7"/><circle id="pring" cx="40" cy="40" r="34" fill="none" stroke="'+(done?'#2E7D4A':'#D9981A')+'" stroke-width="7" stroke-dasharray="'+C+'" stroke-dashoffset="'+(C*(1-pct/100))+'" stroke-linecap="round" transform="rotate(-90 40 40)"/><text id="ptime" x="40" y="46" text-anchor="middle" font-size="18" font-weight="700" fill="'+(done?'#2E7D4A':'#D9981A')+'" font-family="system-ui">'+pfmt(PT.rem)+'</text></svg>'
      +'<div class="pkb">'+(run?'<button type="button" class="cb" data-act="ppause">⏸ '+T('Pausa','Pause')+'</button>':done?'<div class="pkok">'+T('Feito! 💪','Done! 💪')+'</div>':'<button type="button" class="cb pri" data-act="pstart">▶ '+T('Começar','Start')+'</button>')
      +(!run&&!done&&PT.rem<act?'<button type="button" class="cb" data-act="preset">'+T('Recomeçar','Reset')+'</button>':'')+'</div></div>'
      +'<button type="button" class="cb '+(done?'ok':'pri')+'" data-act="plog" style="width:100%">✓ '+T('Registar ','Log ')+pfmt(act)+((PT.noW&&st.kg>0)?' '+T('peso corporal','bodyweight'):st.kg>0?' @ '+st.kg+' kg':'')+'</button>'
      +'<small class="sub">'+T('Próxima: ','Next: ')+next+'</small>'
      +'<button type="button" class="plnk" data-act="pman">'+(PT.manual?T('cancelar','cancel'):T('Já sei o meu nível: definir à mão','I already know my level: set manually'))+'</button>'
      +(PT.manual?'<div class="cform"><small class="sub">'+T('Ex.: se aguentas 30 s com 20 kg, escreve isso e a progressão ajusta-se.','E.g. if you can hold 30 s with 20 kg, enter that and the progression adjusts.')+'</small><input id="pm-kg" type="number" inputmode="numeric" min="0" step="10" placeholder="'+T('Peso (kg), 0 = corpo','Weight (kg), 0 = bodyweight')+'"><input id="pm-s" type="number" inputmode="numeric" min="20" max="60" step="5" placeholder="'+T('Tempo (20–60 s)','Time (20–60 s)')+'"><button type="button" class="cb pri" data-act="papply">'+T('Aplicar','Apply')+'</button></div>':'')
      +'</div>';
  }
  function ptickDom(){
    const act = pactive(), C = 2*Math.PI*34;
    const t = pg.querySelector('#ptime'), r = pg.querySelector('#pring');
    if(t) t.textContent = pfmt(PT.rem);
    if(r) r.setAttribute('stroke-dashoffset', C*(1-Math.round((act-PT.rem)/act*100)/100));
  }
  function pstop(){ clearInterval(PT.iv); PT.iv = null; }
  function pstart(){
    PT.state = 'running'; PT.startAt = Date.now(); PT.remAt = PT.rem;
    pstop(); PT.iv = setInterval(() => {
      const left = Math.max(0, PT.remAt - Math.floor((Date.now()-PT.startAt)/1000)); PT.rem = left; ptickDom();
      if(left===0){ pstop(); PT.state = 'done'; try{ navigator.vibrate && navigator.vibrate([200,80,200]); }catch(e){} render(); }
    }, 500);
  }

  // ---------- painéis ----------
  function panelPrehab(pl, ctx, ws){
    return '<div class="cpan"><div class="cc">'+weekPill(ws.p, TARGET.p)+'<h3>'+T('Prehab de hoje','Today\'s prehab')+'</h3><p class="w">'+L(WHY.prehab,0)+'</p>'
      +picker('p', pl, ctx)+exList('p', pl, ctx)+allBtn('p', pl)+plankCard(pl)+ratingBlock('p', pl.d)+'</div></div>';
  }
  function panelRecovery(pl, ctx, ws){
    return '<div class="cpan"><div class="cc">'+weekPill(ws.r, TARGET.r)+'<h3>'+T('Recuperação de hoje','Today\'s recovery')+'</h3><p class="w">'+L(WHY.recovery,0)+'</p>'
      +picker('r', pl, ctx)+exList('r', pl, ctx)+allBtn('r', pl)+ratingBlock('r', pl.d)
      +'<p class="w">'+(ctx.k==='same'||ctx.k==='next'?T('Hidratos de carbono e proteína nas 2 h a seguir, e dorme 8 h ou mais.','Carbs and protein within 2 h, and sleep 8 h or more.'):T('Dormir 8 h ou mais é a parte inegociável da recuperação.','Sleeping 8 h or more is the non-negotiable part of recovery.'))+'</p></div></div>';
  }
  function panelMental(pl, ctx, ws){
    const first = pl.list.m[0], p = first && P[first[1]];
    return '<div class="cpan"><div class="cc">'+weekPill(ws.m, TARGET.m)+'<h3>'+(p?p[2]+' ':'')+T('Mental de hoje','Today\'s mental work')+'</h3><p class="w">'+L(WHY.mental,0)+'</p>'
      +picker('m', pl, ctx)+exList('m', pl, ctx)+allBtn('m', pl)+ratingBlock('m', pl.d)+'</div></div>';
  }
  function panelSkill(kind, pl, ctx, ws){
    const n = SKN[kind];
    const warn = ctx.k==='same' ? T('Dia de jogo ou pesado: se treinares a técnica, faz leve e com pouco volume.','Match or heavy day: if you work on technique, keep it light and low volume.')
      : ctx.k==='next' ? T('Dia seguinte a jogo ou dia pesado: só técnica leve, sem pressão nem velocidade máxima.','Day after a match or heavy day: light technique only, no pressure or top speed.')
      : ctx.k==='high' ? T('Carga alta esta semana: mantém o volume curto.','High load this week: keep the volume short.') : '';
    return '<div class="cpan"><div class="cc">'+weekPill(ws[kind], TARGET[kind])+'<h3>'+n[2]+' '+T(n[0],n[1])+'</h3>'+(warn?'<p class="cnotew">'+warn+'</p>':'')
      +picker(kind, pl, ctx)+exList(kind, pl, ctx)+allBtn(kind, pl)+ratingBlock(kind, pl.d)+'</div></div>';
  }
  function panelProgress(ctx, ws){
    const t = todayKey(), mon = mondayOf(t), s = streak(), stp = pstate(PB.sessions);
    const bar = (lbl, v, tg) => '<div class="cmod"><span>'+lbl+'</span><div class="cbar"><i data-w="'+Math.min(100,Math.round(v/tg*100))+'"></i></div><span>'+v+'/'+tg+'</span></div>';
    let rows = '';
    for(let i=0;i<8;i++){ const m0 = addDays(mon,-7*i), w = weekStats(m0);
      rows += '<div class="cwk"><span>'+fmt(m0)+'</span><div class="dots"><span>🛠️ '+w.p+'</span><span>🔄 '+w.r+'</span><span>🧘 '+w.m+'</span><span>🏉 '+(w.box+w.pass+w.def+w.agi)+'</span></div><small>'+(w.rd?km(w.rd)+' km':'–')+'</small></div>'; }
    const rated = []; Object.keys(LOG).forEach(k => { if(k > addDays(t,-14) && LOG[k].m && (LOG[k].m.done||[]).length && LOG[k].m.rating) rated.push(LOG[k].m.rating); });
    const avg = rated.length ? rated.reduce((a,b)=>a+b,0)/rated.length : null;
    const notes = []; Object.keys(LOG).sort().reverse().forEach(k => KINDS.forEach(kind => { const e = LOG[k][kind]; if(e && e.note && e.note.trim() && notes.length<4) notes.push('<div class="cnt">'+esc(e.note.trim()).replace(/\n/g,'<br>')+'<small>'+fmt(k)+'</small></div>'); }));
    let total = 0; Object.keys(LOG).forEach(k => KINDS.forEach(kind => { if(kDone(LOG[k], kind)) total++; }));
    return '<div class="cpan"><div class="cst"><div><b>'+s+'</b><small>'+(s===1?T('dia seguido','day in a row'):T('dias seguidos','days in a row'))+'</small></div><div><b>'+total+'</b><small>'+T('skills feitas','skills done')+'</small></div><div><b>'+(avg==null?'–':num1(avg))+'</b><small>'+T('mental, média 14 d','mental, 14-day avg')+'</small></div></div>'
      +'<div class="cc"><h3>'+T('Esta semana','This week')+'</h3>'+bar('🛠️ Prehab', ws.p, TARGET.p)+bar('🔄 '+T('Recup.','Recov.'), ws.r, TARGET.r)+bar('🧘 Mental', ws.m, TARGET.m)+bar('🦵 Box kick', ws.box, TARGET.box)+bar('🏉 '+T('Passe','Passing'), ws.pass, TARGET.pass)+bar('🛡️ '+T('Defesa','Defence'), ws.def, TARGET.def)+bar('⚡ '+T('Agil.','Agility'), ws.agi, TARGET.agi)+'</div>'
      +'<div class="cc"><h3>'+T('Prancha','Plank')+'</h3><p class="w">'+pfmt(stp.secs)+' · '+plabel(stp.kg)+(PB.sessions===1?T(' · 1 sessão',' · 1 session'):T(' · '+PB.sessions+' sessões',' · '+PB.sessions+' sessions'))+'</p></div>'
      +'<div class="cc"><h3>'+T('8 semanas, com a tua carga','8 weeks, with your load')+'</h3><p class="w">'+T('Para ver se a prevenção acompanha as semanas pesadas.','To check that prevention keeps up with heavy weeks.')+'</p>'+rows+'</div>'
      +(notes.length?'<div class="cc"><h3>'+T('As tuas notas','Your notes')+'</h3>'+notes.join('')+'</div>':'')+'</div>';
  }

  // ---------- render ----------
  function render(){
    const ctx = context(), pl = plan(ctx), ws = weekStats(mondayOf(pl.t)), c = CTX[ctx.k];
    const ok = {p: preDone(pl.d), r: kDone(pl.d,'r'), m: kDone(pl.d,'m')};
    const chip = (key, lbl) => '<span class="'+(ok[key]?'ok':'')+'">'+(ok[key]?'✓ ':'')+lbl+'</span>';
    const lr = ctx.ratio==null ? '' : ' · '+T('carga vs. habitual ','load vs usual ')+num1(ctx.ratio);
    const TABS = [['prehab','Prehab'],['recovery',T('Recuperação','Recovery')],['mental','Mental'],['box','Box kick'],['pass',T('Passe','Passing')],['def',T('Defesa','Defence')],['agi',T('Agilidade','Agility')],['progress',T('Progresso','Progress')]];
    const y = scrollY;
    pg.innerHTML = '<section class="ch"><h2>Coach</h2><div class="sub">'+T('Prehab, recuperação, mental e progresso, ajustados à tua carga.','Prehab, recovery, mental and progress, adjusted to your load.')+'</div>'
      +'<div class="cx" style="border-left:6px solid '+c.c+'"><small>'+T('Última sessão ','Last session ')+esc(ctx.lastTxt)+lr+'</small><div class="ct">'+L(c.t,0)+'</div><p>'+L(c.s,0)+'</p><div class="cs">'+chip('p','Prehab')+chip('r',T('Recuperação','Recovery'))+chip('m','Mental')+'</div></div>'
      +'<div class="cseg w7" role="group" aria-label="Coach">'+TABS.map(a=>'<button type="button" data-tab="'+a[0]+'" aria-pressed="'+(tab===a[0])+'">'+a[1]+'</button>').join('')+'</div>'
      +'<div id="cpanel">'+(tab==='prehab'?panelPrehab(pl,ctx,ws):tab==='recovery'?panelRecovery(pl,ctx,ws):tab==='mental'?panelMental(pl,ctx,ws):tab==='progress'?panelProgress(ctx,ws):panelSkill(tab,pl,ctx,ws))+'</div></section>';
    requestAnimationFrame(() => requestAnimationFrame(() => pg.querySelectorAll('.cbar i').forEach(i => { i.style.width = i.dataset.w+'%'; })));
    if(y && pg.classList.contains('on')) scrollTo(0, y);
    commit();
  }

  // ---------- ações ----------
  const rd = id => (pg.querySelector(id)||{}).value || '';
  pg.addEventListener('toggle', e => { const k = e.target.dataset && e.target.dataset.pk; if(k) pickOpen[k] = e.target.open; }, true);
  pg.addEventListener('click', e => {
    const tb = e.target.closest('[data-tab]'); if(tb){ tab = tb.dataset.tab; render(); scrollTo(0, 0); return; }
    const b = e.target.closest('[data-act]'); if(!b) return;
    const t = todayKey(), d = day(t), act = b.dataset.act, k = b.dataset.k, id = b.dataset.id;
    const ensureSet = () => { const e2 = d[k]; if(!e2.set){ e2.ids = todayIds(d, k).slice(); e2.set = true; } return e2; };
    if(act==='tick'){ const a = d[k].done, i = a.indexOf(id); if(i<0) a.push(id); else a.splice(i,1); commit(); render(); const nb = pg.querySelector('.cchk[data-id="'+id+'"]'); if(nb && nb.getAttribute('aria-checked')==='true' && !reduce()) nb.classList.add('pop'); }
    else if(act==='all'){ const ids = todayIds(d, k), all = ids.every(i => d[k].done.includes(i)); d[k].done = all ? d[k].done.filter(i => !ids.includes(i)) : Array.from(new Set(d[k].done.concat(ids))); commit(); render(); }
    else if(act==='toggle'){ const e2 = ensureSet(), i = e2.ids.indexOf(id); if(i<0) e2.ids.push(id); else { e2.ids.splice(i,1); e2.done = e2.done.filter(x => x!==id); } pickOpen[k] = true; commit(); render(); }
    else if(act==='rate'){ const v = +b.dataset.v; d[k].rating = d[k].rating===v ? 0 : v; commit(); render(); }
    else if(act==='cform'){ showForm[k] = !showForm[k]; pickOpen[k] = true; render(); }
    else if(act==='csave'){ const name = rd('#cf-name').trim(); if(!name){ const f = pg.querySelector('#cf-name'); if(f) f.focus(); return; }
      const cid = 'c_'+Date.now().toString(36), dur = (parseInt(rd('#cf-dur'))||10)+' min';
      (CUSTOM[k] = CUSTOM[k] || []).push({id:cid, name, dur, how:rd('#cf-how').trim()}); const e2 = ensureSet(); e2.ids.push(cid); showForm[k] = false; pickOpen[k] = true; commit(); render(); }
    else if(act==='cdel'){ CUSTOM[k] = (CUSTOM[k]||[]).filter(c => c.id!==id); Object.keys(LOG).forEach(dt => { const e2 = LOG[dt][k]; if(e2 && e2.ids) e2.ids = e2.ids.filter(x => x!==id); }); pickOpen[k] = true; commit(); render(); }
    else if(act==='pstart') pstart() || render();
    else if(act==='ppause'){ pstop(); PT.state = 'idle'; render(); }
    else if(act==='preset'){ pstop(); PT.state = 'idle'; PT.rem = pactive(); render(); }
    else if(act==='pnow'){ PT.noW = !PT.noW; pstop(); PT.state = 'idle'; PT.rem = pactive(); render(); }
    else if(act==='plog'){ pstop(); const st = pstate(PB.sessions), act2 = pactive(); d.p.prevPB = JSON.parse(JSON.stringify(PB));
      PB = {sessions:PB.sessions+1, lastTarget:act2, weightKg:st.kg, lastDate:t}; d.p.plank = {secs:act2, kg:st.kg};
      if(!d.p.done.includes('plank')) d.p.done.push('plank'); PT.state = 'idle'; PT.rem = null; try{ navigator.vibrate && navigator.vibrate(30); }catch(e3){} commit(); render(); }
    else if(act==='pundo'){ if(d.p.prevPB) PB = d.p.prevPB; d.p.done = d.p.done.filter(x => x!=='plank'); delete d.p.plank; delete d.p.prevPB; PT.rem = null; commit(); render(); }
    else if(act==='pman'){ PT.manual = !PT.manual; render(); }
    else if(act==='papply'){ const kg = parseInt(rd('#pm-kg'))||0, secs = Math.min(60, Math.max(20, Math.round((parseInt(rd('#pm-s'))||20)/5)*5));
      const idx = Math.max(0, LEVELS.findIndex((l,i) => kg < (LEVELS[i+1] ? LEVELS[i+1].kg : Infinity))), lvl = LEVELS[idx];
      let before = 0; for(let i=0;i<idx;i++) before += Math.round((60-LEVELS[i].s)/5)+1;
      PB = {sessions: before + Math.round((Math.max(lvl.s, secs)-lvl.s)/5), lastTarget:secs, weightKg:kg, lastDate:t}; PT.manual = false; PT.rem = null; commit(); render(); }
  });
  pg.addEventListener('input', e => { const n = e.target.closest && e.target.closest('.cnote'); if(n){ day(todayKey())[n.dataset.k].note = n.value; commit(); } });
  new MutationObserver(() => { if(pg.classList.contains('on')) render(); }).observe(pg, {attributes:true, attributeFilter:['class']});
  // "Corpo" saiu da barra: abre a partir de "Mais" e tem o seu botão de voltar
  const mais = document.getElementById('pg-mais'), corpo = document.getElementById('pg-corpo');
  if(mais){ const bt = document.createElement('button'); bt.type = 'button'; bt.className = 'more-btn more-link'; bt.dataset.go = 'corpo';
    bt.innerHTML = '<span>'+T('Composição corporal','Body composition')+'</span><span aria-hidden="true">›</span>';
    bt.addEventListener('click', () => showTab('corpo')); mais.insertBefore(bt, mais.firstChild); }
  if(corpo){ const bk = document.createElement('button'); bk.type = 'button'; bk.className = 'more-btn'; bk.style.cssText = 'min-height:36px;padding:0 14px;border-radius:12px;font-size:14px;align-self:flex-start;width:auto;margin-bottom:8px';
    bk.textContent = T('‹ Mais','‹ More'); bk.addEventListener('click', () => history.back()); corpo.insertBefore(bk, corpo.firstChild); }
  render();
  window.COACH = {render, setCtx:v => { ctxOverride = v; render(); }, setToday:v => { todayOverride = v; render(); }, reset:() => { LOG = {}; CUSTOM = {}; PB = {sessions:0, weightKg:0, lastTarget:0, lastDate:''}; commit(); render(); }, setTab:v => { tab = v; render(); }};
})();
