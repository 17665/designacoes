// =====================================================
// FONTES DE DADOS
// =====================================================

const palcoCombos = [
  ["Eriton Oliveira", "Daniel Fernandes"],
  ["Ivo Julião", "Pedro Macumbi"],
  ["Eriton Oliveira", "Pedro Macumbi"],
  ["Ivo Julião", "Daniel Fernandes"]
];

const microfoneVolantes = [
  "Endrik Araújo", "Renan Carvalho", "Carlos Silva",
  "Jucelino Alves", "Pedro Macumbi"
];

const indicadoresAuditPatio = [
  "Claudio Borges", "Franklin Dantas", "Carlos Silva", "Juscelino Alves",
  "José Murilo", "Manoel Martins", "Pedro Macumbi", "Eriton Oliveira",
  "Márcio Motta", "Luiz Oliveira", "Ivo Julião", "Francisco Valério"
];

const audioRodizio  = ["Caio Andrade", "Felipe Santos"];
const videoRodizio  = ["Daniel Fernandes", "Rodrigo Albuquerque"];
const zoomRodizio   = ["Caio Andrade", "Felipe Santos", "Daniel Fernandes", "Rodrigo Albuquerque"];

// =====================================================
// UTILITÁRIOS
// =====================================================

function gerarReunioes(mes, ano) {
  const reunioes = [];
  const data = new Date(ano, mes - 1, 1);
  while (data.getMonth() === mes - 1) {
    if (data.getDay() === 3) {
      reunioes.push({ data: new Date(ano, mes - 1, data.getDate(), 19, 0), tipo: "Quarta" });
    } else if (data.getDay() === 6) {
      reunioes.push({ data: new Date(ano, mes - 1, data.getDate(), 18, 30), tipo: "Sábado" });
    }
    data.setDate(data.getDate() + 1);
  }
  return reunioes;
}

function escolherRodizio(fila, idx, usados) {
  let tentativas = 0;
  let candidato;
  do {
    candidato = fila[idx.v % fila.length];
    idx.v++;
    tentativas++;
  } while (usados.includes(candidato) && tentativas <= fila.length);
  usados.push(candidato);
  return candidato;
}

function formatarData(data) {
  return data.toLocaleDateString('pt-BR', {
    weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric'
  });
}

function formatarHora(data) {
  return data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

// =====================================================
// GERAÇÃO DO HTML
// =====================================================

// Índices globais (persistem entre meses para rodízio contínuo)
let idxPalco = 0;
const idxMic  = { v: 0 };
const idxAud  = { v: 0 };
const idxVid  = { v: 0 };
const idxZoom = { v: 0 };
const idxInd  = { v: 0 };

function gerarMes(mes, ano) {
  const reunioes = gerarReunioes(mes, ano);
  const nomeMes = new Date(ano, mes - 1, 1)
    .toLocaleString('pt-BR', { month: 'long' });

  const blocoMes = document.createElement('div');
  blocoMes.className = 'mes-bloco';

  // Cabeçalho do mês
  blocoMes.innerHTML = `
    <div class="mes-header">
      <span class="mes-nome">${nomeMes} ${ano}</span>
      <span class="responsavel">Responsável: Eriton Oliveira</span>
    </div>
  `;

  const grid = document.createElement('div');
  grid.className = 'reunioes-grid';

  reunioes.forEach(r => {
    const usados = [];

    const [coord, ajudante] = palcoCombos[idxPalco % palcoCombos.length];
    idxPalco++;
    usados.push(coord, ajudante);

    const mic1     = escolherRodizio(microfoneVolantes, idxMic,  usados);
    const mic2     = escolherRodizio(microfoneVolantes, idxMic,  usados);
    const audio    = escolherRodizio(audioRodizio,      idxAud,  usados);
    const video    = escolherRodizio(videoRodizio,       idxVid,  usados);
    const zoom     = escolherRodizio(zoomRodizio,        idxZoom, usados);
    const auditorio = escolherRodizio(indicadoresAuditPatio, idxInd, usados);
    const patio    = escolherRodizio(indicadoresAuditPatio, idxInd, usados);

    const tipoClass = r.tipo === 'Quarta' ? 'quarta' : 'sabado';

    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <div class="card-header">
        <span class="tipo-badge ${tipoClass}">${r.tipo}</span>
        <span class="card-data">${formatarData(r.data)}</span>
        <span class="card-hora">${formatarHora(r.data)}</span>
      </div>

      <div class="setor-linha">
        <span class="setor-icone">🏛</span>
        <span class="setor-label">Palco</span>
        <span class="setor-nomes">${coord} &amp; ${ajudante}</span>
      </div>
      <div class="setor-linha">
        <span class="setor-icone">🎤</span>
        <span class="setor-label">Mic. Volante</span>
        <span class="setor-nomes">${mic1} &amp; ${mic2}</span>
      </div>
      <div class="setor-linha">
        <span class="setor-icone">🎧</span>
        <span class="setor-label">Áudio</span>
        <span class="setor-nomes">${audio}</span>
      </div>
      <div class="setor-linha">
        <span class="setor-icone">🎥</span>
        <span class="setor-label">Vídeo</span>
        <span class="setor-nomes">${video}</span>
      </div>
      <div class="setor-linha">
        <span class="setor-icone">🌐</span>
        <span class="setor-label">Zoom</span>
        <span class="setor-nomes">${zoom}</span>
      </div>
      <div class="setor-linha">
        <span class="setor-icone">👥</span>
        <span class="setor-label">Indicadores</span>
        <span class="setor-nomes">
          Auditório → ${auditorio}
          <span class="separador-indicador">|</span>
          Pátio → ${patio}
        </span>
      </div>
    `;

    grid.appendChild(card);
  });

  blocoMes.appendChild(grid);
  document.getElementById('lista').appendChild(blocoMes);
}

// =====================================================
// INICIALIZAÇÃO
// =====================================================

gerarMes(6, 2026); // Junho
gerarMes(7, 2026); // Julho
gerarMes(8, 2026); // Agosto
gerarMes(9, 2026); // Setembro
