document.addEventListener('DOMContentLoaded', (event) => {
    const cpfInput = document.getElementById('cpf');

    cpfInput.addEventListener('input', function (e) {
        let value = e.target.value;

        // Remove tudo que não é dígito
        value = value.replace(/\D/g, '');

        // Limita a 11 dígitos (tamanho do CPF)
        value = value.substring(0, 11);

        // Aplica a máscara: ###.###.###-##
        value = value.replace(/(\d{3})(\d)/, '$1.$2');
        value = value.replace(/(\d{3})(\d)/, '$1.$2');
        value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');

        // Atualiza o valor do input
        e.target.value = value;
    });
});