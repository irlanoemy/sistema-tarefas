import { PGlite } from "@electric-sql/pglite";

const db = new PGlite();

export async function criarTabela() {
    await db.query(`
        CREATE TABLE IF NOT EXISTS tarefas (
            id SERIAL PRIMARY KEY,
            nome VARCHAR(255) UNIQUE NOT NULL,
            custo NUMERIC(10,2) NOT NULL CHECK (custo >= 0),
            data_limite DATE NOT NULL,
            ordem_apresentacao INTEGER UNIQUE NOT NULL
        )
    `)
    console.log("Tabela pronta!")
}

export async function buscarTarefas() {
    return await db.query("SELECT * FROM tarefas ORDER BY ordem_apresentacao")
}

export async function criarTarefa(nome, custo, data_limite, ordem) {
    return await db.query(
        "INSERT INTO tarefas (nome, custo, data_limite, ordem_apresentacao) VALUES ($1, $2, $3, $4) RETURNING *",
        [nome, custo, data_limite, ordem]
    )
}

export async function buscarProximaOrdem() {
    return await db.query(
        "SELECT COALESCE(MAX(ordem_apresentacao), 0) + 1 AS proxima FROM tarefas"
    )
}

//ADICIONADO: função de atualizar tarefa (nome, custo, data_limite)
export async function atualizarTarefa(id, nome, custo, data_limite) {
    return await db.query(
        "UPDATE tarefas SET nome=$1, custo=$2, data_limite=$3 WHERE id=$4 RETURNING *",
        [nome, custo, data_limite, id]
    )
}

//ADICIONADO: função de excluir tarefa por id
export async function excluirTarefa(id) {
    return await db.query(
        "DELETE FROM tarefas WHERE id=$1",
        [id]
    )
}

//ADICIONADO: função de trocar ordem entre duas tarefas
//usa -1 como valor temporário para evitar conflito de UNIQUE na coluna ordem_apresentacao
export async function trocarOrdem(id1, ordem1, id2, ordem2) {
    await db.query("UPDATE tarefas SET ordem_apresentacao=-1 WHERE id=$1", [id1])
    await db.query("UPDATE tarefas SET ordem_apresentacao=$1 WHERE id=$2", [ordem1, id2])
    await db.query("UPDATE tarefas SET ordem_apresentacao=$1 WHERE id=$2", [ordem2, id1])
}