// ---------- composição corporal (página "Corpo") ----------
// Para uma nova medição, acrescenta uma linha a BODY (a mais recente no fim).
const BODY = [
  {date:"2026-10-09", team:"Lusitanos", weight:80.0, bmi:25.2, s8:53.3, fatPct:14.1, fatKg:11.3, ffm:68.7, mm:36.8, lmi:49.0, dS8:0.3,
   sites:[["Tricipital",6.2,"P50"],["Subescapular",8.4,"P0"],["Bicipital",3.4,"P75"],["Crista ilíaca",9.8,"P50"],["Supraespinhal",5.7,"P0"],["Abdominal",8.0,"P0"],["Coxa anterior",6.6,"P0"],["Perna (gémeo)",5.2,"P0"]],
   girths:[["Braço relaxado",33.3,"P75"],["Braço contraído",36.1,"P75"],["Cintura",78.0,"P50"],["Anca / glúteo",97.1,"P100"],["Coxa (média)",57.4,"P100"],["Perna",36.9,"P50"]]}
];
const S8_GOOD = 78, S8_OK = 101, LMI_REF = 54.8, LMI_SD = 4.0;
function renderBody(){
  const el = document.getElementById('bodycard'); if(!el) return;
  const b = BODY[BODY.length-1], prev = BODY.length>1 ? BODY[BODY.length-2] : null;
  const d1 = (v,p,u,fix)=> p==null ? '' : '<small class="bd '+(v-p>0?'up':v-p<0?'dn':'')+'">'+(v-p>=0?'+':'')+(v-p).toFixed(fix).replace('.',',')+u+' vs. anterior</small>';
  const dS8 = prev ? b.s8-prev.s8 : b.dS8;
  const s8z = b.s8<S8_GOOD ? {k:'good',t:'Bom'} : b.s8<=S8_OK ? {k:'warn',t:'Aceitável'} : {k:'bad',t:'A melhorar'};
  const lo = LMI_REF-LMI_SD, hi = LMI_REF+LMI_SD, lz = b.lmi<lo ? {k:'warn',t:'Abaixo da referência'} : b.lmi>hi ? {k:'good',t:'Acima da referência'} : {k:'good',t:'Dentro da referência'};
  const S8MAX = 120, pS = Math.min(100,b.s8/S8MAX*100), LMIN = 40, LMAX = 65, pL = Math.max(0,Math.min(100,(b.lmi-LMIN)/(LMAX-LMIN)*100));
  const pc = s => { const n=+String(s).replace('P',''); return n>=85?'hi':n>=75?'mid':'lo'; };
  const rows = a => a.map(r=>'<tr><td>'+r[0]+'</td><td class="v">'+f1(r[1])+'</td><td><span class="pcp '+pc(r[2])+'">'+r[2]+'</span></td></tr>').join('');
  el.innerHTML =
    '<div class="tag">Medição de '+dlong(b.date)+' · '+b.team+' · protocolo ISAK</div>'
   +'<div class="btiles">'
   +'<div><small>Peso</small><span class="num">'+f1(b.weight)+' kg</span><small>IMC '+f1(b.bmi)+'</small></div>'
   +'<div><small>Σ8 pregas</small><span class="num">'+f1(b.s8)+' mm</span><small class="t-'+s8z.k+'" style="font-weight:700">'+s8z.t+'</small></div>'
   +'<div><small>Massa gorda (estim.)</small><span class="num">'+f1(b.fatPct)+'%</span><small>'+f1(b.fatKg)+' kg · FFM '+f1(b.ffm)+' kg</small></div>'
   +'<div><small>LMI (massa magra)</small><span class="num">'+f1(b.lmi)+'</span><small class="t-'+lz.k+'" style="font-weight:700">'+lz.t+'</small></div></div>'
   +'<div class="bz"><b>Σ8 pregas</b><div class="bbar s8"><i style="left:'+pS.toFixed(1)+'%"></i></div>'
   +'<div class="bl" style="position:relative;height:14px"><span style="left:0">0</span><span style="left:'+(S8_GOOD/S8MAX*100).toFixed(1)+'%;transform:translateX(-50%)">78</span><span style="left:'+(S8_OK/S8MAX*100).toFixed(1)+'%;transform:translateX(-50%)">101</span></div>'
   +'<div class="sub">Verde: bom para 3/4s (&lt;78 mm). Amarelo: aceitável (até 101). Vermelho: a melhorar. '+(dS8!=null?'Variação face à medição anterior: '+(dS8>=0?'+':'')+dS8.toFixed(1).replace('.',',')+' mm.':'')+'</div></div>'
   +'<div class="bz"><b>LMI</b><div class="bbar lmi"><u style="left:'+((lo-LMIN)/(LMAX-LMIN)*100).toFixed(1)+'%;width:'+((hi-lo)/(LMAX-LMIN)*100).toFixed(1)+'%"></u><i style="left:'+pL.toFixed(1)+'%"></i></div>'
   +'<div class="bl" style="position:relative;height:14px"><span style="left:0">'+LMIN+'</span><span style="left:'+((LMI_REF-LMIN)/(LMAX-LMIN)*100).toFixed(1)+'%;transform:translateX(-50%)">'+f1(LMI_REF)+'</span><span style="right:0">'+LMAX+'</span></div>'
   +'<div class="sub">A faixa verde é a referência do grupo (54,8 ± 4,0). Estás abaixo: para a gordura que tens, o teu peso é baixo. Objetivo: ganhar massa magra.</div></div>'
   +'<div class="todo"><b>O que fazer</b>Ganhar massa magra sem subir o Σ8 acima de ~78 mm: treino de força com energia e proteína suficientes (fala com o teu nutricionista e o S&amp;C), e carb-up de 560–640 g nos dias pesados e de jogo.</div>'
   +'<details class="more"><summary>Ver pregas e perímetros</summary><div class="scroll"><table class="bt"><tr><th>Prega (mm)</th><th>Valor</th><th>Percentil</th></tr>'+rows(b.sites)+'</table></div>'
   +'<div class="scroll"><table class="bt"><tr><th>Perímetro (cm)</th><th>Valor</th><th>Percentil</th></tr>'+rows(b.girths)+'</table></div>'
   +'<div class="sub">Percentis face a só 3 atletas da tua posição (n=3): usa-os como indicação, não como regra.</div></details>'
   +'<details class="more"><summary>Histórico ('+BODY.length+(BODY.length===1?' medição':' medições')+')</summary><div class="scroll"><table class="bt"><tr><th>Data</th><th>Peso</th><th>Σ8</th><th>MG %</th><th>LMI</th></tr>'
   +BODY.slice().reverse().map(x=>'<tr><td>'+dshort(x.date)+'</td><td class="v">'+f1(x.weight)+'</td><td class="v">'+f1(x.s8)+'</td><td class="v">'+f1(x.fatPct)+'</td><td class="v">'+f1(x.lmi)+'</td></tr>').join('')+'</table></div>'
   +'<div class="sub">Massa gorda, massa magra e massa muscular são estimadas por equações (Evans 2007, Lee 2000) e em atletas de rugby de elite não são exatas em valor absoluto: lê-as como tendência. Fonte: relatório de composição corporal (ISAK).</div></details>';
}
renderBody();

// ---------- semana 45 fechada: relatórios finais recebidos ----------
POSWK.final = true;
POSWK.note = "Semana 45 fechada com os relatórios finais (Backs em jogo, Non 23 e jogo). Os teus números são de 02, 03 e 04/11 (3 sessões); os dos 3/4 incluem a semana toda e o jogo, por isso a distância não é diretamente comparável.";
(function(){ const base = renderPos; renderPos = function(){ base(); document.querySelectorAll('#pos .tag').forEach(t=>{ if(t.textContent==='Parcial') t.textContent = POSWK.final ? 'Final' : 'Parcial'; }); }; renderPos(); })();

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
(function(){
  const base = renderPos;
  renderPos = function(){
    if(selWeek === POSWK46.week){
      const keep = Object.assign({}, POSWK);
      Object.assign(POSWK, POSWK46);
      try { base(); } finally { Object.assign(POSWK, keep); }
    } else if(selWeek === 45){ base(); }
    else { const el=document.getElementById('pos'); if(el) el.innerHTML='<div class="sub">Comparação com os outros scrum-halves e com os 3/4 só existe para as semanas 45 e 46, a partir dos relatórios semanais. Escolhe uma delas acima para ver.</div>'; }
  };
  renderPos();
})();
