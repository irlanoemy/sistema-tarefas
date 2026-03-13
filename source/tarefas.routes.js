//ADICIONADO: rotas de tarefas separadas do server.js
import { Router } from "express"
import {
    buscarTarefas,
    criarTarefa,
    buscarProximaOrdem,
    atualizarTarefa,
    excluirTarefa,
    trocarOrdem
} from "./database.js"
import { validarTarefa, validarReordenacao } from "./tarefas.validator.js"

const router = Router()

router.get("/", async (req, res, next) => {
    try {
        const result = await buscarTarefas()
        res.json(result.rows)
    } catch (err) {
        next(err)
    }
})

router.post("/", async (req, res, next) => {
    try {
        const { nome, custo, data_limite } = req.body

        //ADICIONADO: validação antes de acessar o banco
        const erro = validarTarefa(nome, custo, data_limite)
        if (erro) return res.status(400).json({ erro })

        const ordemResult = await buscarProximaOrdem()
        const ordem = ordemResult.rows[0].proxima
        const result = await criarTarefa(nome, custo, data_limite, ordem)
        res.status(201).json(result.rows[0])
    } catch (err) {
        next(err)
    }
})

router.put("/reordenar/trocar", async (req, res, next) => {
    try {
        const { id1, ordem1, id2, ordem2 } = req.body

        //ADICIONADO: validação antes de acessar o banco
        const erro = validarReordenacao(id1, ordem1, id2, ordem2)
        if (erro) return res.status(400).json({ erro })

        await trocarOrdem(id1, ordem1, id2, ordem2)
        res.json({ mensagem: "Ordem atualizada" })
    } catch (err) {
        next(err)
    }
})

router.put("/:id", async (req, res, next) => {
    try {
        const { id } = req.params
        const { nome, custo, data_limite } = req.body

        //ADICIONADO: validação antes de acessar o banco
        const erro = validarTarefa(nome, custo, data_limite)
        if (erro) return res.status(400).json({ erro })

        const result = await atualizarTarefa(id, nome, custo, data_limite)
        if (result.rows.length === 0) {
            return res.status(404).json({ erro: "Tarefa nao encontrada" })
        }
        res.json(result.rows[0])
    } catch (err) {
        next(err)
    }
})

router.delete("/:id", async (req, res, next) => {
    try {
        const { id } = req.params
        await excluirTarefa(id)
        res.json({ mensagem: "Tarefa excluida" })
    } catch (err) {
        next(err)
    }
})

export default router