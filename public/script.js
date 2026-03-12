const API = ""

async function carregarTarefas() {
    const res = await fetch(API + "/tarefas")
    const tarefas = await res.json()
    renderizarTarefas(tarefas)
}

function abrirFormulario() {
    document.getElementById("formulario").style.display = "block"
}

async function adicionarTarefa() {
    const nome = document.getElementById("nomeTarefa").value.trim()
    const custo = document.getElementById("custoTarefa").value
    const data = document.getElementById("dataTarefa").value

    if (!nome || !custo || !data) {
        alert("Preencha todos os campos")
        return
    }

    if (parseFloat(custo) < 0) {
        alert("Custo nao pode ser negativo")
        return
    }

    const res = await fetch(API + "/tarefas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome: nome, custo: parseFloat(custo), data_limite: data })
    })

    const data2 = await res.json()

    if (!res.ok) {
        alert(data2.erro)
        return
    }

    document.getElementById("nomeTarefa").value = ""
    document.getElementById("custoTarefa").value = ""
    document.getElementById("dataTarefa").value = ""
    document.getElementById("formulario").style.display = "none"

    carregarTarefas()
}

async function excluirTarefa(id) {
    if (!confirm("Deseja excluir essa tarefa?")) return
    await fetch(API + "/tarefas/" + id, { method: "DELETE" })
    carregarTarefas()
}

async function abrirEdicao(id, nomeAtual, custoAtual, dataAtual) {
    const novoNome = prompt("Nome da tarefa:", nomeAtual)
    if (novoNome === null) return

    const novoCusto = prompt("Custo (R$):", custoAtual)
    if (novoCusto === null) return

    const novaData = prompt("Data limite (AAAA-MM-DD):", dataAtual)
    if (novaData === null) return

    if (!novoNome.trim() || !novoCusto || !novaData.trim()) {
        alert("Nenhum campo pode ficar vazio")
        return
    }

    const res = await fetch(API + "/tarefas/" + id, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome: novoNome.trim(), custo: parseFloat(novoCusto), data_limite: novaData.trim() })
    })

    const data = await res.json()

    if (!res.ok) {
        alert(data.erro)
        return
    }

    carregarTarefas()
}

async function trocarOrdem(id1, ordem1, id2, ordem2) {
    await fetch(API + "/tarefas/reordenar/trocar", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id1: id1, ordem1: ordem1, id2: id2, ordem2: ordem2 })
    })
    carregarTarefas()
}

function formatarData(data) {
    const partes = data.split("T")[0].split("-")
    return partes[2] + "/" + partes[1] + "/" + partes[0]
}

function formatarCusto(custo) {
    return parseFloat(custo).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
}

let dragId = null

function renderizarTarefas(tarefas) {
    const lista = document.getElementById("listaTarefas")
    lista.innerHTML = ""
    let total = 0

    tarefas.forEach(function(tarefa, index) {
        const linha = document.createElement("tr")
        linha.setAttribute("draggable", "true")
        linha.setAttribute("data-id", tarefa.id)
        linha.setAttribute("data-ordem", tarefa.ordem_apresentacao)

        if (parseFloat(tarefa.custo) >= 1000) {
            linha.classList.add("custo-alto")
        }

        const btnSubir = index === 0 ? "" :
            "<button onclick=\"trocarOrdem(" + tarefa.id + "," + tarefa.ordem_apresentacao + "," + tarefas[index-1].id + "," + tarefas[index-1].ordem_apresentacao + ")\">&#9650;</button>"

        const btnDescer = index === tarefas.length - 1 ? "" :
            "<button onclick=\"trocarOrdem(" + tarefa.id + "," + tarefa.ordem_apresentacao + "," + tarefas[index+1].id + "," + tarefas[index+1].ordem_apresentacao + ")\">&#9660;</button>"

        const dataFormatada = tarefa.data_limite.split("T")[0]

        linha.innerHTML =
            "<td>" + tarefa.nome + "</td>" +
            "<td>" + formatarCusto(tarefa.custo) + "</td>" +
            "<td>" + formatarData(tarefa.data_limite) + "</td>" +
            "<td>" +
                btnSubir +
                btnDescer +
                "<button onclick=\"abrirEdicao(" + tarefa.id + ",'" + tarefa.nome + "'," + tarefa.custo + ",'" + dataFormatada + "')\">Editar</button>" +
                "<button onclick=\"excluirTarefa(" + tarefa.id + ")\">Excluir</button>" +
            "</td>"

        linha.addEventListener("dragstart", function() {
            dragId = tarefa.id
            this.classList.add("arrastando")
        })
        linha.addEventListener("dragover", function(e) {
            e.preventDefault()
        })
        linha.addEventListener("drop", function() {
            if (dragId === tarefa.id) return
            const origem = tarefas.find(function(t) { return t.id === dragId })
            if (origem) {
                trocarOrdem(origem.id, origem.ordem_apresentacao, tarefa.id, tarefa.ordem_apresentacao)
            }
        })
        linha.addEventListener("dragend", function() {
            this.classList.remove("arrastando")
            dragId = null
        })

        lista.appendChild(linha)
        total += parseFloat(tarefa.custo)
    })

    document.getElementById("totalCustos").innerText = formatarCusto(total)
}

carregarTarefas()