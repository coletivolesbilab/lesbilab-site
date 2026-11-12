/**
 * LESBILAB · cria no Google Forms a pergunta "Estado" e, para cada estado,
 * uma seção com a lista de todas as cidades daquele estado.
 * Como usar: no Forms, ⋮ (Mais) → Apps Script → cole este código → Executar "criarEstadoCidade".
 * As perguntas são adicionadas no FIM do formulário. Depois, apague a pergunta antiga "Cidade e estado".
 */
function criarEstadoCidade() {
  var form = FormApp.getActiveForm();
  var cidades = JSON.parse(UrlFetchApp.fetch('https://coletivolesbilab.vercel.app/municipios.json').getContentText());
  var nomes = {AC:'Acre',AL:'Alagoas',AP:'Amapá',AM:'Amazonas',BA:'Bahia',CE:'Ceará',DF:'Distrito Federal',ES:'Espírito Santo',GO:'Goiás',MA:'Maranhão',MT:'Mato Grosso',MS:'Mato Grosso do Sul',MG:'Minas Gerais',PA:'Pará',PB:'Paraíba',PR:'Paraná',PE:'Pernambuco',PI:'Piauí',RJ:'Rio de Janeiro',RN:'Rio Grande do Norte',RS:'Rio Grande do Sul',RO:'Rondônia',RR:'Roraima',SC:'Santa Catarina',SP:'São Paulo',SE:'Sergipe',TO:'Tocantins'};
  var ufs = Object.keys(nomes).sort(function (a, b) { return nomes[a].localeCompare(nomes[b]); });

  var estado = form.addListItem().setTitle('Estado').setRequired(true);
  var secoes = [];
  ufs.forEach(function (uf) {
    var secao = form.addPageBreakItem().setTitle('Cidade · ' + nomes[uf]);
    form.addListItem().setTitle('Cidade (' + uf + ')').setChoiceValues(cidades[uf]).setRequired(true);
    secoes.push(secao);
  });
  // Ao terminar a seção de um estado, envia o formulário (não passa pelos outros estados).
  for (var i = 1; i < secoes.length; i++) secoes[i].setGoToPage(FormApp.PageNavigationType.SUBMIT);
  estado.setChoices(ufs.map(function (uf, i) { return estado.createChoice(nomes[uf], secoes[i]); }));
}
