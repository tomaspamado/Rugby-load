// ---------- Relatórios semanais: tu vs. os outros 9 vs. os 3/4 ----------
// Para uma semana nova: copia o bloco da última semana, muda os números e acrescenta-o a POSWEEKS no fim.
// g: 'in' = 3/4 da equipa de jogo (média oficial), 'n23' = Non 23, sh = scrum-half, me = tu; rd arredondado a 100 m nos outros.

// ---------- semana 45 ----------
const POSWK = {week:45, final:true,
  note:"Semana 45 fechada com os relatórios finais (Backs em jogo, Non 23 e jogo). Os teus números são de 02, 03 e 04/11 (3 sessões); os dos 3/4 incluem a semana toda e o jogo, por isso a distância não é diretamente comparável.",
  /* g: 'in' = 3/4 da equipa de jogo (média oficial), 'n23' = Non 23, me = tu; rd arredondado a 100 m nos outros */
  rows:[
  {n:"Simão Bento",p:"Defesa",g:"in",rd:8815,hsr:1515,acc:120,sp:30.4,pc:92.2},
  {n:"Raffaele Storti",p:"Ponta",g:"in",rd:8203,hsr:1779,acc:144,sp:31.2,pc:90.3},
  {n:"Manuel Vareiro",p:"Abertura",g:"in",rd:7999,hsr:1439,acc:145,sp:28.9,pc:86.7},
  {n:"Domingos Cabral",p:"Abertura",g:"in",rd:7900,hsr:1251,acc:176,sp:26.8,pc:82.9},
  {n:"Manuel Cardoso-Pinto",p:"Ponta",g:"in",rd:7800,hsr:1653,acc:118,sp:28.9,pc:81.1},
  {n:"Samuel Marques",p:"9",sh:1,g:"in",rd:7700,hsr:1666,acc:119,sp:26.6,pc:80.4},
  {n:"Hugo Camacho",p:"9",sh:1,g:"in",rd:6900,hsr:1213,acc:103,sp:30.0,pc:95.3},
  {n:"Vincent Pinto",p:"Defesa",g:"in",rd:6900,hsr:1117,acc:105,sp:30.0,pc:89.1},
  {n:"Jordan Lee Bacon",p:"Centro",g:"n23",rd:7100,hsr:1085,acc:125,sp:31.5,pc:92.8},
  {n:"Joris Moura",p:"Abertura",g:"n23",rd:7000,hsr:1253,acc:85,sp:29.8,pc:93.2},
  {n:"Hugo Aubry",p:"Abertura",g:"n23",rd:6900,hsr:936,acc:119,sp:27.8,pc:88.8},
  {n:"Vasco Durao",p:"Centro",g:"n23",rd:6500,hsr:912,acc:132,sp:26.8,pc:83.9},
  {n:"Tomás Amado",p:"9",sh:1,me:1,g:"n23",rd:6800,hsr:1382,acc:131,sp:31.2,pc:93.5}],
  game:{date:"07/11 vs Chile",avg:{rd:2653,hsr:588,acc:34,pc:86},
    sh:[{n:"Samuel Marques",min:"1:20:50",rd:3600,hsr:672,acc:34,sp:27.1},{n:"Hugo Camacho",min:"0:13:06",rd:800,hsr:100,acc:4,sp:24.8}]}
};

