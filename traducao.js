// ---------- Idioma: Português (original) / English ----------
// Só traduz texto da interface. Os dados (números, nomes, notas das sessões) ficam como estão.
// O português é a fonte; em inglês, uma camada traduz o que a app desenha (e continua a traduzir o que ela redesenha).
(function(){
  let L = 'pt';
  try{ L = localStorage.getItem('lang') || ''; }catch(e){}
  if(!L){ try{ const m = /(?:^|;)lang=(en|pt)/.exec(window.name||''); if(m) L = m[1]; }catch(e){} }
  if(L !== 'en') L = 'pt';
  // ajuda partilhada para texto novo escrito nos dois idiomas: const {en: EN, t: T} = I18N;
  window.I18N = {en: L==='en', t: (pt,en) => L==='en' ? en : pt};
  const store = v => { try{ localStorage.setItem('lang', v); }catch(e){} try{ window.name = 'lang='+v+';'+(window.name||'').replace(/(?:^|;)lang=(en|pt)/g,''); }catch(e){} };

  // ---------- dicionário ----------
  const EX = { // texto inteiro do nó
    'Hoje':'Today','Semana':'Week','Evolução':'Progress','Jogos':'Matches','Corpo':'Body','Troféus':'Trophies','Mais':'More',
    'Tu':'You','Tipo':'Type','Data':'Date','Dia':'Day','Valor':'Value','Novo':'New','Ouro':'Gold','Prata':'Silver',
    'Estável':'Steady','Treino':'Training','Jogo':'Match','Treinos':'Training','Todas':'All','Tudo':'All','Seleção':'National team',
    'Distância':'Distance','Tempo':'Time','Jogador':'Player','Métrica':'Metric','Estado':'Status','Habitual':'Usual','Bom':'Good',
    'Recuperação':'Recovery','Média':'Average','Em campo':'On the pitch','Sessões':'Sessions','Medalhas':'Medals','Final':'Final',
    'Seg':'Mon','Ter':'Tue','Qua':'Wed','Qui':'Thu','Sex':'Fri','Sáb':'Sat','Dom':'Sun',
    'Defesa':'Fullback','Ponta':'Wing','Abertura':'Fly-half','Centro':'Centre','Abertura · Non 23':'Fly-half · Non 23','Centro · Non 23':'Centre · Non 23',
    'Dist.':'Dist.','Rápida':'Fast','Acel.':'Acc.','Vel.':'Speed','Dist. m':'Dist. m','Rápida m':'Fast m','Km/h':'Km/h',
    'Dist. (m)':'Dist. (m)','Rápida (m)':'Fast (m)','Vel. (km/h)':'Speed (km/h)','Vel. máx':'Top speed','Vel. máx.':'Top speed',
    'Prega (mm)':'Skinfold (mm)','Percentil':'Percentile','Perímetro (cm)':'Girth (cm)','Peso':'Weight','Massa gorda':'Body fat',
    'Tricipital':'Triceps','Subescapular':'Subscapular','Bicipital':'Biceps','Crista ilíaca':'Iliac crest','Supraespinhal':'Supraspinale',
    'Abdominal':'Abdominal','Coxa anterior':'Front thigh','Perna (gémeo)':'Calf','Braço relaxado':'Arm relaxed','Braço contraído':'Arm flexed',
    'Cintura':'Waist','Anca / glúteo':'Hip / glute','Coxa (média)':'Thigh (mid)','Perna':'Calf girth',
    'Sem nota.':'No note.','Mais tarde':'Later','Média dos Backs':'Backs average','Média Backs':'Backs average','Jogo':'Match',
    'Dia pesado':'Heavy day','Dia de jogo':'Match day','Dados incompletos':'Incomplete data','Carga alta':'High load','Carga normal':'Normal load',
    'Mais pesada':'Heaviest','Mais leve':'Lightest','Semana a começar':'Week just starting','Ainda não cumprida':'Not reached yet',
    'Dia normal':'Normal day','Recuperação normal':'Normal recovery','Recuperação completa':'Full recovery','Sem protocolo extra':'No extra protocol',
    'Semana acima do teu habitual':'Week above your usual','Semana abaixo do teu habitual':'Week below your usual','Semana dentro do teu normal':'Week within your normal',
    '▲ Acima':'▲ Above','▼ Abaixo':'▼ Below','● Na média':'● On average','Corpo':'Body',
    '‹ Troféus':'‹ Trophies','Ver troféus ›':'See trophies ›','nº':'no.','média':'average','Outros':'Others',
    'Número 1 dos 9':'Number 1 of the 9s','Meta de velocidade':'Speed goal','Quatro de quatro':'Four out of four','Carga certa':'Right load',
    'Idioma':'Language','Velocidade máx.':'Top speed','Também nesse dia:':'Also that day:','Ver tabela completa por jogador':'See the full table by player'
  };
  const MONTH = {janeiro:'January',fevereiro:'February','março':'March',abril:'April',maio:'May',junho:'June',julho:'July',agosto:'August',setembro:'September',outubro:'October',novembro:'November',dezembro:'December'};
  const DOW = {'segunda-feira':'Monday','terça-feira':'Tuesday','quarta-feira':'Wednesday','quinta-feira':'Thursday','sexta-feira':'Friday','sábado':'Saturday','domingo':'Sunday','segunda':'Monday','terça':'Tuesday','quarta':'Wednesday','quinta':'Thursday','sexta':'Friday'};
  const SMON = {jan:'Jan',fev:'Feb',mar:'Mar',abr:'Apr',mai:'May',jun:'Jun',jul:'Jul',ago:'Aug',set:'Sep',out:'Oct',nov:'Nov',dez:'Dec'};
  const dw = s => DOW[s] || s;
  const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  const B = '(?<![\\p{L}\\d])', E = '(?![\\p{L}\\d])';
  const plural = (n,one,many) => (+n===1 ? one : many);

  // regras com captura (as primeiras a correr)
  const RX = [
    [/(\d+) de (janeiro|fevereiro|março|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro)/g, (m,d,mo)=>d+' '+MONTH[mo]],
    [/\b(\d{1,2}) (jan|fev|mar|abr|mai|jun|jul|ago|set|out|nov|dez)\b/g, (m,d,mo)=>d+' '+SMON[mo]],
    [/só até à? (\S+?)-?(feira)? \(segunda a (\S+?)-?(feira)?\)/g, (m,a,f1,b)=>'only up to '+dw(a.replace(/-$/,''))+' (Monday to '+dw(b.replace(/-$/,''))+')'],
    [/Semana anterior até (\S+?)(?=:)/g, (m,w)=>'Previous week up to '+dw(w)],
    [/Medição de (\S+), (\d+ de \S+)/, (m,w,d)=>'Measurement of '+dw(w)+', '+d],
    [/^(Seg|Ter|Qua|Qui|Sex|Sáb|Dom) (\d\d\/\d\d)$/, (m,w,d)=>({Seg:'Mon',Ter:'Tue',Qua:'Wed',Qui:'Thu',Sex:'Fri','Sáb':'Sat',Dom:'Sun'})[w]+' '+d],
    [/Acima do grupo nas (\d+) métricas/, (m,n)=>'Above the group on '+n+' metrics'],
    [/Acima da tua média nas (\d+) métricas/, (m,n)=>'Above your average on '+n+' metrics'],
    [/^(Na média|Acima|Abaixo) ([+-]?\d+%)$/, (m,w,p)=>({'Na média':'On average',Acima:'Above',Abaixo:'Below'})[w]+' '+p],
    [/^Últimas (\d+)$/, (m,n)=>'Last '+n],
    [/Últimas (\d+) sessões · tracejado: dia pesado \((\d+) m\) · vermelho: jogo/, (m,n,h)=>'Last '+n+' sessions · dashed: heavy day ('+h+' m) · red: match'],
    [/Atualizado a (\S+) · (\d+) sessões/, (m,d,n)=>'Updated '+d+' · '+n+' sessions'],
    [/Última sessão · (\S+) \((ontem|hoje)\)/, (m,d,w)=>'Latest session · '+d+' ('+(w==='ontem'?'yesterday':'today')+')'],
    [/Última sessão · (.+?) · (Treino|Jogo.*)$/, (m,d,t)=>'Latest session · '+d+' · '+t],
    [/^Sessão · (.+?) · (Treino|Jogo.*)$/, (m,d,t)=>'Session · '+d+' · '+t],
    [/Boa sessão: acima da média dos (.+?) em (\d+) de (\d+) métricas\./, (m,g,a,b)=>'Good session: above the '+g+' average on '+a+' of '+b+' metrics.'],
    [/Muito bom: acima da média dos (.+?) em (\d+) de (\d+) métricas\./, (m,g,a,b)=>'Very good: above the '+g+' average on '+a+' of '+b+' metrics.'],
    [/Sessão leve: abaixo da média dos (.+?) em (\d+) de (\d+) métricas\./, (m,g,a,b)=>'Light session: below the '+g+' average on '+a+' of '+b+' metrics.'],
    [/Sessão normal: perto da média dos (.+?)\./, (m,g)=>'Normal session: close to the '+g+' average.'],
    [/Jogaste (só )?(\d+) min, por isso os totais ficam abaixo da média dos Backs\./, (m,s,n)=>'You played '+(s?'only ':'')+n+' min, so the totals are below the Backs average.'],
    [/Jogaste (\d+) min\./, (m,n)=>'You played '+n+' min.'],
    [/Média dos Non (\d+)/, (m,n)=>'Non '+n+' average'],
    [/Média Non (\d+)/, (m,n)=>'Non '+n+' average'],
    [/Média (\d+\/\d+) \(jogo\)/, (m,g)=>g+' average (match)'],
    [/Média (\d+\/\d+) da equipa de jogo/, (m,g)=>g+' average, match squad'],
    [/Média (\d+\/\d+)(?= )/, (m,g)=>g+' average'],
    [/Média (\d+\/\d+)$/, (m,g)=>g+' average'],
    [/Outros (\d+) \(Marques, Camacho\)/, (m,n)=>'Other '+n+'s (Marques, Camacho)'],
    [/Outros (\d+): média de (\d+) scrum-halves\. (\d+\/\d+): média de (\d+) backs da equipa de jogo; a percentagem é a tua diferença para eles\. Os valores deles incluem o jogo\./, (m,a,b,c,d)=>'Other '+a+'s: average of '+b+' scrum-halves. '+c+': average of '+d+' backs in the match squad; the percentage is your difference to them. Their values include the match.'],
    [/^Outros (\d+)$/, (m,n)=>'Other '+n+'s'],
    [/Restantes (\d+\/\d+)/, (m,g)=>'Other '+g],
    [/^Semana (\d+) · (\S+) – (\S+) · atual$/, (m,w,a,b)=>'Week '+w+' · '+a+' – '+b+' · current'],
    [/^Semana (\d+) · (\S+) – (\S+)$/, (m,w,a,b)=>'Week '+w+' · '+a+' – '+b],
    [/^Semana (\d+) · até (\S+)$/, (m,w,d)=>'Week '+w+' · up to '+dw(d)],
    [/^Semana (\d+) · completa$/, (m,w)=>'Week '+w+' · complete'],
    [/^Semana (\d+) · semana completa$/, (m,w)=>'Week '+w+' · full week'],
    [/^Semana (\d+) · (\d\d\/\d\d)$/, (m,w,d)=>'Week '+w+' · '+d],
    [/Como me comparo · semana (\d+) \(final\)/, (m,w)=>'How I compare · week '+w+' (final)'],
    [/Como me comparo · semana (\d+)/, (m,w)=>'How I compare · week '+w],
    [/Primeiro dos (\d+) scrum-halves em (\d+) de (\d+) métricas\./, (m,a,b,c)=>'First of the '+a+' scrum-halves on '+b+' of '+c+' metrics.'],
    [/Entre os (\d+) scrum-halves: (#\d+) em (\d+) de (\d+)/, (m,a,r,b,c)=>'Among the '+a+' scrum-halves: '+r+' on '+b+' of '+c],
    [/^# ?(\d+) nos (\d+)$/, null],
    [/^\/(\d+) nos (\d+)$/, (m,a,b)=>'/'+a+' of the '+b+'s'],
    [/^\/(\d+) nos (\d+\/\d+)$/, (m,a,b)=>'/'+a+' of the '+b+'s'],
    [/^(\d+) sessões$/, (m,n)=>n+' sessions'],
    [/^(\d+) sessão$/, (m,n)=>n+' session'],
    [/(\d+) sessões · a comparar com a semana (\d+), só até ao mesmo dia/, (m,n,w)=>n+' sessions · compared with week '+w+', only up to the same day'],
    [/(\d+) sessões · há treinos sem GPS, não comparo/, (m,n)=>n+' sessions · some training without GPS, no comparison'],
    [/(\d+) sessão · há treinos sem GPS, não comparo/, (m,n)=>n+' session · some training without GPS, no comparison'],
    [/(\d+) sess(?:ão|ões) · (\d+) na semana (\d+)\. Com número de sessões diferente, os totais não são diretamente comparáveis\./, (m,a,b,w)=>a+' '+plural(a,'session','sessions')+' · '+b+' in week '+w+'. With a different number of sessions, totals are not directly comparable.'],
    [/(\d+) sess(?:ão|ões) · (\d+) na semana (\d+)/, (m,a,b,w)=>a+' '+plural(a,'session','sessions')+' · '+b+' in week '+w],
    [/(\d+) sess(?:ão|ões) esta semana, (\d+) na anterior\./g, (m,a,b)=>a+' '+plural(a,'session','sessions')+' this week, '+b+' in the previous one.'],
    [/Ainda só (\d+) sessão com GPS esta semana/, (m,n)=>'Only '+n+' GPS session so far this week'],
    [/Comparação justa: as duas semanas contadas /, ()=>'Fair comparison: both weeks counted '],
    [/só até à? (\S+?) \(segunda a (\S+?)\)\./, (m,a,b)=>'only up to '+dw(a.replace(/-$/,''))+' (Monday to '+dw(b)+').'],
    [/Com número de sessões diferente, os totais não são diretamente comparáveis\./g, ()=>'With a different number of sessions, totals are not directly comparable.'],
    [/A semana atual só conta até à (\S+)\. Comparada com a semana (\d+), também só de segunda a (\S+)\./, (m,d,w,e)=>'The current week only counts up to '+dw(d)+'. Compared with week '+w+', also only Monday to '+dw(e)+'.'],
    [/Comparada com a semana (\d+), também só completa\./, (m,w)=>'Compared with week '+w+', also complete only.'],
    [/^Semana (\d+): (.+)$/, (m,w,r)=>'Week '+w+': '+r],
    [/(\d+) dias até (\S+) vs\. média semanal das últimas (\d+) semanas/, (m,a,d,b)=>a+' days up to '+d+' vs. weekly average of the last '+b+' weeks'],
    [/Distância nos últimos (\d+) dias/, (m,n)=>'Distance in the last '+n+' days'],
    [/Teu habitual: (.+?) km\/semana/, (m,v)=>'Your usual: '+v+' km/week'],
    [/Dias pesados \(>(\d+) m\)/, (m,n)=>'Heavy days (>'+n+' m)'],
    [/Meta (\d+%): /, (m,n)=>'Goal '+n+': '],
    [/Último sprint ≥(\d+%)/, (m,n)=>'Last sprint ≥'+n],
    [/Zona segura · /, ()=>'Safe zone · '],
    [/Carga desta semana vs\. o teu habitual: (\S+) \((\S+) a (\S+) é a zona segura\)/, (m,v,a,b)=>'This week\'s load vs. your usual: '+v+' ('+a+' to '+b+' is the safe zone)'],
    [/Como ler: compara a carga dos últimos (\d+) dias com o que costumas fazer\. Entre (\S+) e (\S+) é a zona segura; acima de (\S+) o risco de lesão sobe\. É um guia, não uma regra: manda o que sentes e o que o teu S&C decidir\./, (m,a,b,c,d)=>'How to read it: compares the load of the last '+a+' days with what you usually do. Between '+b+' and '+c+' is the safe zone; above '+d+' injury risk goes up. It is a guide, not a rule: what you feel and what your S&C decides comes first.'],
    [/Abaixo de (\d+) m/, (m,n)=>'Below '+n+' m'],
    [/Entre (\d+) e (\d+) m/, (m,a,b)=>'Between '+a+' and '+b+' m'],
    [/Mais de ~(\d+) m/, (m,n)=>'More than ~'+n+' m'],
    [/Metros acima de (\d+) km\/h\.?/, (m,n)=>'Metres above '+n+' km/h.'],
    [/Corrida rápida \(>(\d+) km\/h\)/, (m,n)=>'Fast running (>'+n+' km/h)'],
    [/m >(\d+) km\/h/, (m,n)=>'m >'+n+' km/h'],
    [/^(\d+) pontos · (\d+) medalhas novas?$/, (m,a,b)=>a+' points · '+b+' new '+plural(b,'medal','medals')],
    [/^(\d+) pontos · faltam (\d+) para Elite$/, (m,a,b)=>a+' points · '+b+' to go for Elite'],
    [/Meta: chegar a (\S+) do máximo \((\S+) km\/h\) pelo menos uma vez por semana\. A marca verde é a meta\.( Faltam (\S+) km\/h\.)?/, (m,p,v,x,f)=>'Goal: reach '+p+' of your max ('+v+' km/h) at least once a week. The green mark is the goal.'+(f?' '+f+' km/h to go.':'')],
    [/\(([\d,.]+)% do teu máximo\)/, (m,p)=>'('+p+'% of your max)'],
    [/Estás a evoluir\?/, ()=>'Are you progressing?'],
    [/Semanas (\d+) a (\d+) vs\. (\d+) a (\d+) · só treinos de equipa completos \((\d+) vs\. (\d+)\)/, (m,a,b,c,d,e,f)=>'Weeks '+a+' to '+b+' vs. '+c+' to '+d+' · full team sessions only ('+e+' vs. '+f+')'],
    [/vs\. (\d+) semanas antes/, (m,n)=>'vs. '+n+' weeks before'],
    [/vs\. semana anterior/, ()=>'vs. previous week'],
    [/Subida ou descida só conta a partir de (\d+)% \((\d+)% na velocidade\)\. Nas duas janelas eras de equipas diferentes \(Lusitanos antes, Lusitanos \+ Seleção agora\): lê como indicação\./, (m,a,b)=>'A rise or fall only counts from '+a+'% ('+b+'% for speed). In the two windows you were with different teams (Lusitanos before, Lusitanos + National team now): read it as an indication.'],
    [/^(\d+) jogos na época$/, (m,n)=>n+' matches this season'],
    [/(\S+) m\/min rápidos no melhor/, (m,v)=>v+' fast m/min in the best'],
    [/Todos os jogos \((\d+)\)/, (m,n)=>'All matches ('+n+')'],
    [/^(\d\d\/\d\d) · (\d+) min em campo$/, (m,d,n)=>d+' · '+n+' min on the pitch'],
    [/Corrida rápida: (\S+) m\/min/, (m,v)=>'Fast running: '+v+' m/min'],
    [/^Jogo (\d\d\/\d\d) vs (\S+) · formações de jogo$/, (m,d,o)=>'Match '+d+' vs '+o+' · match squad'],
    [/Tu não estavas na lista de (\d+)/, (m,n)=>'You were not in the '+n+' list'],
    [/Mostrar só as (\d+) últimas/, (m,n)=>'Show only the last '+n],
    [/^Ver todas as sessões \((\d+)\)$/, (m,n)=>'See all sessions ('+n+')'],
    [/^Medição de (\d\d\/\d\d)$/, (m,d)=>'Measurement of '+d],
    [/Medição de (\S+), (\d+ de \S+) · Lusitanos · protocolo ISAK/, (m,w,d)=>'Measurement of '+dw(w)+', '+d+' · Lusitanos · ISAK protocol'],
    [/Bom \(meta <(\d+)\)/, (m,n)=>'Good (goal <'+n+')'],
    [/Soma de (\d+) pregas \(Σ(\d+)\)/, (m,a,b)=>'Sum of '+a+' skinfolds (Σ'+b+')'],
    [/Σ(\d+) pregas/, (m,n)=>'Σ'+n+' skinfolds'],
    [/Histórico \((\d+) medição\)/, (m,n)=>'History ('+n+' '+plural(n,'measurement','measurements')+')'],
    [/Percentis face a só (\d+) atletas da tua posição \(n=(\d+)\): usa-os como indicação, não como regra\./, (m,a,b)=>'Percentiles against only '+a+' athletes in your position (n='+b+'): use them as an indication, not a rule.'],
    [/Verde: bom para (\S+)s \(<(\d+) mm\)\. Amarelo: aceitável \(até (\d+)\)\. Vermelho: a melhorar\. O relatório indica, face a uma medição anterior que não está na app: (\S+) mm\./, (m,g,a,b,d)=>'Green: good for '+g+'s (<'+a+' mm). Yellow: acceptable (up to '+b+'). Red: to improve. The report indicates, against an earlier measurement that is not in the app: '+d+' mm.'],
    [/A faixa verde é a referência do grupo \((.+?)\)\. Estás abaixo: para a gordura que tens, o teu peso é baixo\. Objetivo: ganhar massa magra\./, (m,r)=>'The green band is the group reference ('+r+'). You are below it: for the fat you carry, your weight is low. Goal: gain lean mass.'],
    [/Ganhar massa magra sem subir o Σ(\d+) acima de ~(\d+) mm: treino de força com energia e proteína suficientes \(fala com o teu nutricionista e o S&C\), e carb-up de (.+?) g nos dias pesados e de jogo\./, (m,a,b,c)=>'Gain lean mass without pushing Σ'+a+' above ~'+b+' mm: strength training with enough energy and protein (talk to your nutritionist and S&C), and a carb-up of '+c+' g on heavy and match days.'],
    [/Massa gorda, massa magra e massa muscular são estimadas por equações \((.+?)\) e em atletas de rugby de elite não são exatas em valor absoluto: lê-as como tendência\. Fonte: relatório de composição corporal \(ISAK\)\./, (m,e)=>'Body fat, lean mass and muscle mass are estimated by equations ('+e+') and are not exact in absolute value for elite rugby athletes: read them as a trend. Source: body composition report (ISAK).'],
    [/Massa gorda \(estim\.\)/, ()=>'Body fat (est.)'],
    [/LMI \(massa magra\)/, ()=>'LMI (lean mass)'],
    [/Índice de massa magra \(LMI\)/, ()=>'Lean mass index (LMI)'],
    [/Abaixo da referência/, ()=>'Below the reference'],
    [/Desde (\S+) · (\d+) semanas com GPS/, (m,d,n)=>'Since '+d+' · '+n+' weeks with GPS'],
    [/semanas seguidas com a meta de velocidade/, ()=>'weeks in a row hitting the speed goal'],
    [/semanas seguidas com a carga certa/, ()=>'weeks in a row with the right load'],
    [/semanas seguidas como nº (\d+) dos (\d+)/, (m,a,b)=>'weeks in a row as no. '+a+' of the '+b+'s'],
    [/^semanas seguidas$/, ()=>'weeks in a row'], [/^semana seguida$/, ()=>'week in a row'],
    [/(\d+) vezes conquistada/, (m,n)=>'won '+n+' times'], [/(\d+) vez conquistada/, (m,n)=>'won '+n+' time'], [/Ainda por conquistar/, ()=>'Not won yet'],
    [/a tua melhor série foi (\d+)/, (m,n)=>'your best streak was '+n],
    [/^Medalhas \((\d+)\)$/, (m,n)=>'Medals ('+n+')'],
    [/^(\d+)× · (Ouro|Prata|Bronze)$/, (m,n,t)=>n+'× · '+({Ouro:'Gold',Prata:'Silver',Bronze:'Bronze'})[t]],
    [/Chegar a (\S+) do teu máximo \((\S+) km\/h\) numa semana\. Prata: (\S+)\. Ouro: novo recorde da época\./, (m,a,b,c)=>'Reach '+a+' of your max ('+b+' km/h) in a week. Silver: '+c+'. Gold: new season record.'],
    [/Numa sessão, acima em distância, corrida rápida, acelerações e velocidade\. Na Seleção, contra a média do grupo; nos Lusitanos, contra a tua própria média\./, ()=>'In one session, above on distance, fast running, accelerations and speed. In the National team, against the group average; at Lusitanos, against your own average.'],
    [/Primeiro entre os scrum-halves em pelo menos (\d+) das (\d+) métricas da semana\./, (m,a,b)=>'First among the scrum-halves in at least '+a+' of the week\'s '+b+' metrics.'],
    [/Semana fechada com a carga entre (\S+) e (\S+) do teu habitual \(a zona segura\)\./, (m,a,b)=>'Week closed with a load between '+a+' and '+b+' of your usual (the safe zone).'],
    [/Última: (\S+) · (\S+) km\/h \((\d+%)\)/, (m,d,v,p)=>'Latest: '+d+' · '+v+' km/h ('+p+')'],
    [/Última: (\S+) · Acima do grupo nas (\d+) métricas/, (m,d,n)=>'Latest: '+d+' · Above the group on '+n+' metrics'],
    [/Última: (\S+) · Acima da tua média nas (\d+) métricas/, (m,d,n)=>'Latest: '+d+' · Above your average on '+n+' metrics'],
    [/Última: (\S+) · (#\d+) dos (\d+) em (\d+) de (\d+)/, (m,d,r,a,b,c)=>'Latest: '+d+' · '+r+' of the '+a+'s on '+b+' of '+c],
    [/Última: (\S+) · Rácio (\S+)/, (m,d,r)=>'Latest: '+d+' · Ratio '+r],
    [/^(#\d+) dos (\d+) em (\d+) de (\d+)$/, (m,r,a,b,c)=>r+' of the '+a+'s on '+b+' of '+c],
    [/(\d\d\/\d\d) · Número (\d+) dos (\d+)/, (m,d,a,b)=>d+' · Number '+a+' of the '+b+'s'],
    [/(\d\d\/\d\d) · Meta de velocidade \((\w+)\)/, (m,d,t)=>d+' · Speed goal ('+({Ouro:'Gold',Prata:'Silver',Bronze:'Bronze'})[t]||t+')'],
    [/(\d\d\/\d\d) · Carga certa/, (m,d)=>d+' · Right load'],
    [/(\d\d\/\d\d) · Quatro de quatro/, (m,d)=>d+' · Four out of four'],
    [/^Número (\d+) dos (\d+)$/, (m,a,b)=>'Number '+a+' of the '+b+'s'],
    [/^Rácio (\S+)$/, (m,v)=>'Ratio '+v],
    [/^IMC (\S+)$/, (m,v)=>'BMI '+v],
    [/^nível (Ouro|Prata|Bronze|Elite)$/, (m,t)=>'level '+({Ouro:'Gold',Prata:'Silver',Bronze:'Bronze',Elite:'Elite'})[t]],
    [/Non (\d+) no dia do jogo vs (\S+)\. \(não estavas nos (\d+)\)/, null],
    [/(Non \d+) no dia do jogo vs (\S+) \(não estavas nos (\d+)\)\. Grupo de (\d+) jogadores \(avançados \+ backs; as médias são do grupo (Non \d+), não dos Backs\), tempo de campo do grupo (\S+)\. Distância (\S+)m \(exata; média (\S+)\), HSR (\S+)m \((#\d+) de (\d+); média (\S+)\), (\d+) acelerações \((#\d+); média (\S+)\), (\d+) sprints, velocidade máx\. (\S+) km\/h \((\S+)% vs grupo (\S+)%\)\./, (m,g,o,n,p,gp,t,d,da,h,r,tot,ha,ac,ar,aa,sp,v,vp,vg)=>g+' on the match day vs '+o+' (you were not in the '+n+'). Group of '+p+' players (forwards + backs; averages are the '+gp+' group, not the Backs), group field time '+t+'. Distance '+d+'m (exact; average '+da+'), HSR '+h+'m ('+r+' of '+tot+'; average '+ha+'), '+ac+' accelerations ('+ar+'; average '+aa+'), '+sp+' sprints, top speed '+v+' km/h ('+vp+'% vs group '+vg+'%).'],
    [/Metros por minuto em campo · vermelho = corrida rápida \(>(\d+) km\/h\)/, (m,n)=>'Metres per minute on the pitch · red = fast running (>'+n+' km/h)'],
    [/Mais tarde, no mesmo dia, houve um Team Run \(aquecimento\/corrida leve, (\S+) em campo\): (\S+) m \((#\d+) de (\d+) no grupo; média (\S+) m\), (\S+) m acima de (\d+) km\/h \((#\d+); média (\S+)\), (\d+) acelerações \((#\d+); média (\S+)\), velocidade máxima (\S+) km\/h \((\S+)%, (#\d+); média (\S+)%\)\. Os números em cima são a soma das duas sessões \(médias do grupo também somadas\)\. Dia leve\./, (m,t,d,r,n,da,h,hs,hr,ha,ac,ar,aa,v,vp,vr,vg)=>'Later the same day there was a Team Run (warm-up / easy run, '+t+' on the pitch): '+d+' m ('+r+' of '+n+' in the group; average '+da+' m), '+h+' m above '+hs+' km/h ('+hr+'; average '+ha+'), '+ac+' accelerations ('+ar+'; average '+aa+'), top speed '+v+' km/h ('+vp+'%, '+vr+'; average '+vg+'%). The numbers above are the sum of both sessions (group averages summed too). Light day.'],
    [/Dia com (\d+) sessões juntas\./, (m,n)=>'Day with '+n+' sessions combined.'],
    [/Os números são do dia todo, por isso compara só com a média dos (.+?) e não com as tuas sessões individuais\./, (m,g)=>'The numbers are for the whole day, so compare only with the '+g+' average and not with your individual sessions.'],
    [/Dia com (\d+) sessões somadas \(/, (m,n)=>'Day with '+n+' sessions summed ('],
    [/Sessão encurtada \(saíste mais cedo\), por isso a distância ficou baixa\. Ficaste acima da média dos Backs em corrida rápida e velocidade máxima\./, ()=>'Shortened session (you left early), so distance was low. You were above the Backs average in fast running and top speed.'],
    [/Comparação justa do jogo: por minuto em campo \((\d+) min\)\. Os Backs jogam tempos diferentes, por isso aqui comparas só contigo\./, (m,n)=>'Fair match comparison: per minute on the pitch ('+n+' min). Backs play different amounts of time, so here you only compare with yourself.'],
    [/Média dos teus jogos anteriores: (\S+)/, (m,v)=>'Average of your previous matches: '+v],
    [/\* Média dos teus (\d+) jogos anteriores\. A percentagem mostra se estás acima ou abaixo de ti\./, (m,n)=>'* Average of your previous '+n+' matches. The percentage shows whether you are above or below yourself.'],
    [/\* Média das tuas (\d+) sessões de treino anteriores\. A percentagem mostra se estás acima ou abaixo de ti\./, (m,n)=>'* Average of your previous '+n+' training sessions. The percentage shows whether you are above or below yourself.'],
    [/Média por treino \(sem jogos, dias de (\d+) sessões nem sessões encurtadas\)\. Cada equipa tem a sua média de grupo, por isso também comparo contigo face ao grupo\./, (m,n)=>'Average per training (no matches, no '+n+'-session days or shortened sessions). Each team has its own group average, so I also compare you against the group.'],
    [/(\d+) (km|m)$/, null],
    [/Semana (\d+) fechada: o relatório semanal sai antes do jogo e já não houve mais treinos de equipa\. Os teus números são de (.+?) \((\d+) sessões\); a sessão Non (\d+) de (\S+) \((.+?)\) fica de fora, como no relatório\. Os (\d+\/\d+) incluem a semana toda e o jogo\./, (m,w,d,n,nn,dd,x,g)=>'Week '+w+' closed: the weekly report comes out before the match and there were no more team sessions. Your numbers are from '+d.replace(/ e /,' and ')+' ('+n+' sessions); the Non '+nn+' session of '+dd+' ('+x+') is left out, as in the report. The '+g+' include the whole week and the match.'],
    [/Semana (\d+) fechada com os relatórios finais \(Backs em jogo, Non (\d+) e jogo\)\. Os teus números são de (.+?) \((\d+) sessões\); os dos (\d+\/\d+) incluem a semana toda e o jogo, por isso a distância não é diretamente comparável\./, (m,w,nn,d,n,g)=>'Week '+w+' closed with the final reports (Backs in the match, Non '+nn+' and match). Your numbers are from '+d.replace(/, | e /g,(x)=>x===' e '?' and ':', ')+' ('+n+' sessions); the '+g+' include the whole week and the match, so distance is not directly comparable.'],
    [/Comparação com os outros scrum-halves e com os (\S+) só existe para as semanas (\d+) e (\d+), a partir dos relatórios semanais\. Escolhe uma delas acima para ver\./, (m,g,a,b)=>'Comparison with the other scrum-halves and with the '+g+' only exists for weeks '+a+' and '+b+', from the weekly reports. Pick one above to see it.'],
    [/Comparação com os outros scrum-halves \((\d+)\) e com os três-quartos, a partir dos relatórios semanais/, (m,n)=>'Comparison with the other scrum-halves ('+n+') and with the three-quarters, from the weekly reports'],
    [/Semana: tu vs\. a tua posição vs\. os (\S+)/, (m,g)=>'Week: you vs. your position vs. the '+g],
    [/Sem sessões com este filtro \((.+?)\)\. Experimenta outra combinação\./, (m,f)=>'No sessions with this filter ('+f.replace('Seleção','National team').replace('jogos','matches').replace('treinos','training')+'). Try another combination.'],
    [/Percentil(?=\s|$)/, ()=>'Percentile'],
    [/(?<![\p{L}])(segunda-feira|terça-feira|quarta-feira|quinta-feira|sexta-feira|sábado|domingo)(?![\p{L}])/gu, (m,w)=>dw(w)]
  ].filter(r=>r[1]);

  // frases (substituição por palavra inteira, mais longas primeiro)
  const PH = [
    ['Seleção de Portugal · Formação de jogo (9) · Controlo de carga','Portugal national team · Match formation (9) · Load monitoring'],
    ['Refeições habituais, sem carb-up extra.','Usual meals, no extra carb-up.'],
    ['Recuperação normal e refeições habituais. Sem carb-up extra.','Normal recovery and usual meals. No extra carb-up.'],
    ['Protocolo de recuperação completo e carb-up de','Full recovery protocol and a carb-up of'],
    ['de hidratos de carbono no teu peso','of carbohydrate for your weight'],
    ['Sessão: Carga normal','Session: Normal load'],['Semana: Habitual','Week: Usual'],
    ['Vel. máx. · meta ✓','Top speed · goal ✓'],
    ['Ver a semana completa','See the full week'],['Sessão em detalhe e outras sessões','Session in detail and other sessions'],
    ['Ver sessão: escolher','View session: choose'],['Ver semana: escolher','View week: choose'],
    ['Ver sessão','View session'],['Ver semana','View week'],['Ver a semana','See the week'],['Ver a evolução','See progress'],['Ver troféus','See trophies'],
    ['Esta semana vs. último mês','This week vs. last month'],['Esta semana vs. a anterior · semana','This week vs. the previous one · week'],
    ['Carga da sessão','Session load'],['Carga e recuperação: detalhe','Load and recovery: detail'],['Carga e recuperação','Load and recovery'],
    ['O que fazer','What to do'],
    ['Ver detalhe: números, comparações e meta','See detail: numbers, comparisons and goal'],
    ['Tua média','Your average'],['Metros corridos na sessão.','Metres run in the session.'],['Metros corridos','Metres run'],['Arranques fortes na sessão.','Hard accelerations in the session.'],['Arranques fortes','Hard accelerations'],
    ['Velocidade máxima','Top speed'],['Ponta mais alta','Peak'],
    ['Meta de velocidade da semana','Speed goal of the week'],['✓ Meta cumprida','✓ Goal reached'],['Meta de velocidade','Speed goal'],
    ['Distância total','Total distance'],['Velocidade mais alta','Highest speed'],['Corrida rápida (média)','Fast running (average)'],['Distância (média)','Distance (average)'],['Acelerações (média)','Accelerations (average)'],['Velocidade máx. (melhor)','Top speed (best)'],
    ['Corrida rápida','Fast running'],['Acelerações','Accelerations'],['Distância (jogo)','Distance (match)'],['Distância por dia (km) · vermelho: jogo','Distance per day (km) · red: match'],['Distância por dia (km)','Distance per day (km)'],['Metros por dia · vermelho = jogo','Metres per day · red = match'],
    ['Detalhe da semana: números e dia a dia','Week detail: numbers and day by day'],['Dia a dia','Day by day'],['A tua semana','Your week'],
    ['Esta semana ou a anterior tiveram treinos sem GPS (Agronomia), por isso não comparo as semanas.','This week or the previous one had training without GPS (Agronomia), so I do not compare the weeks.'],
    ['Esta semana ou a anterior tiveram treinos sem GPS (Agronomia), por isso não pondero a comparação.','This week or the previous one had training without GPS (Agronomia), so I do not weigh the comparison.'],
    ['Treinos da semana sem GPS (Agronomia)','Training this week without GPS (Agronomia)'],
    ['Carga dentro do que o teu corpo está habituado. Atenção: houve treinos sem GPS (Agronomia), por isso o valor pode estar subestimado.','Load within what your body is used to. Note: there was training without GPS (Agronomia), so the value may be underestimated.'],
    ['Sem jogos nesta janela','No matches in this window'],['Velocidade máx. da semana','Top speed of the week'],['Estado','Status'],
    ['Distância (m)','Distance (m)'],['Corrida rápida (m)','Fast running (m)'],['Vel. máxima (km/h)','Top speed (km/h)'],['Treino médio','Average training'],['Treinos contados','Training counted'],['Lus vs. Sel','Lus vs. Nat'],
    ['Seleção vs. Lusitanos','National team vs. Lusitanos'],['Tu vs. a média do grupo','You vs. the group average'],['(o mesmo treino, comparado com os colegas)','(the same training, compared with teammates)'],
    ['Equipa e grupo: Seleção vs. Lusitanos, tu vs. a média','Team and group: National team vs. Lusitanos, you vs. the average'],
    ['As mesmas 4 métricas, sessão a sessão','The same 4 metrics, session by session'],['Gráficos completos e filtros','Full charts and filters'],
    ['Todas as equipas','All teams'],['Média dos Backs','Backs average'],['Máximo pessoal','Personal max'],['Meta 95%','Goal 95%'],
    ['km/h. Tracejado: máximo pessoal (~33,4). Linha verde: meta semanal de 95% (31,7).','km/h. Dashed: personal max (~33.4). Green line: weekly goal of 95% (31.7).'],
    ['Distância por minuto em campo: permite comparar jogos em que jogaste tempos diferentes','Distance per minute on the pitch: lets you compare matches where you played different amounts of time'],
    ['Intensidade = metros por minuto em campo','Intensity = metres per minute on the pitch'],['Intensidade por jogo','Intensity per match'],['Metros por minuto em cada jogo','Metres per minute in each match'],
    ['Melhor jogo','Best match'],['dos teus jogos','of your matches'],['vs jogos anteriores:','vs previous matches:'],['Média','Average'],
    ['Composição corporal','Body composition'],['Pregas, peso e massa magra. Volta aqui depois de cada medição.','Skinfolds, weight and lean mass. Come back here after each measurement.'],
    ['Lusitanos · protocolo ISAK','Lusitanos · ISAK protocol'],['Massa gorda','Body fat'],['Ver pregas e perímetros','See skinfolds and girths'],
    ['O teu nível','Your level'],['A tua época em números','Your season in numbers'],['Mais recentes','Most recent'],
    ['Contam todas as sessões: na Seleção comparas com o grupo, nos Lusitanos contigo próprio. Semanas sem GPS não quebram as séries. Não há medalhas por correr mais: só pelo que interessa.','All sessions count: with the National team you compare with the group, at Lusitanos with yourself. Weeks without GPS do not break streaks. There are no medals for running more: only for what matters.'],
    ['Sessões por semana','Sessions per week'],['Todas as sessões','All sessions'],['Toca numa linha para ver a nota.','Tap a row to see the note.'],['Ver todas as sessões','See all sessions'],
    ['Glossário','Glossary'],['Corrida rápida:','Fast running:'],['Aceleração:','Acceleration:'],['Média dos Backs:','Backs average:'],['Dia pesado:','Heavy day:'],['Carga vs. habitual:','Load vs. usual:'],
    ['metros percorridos acima de 18 km/h.','metres covered above 18 km/h.'],['arranque acima de 2,5 m/s².','a start above 2.5 m/s².'],['média da tua linha (Backs) na mesma sessão.','average of your line (Backs) in the same session.'],
    ['mais de ~3500 m. Os jogos têm sempre recuperação completa e carb-up.','more than ~3500 m. Matches always get full recovery and a carb-up.'],
    ['jogadores fora dos 23 convocados para o jogo; os teus treinos nesse dia comparam-se com esse grupo.','players outside the 23 called up for the match; your training that day is compared with that group.'],
    ['os três-quartos, ou seja, os backs da equipa de jogo (tudo menos avançados e scrum-halves).','the three-quarters, i.e. the backs of the match squad (everything except forwards and scrum-halves).'],
    ['soma de 8 pregas de gordura (mm). Quanto mais baixo, menos gordura; meta abaixo de 78 mm.','sum of 8 fat skinfolds (mm). The lower, the less fat; goal below 78 mm.'],
    ['índice de massa magra: quanto músculo tens para a tua altura. Referência do grupo: 54,8 ± 4,0.','lean mass index: how much muscle you carry for your height. Group reference: 54.8 ± 4.0.'],
    ['protocolo internacional de medição das pregas e perímetros.','international protocol for measuring skinfolds and girths.'],
    ['a tua corrida dos últimos 7 dias dividida pela média semanal das últimas 4 semanas. Entre 0,8 e 1,3 é a zona segura.','your running over the last 7 days divided by the weekly average of the last 4 weeks. Between 0.8 and 1.3 is the safe zone.'],
    ['valor aproximado (lido de um gráfico do relatório).','approximate value (read from a chart in the report).'],
    ['Controlo de carga · GPS','Load monitoring · GPS'],
    ['Tricipital','Triceps'],['Sessão:','Session:'],['Sessão','Session'],['Na média','On average'],['Acima','Above'],['Abaixo','Below'],['Medição de','Measurement of'],
    ['Dia com 2 sessões somadas','Day with 2 sessions summed'],['Dia com','Day with'],
    ['Navegação','Navigation'],['Período','Period'],['Tipo de sessão','Session type'],['Equipa','Team'],
    ['Distância por sessão','Distance per session'],['Corrida rápida por sessão','Fast running per session'],['Acelerações por sessão','Accelerations per session'],['Velocidade máxima por sessão','Top speed per session'],
    ['Abrir','Open'],['Voltar aos troféus','Back to trophies'],['Distância das últimas','Distance of the last'],
    ['Metros por minuto em campo','Metres per minute on the pitch'],
    ['Seleção','National team'],['Treino','Training'],['Jogo vs','Match vs'],['Jogo','Match'],
    ['Distância','Distance'],['Peso','Weight'],['Meta','Goal'],
    ['semana anterior','previous week'],['na semana','in week'],
    ['sessões','sessions'],['sessão','session'],['métricas','metrics'],['Semana','Week'],['semana','week'],
    ['min em campo','min on the pitch'],['metros','metres'],['acelerações','accelerations'],['sprints','sprints'],
    ['Tu','You'],['Mais','More']
  ];
  const PHR = PH.sort((a,b)=>b[0].length-a[0].length).map(([a,b])=>[new RegExp(B+esc(a)+E,'gu'), b]);

  // chaves técnicas que ficam como estão
  const SKIP = /^(SCRIPT|STYLE|CANVAS|NOSCRIPT)$/;
  function tr(s){
    if(!s) return s;
    if(!/[A-Za-zÀ-ÿ]/.test(s)) return /\d,\d/.test(s) ? s.replace(/(\d),(\d{1,2})(?!\d)/g,'$1.$2') : s;
    const lead = /^\s*/.exec(s)[0], trail = /\s*$/.exec(s)[0], core = s.trim();
    if(Object.prototype.hasOwnProperty.call(EX, core)) return lead+EX[core]+trail;
    let t = core;
    for(const [re,fn] of RX){ if(re.test(t)){ re.lastIndex = 0; t = t.replace(re, fn); } re.lastIndex = 0; }
    for(const [re,rep] of PHR){ t = t.replace(re, rep); }
    t = t.replace(/(\d),(\d{1,2})(?!\d)/g,'$1.$2');
    return lead+t+trail;
  }
  window.trI18n = tr;

  // ---------- aplicar ao DOM ----------
  const ATTR = ['aria-label','title','placeholder','alt'];
  const orig = new WeakMap(); // nó -> texto PT original
  function doText(n){
    if(SKIP.test(n.parentNode&&n.parentNode.tagName||'')) return;
    const v = n.nodeValue, t = tr(v);
    if(t !== v){ if(!orig.has(n)) orig.set(n, v); n.nodeValue = t; }
  }
  function doAttrs(e){
    for(const a of ATTR){ const v = e.getAttribute && e.getAttribute(a); if(v){ const t = tr(v); if(t !== v) e.setAttribute(a, t); } }
  }
  function walk(root){
    if(root.nodeType === 3){ doText(root); return; }
    if(root.nodeType !== 1) return;
    doAttrs(root);
    const w = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT|NodeFilter.SHOW_TEXT);
    let n; while(n = w.nextNode()){ n.nodeType === 3 ? doText(n) : doAttrs(n); }
  }
  let mo = null, busy = false;
  function start(){
    document.documentElement.lang = 'en';
    walk(document.body);
    mo = new MutationObserver(ms => {
      if(busy) return; busy = true;
      try{
        for(const m of ms){
          if(m.type === 'characterData') doText(m.target);
          else if(m.type === 'attributes') doAttrs(m.target);
          else m.addedNodes.forEach(walk);
        }
      }finally{ busy = false; }
    });
    mo.observe(document.body, {childList:true, subtree:true, characterData:true, attributes:true, attributeFilter:ATTR});
  }

  // ---------- gráficos (texto desenhado no canvas) ----------
  if(L === 'en' && window.Chart){
    const C0 = window.Chart;
    const fixCfg = cfg => {
      try{
        const d = cfg.data || {};
        (d.datasets||[]).forEach(s => { if(typeof s.label === 'string') s.label = tr(s.label); });
        if(Array.isArray(d.labels)) d.labels = d.labels.map(x => typeof x === 'string' ? tr(x) : x);
        const o = cfg.options || {}, pl = o.plugins || {};
        const cb = pl.tooltip && pl.tooltip.callbacks;
        if(cb) Object.keys(cb).forEach(k => { const f = cb[k]; if(typeof f === 'function') cb[k] = function(){ const r = f.apply(this, arguments); return Array.isArray(r) ? r.map(x=>typeof x==='string'?tr(x):x) : (typeof r==='string' ? tr(r) : r); }; });
        Object.values(o.scales||{}).forEach(sc => { if(sc && sc.title && typeof sc.title.text === 'string') sc.title.text = tr(sc.title.text); });
      }catch(e){}
      return cfg;
    };
    const W = function(ctx, cfg){ return new C0(ctx, fixCfg(cfg)); };
    Object.setPrototypeOf(W, C0); W.prototype = C0.prototype;
    window.Chart = W;
  }

  // ---------- seletor no separador Mais ----------
  function addToggle(){
    const pg = document.getElementById('pg-mais'); if(!pg || document.getElementById('langseg')) return;
    const s = document.createElement('section'); s.id = 'langseg';
    s.innerHTML = '<h2>Idioma · Language</h2><div class="sub">Só muda o texto; os dados ficam iguais. · Only the text changes; the data stays the same.</div>'
      +'<div class="seg" role="group" aria-label="Idioma · Language"><button type="button" data-l="pt" aria-pressed="'+(L==='pt')+'">Português</button><button type="button" data-l="en" aria-pressed="'+(L==='en')+'">English</button></div>';
    pg.insertBefore(s, pg.firstChild);
    s.querySelectorAll('button').forEach(b => b.addEventListener('click', () => {
      const v = b.dataset.l; if(v === L) return;
      store(v);
      try{ sessionStorage.setItem('goMais','1'); }catch(e){} try{ window.name += ';goMais'; }catch(e){}
      location.reload();
    }));
  }
  addToggle();
  if(L === 'en') start();

  // depois de mudar de idioma, volta ao separador Mais
  let go = false; try{ go = sessionStorage.getItem('goMais'); sessionStorage.removeItem('goMais'); }catch(e){}
  if(!go && /;goMais/.test(window.name||'')) go = true;
  try{ window.name = (window.name||'').replace(/;goMais/g,''); }catch(e){}
  if(go) addEventListener('DOMContentLoaded', ()=>{ try{ showTab('mais'); }catch(e){} });
})();
