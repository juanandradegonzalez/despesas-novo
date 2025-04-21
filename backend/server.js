const express = require('express');
const app = express();
const port = process.env.PORT || 3000; // Define a porta (usa a do ambiente se existir, senão 3000)

// Middleware básico para permitir que o Express entenda JSON nas requisições
app.use(express.json());

// Rota de exemplo para verificar se o servidor está funcionando
app.get('/', (req, res) => {
  res.send('Backend da Gestão de Despesas está rodando!');
});

// O servidor começa a "escutar" requisições na porta especificada
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});