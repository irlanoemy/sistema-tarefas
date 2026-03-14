//ALTERADO: server.js simplificado, rotas movidas para source/tarefas.routes.js
import express from "express"
import cors from "cors"
import { criarTabela } from "./source/database.js"
import tarefasRouter from "./source/tarefas.routes.js"

const app = express()
const port = process.env.PORT || 3000

app.use(cors())
app.use(express.json())
app.use(express.static("public"))

criarTabela()

//ALTERADO: todas as rotas /tarefas agora vêm do router
app.use("/tarefas", tarefasRouter)

//ADICIONADO: middleware global de erros, captura qualquer next(err) das rotas
app.use((err, req, res, next) => {
    if (err.code === "23505") {
        return res.status(400).json({ erro: "Ja existe uma tarefa com esse nome" })
    }
    console.error(err)
    res.status(500).json({ erro: "Erro interno do servidor" })
})

app.listen(port, () => console.log("Servidor rodando na porta " + port))