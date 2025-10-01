// --- CRONÔMETRO DE DESCANSO ---
let intervalo;
const tempoPadrao = 60; // 60 segundos (você pode ajustar)

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


// --- MARCAR COMO CONCLUÍDO ---
function marcarConcluido(botao) {
    const card = botao.closest('.ficha-exercicio');
    
    // Verifica se o card já está marcado como concluído
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
}
