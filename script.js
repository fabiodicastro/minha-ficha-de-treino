// VARIÁVEL GLOBAL PARA O CRONÔMETRO
let intervalo;
const tempoPadrao = 60; // 60 segundos (tempo de descanso)


// ==========================================================
// 1. PERSISTÊNCIA DE DADOS (CARREGAR E SALVAR PROGRESSO)
// ==========================================================

// Carrega o progresso ao abrir a página
document.addEventListener('DOMContentLoaded', carregarProgresso);

function carregarProgresso() {
    // Usa o nome do arquivo (ex: index.html) como chave para o localStorage
    const nomeFicha = window.location.pathname.split('/').pop() || 'index.html';
    const progressoSalvo = localStorage.getItem(nomeFicha);
    const listaExercicios = document.querySelector('.lista-exercicios');

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

                // Move o card concluído para o final da lista ao carregar
                if (listaExercicios) {
                     listaExercicios.appendChild(card);
                }
            }
        });
    }
}

function salvarProgresso() {
    // 1. Encontra todos os exercícios que possuem a classe 'concluido'
    const cardsConcluidos = document.querySelectorAll('.ficha-exercicio.concluido');
    
    // 2. Extrai os valores do atributo data-id
    const exerciciosConcluidos = Array.from(cardsConcluidos).map(card => card.dataset.id);

    // 3. Salva a lista de IDs no localStorage
    const nomeFicha = window.location.pathname.split('/').pop() || 'index.html';
    localStorage.setItem(nomeFicha, JSON.stringify(exerciciosConcluidos));
}


// ==========================================================
// 2. MARCAR CONCLUÍDO E MOVER CARD
// ==========================================================

function marcarConcluido(botao) {
    const card = botao.closest('.ficha-exercicio');
    // Busca o container correto de exercícios para movimentação
    const listaExercicios = document.querySelector('.lista-exercicios'); 

    if (!listaExercicios) return; // Parada de segurança

    if (card.classList.contains('concluido')) {
        // --- AÇÃO: DESMARCAR (volta para o topo) ---
        card.classList.remove('concluido');
        botao.textContent = 'Concluído';
        
        // Mover para o INÍCIO da lista
        // Insere o card antes do primeiro card existente no container
        listaExercicios.insertBefore(card, listaExercicios.firstChild); 
        
    } else {
        // --- AÇÃO: MARCAR (vai para o fim) ---
        card.classList.add('concluido');
        botao.textContent = 'Desmarcar';
        
        // Opcional: Para o cronômetro de descanso se estiver rodando
        clearInterval(intervalo);
        const cronometroSpan = card.querySelector('.cronometro');
        if (cronometroSpan) {
            cronometroSpan.textContent = '';
        }
        
        // Mover para o FINAL da lista
        listaExercicios.appendChild(card);
    }
    
    // Salva a alteração
    salvarProgresso(); 
}


// ==========================================================
// 3. CRONÔMETRO DE DESCANSO
// ==========================================================

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
