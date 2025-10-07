// VARIÁVEL GLOBAL PARA O CRONÔMETRO
let intervalo;
const tempoPadrao = 60; 

// Inicializa o objeto de áudio globalmente
const audioAlerta = new Audio('https://www.soundjay.com/button/beep-01a.mp3');
let audioDesbloqueado = false; 


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
// FUNÇÕES DE CRONÔMETRO E ÁUDIO
// ==========================================================

function tocarAlerta() {
    audioAlerta.currentTime = 0; 
    audioAlerta.play().catch(e => {
        console.warn("Áudio de alerta bloqueado ou falhou na reprodução.", e);
    });
}

function desbloquearAudio() {
    if (!audioDesbloqueado) {
        audioAlerta.play().then(() => {
            audioAlerta.pause();
            audioDesbloqueado = true;
            console.log("Áudio desbloqueado!");
        }).catch(e => {
            console.warn("Falha no desbloqueio silencioso do áudio, mas continuando...", e);
        });
    }
}


function iniciarCronometro(botao) {
    desbloquearAudio(); 

    // LÓGICA DE PAUSE / STOP
    if (intervalo) {
        clearInterval(intervalo);
        intervalo = null; 
        botao.textContent = `Descanso (${tempoPadrao}s)`;
        const cronometroSpan = botao.closest('.ficha-exercicio').querySelector('.cronometro');
        if (cronometroSpan) cronometroSpan.textContent = '';
        return; 
    }

    // LÓGICA DE START
    const card = botao.closest('.ficha-exercicio');
    if (!card) return;

    const cronometroSpan = card.querySelector('.cronometro');
    if (!cronometroSpan) return;

    let tempoRestante = tempoPadrao;
    
    cronometroSpan.textContent = `Descanso: ${tempoRestante}s`;
    botao.textContent = 'Pausar';
    
    intervalo = setInterval(() => {
        tempoRestante--;

        if (tempoRestante >= 0) {
            cronometroSpan.textContent = `Descanso: ${tempoRestante}s`;
        } else {
            clearInterval(intervalo);
            intervalo = null; // Reset essencial
            cronometroSpan.textContent = 'PRONTO!';
            tocarAlerta(); 
            botao.textContent = `Descanso (${tempoPadrao}s)`;
        }
    }, 1000); 
}


// ==========================================================
// FUNÇÕES DE CARGA E PROGRESSO
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
        
        // CORREÇÃO: Reseta completamente o cronômetro para que o botão de descanso volte ao normal
        if (intervalo) {
            clearInterval(intervalo);
            intervalo = null; // ESSENCIAL: Limpa a variável global
        }
        
        const cronometroSpan = card.querySelector('.cronometro');
        if (cronometroSpan) {
            cronometroSpan.textContent = '';
        }

        // CORREÇÃO: Reseta o texto do botão de descanso
        const descansoBotao = card.querySelector('.btn-descanso');
        if (descansoBotao) {
            descansoBotao.textContent = `Descanso (${tempoPadrao}s)`;
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
    // Adiciona um listener para tentar desbloquear o áudio na primeira interação
    document.body.addEventListener('click', desbloquearAudio, { once: true });
});
