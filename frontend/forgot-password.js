// Aguarda o DOM carregar completamente
document.addEventListener('DOMContentLoaded', () => {
    // --- Seleção de Elementos HTML ---
    // O formulário principal que engloba todos os campos
    const resetPasswordForm = document.getElementById('resetPasswordForm');

    const cpfInput = document.getElementById('cpf'); // Campo CPF
    const securityQuestionSelect = document.getElementById('securityQuestion'); // Dropdown pergunta
    const securityAnswerInput = document.getElementById('securityAnswer');     // Campo Resposta
    const newPasswordInput = document.getElementById('newPassword');         // Campo Nova Senha
    const resetButton = document.getElementById('resetPasswordButton');       // Botão "Redefinir Senha"

    // --- URL do Endpoint do Backend ---
    // Esta página AGORA só envia para a rota de redefinir senha
    const resetPasswordUrl = 'http://localhost:3000/api/auth/reset-password'; // <== Endereço para redefinir a senha (local)

    // Lógica da máscara de CPF já vem do script.js incluído no HTML.

    // --- Lógica Principal: Um Único Listener de Submit para Enviar Todos os Dados ---
    // O formulário agora envia todos os dados quando o botão 'Redefinir Senha' (type="submit") é clicado.
    resetPasswordForm.addEventListener('submit', async (event) => {
        event.preventDefault(); // Sempre previne o comportamento padrão do formulário

        // Coleta os valores de TODOS os campos
        const cpf = cpfInput.value;
        const securityQuestion = securityQuestionSelect.value; // Valor da pergunta selecionada (o 'value' da tag <option>)
        const securityAnswer = securityAnswerInput.value;
        const newPassword = newPasswordInput.value;

        // --- Validação no Frontend (Antes de Enviar) ---
        const cleanedCpf = cpf ? cpf.replace(/\D/g, '') : '';

        if (cleanedCpf.length !== 11) {
            alert('Por favor, digite um CPF válido com 11 dígitos.');
            return;
        }

        if (!securityQuestion) { // Verifica se alguma pergunta foi selecionada (o valor é diferente do placeholder vazio)
             alert('Por favor, selecione sua pergunta de segurança.');
             return;
        }

         if (!securityAnswer) { // Verifica se a resposta foi digitada
             alert('Por favor, digite sua resposta.');
             return;
        }

         if (newPassword.length < 6) { // Verifica o tamanho mínimo da nova senha
             alert('A nova senha deve ter pelo menos 6 caracteres.');
             return;
         }


        // --- Preparar Dados para Enviar ---
        // Cria um objeto com todos os dados para enviar ao backend
        const resetData = {
             cpf: cleanedCpf, // Envia o CPF limpo
             securityQuestion: securityQuestion, // Envia a pergunta selecionada (o 'value' da <option>)
             securityAnswer: securityAnswer,     // Envia a resposta
             newPassword: newPassword           // Envia a nova senha (texto puro)
        };

        console.log('Tentando redefinir senha com dados:', resetData); // Log dos dados (exceto senha)


        // Desabilita o botão enquanto espera a resposta
        resetButton.disabled = true;
        resetButton.textContent = 'Redefinindo...';


        // --- Enviar Dados para o Backend ---
        try {
            // Usa a Fetch API para enviar a requisição POST para a rota de reset de senha no backend
            const response = await fetch(resetPasswordUrl, {
                method: 'POST', // Método HTTP POST
                headers: { 'Content-Type': 'application/json' }, // Informa que o corpo é JSON
                body: JSON.stringify(resetData) // Converte o objeto JS para string JSON
            });

            // Analisa a resposta do backend como JSON
            const result = await response.json();
            console.log('Resposta do backend (Redefinir Senha):', result);

            // --- Processar Resposta do Backend ---
            if (response.ok) { // Verifica se o status da resposta é 200-299 (sucesso)
                alert('Senha redefinida com sucesso! Você já pode fazer login com a nova senha.');
                // Redireciona para a página de login após sucesso
                window.location.href = 'index.html';

            } else { // Status de erro do backend (400, 401, 500, etc.)
                 // Mostra a mensagem de erro vinda do backend
                 alert('Erro ao redefinir senha: ' + (result.message || 'Ocorreu um erro.'));
                 // Habilita o botão novamente
                 resetButton.disabled = false;
                 resetButton.textContent = 'Redefinir Senha';
            }

        } catch (error) {
            // Captura erros de rede (servidor offline, CORS, etc.)
            console.error('Erro de rede ao enviar redefinição de senha para o backend:', error);
            alert('Erro ao conectar com o servidor de redefinição de senha. Verifique se o backend está rodando.');
             // Habilita o botão novamente em caso de erro de rede
             resetButton.disabled = false;
             resetButton.textContent = 'Redefinir Senha';
        }
    });

    // Note: A máscara de CPF é aplicada ao campo CPF pois incluímos script.js no HTML desta página.
});