// Aguarda o DOM carregar completamente antes de executar o script
document.addEventListener('DOMContentLoaded', (event) => {
    // --- Código da Máscara de CPF ---
    const cpfInput = document.getElementById('cpf');

    // Verifica se o elemento CPF existe na página atual antes de adicionar o listener
    // (Ele existe nas 3 páginas: index.html, cadastro.html, forgot-password.html)
    if (cpfInput) {
        cpfInput.addEventListener('input', function (e) {
            let value = e.target.value;

            // Remove tudo que não é dígito. Isso impede letras.
            value = value.replace(/\D/g, '');

            // Limita a 11 dígitos (tamanho do CPF)
            value = value.substring(0, 11);

            // Aplica a máscara: ###.###.###-##
            // Aplica as partes da máscara APENAS se já houver dígitos suficientes
            if (value.length > 3) {
                 value = value.replace(/(\d{3})(\d)/, '$1.$2');
            }
             if (value.length > 6) {
                value = value.replace(/(\d{3})(\d)/, '$1.$2'); // Aplica no segundo grupo de 3
            }
             if (value.length > 9) {
                 value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2'); // Aplica o hífen
            }


            // Atualiza o valor do input com o CPF formatado
            e.target.value = value;
        });

         // Opcional: Adicionar um listener para colar (paste) para aplicar a máscara também
         cpfInput.addEventListener('paste', function(e) {
             const pasteData = e.clipboardData.getData('text');
             // Processa o dado colado para aplicar a máscara
             let value = pasteData.replace(/\D/g, '').substring(0, 11);

             // Aplica a máscara similar ao input
             if (value.length > 3) value = value.replace(/(\d{3})(\d)/, '$1.$2');
             if (value.length > 6) value = value.replace(/(\d{3})(\d)/, '$1.$2');
             if (value.length > 9) value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');

             e.target.value = value;
             e.preventDefault(); // Previne a colagem padrão para que nosso script controle
         });
    }
    // --- Fim do Código da Máscara de CPF ---


    // --- Código para o Formulário de Login (Executa APENAS na página index.html) ---
    // Verifica se o formulário de login existe na página atual antes de adicionar o listener
    const loginForm = document.getElementById('loginForm');

    if (loginForm) { // Esta lógica SÓ roda se existir um elemento com id="loginForm" na página (apenas em index.html)
        const loginBackendUrl = 'http://localhost:3000/api/auth/login'; // URL da rota de login no backend (local)

        // Adiciona um ouvinte para o evento 'submit' do formulário de login
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault(); // Previne o comportamento padrão do formulário (recarregar a página)

            // Coleta os valores dos campos CPF e Senha do formulário de login
            // Pega o valor atual do input CPF (já mascarado no visual, mas limpamos para enviar)
             const cpf = cpfInput ? cpfInput.value.replace(/\D/g, '') : ''; // Pega o CPF limpo
            const passwordInput = document.getElementById('senha'); // ID do campo senha é 'senha' no index.html
            const password = passwordInput ? passwordInput.value : ''; // Pega o valor da senha


            // Validação básica de campos antes de enviar
             if (!cpf || cpf.length !== 11 || !password) {
                 alert('Por favor, preencha CPF e Senha corretamente.');
                 return;
             }


            // Cria um objeto com os dados para enviar
            const loginData = {
                 cpf: cpf, // Envia o CPF limpo
                 password: password
             };

            console.log('Dados de login coletados:', loginData); // Log para depuração

            try {
                // Envia os dados para a rota de login no backend
                const response = await fetch(loginBackendUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(loginData) // Envia CPF e senha como JSON
                });

                // Analisa a resposta do backend
                const result = await response.json();

                console.log('Resposta do backend (Login):', result); // Log da resposta

                // Verifica o status da resposta do backend
                if (response.ok) { // status 200-299 indica sucesso
                    alert('Login bem-sucedido! Olá, ' + result.fullName); // Feedback

                    // Armazenar informações do usuário (userId, fullName, etc.) no Local Storage
                    // Isso é um método BÁSICO para manter o estado de login no frontend.
                    // Em apps reais, JWTs seriam usados para segurança.
                    localStorage.setItem('currentUser', JSON.stringify({
                        userId: result.userId,
                        fullName: result.fullName,
                        cpf: result.cpf
                    }));

                    // Redirecionar para a próxima página (ex: dashboard de despesas)
                    window.location.href = 'dashboard.html'; // <-- Vamos criar um placeholder para o dashboard depois

                } else { // Status de erro (401 Unauthorized, 400 Bad Request, 500 Internal Error, etc.)
                    // Mostra a mensagem de erro vinda do backend (ex: "CPF ou senha inválidos.")
                    alert('Erro no login: ' + (result.message || 'Erro desconhecido'));
                }

            } catch (error) {
                // Captura erros de rede (servidor offline, problema CORS - se não estiver resolvido)
                console.error('Erro ao enviar dados de login para o backend:', error);
                alert('Erro ao conectar com o servidor de login. Verifique se o backend está rodando.');
            }
        });
    }
    // --- Fim do Código para o Formulário de Login ---

    // Note: A lógica para o formulário de Cadastro está no cadastro.js
    // Note: A lógica para o formulário de Recuperar Senha está no forgot-password.js
    // Esses scripts são incluídos no HTML de suas respectivas páginas.

}); // <-- Fecha o addEventListener('DOMContentLoaded', ...)