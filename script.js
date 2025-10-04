// VARIÁVEL GLOBAL PARA O CRONÔMETRO
let intervalo;
const tempoPadrao = 60; // 60 segundos (tempo de descanso)


// --- 1. FUNÇÃO PARA SALVAR E CARREGAR PROGRESSO (PERSISTÊNCIA) ---

// Função principal para carregar o progresso ao abrir a página
document.addEventListener('DOMContentLoaded', carregarProgresso);

function carregarProgresso() {
    // A chave de salvamento depende do nome do arquivo (ex: index.html, treino-b.html)
    const nomeFicha = window.location.pathname.split('/').pop() || 'index.html';
    const progressoSalvo = localStorage.getItem(nomeFicha);

    if (progressoSalvo) {
        const exerciciosConcluidos = JSON.parse(progressoSalvo);
        
        exerciciosConcluidos.forEach(id => {
            const card = document.querySelector(`.ficha-exercicio[data-id="${id}"]`);
            if (card) {
                // Adiciona a classe 'concluido' no carregamento
                card.classList.add('concluido');
                
                // Atualiza o texto do botão
                const botaoConcluido = card.querySelector('.btn-concluido');
                if (botaoConcluido) {
                    botaoConcluido.textContent = 'Desmarcar';
                }
            }
        });
    }
}

function salvarProgresso() {
    // 1. Encontra todos os exercícios concluídos na página
    const cardsConcluidos = document.querySelectorAll('.ficha-exercicio.concluido');
    
    // 2. Extrai os IDs de cada exercício concluído
    const exerciciosConcluidos = Array.from(cardsConcluidos).map(card => card.dataset.id);

    // 3. Salva a lista de IDs no localStorage com base no nome do arquivo
    const nomeFicha = window.location.pathname.split('/').pop() || 'index.html';
    localStorage.setItem(nomeFicha, JSON.stringify(exerciciosConcluidos));
}


// --- 2. FUNÇÃO MARCAR CONCLUÍDO (ATUALIZADA) ---

function marcarConcluido(botao) {
    const card = botao.closest('.ficha-exercicio');
    
    if (card.classList.contains('concluido')) {
        // Desmarca
        card.classList.remove('concluido');
        botao.textContent = 'Concluído';
    } else {
        // Marca
        card.classList.add('concluido');
        botao.textContent = 'Desmarcar';
        
        // Opcional: Para o cronômetro de descanso se estiver rodando
        clearInterval(intervalo);
        const cronometroSpan = card.querySelector('.cronometro');
        if (cronometroSpan) {
            cronometroSpan.textContent = '';
        }
    }
    
    // NOVIDADE: Chama a função para salvar a alteração
    salvarProgresso(); 
}


// --- 3. FUNÇÃO CRONÔMETRO DE DESCANSO (INALTERADA) ---

function iniciarCronometro(botao) {
    // 1. Limpa qualquer cronômetro anterior para evitar que vários rodem
    clearInterval(intervalo);

    // 2. Encontra o elemento <span> para exibir o tempo
    const cronometroSpan = botao.parentNode.querySelector('.cronometro');
    let tempoRestante = tempoPadrao;

    // 3. Função para atualizar o tempo
    function atualizarCronometro() {
        if (tempoRestante <= 0) {
            clearInterval(intervalo);
            cronometroSpan.textContent = "DESCANSO CONCLUÍDO!";
            cronometroSpan.style.color = 'green';
            botao.textContent = 'Descanso (60s)';
            return;
        }

        // Formata o tempo para exibir MM:SS
        const minutos = Math.floor(tempoRestante / 60);
        const segundos = tempoRestante % 60;
        const segundosFormatados = segundos < 10 ? '0' + segundos : segundos;
        
        cronometroSpan.textContent = `Descanso: ${minutos}:${segundosFormatados}`;
        cronometroSpan.style.color = '#dc3545'; // Cor de alerta
        tempoRestante--;
    }

    // 4. Inicia e define a atualização a cada 1 segundo
    atualizarCronometro(); // Roda imediatamente
    intervalo = setInterval(atualizarCronometro, 1000);
    botao.textContent = 'REINICIAR DESCANSO';
}
