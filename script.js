// VARIÁVEL GLOBAL PARA O CRONÔMETRO
let intervalo;
const tempoPadrao = 60; // 60 segundos (tempo de descanso)

// Função para extrair o ID da ficha de treino atual (ex: 'treino-a')
function getFichaId() {
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
const PROGRESSO_KEY = getFichaId() + '-concluidos';
// Chave para armazenar as cargas (será 'treino-a-cargas' etc.)
const CARGAS_KEY = getFichaId() + '-cargas';

// ==========================================================
// FUNÇÕES DE PERSISTÊNCIA DE CARGA (NOVIDADE)
// ==========================================================

function carregarCargas() {
    const cargasSalvas = localStorage.getItem(CARGAS_KEY);
    if (!cargasSalvas) return;

    const cargas = JSON.parse(cargasSalvas);
    
    for (const idExercicio in cargas) {
        const inputCarga = document.querySelector(`.ficha-exercicio[data-id="${idExercicio}"] .badge.carga`);
        
        if (inputCarga) {
            // Define o valor do input com a carga salva
            inputCarga.value = cargas[idExercicio];
        }
    }
}

function salvarCarga(inputElement) {
    const card = inputElement.closest('.ficha-exercicio');
    if (!card) return;

    const idExercicio = card.dataset.id;
    const novaCarga = inputElement.value;

    // Carrega as cargas atuais, ou um objeto vazio se não houver nada
    let cargasAtuais = JSON.parse(localStorage.getItem(CARGAS_KEY)) || {};
    
    // Atualiza a carga específica
    cargasAtuais[idExercicio] = novaCarga;

    // Salva o objeto completo de volta no localStorage
    localStorage.setItem(CARGAS_KEY, JSON.stringify(cargasAtuais));
}


// ==========================================================
// 1. PERSISTÊNCIA DE DADOS (CARREGAR E SALVAR PROGRESSO)
// ==========================================================

// Carrega o progresso e as cargas ao abrir a página
document.addEventListener('DOMContentLoaded', () => {
    carregarCargas(); // NOVO: Carrega as cargas antes
    carregarProgresso();
});


function carregarProgresso() {
    // ... (A lógica de carregar progresso é complexa, deixamos ela separada) ...
    const progressoSalvo = localStorage.getItem(PROGRESSO_KEY);
    const listaExercicios = document.querySelector('.lista-exercicios');

    if (!listaExercicios) return; 

    // Cria o container de concluídos (se for necessário)
    let concluidosContainer = document.querySelector('.exercicios-concluidos');
    if (!concluidosContainer) {
        concluidosContainer = document.createElement('div');
        concluidosContainer.classList.add('exercicios-concluidos');
        concluidosContainer.innerHTML = '<h2>✅ Concluídos</h2>';
        // Adiciona o container no DOM para que a lógica de movimento funcione
        listaExercicios.parentNode.appendChild(concluidosContainer); 
    }
    
    if (progressoSalvo) {
        const exerciciosConcluidos = JSON.parse(progressoSalvo);
        
        exerciciosConcluidos.forEach(id => {
            const card = document.querySelector(`.ficha-exercicio[data-id="${id}"]`);
            if (card) {
                // Adiciona a classe 'concluido'
                card.classList.add('concluido');
                
                // Atualiza o texto do botão
                const botaoConcluido = card.querySelector('.btn-concluido');
                if (botaoConcluido) {
                    botaoConcluido.textContent = 'Desmarcar';
                }

                // Move o card concluído para o container de concluídos
                const hrAposCard = card.nextElementSibling;
                concluidosContainer.appendChild(card);
                if (hrAposCard && hrAposCard.tagName === 'HR') {
                    concluidosContainer.appendChild(hrAposCard);
                }
            }
        });
    }

    // Remove o container de concluídos se ele estiver vazio após o carregamento
    if (concluidosContainer.querySelectorAll('.ficha-exercicio').length === 0) {
        concluidosContainer.remove();
    }
}

function salvarProgresso() {
    const cardsConcluidos = document.querySelectorAll('.ficha-exercicio.concluido');
    const exerciciosConcluidos = Array.from(cardsConcluidos).map(card => card.dataset.id);
    localStorage.setItem(PROGRESSO_KEY, JSON.stringify(exerciciosConcluidos));
}


// ==========================================================
// 2. MARCAR CONCLUÍDO E MOVER CARD
// ==========================================================

function marcarConcluido(botao) {
    const card = botao.closest('.ficha-exercicio');
    const listaExerciciosContainer = document.querySelector('.lista-exercicios'); 

    if (!listaExerciciosContainer) return;

    // Encontra a linha horizontal que está logo APÓS o card (se existir)
    const hrAposCard = card.nextElementSibling;

    // Cria ou encontra o container de concluídos
    let concluidosContainer = document.querySelector('.exercicios-concluidos');
    if (!concluidosContainer) {
        concluidosContainer = document.createElement('div');
        concluidosContainer.classList.add('exercicios-concluidos');
        concluidosContainer.innerHTML = '<h2>✅ Concluídos</h2>';
        listaExerciciosContainer.parentNode.appendChild(concluidosContainer);
    }
    

    if (card.classList.contains('concluido')) {
        // --- AÇÃO: DESMARCAR (volta para a lista principal) ---
        card.classList.remove('concluido');
        botao.textContent = 'Concluído';
        
        // Mover o card para o INÍCIO da lista principal
        listaExerciciosContainer.insertBefore(card, listaExerciciosContainer.firstChild); 
        
        // Mover a HR para que ela fique depois do card na lista principal
        if (hrAposCard && hrAposCard.tagName === 'HR') {
             listaExerciciosContainer.insertBefore(hrAposCard, card.nextSibling); 
        }

    } else {
        // --- AÇÃO: MARCAR (vai para o container de concluídos) ---
        card.classList.add('concluido');
        botao.textContent = 'Desmarcar';
        
        // Opcional: Para o cronômetro de descanso se estiver rodando
        clearInterval(intervalo);
        const cronometroSpan = card.querySelector('.cronometro');
        if (cronometroSpan) {
            cronometroSpan.textContent = '';
        }
        
        // Mover o card para o FINAL do container de concluídos
        concluidosContainer.appendChild(card);
        
        // Mover a HR para o FINAL do container de concluídos, após o card
        if (hrAposCard && hrAposCard.tagName === 'HR') {
             concluidosContainer.appendChild(hrAposCard);
        }
    }
    
    // Salva a alteração
    salvarProgresso(); 
    
    // Remove o container de concluídos se ele ficar vazio
    if (concluidosContainer.querySelectorAll('.ficha-exercicio').length === 0) {
        concluidosContainer.remove();
    }
}


// ==========================================================
// 3. RESET DE PROGRESSO
// ==========================================================

function resetarProgresso() {
    if (confirm("Tem certeza que deseja resetar o progresso deste treino? Todos os exercícios serão desmarcados e o timer será parado.")) {
        
        // Limpa o LocalStorage para a ficha atual
        localStorage.removeItem(PROGRESSO_KEY);
        localStorage.removeItem(CARGAS_KEY); // NOVIDADE: Limpa também as cargas salvas
        
        // Recarrega a página para restaurar a ordem original
        window.location.reload();
    }
}


// ==========================================================
// 4. CRONÔMETRO DE DESCANSO
// ==========================================================

// ... (Mantenha o código do cronômetro da versão anterior) ...
// (Para evitar que o código fique gigantesco, vou assumir que você tem a função iniciarCronometro em sua versão anterior)
// Nota do sistema: O usuário deve garantir que a função iniciarCronometro esteja no arquivo.
