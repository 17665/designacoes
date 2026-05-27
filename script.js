// Listas de nomes (fontes para o rodízio)
const palcoCombos = [
  ["Eriton Oliveira","Daniel Fernandes"],
  ["Ivo Julião","Pedro Macumbi"],
  ["Eriton Oliveira","Pedro Macumbi"],
  ["Ivo Julião","Daniel Fernandes"]
];

const microfoneVolantes = ["Endrik Araújo","Renan Carvalho","Carlos Silva","Jucelino Cruz","Pedro Macumbi"];
const indicadoresAuditPatio = [
  "Claudio Borges","Franklin Dantas","Carlos Silva","Juscelino Alves","José Murilo",
  "Manoel Martins","Pedro Macumbi","Eriton Oliveira","Márcio Motta","Luiz Oliveira",
  "Ivo Julião","Francisco Valério"
];
const audioRodizio = ["Caio Andrade","Felipe Santos"];
const videoRodizio = ["Daniel Fernandes","Rodrigo Albuquerque"];
const zoomRodizio = ["Caio Andrade","Felipe Santos","Daniel Fernandes","Rodrigo Albuquerque"];

// Função para gerar reuniões de um mês específico
function gerarReunioes(mes, ano) {
  const inicio = new Date(ano, mes-1, 1);
  const reunioes = [];
  let data = new Date(inicio);

  while (data.getMonth() === inicio.getMonth()) {
    if (data.getDay() === 3) {
      reunioes.push({data: new Date(data.setHours(19,30)), tipo: "Quarta"});
    } else if (data.getDay() === 6) {
      reunioes.push({data: new Date(data.setHours(19,0)), tipo: "Sábado"});
    }
    data.setDate(data.getDate() + 1);
  }
  return reunioes;
}

// Função rodízio sem duplicar
function escolherRodizioUnico(fila, indexRef, usados) {
  let candidato;
  let tentativas = 0;
  do {
    candidato = fila[indexRef.value % fila.length];
    indexRef.value++;
    tentativas++;
  } while (usados.includes(candidato) && tentativas < fila.length);
  usados.push(candidato);
  return candidato;
}

// Função principal para gerar designações
function gerarDesignacoes(mes, ano) {
  const reunioes = gerarReunioes(mes, ano);
  const lista = document.getElementById("lista");

  let mesAtual = -1;
  let idxPalco = 0;
  let idxMic = {value:0}, idxAudio = {value:0}, idxVideo = {value:0}, idxZoom = {value:0}, idxIndicador = {value:0};

  reunioes.forEach(r => {
    const usados = [];

    if (r.data.getMonth() !== mesAtual) {
      mesAtual = r.data.getMonth();
      const cabecalho = document.createElement("div");
      cabecalho.className = "cabecalho";
      cabecalho.innerHTML = `
        <strong>${r.data.toLocaleString('pt-BR',{month:'long'})} ${ano}</strong><br>
        Responsável: Eriton Oliveira
      `;
      lista.appendChild(cabecalho);
    }

    const [coord, ajudante] = palcoCombos[idxPalco % palcoCombos.length];
    idxPalco++;
    usados.push(coord, ajudante);

    const mic1 = escolherRodizioUnico(microfoneVolantes, idxMic, usados);
    const mic2 = escolherRodizioUnico(microfoneVolantes, idxMic, usados);
    const audio = escolherRodizioUnico(audioRodizio, idxAudio, usados);
    const video = escolherRodizioUnico(videoRodizio, idxVideo, usados);
    const zoom = escolherRodizioUnico(zoomRodizio, idxZoom, usados);
    const auditorio = escolherRodizioUnico(indicadoresAuditPatio, idxIndicador, usados);
    const patio = escolherRodizioUnico(indicadoresAuditPatio, idxIndicador, usados);

    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <h2>📅 ${r.tipo} - ${r.data.toLocaleDateString()} ${r.data.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</h2>
      <div class="setor palco">🏛️ <span>Palco:</span> ${coord}, ${ajudante}</div>
      <div class="setor microfone">🎤 <span>Microfone Volante:</span> ${mic1}, ${mic2}</div>
      <div class="setor audio">🎧 <span>Áudio:</span> ${audio}</div>
      <div class="setor video">🎥 <span>Vídeo:</span> ${video}</div>
      <div class="setor zoom">🌐 <span>Zoom:</span> ${zoom}</div>
      <div class="setor indicadores">👥 <span>Indicadores:</span> Auditório → ${auditorio} | Pátio → ${patio}</div>
    `;
    lista.appendChild(card);
  });
}

// Gerar 4 meses a partir de junho/2026
gerarDesignacoes(6, 2026); // Junho
gerarDesignacoes(7, 2026); // Julho
