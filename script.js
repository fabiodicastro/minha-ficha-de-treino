// Função para extrair o ID da ficha de treino atual (ex: 'treino-a', 'treino-b')
function getFichaId() {
    // Ex: index.html -> treino-a; treino-b.html -> treino-b
    const nomeArquivo = window.location.pathname.split('/').pop();
    if (nomeArquivo === 'index.html' || nomeArquivo === '') {
        return 'treino-a';
    } else if (nomeArquivo.includes('treino-b')) {
        return 'treino-b';
    } else if (nomeArquivo.includes('treino-c')) {
        return 'treino-c';
    }
    return 'default'; // Fallback
}

// Chave para armazenar o progresso no localStorage (será 'treino-a-concluidos' etc.)
const STORAGE_KEY = getFichaId() + '-concluidos';


// Função para salvar o progresso atual no LocalStorage
function salvarProgresso(concluidos) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(concluidos));
}

// Função para carregar o progresso do LocalStorage
function carregarProgresso() {
    const listaExercicios = document.querySelector('.lista-exercicios');
    if (!listaExercicios) {
        console.error("Container '.lista-exercicios' não encontrado.");
        return;
    }

    const progressoSalvo = localStorage.getItem(STORAGE_KEY);
    if (!progressoSalvo) {
        return;
    }

    const concluidos = JSON.parse(progressoSalvo);
    const concluidosContainer = document.createElement('div');
    concluidosContainer.classList.add('exercicios-concluidos');
    
    // Adiciona o cabeçalho "Concluídos"
    const h2Concluidos = document.createElement('h2');
    h2Concluidos.textContent = "✅ Concluídos";
    concluidosContainer.appendChild(h2Concluidos);

    // Mapeia todos os exercícios da lista
    const todosExercicios = Array.from(listaExercicios.querySelectorAll('.ficha-exercicio'));
    
    // Move os exercícios concluídos para o novo container
    concluidos.forEach(idConcluido => {
        const exercicioDiv = listaExercicios.querySelector(`.ficha-exercicio[data-id="${idConcluido}"]`);
        
        if (exercicioDiv) {
            exercicioDiv.classList.add('concluido');
            
            // Move o exercício e a linha divisória (hr) que o segue
            const hrElement = exercicioDiv.nextElementSibling;
            
            concluidosContainer.appendChild(exercicioDiv);
            if (hrElement && hrElement.tagName === 'HR') {
                concluidosContainer.appendChild(hrElement);
            }
        }
    });

    // Anexa o container de concluídos à página, logo após a lista principal
    if (concluidos.length > 0) {
        listaExercicios.parentNode.appendChild(concluidosContainer);
    }
}

// Função para marcar/desmarcar o exercício como concluído
function marcarConcluido(botao) {
    const ficha = botao.closest('.ficha-exercicio');
    if (!ficha) return;

    const idExercicio = ficha.dataset.id;
    let progressoAtual = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

    // O elemento 'hr' é o irmão logo após o 'div.ficha-exercicio'
    const hrElement = ficha.nextElementSibling;
    const listaExerciciosContainer = document.querySelector('.lista-exercicios');

    // Cria ou encontra o container de concluídos
    let concluidosContainer = document.querySelector('.exercicios-concluidos');
    if (!concluidosContainer) {
        concluidosContainer = document.createElement('div');
        concluidosContainer.classList.add('exercicios-concluidos');
        
        // Adiciona o cabeçalho "Concluídos"
        const h2Concluidos = document.createElement('h2');
        h2Concluidos.textContent = "✅ Concluídos";
        concluidosContainer.appendChild(h2Concluidos);
        
        listaExerciciosContainer.parentNode.appendChild(concluidosContainer);
    }


    if (ficha.classList.contains('concluido')) {
        // Desmarcar e mover de volta para a lista principal
        ficha.classList.remove('concluido');
        progressoAtual = progressoAtual.filter(id => id !== idExercicio);

        // Move o item e a linha para o final da lista principal
        listaExerciciosContainer.appendChild(ficha);
        if (hrElement && hrElement.tagName === 'HR') {
            listaExerciciosContainer.appendChild(hrElement);
        }

    } else {
        // Marcar e mover para o container de concluídos
        ficha.classList.add('concluido');
        if (!progressoAtual.includes(idExercicio)) {
            progressoAtual.push(idExercicio);
        }

        // Move o item e a linha para o final do container de concluídos
        concluidosContainer.appendChild(ficha);
        if (hrElement && hrElement.tagName === 'HR') {
            concluidosContainer.appendChild(hrElement);
        }
    }

    // Salva o novo estado
    salvarProgresso(progressoAtual);

    // Remove o container de concluídos se ele ficar vazio
    if (concluidosContainer.querySelectorAll('.ficha-exercicio').length === 0) {
        concluidosContainer.remove();
    }
}

// NOVA FUNÇÃO DE RESET
function resetarProgresso() {
    if (confirm("Tem certeza que deseja resetar o progresso deste treino? Todos os exercícios serão desmarcados e o timer será parado.")) {
        
        // 1. Limpa o LocalStorage para a ficha atual
        localStorage.removeItem(STORAGE_KEY);
        
        // 2. Remove o container de concluídos da tela (se existir)
        const concluidosContainer = document.querySelector('.exercicios-concluidos');
        if (concluidosContainer) {
            concluidosContainer.remove();
        }

        // 3. Reinicia a página para recarregar a lista em sua ordem original
        window.location.reload();
    }
}


// Funções de Cronômetro (mantidas do código anterior)
let cronometros = {};
let intervalos = {};

function iniciarCronometro(botao) {
    const ficha = botao.closest('.ficha-exercicio');
    const idExercicio = ficha.dataset.id;
    const cronometroSpan = ficha.querySelector('.cronometro');

    // Pega o tempo de descanso do texto do botão (ex: 'Descanso (60s)' -> 60)
    const tempoTotal = parseInt(botao.textContent.match(/\d+/)[0]);
    
    // Se o cronômetro já estiver rodando, apenas o para
    if (intervalos[idExercicio]) {
        clearInterval(intervalos[idExercicio]);
        delete intervalos[idExercicio];
        cronometroSpan.textContent = '';
        botao.textContent = `Descanso (${tempoTotal}s)`;
        return;
    }

    // Inicia o cronômetro
    cronometros[idExercicio] = tempoTotal;
    botao.textContent = `Pausar (${cronometros[idExercicio]}s)`;

    intervalos[idExercicio] = setInterval(() => {
        cronometros[idExercicio]--;

        if (cronometros[idExercicio] <= 0) {
            clearInterval(intervalos[idExercicio]);
            delete intervalos[idExercicio];
            cronometroSpan.textContent = 'Tempo Esgotado! 🔔';
            botao.textContent = `Descanso (${tempoTotal}s)`;
        } else {
            const minutos = Math.floor(cronometros[idExercicio] / 60).toString().padStart(2, '0');
            const segundos = (cronometros[idExercicio] % 60).toString().padStart(2, '0');
            cronometroSpan.textContent = `${minutos}:${segundos}`;
            botao.textContent = `Pausar (${cronometros[idExercicio]}s)`;
        }
    }, 1000);
}

// Carrega o progresso ao carregar a página
window.onload = carregarProgresso;