// ---------- semana 46 (relatório semanal + jogo vs Samoa) ----------
const POSWK46 = {week:46, final:true,
  note:"Semana 46 fechada: o relatório semanal sai antes do jogo e já não houve mais treinos de equipa. Os teus números são de 10 e 12/11 (2 sessões); a sessão Non 23 de 14/11 (1 357 m) fica de fora, como no relatório. Os 3/4 incluem a semana toda e o jogo.",
  rows:[
  {n:"Simão Bento",p:"Defesa",g:"in",rd:7780,hsr:1444,acc:96,sp:31.3,pc:95.1},
  {n:"Raffaele Storti",p:"Ponta",g:"in",rd:6921,hsr:1862,acc:91,sp:31.8,pc:92.0},
  {n:"Manuel Vareiro",p:"Abertura",g:"in",rd:6664,hsr:1108,acc:90,sp:28.5,pc:85.5},
  {n:"Rodrigo Marta",p:"Centro",g:"in",rd:6300,hsr:1223,acc:84,sp:28.8,pc:80.7},
  {n:"Tomás Appleton",p:"Centro",g:"in",rd:6300,hsr:1239,acc:125,sp:28.7,pc:85.8},
  {n:"Vincent Pinto",p:"Ponta",g:"in",rd:6100,hsr:1433,acc:89,sp:29.6,pc:87.9},
  {n:"Manuel Cardoso-Pinto",p:"Ponta",g:"in",rd:5900,hsr:1510,acc:85,sp:32.8,pc:92.1},
  {n:"Domingos Cabral",p:"Abertura",g:"in",rd:5700,hsr:1115,acc:118,sp:27.3,pc:84.7},
  {n:"Hugo Camacho",p:"9",sh:1,g:"in",rd:5400,hsr:981,acc:78,sp:29.3,pc:92.9},
  {n:"Samuel Marques",p:"9",sh:1,g:"in",rd:5100,hsr:1428,acc:56,sp:31.4,pc:94.9},
  {n:"Hugo Aubry",p:"Abertura",g:"n23",rd:5300,hsr:860,acc:101,sp:29.7,pc:94.7},
  {n:"Joris Moura",p:"Abertura",g:"n23",rd:5700,hsr:1125,acc:76,sp:27.8,pc:86.8},
  {n:"Vasco Durao",p:"Centro",g:"n23",rd:5700,hsr:983,acc:86,sp:29.0,pc:90.7},
  {n:"Jordan Lee Bacon",p:"Centro",g:"n23",rd:5600,hsr:1345,acc:98,sp:29.0,pc:85.4},
  {n:"Tomás Amado",p:"9",sh:1,me:1,g:"n23",rd:6392,hsr:1721,acc:96,sp:32.7,pc:98.1}],
  game:{date:"14/11 vs Samoa",avg:{rd:2623,hsr:621,acc:38,pc:83},
    sh:[{n:"Samuel Marques",min:"1:31:24",rd:4400,hsr:1024,acc:51,sp:28.5},{n:"Hugo Camacho",min:"0:22:58",rd:1200,hsr:358,acc:15,sp:27.8}]}
};


// ---------- semanas com relatório semanal: uma só lista ----------
const POSWEEKS = [POSWK, POSWK46];

