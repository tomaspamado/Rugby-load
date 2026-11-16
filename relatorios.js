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
function posWeek(w){ if(w==null) return POSWEEKS[POSWEEKS.length-1]; return POSWEEKS.find(p=>p.week===w) || null; }

// ---------- exigência da semana (critério do treinador) ----------
// Percentil 50 (mediana) e percentil 75 (top 25%) dos outros jogadores do relatório semanal, em distância e corrida rápida.
// Estar no P75 = pronto para as exigências; acima do P50 = perto. Semana sem relatório (a semana em curso e as seguintes)
// usa o último relatório: a exigência que a equipa teve na semana anterior. Semanas antes do primeiro relatório: sem exigência (usa os alvos fixos).
function pctl(xs, p){ const s = xs.slice().sort((a,b)=>a-b), i = (s.length-1)*p, lo = Math.floor(i), hi = Math.ceil(i); return s[lo] + (s[hi]-s[lo])*(i-lo); }
function demandOf(w){
  let P = posWeek(w);
  if(!P){ const last = POSWEEKS[POSWEEKS.length-1]; if(w <= last.week) return null; P = last; }
  const o = P.rows.filter(r => !r.me), q = k => ({p50:pctl(o.map(r=>r[k]), .5), p75:pctl(o.map(r=>r[k]), .75)});
  return {week:P.week, own:P.week===w, n:o.length, rd:q('rd'), hsr:q('hsr')};
}
