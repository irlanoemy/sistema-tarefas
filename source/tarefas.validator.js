//ADICIONADO: arquivo de validações, checa os dados antes de tocar no banco

export function validarTarefa(nome, custo, data_limite) {
    if (!nome || nome.trim() === "") {
        return "Nome é obrigatório"
    }
    if (custo === undefined || custo === null || custo === "") {
        return "Custo é obrigatório"
    }
    if (Number(custo) < 0) {
        return "Custo deve ser maior ou igual a zero"
    }
    if (!data_limite) {
        return "Data limite é obrigatória"
    }
    return null // null = sem erros, pode prosseguir
}

export function validarReordenacao(id1, ordem1, id2, ordem2) {
    if (!id1 || !id2 || ordem1 === undefined || ordem2 === undefined) {
        return "Dados de reordenação incompletos"
    }
    return null
}