const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // Importa a biblioteca bcryptjs

// Define o Schema (estrutura) para um usuário
const userSchema = new mongoose.Schema({
  fullName: { // Campo: Nome completo
    type: String,
    required: [true, 'Nome completo é obrigatório'],
    trim: true,
  },
  cpf: { // Campo: CPF
    type: String,
    required: [true, 'CPF é obrigatório'],
    unique: true, // Cada CPF deve ser único no banco de dados
    // Validação customizada para garantir que, após limpeza, tenha 11 dígitos
    validate: {
      validator: function(v) {
        // Verifica se o valor existe e, após remover não-dígitos, tem exatamente 11 caracteres
        const cleanedCpf = v ? v.replace(/\D/g, '') : '';
        return cleanedCpf.length === 11;
      },
      message: props => `${props.value} não é um formato de CPF válido (após limpeza, deve ter 11 dígitos).`
    },
    // Hook para limpar o CPF antes de salvar no banco
    set: function(v) {
      // Remove caracteres não numéricos antes de salvar
      return v ? v.replace(/\D/g, '') : v; // Retorna vazio ou null se a entrada for assim
    },
    // Getter opcional: para formatar o CPF ao buscar do banco (pode ser feito no frontend tbm)
    // get: function(v) {
    //   if (!v || v.length !== 11) return v; // Retorna o valor original se não for 11 dígitos
    //   return v.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    // }
  },
  password: { // Campo: Senha
    type: String,
    required: [true, 'Senha é obrigatória'],
    minlength: [6, 'Senha deve ter pelo menos 6 caracteres'],
  },
  securityQuestion: { // Campo: Pergunta de segurança
    type: String,
    required: [true, 'Pergunta de segurança é obrigatória'],
    trim: true,
  },
  securityAnswer: { // Campo: Resposta de segurança
    type: String,
    required: [true, 'Resposta de segurança é obrigatória'],
    trim: true,
    // Nota: A resposta de segurança TAMBÉM deveria ser hasheada para maior segurança.
    // Por agora, guardaremos como texto (trim). Implementar hashing seria similar à senha principal.
  },
  createdAt: { // Campo: Data de criação do usuário
    type: Date,
    default: Date.now, // Define a data de criação automaticamente
  }
});

// Middleware (Hook) do Mongoose: Executa ANTES de salvar o usuário
// Usado aqui para fazer o hash da senha principal
userSchema.pre('save', async function(next) {
  // "this" refere-se ao documento User que está sendo salvo.

  // 1. Hash SOMENTE a senha principal se ela foi modificada (ou é um novo usuário)
  //    Isso evita re-hashear a senha em atualizações de outros campos.
  if (!this.isModified('password')) { // <-- Verifica se o campo password foi modificado
    // Se a resposta de segurança também precisasse de hashing, você verificaria aqui tbm:
    // || !this.isModified('securityAnswer')
     return next(); // Se nem a senha nem a resposta (se hasheada) foram modificadas, pula o hash.
  }

  // Se a senha foi modificada, gere um salt e faça o hash da senha principal.
  if (this.isModified('password')) {
      const salt = await bcrypt.genSalt(10); // Gera um salt (valor aleatório) para o hashing (10 rounds)
      this.password = await bcrypt.hash(this.password, salt); // Hash a senha original
  }

  // 2. (Opcional - Se hashing a resposta de segurança) Hash a resposta de segurança se ela foi modificada
  // if (this.isModified('securityAnswer')) {
  //     const saltAnswer = await bcrypt.genSalt(10); // Gere um NOVO salt para a resposta
  //     this.securityAnswer = await bcrypt.hash(this.securityAnswer, saltAnswer); // Hash a resposta
  // }


  next(); // Continua para o próximo middleware ou salva o documento
});


// Cria o Modelo 'User' a partir do userSchema
// É este Modelo que usaremos para interagir com a coleção 'users' no MongoDB
const User = mongoose.model('User', userSchema);

// Exporta o Modelo para ser usado em outras partes do backend
module.exports = User;