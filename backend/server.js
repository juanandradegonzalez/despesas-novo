const express = require('express');
const mongoose = require('mongoose'); // Importa o Mongoose
const User = require('./models/userModel'); // Importa o modelo de usuário
const cors = require('cors'); // Importa o pacote cors
const bcrypt = require('bcryptjs'); // Importa a biblioteca bcryptjs

// String de conexão do MongoDB Atlas
// ***** MUITO IMPORTANTE: Substitua a string abaixo PELA SUA STRING REAL E COMPLETA! *****
// Exemplo: mongodb+srv://seu_usuario_real:sua_senha_real@cluster0.abcde.mongodb.net/nome_do_seu_db?retryWrites=true&w=majority&appName=seu_app_name
const dbURI = 'mongodb+srv://juan:88749860@despesas.bg7riti.mongodb.net/?retryWrites=true&w=majority&appName=despesas'; // <== SUBSTITUA AQUI PELA SUA STRING REAL!

// Conectar ao MongoDB Atlas
mongoose.connect(dbURI)
  .then(() => console.log('Conectado ao MongoDB Atlas com sucesso!')) // Executa se a conexão for bem-sucedida
  .catch(err => console.error('Erro ao conectar ao MongoDB Atlas:', err)); // Executa se houver erro na conexão

// Eventos de conexão (opcional, mas útil para monitorar)
mongoose.connection.on('connected', () => {
  console.log('Mongoose conectado à URI especificada.');
});

mongoose.connection.on('error', (err) => {
  console.error('Erro na conexão do Mongoose:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose desconectado.');
});

// Para fechar a conexão do Mongoose se o Node.js for encerrado (ex: Ctrl+C)
process.on('SIGINT', () => {
  mongoose.connection.close(() => {
    console.log('Mongoose desconectado via encerramento da aplicação.');
    process.exit(0);
  });
});


// --- Configuração do Express ---
const app = express();
const port = process.env.PORT || 3000;

// Middleware para logar cada requisição recebida BEM NO INÍCIO
app.use((req, res, next) => {
  console.log(`--> Recebida requisição: ${req.method} ${req.url} de ${req.ip}`);
  next(); // Continua para o próximo middleware ou rota
});

app.use(cors()); // Usa o middleware CORS para permitir requisições de outras origens

// Middleware para entender JSON nas requisições (essencial para receber dados POST)
app.use(express.json());


// --- Rotas da API ---

// Rota de exemplo para verificar o status do servidor e da conexão com o DB
app.get('/', (req, res) => {
  // readyState: 0=disconnected, 1=connected, 2=connecting, 3=disconnecting
  if (mongoose.connection.readyState === 1) {
      res.send('Backend da Gestão de Despesas está rodando e **CONECTADO** ao MongoDB Atlas!');
  } else {
      res.status(500).send('Backend da Gestão de Despesas está rodando, mas o MongoDB Atlas **NÃO ESTÁ CONECTADO**! Status: ' + mongoose.connection.readyState);
  }
});

// Rota para Registrar Novo Usuário (POST /api/auth/register)
app.post('/api/auth/register', async (req, res) => {
  // Extrai os dados do corpo da requisição (enviados pelo frontend ou Postman)
  const { fullName, cpf, password, securityQuestion, securityAnswer } = req.body;

  try {
    // Cria uma nova instância do modelo User com os dados recebidos
    // Os hooks e validações do Mongoose (CPF único/formato, hash de senha) rodam ao salvar
    const newUser = new User({
      fullName,
      cpf,
      password, // A senha será hasheada automaticamente pelo hook 'pre.save' no modelo
      securityQuestion,
      securityAnswer // Por enquanto, a resposta é salva como texto limpo
    });

    // Salva o novo usuário no banco de dados
    await newUser.save();

    // Se o usuário for salvo com sucesso, envia uma resposta de sucesso
    // status 201 significa "Created" (Criado)
    res.status(201).json({
      message: 'Usuário registrado com sucesso!',
      userId: newUser._id, // Envia o ID gerado pelo MongoDB para o novo documento
      cpf: newUser.cpf // Envia o CPF limpo de volta (opcional)
    });

  } catch (error) {
    // Se ocorrer um erro (ex: validação falhou, CPF duplicado, erro no DB, etc.)

    // Verifica se é um erro de validação do Mongoose (campos obrigatórios faltando, formato inválido, minlength)
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      // Status 400 para requisições inválidas
      return res.status(400).json({ message: 'Erro de validação: ' + messages.join(', ') });
    }

    // Verifica se é um erro de chave duplicada (código 11000, para campos 'unique', como o CPF)
    if (error.code === 11000 && error.keyPattern) {
        // Identifica qual campo duplicado causou o erro
        const field = Object.keys(error.keyPattern)[0];
        const value = error.keyValue[field];
        return res.status(400).json({ message: `O campo '${field}' com valor '${value}' já existe. (${field === 'cpf' ? 'Este CPF já está registrado' : 'Valor duplicado'}).` });
    }

    // Para outros erros inesperados do servidor
    console.error('Erro inesperado ao registrar usuário:', error);
    res.status(500).json({ message: 'Erro interno do servidor ao registrar usuário.' });
  }
});

