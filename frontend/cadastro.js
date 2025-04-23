// Aguarda o DOM carregar completamente antes de executar o script
document.addEventListener('DOMContentLoaded', () => {
    // Seleciona o formulário de cadastro pelo ID
    const cadastroForm = document.getElementById('cadastroForm');
    // Define o endpoint do backend para registro de usuário (usando localhost por enquanto)
    const backendUrl = 'http://localhost:3000/api/auth/register'; // <== Endereço do seu backend local

    // Adiciona um ouvinte para o evento de 'submit' (quando o formulário é enviado)
    cadastroForm.addEventListener('submit', async (event) => {
        event.preventDefault(); // Previne o comportamento padrão do formulário (recarregar a página)

        // Coleta os dados dos campos do formulário
        const fullName = document.getElementById('fullName').value;
        const cpf = document.getElementById('cpf').value;
        const password = document.getElementById('password').value;
        const securityQuestion = document.getElementById('securityQuestion').value;
        const securityAnswer = document.getElementById('securityAnswer').value;

        // Cria um objeto com os dados do usuário
        const userData = {
            fullName: fullName,
            cpf: cpf,
            password: password,
            securityQuestion: securityQuestion,
            securityAnswer: securityAnswer
        };

        console.log('Dados do formulário coletados:', userData); // Log para depuração

        try {
            // Envia os dados para o backend usando a Fetch API
            const response = await fetch(backendUrl, {
                method: 'POST', // Método HTTP POST
                headers: {
                    'Content-Type': 'application/json', // Indica que o corpo da requisição é JSON
                },
                body: JSON.stringify(userData) // Converte o objeto JS para uma string JSON para enviar no corpo
            });

            // Analisa a resposta do backend como JSON
            const result = await response.json();

            console.log('Resposta do backend:', result); // Log da resposta

            // Verifica o status da resposta
            if (response.ok) { // status 200-299 indica sucesso
                alert('Cadastro realizado com sucesso!'); // Feedback visual
                // Opcional: Redirecionar para a tela de login
                window.location.href = 'index.html';
            } else { // Status de erro (400, 500, etc.)
                // Mostra a mensagem de erro vinda do backend
                alert('Erro no cadastro: ' + (result.message || 'Erro desconhecido'));
            }

        } catch (error) {
            // Captura erros de rede (servidor offline, problema CORS, etc.)
            console.error('Erro ao enviar dados para o backend:', error);
            alert('Erro ao conectar com o servidor. Tente novamente mais tarde.');
        }
    });
});