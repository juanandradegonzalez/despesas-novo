const express = require('express');
const mongoose = require('mongoose'); // Importa o Mongoose
// O restante do seu código do express (const app = express(), etc.) virá aqui...

// String de conexão do MongoDB Atlas
// ***** MUITO IMPORTANTE: Substitua esta string PELA SUA STRING REAL! *****
const dbURI = 'mongodb+srv://juan:88749860@despesas.bg7riti.mongodb.net/?retryWrites=true&w=majority&appName=despesas'; // <== Substitua pela sua string real e completa!

// Conectar ao MongoDB
mongoose.connect(dbURI)
  .then(() => console.log('Conectado ao MongoDB Atlas!')) // Executa se a conexão for bem-sucedida
  .catch(err => console.error('Erro ao conectar ao MongoDB Atlas:', err)); // Executa se houver erro na conexão

// Eventos de conexão (opcional, mas útil para monitorar)
mongoose.connection.on('connected', () => {
  console.log('Mongoose conectado a ' + dbURI);
});

mongoose.connection.on('error', (err) => {
  console.error('Erro na conexão do Mongoose: ' + err);
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose desconectado');
});

// Para fechar a conexão do Mongoose se o Node.js for encerrado
process.on('SIGINT', () => {
  mongoose.connection.close(() => {
    console.log('Mongoose desconectado via encerramento da aplicação');
    process.exit(0);
  });
});

// --- Código do Express que já existia ---
const app = express();
const port = process.env.PORT || 3000;

// Middleware básico para permitir que o Express entenda JSON nas requisições
app.use(express.json());

// Rota de exemplo para verificar se o servidor está funcionando
app.get('/', (req, res) => {
  // Podemos verificar o estado da conexão aqui se quisermos, mas por agora, apenas envia a mensagem
  if (mongoose.connection.readyState === 1) { // 1 significa conectado
      res.send('Backend da Gestão de Despesas está rodando e CONECTADO ao DB!');
  } else {
      res.status(500).send('Backend da Gestão de Despesas está rodando, mas o DB NÃO ESTÁ CONECTADO!');
  }
});

// O servidor começa a "escutar" requisições na porta especificada
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});