// Rota para Login de Usuário Existente (POST /api/auth/login)
app.post('/api/auth/login', async (req, res) => {
  // Extrai CPF e Senha do corpo da requisição
  const { cpf, password } = req.body;

  try {
    // 1. Limpar o CPF recebido (remover pontos/hífen) para buscar no banco
    const cleanedCpf = cpf ? cpf.replace(/\D/g, '') : '';

    // 2. Procurar o usuário pelo CPF limpo no banco de dados
    const user = await User.findOne({ cpf: cleanedCpf });

    // 3. Verificar se o usuário foi encontrado
    if (!user) {
      // Usuário não encontrado com este CPF
      return res.status(401).json({ message: 'CPF ou senha inválidos.' }); // Status 401 Unauthorized
    }

    // 4. Comparar a senha fornecida com a senha hasheada do banco
    // bcrypt.compare(senha_texto_puro, senha_hasheada_do_banco) retorna true ou false
    const isMatch = await bcrypt.compare(password, user.password);

    // 5. Verificar se a senha coincide
    if (!isMatch) {
      // Senha incorreta
      return res.status(401).json({ message: 'CPF ou senha inválidos.' }); // Status 401 Unauthorized
    }

    // 6. Se o usuário for encontrado e a senha coincidir, o login foi bem-sucedido!
    // Podemos enviar informações do usuário de volta, MAS NUNCA A SENHA!
    res.status(200).json({
      message: 'Login bem-sucedido!',
      userId: user._id,
      fullName: user.fullName,
      cpf: user.cpf // CPF limpo
      // Futuramente, aqui poderíamos gerar e enviar um token de autenticação (JWT)
    });

  } catch (error) {
    // Capturar erros durante a busca ou comparação
    console.error('Erro durante o login:', error);
    res.status(500).json({ message: 'Erro interno do servidor durante o login.' });
  }
});

// --- Rota para Solicitar Pergunta de Segurança (REMOVIDA NESTE FLUXO) ---
// app.post('/api/auth/forgot-password-request', ...) - REMOVIDA NESTE CÓDIGO


// --- Rota para Redefinir Senha (POST /api/auth/reset-password) <--- ROTA ADICIONADA/COMPLETADA AQUI
app.post('/api/auth/reset-password', async (req, res) => {
  // Espera receber CPF, a pergunta ESCOLHIDA no dropdown, a resposta e a nova senha
  const { cpf, securityQuestion, securityAnswer, newPassword } = req.body;

  try {
    // 1. Limpar o CPF recebido
    const cleanedCpf = cpf ? cpf.replace(/\D/g, '') : '';

    // Validação básica dos campos recebidos
    if (!cleanedCpf || cleanedCpf.length !== 11 || !securityQuestion || !securityAnswer || !newPassword) {
        return res.status(400).json({ message: 'Dados incompletos ou formato de CPF inválido para redefinir a senha.' });
    }
    if (newPassword.length < 6) {
        return res.status(400).json({ message: 'A nova senha deve ter pelo menos 6 caracteres.' });
    }


    // 2. Procurar o usuário pelo CPF limpo
    // Selecionamos os campos necessários para verificação: cpf, password, securityQuestion, securityAnswer
    const user = await User.findOne({ cpf: cleanedCpf }).select('cpf password securityQuestion securityAnswer');


    // 3. Verificar se o usuário foi encontrado
    if (!user) {
        // Usuário não encontrado. Erro genérico por segurança.
        return res.status(400).json({ message: 'Credenciais inválidas para redefinir senha.' }); // Mensagem genérica
    }

    // 4. Verificar se a pergunta fornecida (do dropdown do frontend) coincide com a pergunta armazenada
    // Isso é importante para garantir que o usuário escolheu a pergunta correta da lista.
    if (user.securityQuestion !== securityQuestion) {
        // Pergunta não coincide. Erro genérico.
        return res.status(400).json({ message: 'Credenciais inválidas para redefinir senha.' }); // Mensagem genérica
    }

    // 5. Verificar se a resposta fornecida coincide com a resposta armazenada
    // Nota: Estamos comparando strings diretamente aqui, pois não hasheamos a resposta de segurança.
    // Uma comparação case-insensitive pode ser adicionada: user.securityAnswer.toLowerCase() !== securityAnswer.toLowerCase()
    if (user.securityAnswer !== securityAnswer) { // Comparação simples case-sensitive
        // Resposta não coincide. Erro genérico.
        return res.status(400).json({ message: 'Credenciais inválidas para redefinir senha.' }); // Mensagem genérica
    }


    // 6. Se chegou até aqui, CPF, Pergunta ESCOLHIDA e Resposta digitada ESTÃO CORRETOS e coincidem com o banco!
    // Fazer o hash da NOVA senha fornecida pelo usuário
    const salt = await bcrypt.genSalt(10);
    const hashedNewPassword = await bcrypt.hash(newPassword, salt);

    // 7. Atualizar a senha do usuário no banco de dados
    // Encontra o usuário pelo ID e atualiza APENAS o campo password
    await User.findByIdAndUpdate(user._id, { password: hashedNewPassword }, { new: true });

    // Uma alternativa seria carregar o documento completo, mudar a senha e salvar:
    // user.password = hashedNewPassword; // Atribui a nova senha hasheada
    // await user.save(); // Salva o documento atualizado (Nota: O hook pre('save') NÃO roda automaticamente aqui para o password se o password foi hasheado manualmente antes)


    // 8. Sucesso na redefinição!
    res.status(200).json({ message: 'Senha redefinida com sucesso!' });

  } catch (error) {
    console.error('Erro durante a redefinição de senha:', error);
     if (error.name === 'ValidationError') { // Erro de validação na NOVA senha (ex: minlength, se usarmos validação no schema ao atualizar)
        const messages = Object.values(error.errors).map(val => val.message);
        return res.status(400).json({ message: 'Erro de validação na nova senha: ' + messages.join(', ') });
     }
    res.status(500).json({ message: 'Erro interno do servidor durante a redefinição de senha.' });
  }
});


// --- Iniciar o Servidor Express ---
// O servidor começa a "escutar" requisições na porta especificada
app.listen(port, () => {
  console.log(`Servidor Express rodando em http://localhost:${port}`);
});