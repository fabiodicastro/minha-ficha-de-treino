// VARIÁVEL GLOBAL PARA O CRONÔMETRO
let intervalo;
const tempoPadrao = 60; 

// Inicializa o objeto de áudio globalmente
const audioAlerta = new Audio('https://www.soundjay.com/button/beep-01a.mp3');
let audioDesbloqueado = false; // NOVA VARIÁVEL DE CONTROLE


// ==========================================================
// FUNÇÕES DE CRONÔMETRO (SOLUÇÃO FINAL DE ÁUDIO)
// ==========================================================

function tocarAlerta() {
    // Tenta reproduzir o som do começo
    audioAlerta.currentTime = 0; 
    audioAlerta.play().catch(e => {
        // O console.warn deve parar de aparecer depois da primeira interação
        console.warn("Áudio de alerta bloqueado ou falhou na reprodução.", e);
    });
}

// NOVIDADE: Função para garantir que o áudio seja desbloqueado
function desbloquearAudio() {
    if (!audioDesbloqueado) {
        // Tenta tocar e pausar imediatamente com um clique simulado
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
    // 1. Tenta desbloquear o áudio a cada clique (só funcionará na primeira)
    desbloquearAudio(); 

    if (intervalo) {
        clearInterval(intervalo);
        intervalo = null; // Limpa a variável
        botao.textContent = `Descanso (${tempoPadrao}s)`;
        const cronometroSpan = botao.closest('.ficha-exercicio').querySelector('.cronometro');
        if (cronometroSpan) cronometroSpan.textContent = '';
        return;
    }

    const card = botao.closest('.ficha-exercicio');
    if (!card) return;

    const cronometroSpan = card.querySelector('.cronometro');
    if (!cronometroSpan) return;

    let tempoRestante = tempoPadrao;
    
    // Configura o display inicial
    cronometroSpan.textContent = `Descanso: ${tempoRestante}s`;
    botao.textContent = 'Pausar';
    
    intervalo = setInterval(() => {
        tempoRestante--;

        if (tempoRestante >= 0) {
            cronometroSpan.textContent = `Descanso: ${tempoRestante}s`;
        } else {
            clearInterval(intervalo);
            intervalo = null;
            cronometroSpan.textContent = 'PRONTO!';
            // TOCA O SINAL SONORO!
            tocarAlerta(); 
            botao.textContent = `Descanso (${tempoPadrao}s)`;
        }
    }, 1000); 
}

// ... (Mantenha todas as outras funções: getFichaId, carregarCargas, salvarCarga, carregarProgresso, salvarProgresso, marcarConcluido, resetarProgresso) ...

// Carrega o progresso e as cargas ao abrir a página
document.addEventListener('DOMContentLoaded', () => {
    carregarCargas();
    carregarProgresso();
    // NOVIDADE: Adiciona um listener para tentar desbloquear o áudio no primeiro clique em qualquer lugar
    document.body.addEventListener('click', desbloquearAudio, { once: true });
});
