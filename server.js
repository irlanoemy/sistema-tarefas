const express = require("express")
const cors = require("cors")
const { Pool } = require("pg")

const app = express()
const port = process.env.PORT || 3000

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
})

app.use(cors())
app.use(express.json())
app.use(express.static("public"))

async function criarTabela() {
    await pool.query(`
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
criarTabela()

app.get("/tarefas", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM tarefas ORDER BY ordem_apresentacao")
        res.json(result.rows)
    } catch (err) {
        res.status(500).json({ erro: err.message })
    }
})

app.post("/tarefas", async (req, res) => {
    try {
        const { nome, custo, data_limite } = req.body
        const ordemResult = await pool.query(
            "SELECT COALESCE(MAX(ordem_apresentacao), 0) + 1 AS proxima FROM tarefas"
        )
        const ordem = ordemResult.rows[0].proxima
        const result = await pool.query(
            "INSERT INTO tarefas (nome, custo, data_limite, ordem_apresentacao) VALUES ($1, $2, $3, $4) RETURNING *",
            [nome, custo, data_limite, ordem]
        )
        res.status(201).json(result.rows[0])
    } catch (err) {
        if (err.code === "23505") {
            res.status(400).json({ erro: "Ja existe uma tarefa com esse nome" })
        } else {
            res.status(500).json({ erro: err.message })
        }
    }
})

app.put("/tarefas/reordenar/trocar", async (req, res) => {
    try {
        const { id1, ordem1, id2, ordem2 } = req.body
        await pool.query("UPDATE tarefas SET ordem_apresentacao=-1 WHERE id=$1", [id1])
        await pool.query("UPDATE tarefas SET ordem_apresentacao=$1 WHERE id=$2", [ordem1, id2])
        await pool.query("UPDATE tarefas SET ordem_apresentacao=$1 WHERE id=$2", [ordem2, id1])
        res.json({ mensagem: "Ordem atualizada" })
    } catch (err) {
        res.status(500).json({ erro: err.message })
    }
})

app.put("/tarefas/:id", async (req, res) => {
    try {
        const { id } = req.params
        const { nome, custo, data_limite } = req.body
        const result = await pool.query(
            "UPDATE tarefas SET nome=$1, custo=$2, data_limite=$3 WHERE id=$4 RETURNING *",
            [nome, custo, data_limite, id]
        )
        if (result.rows.length === 0) {
            return res.status(404).json({ erro: "Tarefa nao encontrada" })
        }
        res.json(result.rows[0])
    } catch (err) {
        if (err.code === "23505") {
            res.status(400).json({ erro: "Ja existe uma tarefa com esse nome" })
        } else {
            res.status(500).json({ erro: err.message })
        }
    }
})

app.delete("/tarefas/:id", async (req, res) => {
    try {
        const { id } = req.params
        await pool.query("DELETE FROM tarefas WHERE id=$1", [id])
        res.json({ mensagem: "Tarefa excluida" })
    } catch (err) {
        res.status(500).json({ erro: err.message })
    }
})

app.listen(port, () => console.log("Servidor rodando na porta " + port))