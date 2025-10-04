// VARIÁVEL GLOBAL PARA O CRONÔMETRO
let intervalo;
// Tempo padrão de descanso em segundos
const tempoPadrao = 60; 

// Inicializa o objeto de áudio globalmente (tenta resolver a política de autoplay)
// O som é um bip simples. Se quiser um som diferente, troque o URL.
const audioAlerta = new Audio('https://www.soundjay.com/button/beep-01a.mp3');


// ==========================================================
// FUNÇÕES DE UTILIDADE E PERSISTÊNCIA
// ==========================================================

function getFichaId() {
    const nomeArquivo = window.location.pathname.split('/').pop();
    if (nomeArquivo === 'index.html' || nomeArquivo === '') {
        return 'treino-a';
    } else if (nomeArquivo.includes('treino-b')) {
        return 'treino-b';
    } else if (nomeArquivo.includes('treino-c')) {
        return 'treino-c';
    }
    return 'default';
}

const PROGRESSO_KEY = getFichaId() + '-concluidos';
const CARGAS_KEY = getFichaId() + '-cargas';

// ==========================================================
// FUNÇÕES DE CRONÔMETRO (CORRIGIDO PARA ÁUDIO)
// ==========================================================

function tocarAlerta() {
    // Tenta reproduzir o som do começo
    audioAlerta.currentTime = 0; 
    audioAlerta.play().catch(e => {
        // Captura o erro se o navegador bloquear, mas tenta reproduzir o som
        console.warn("Áudio de alerta bloqueado pelo navegador. Tente interagir com a página primeiro.", e);
    });
}


function iniciarCronometro(botao) {
    if (intervalo) {
        clearInterval(intervalo);
    }

    const card = botao.closest('.ficha-exercicio');
    if (!card) return;

    const cronometroSpan = card.querySelector('.cronometro');
    if (!cronometroSpan) return;

    let tempoRestante = tempoPadrao;
    
    // Configura o display inicial
    cronometroSpan.textContent = `Descanso: ${tempoRestante}s`;
    
    intervalo = setInterval(() => {
        tempoRestante--;

        if (tempoRestante >= 0) {
            cronometroSpan.textContent = `Descanso: ${tempoRestante}s`;
        } else {
            clearInterval(intervalo);
            cronometroSpan.textContent = 'PRONTO!';
            // TOCA O SINAL SONORO!
            tocarAlerta(); 
        }
    }, 1000); 
}


// ==========================================================
// FUNÇÕES DE CARGA E PROGRESSO (Não alteradas, mas incluídas para completar)
// ==========================================================

function carregarCargas() {
    const cargasSalvas = localStorage.getItem(CARGAS_KEY);
    if (!cargasSalvas) return;

    const cargas = JSON.parse(cargasSalvas);
    
    for (const idExercicio in cargas) {
        const inputCarga = document.querySelector(`.ficha-exercicio[data-id="${idExercicio}"] .badge.carga`);
        
        if (inputCarga) {
            inputCarga.value = cargas[idExercicio];
        }
    }
}

function salvarCarga(inputElement) {
    const card = inputElement.closest('.ficha-exercicio');
    if (!card) return;

    const idExercicio = card.dataset.id;
    const novaCarga = inputElement.value;

    let cargasAtuais = JSON.parse(localStorage.getItem(CARGAS_KEY)) || {};
    cargasAtuais[idExercicio] = novaCarga;
    localStorage.setItem(CARGAS_KEY, JSON.stringify(cargasAtuais));
}

function carregarProgresso() {
    const progressoSalvo = localStorage.getItem(PROGRESSO_KEY);
    const listaExercicios = document.querySelector('.lista-exercicios');

    if (!listaExercicios) return; 

    let concluidosContainer = document.querySelector('.exercicios-concluidos');
    if (!concluidosContainer) {
        concluidosContainer = document.createElement('div');
        concluidosContainer.classList.add('exercicios-concluidos');
        concluidosContainer.innerHTML = '<h2>✅ Concluídos</h2>';
        listaExercicios.parentNode.appendChild(concluidosContainer); 
    }
    
    if (progressoSalvo) {
        const exerciciosConcluidos = JSON.parse(progressoSalvo);
        
        exerciciosConcluidos.forEach(id => {
            const card = document.querySelector(`.ficha-exercicio[data-id="${id}"]`);
            if (card) {
                card.classList.add('concluido');
                const botaoConcluido = card.querySelector('.btn-concluido');
                if (botaoConcluido) {
                    botaoConcluido.textContent = 'Desmarcar';
                }

                const hrAposCard = card.nextElementSibling;
                concluidosContainer.appendChild(card);
                if (hrAposCard && hrAposCard.tagName === 'HR') {
                    concluidosContainer.appendChild(hrAposCard);
                }
            }
        });
    }

    if (concluidosContainer.querySelectorAll('.ficha-exercicio').length === 0) {
        concluidosContainer.remove();
    }
}

function salvarProgresso() {
    const cardsConcluidos = document.querySelectorAll('.ficha-exercicio.concluido');
    const exerciciosConcluidos = Array.from(cardsConcluidos).map(card => card.dataset.id);
    localStorage.setItem(PROGRESSO_KEY, JSON.stringify(exerciciosConcluidos));
}

function marcarConcluido(botao) {
    const card = botao.closest('.ficha-exercicio');
    const listaExerciciosContainer = document.querySelector('.lista-exercicios'); 

    if (!listaExerciciosContainer) return;

    const hrAposCard = card.nextElementSibling;

    let concluidosContainer = document.querySelector('.exercicios-concluidos');
    if (!concluidosContainer) {
        concluidosContainer = document.createElement('div');
        concluidosContainer.classList.add('exercicios-concluidos');
        concluidosContainer.innerHTML = '<h2>✅ Concluídos</h2>';
        listaExerciciosContainer.parentNode.appendChild(concluidosContainer);
    }
    

    if (card.classList.contains('concluido')) {
        // --- AÇÃO: DESMARCAR ---
        card.classList.remove('concluido');
        botao.textContent = 'Concluído';
        
        listaExerciciosContainer.insertBefore(card, listaExerciciosContainer.firstChild); 
        
        if (hrAposCard && hrAposCard.tagName === 'HR') {
             listaExerciciosContainer.insertBefore(hrAposCard, card.nextSibling); 
        }

    } else {
        // --- AÇÃO: MARCAR ---
        card.classList.add('concluido');
        botao.textContent = 'Desmarcar';
        
        // Para o cronômetro de descanso se estiver rodando
        if (intervalo) {
            clearInterval(intervalo);
        }
        const cronometroSpan = card.querySelector('.cronometro');
        if (cronometroSpan) {
            cronometroSpan.textContent = '';
        }
        
        concluidosContainer.appendChild(card);
        
        if (hrAposCard && hrAposCard.tagName === 'HR') {
             concluidosContainer.appendChild(hrAposCard);
        }
    }
    
    salvarProgresso(); 
    
    if (concluidosContainer.querySelectorAll('.ficha-exercicio').length === 0) {
        concluidosContainer.remove();
    }
}

function resetarProgresso() {
    if (confirm("Tem certeza que deseja resetar o progresso deste treino? Todos os exercícios serão desmarcados e o timer será parado.")) {
        
        localStorage.removeItem(PROGRESSO_KEY);
        localStorage.removeItem(CARGAS_KEY); 
        
        window.location.reload();
    }
}


// Carrega o progresso e as cargas ao abrir a página
document.addEventListener('DOMContentLoaded', () => {
    carregarCargas();
    carregarProgresso();
});