// ---------- semana em curso: relatórios diários dos Backs, somados até sair o relatório semanal ----------
// Um bloco por treino (página Backs do PDF do dia). rd arredondado a 100 m nos outros (gráfico), exato nos 3 primeiros e em ti.
const DAYREPS = [
  {date:"2026-11-17", week:47, rows:[
    {n:"Tomás Batista",p:"Defesa",rd:3391,hsr:746,acc:47,sp:29.5},
    {n:"Diogo Rodrigues",p:"Centro",rd:3114,hsr:627,acc:32,sp:30.0},
    {n:"Tomás Amado",p:"9",sh:1,me:1,rd:3069,hsr:625,acc:53,sp:29.1},
    {n:"Manuel Vareiro",p:"Centro",rd:2700,hsr:727,acc:54,sp:28.7},
    {n:"Vasco Durao",p:"Centro",rd:2700,hsr:585,acc:33,sp:28.1},
    {n:"Hugo Aubry",p:"Abertura",rd:2600,hsr:593,acc:41,sp:27.4},
    {n:"Joris Moura",p:"Defesa",rd:2600,hsr:626,acc:29,sp:26.5},
    {n:"Samuel Marques",p:"9",sh:1,rd:2500,hsr:575,acc:32,sp:26.4},
    {n:"Hugo Camacho",p:"9",sh:1,rd:2500,hsr:578,acc:20,sp:29.8},
    {n:"Vincent Pinto",p:"Ponta",rd:2400,hsr:499,acc:20,sp:27.8},
    {n:"Domingos Cabral",p:"Centro",rd:2400,hsr:522,acc:49,sp:25.4}]}
];
// Soma os treinos da semana por jogador (velocidade = a máxima). Só os mesmos treinos de todos, por isso a comparação é justa.
function liveWeek(w){
  const ds = DAYREPS.filter(d=>d.week===w); if(!ds.length) return null;
  const by = {};
  ds.forEach(d=>d.rows.forEach(r=>{ const o = by[r.n] || (by[r.n] = {n:r.n, p:r.p, sh:r.sh, me:r.me, g:'in', rd:0, hsr:0, acc:0, sp:0, days:0});
    o.rd += r.rd; o.hsr += r.hsr; o.acc += r.acc; o.sp = Math.max(o.sp, r.sp); o.days++; }));
  const last = ds[ds.length-1].date.slice(8,10)+'/'+ds[ds.length-1].date.slice(5,7);
  return {week:w, final:false, live:true, days:ds.length, rows:Object.values(by),
    note:'Semana '+w+' em curso: soma dos '+ds.length+' treino'+(ds.length>1?'s':'')+' de equipa até '+last+' (relatórios diários dos Backs). Atualiza a cada relatório; o relatório semanal substitui-a.', game:null};
}
// posWeek(w): só o relatório semanal (medalhas e página Semana). posWeek() sem semana: a mais recente, incluindo a semana em curso (Hoje).
function posWeek(w){
  if(w==null){ const lw = DAYREPS.length ? DAYREPS[DAYREPS.length-1].week : null, last = POSWEEKS[POSWEEKS.length-1];
    return (lw!=null && lw>last.week) ? liveWeek(lw) : last; }
  return POSWEEKS.find(p=>p.week===w) || null;
}

// ---------- o 9 titular no jogo: quanto corre (para saber quanto tens de correr a mais nos treinos) ----------
// Conta só jogos em que o 9 jogou 60 min ou mais. Titular = o desses jogos mais recente.
const toMin = s => { const [h,m,x] = String(s).split(':').map(Number); return h*60 + m + (x||0)/60; };
function starterGame(){
  const gs = POSWEEKS.filter(p=>p.game).map(p=>({week:p.week, date:p.game.date, r:p.game.sh.filter(x=>toMin(x.min)>=60).sort((a,b)=>toMin(b.min)-toMin(a.min))[0]})).filter(g=>g.r);
  if(!gs.length) return null;
  const av = k => gs.reduce((a,g)=>a+g.r[k],0)/gs.length;
  return {name:gs[gs.length-1].r.n, n:gs.length, rd:av('rd'), hsr:av('hsr'), games:gs};
}

// ---------- exigência da semana (critério do treinador) ----------
// Percentil 50 (mediana) e percentil 75 (top 25%) dos outros jogadores do relatório semanal, em distância e corrida rápida.
// Estar no P75 = pronto para as exigências; acima do P50 = perto. Compara-se sempre a mesma semana: os teus números da semana X
// com os percentis da semana X. Antes de sair o relatório semanal, usa a soma dos relatórios diários da semana (DAYREPS); sem nenhum, os alvos fixos.
function pctl(xs, p){ const s = xs.slice().sort((a,b)=>a-b), i = (s.length-1)*p, lo = Math.floor(i), hi = Math.ceil(i); return s[lo] + (s[hi]-s[lo])*(i-lo); }
function demandOf(w){
  const P = POSWEEKS.find(p=>p.week===w) || liveWeek(w); if(!P) return null;   // semana em curso: percentis dos treinos até agora
  const o = P.rows.filter(r => !r.me), me = P.rows.find(r => r.me), q = k => ({p50:pctl(o.map(r=>r[k]), .5), p75:pctl(o.map(r=>r[k]), .75)});
  // os teus números vêm do mesmo relatório (mesmas sessões que os dos outros), não do total da app
  return {week:P.week, n:o.length, rd:q('rd'), hsr:q('hsr'), me: me ? {rd:me.rd, hsr:me.hsr} : null};
}
