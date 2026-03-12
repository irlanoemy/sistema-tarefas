let tarefas = []
let ordemAtual = 1 // controla a ordem de apresentação

//Formulário
function abrirFormulario() {
    let form = document.getElementById("formulario")
    form.style.display = "block"
}

//Incluir tarefa
function adicionarTarefa() {
    let nome  = document.getElementById("nomeTarefa").value.trim()
    let custo = document.getElementById("custoTarefa").value
    let data  = document.getElementById("dataTarefa").value

    if (nome === "" || custo === "" || data === "") {
        alert("Preencha todos os campos")
        return
    }

    custo = parseFloat(custo)

    if (isNaN(custo) || custo < 0) {
        alert("Custo inválido")
        return
    }

    //verifica nome duplicado
    let repetida = tarefas.find(t => t.nome.toLowerCase() === nome.toLowerCase())
    if (repetida) {
        alert("Já existe uma tarefa com esse nome")
        return
    }

    let tarefa = {
        id: Date.now(),
        nome: nome,
        custo: custo,
        data: data,
        ordem: ordemAtual++ //novo registro vai para o último
    }

    tarefas.push(tarefa)

    // limpa campos e esconde formulário
    document.getElementById("nomeTarefa").value  = ""
    document.getElementById("custoTarefa").value = ""
    document.getElementById("dataTarefa").value  = ""
    document.getElementById("formulario").style.display = "none"

    renderizarTarefas()
}

//Formatar data YYYY-MM-DD → DD/MM/AAAA
function formatarData(data) {
    let [ano, mes, dia] = data.split("-")
    return `${dia}/${mes}/${ano}`
}

//Formatar custo → R$ 1.500,00
function formatarCusto(custo) {
    return custo.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
}

//Renderizar
function renderizarTarefas() {

    // ordena pelo campo "ordem"
    tarefas.sort((a, b) => a.ordem - b.ordem)

    let lista = document.getElementById("listaTarefas")
    lista.innerHTML = ""

    let total = 0

    tarefas.forEach((tarefa, index) => {
        let linha = document.createElement("tr")
        linha.setAttribute("draggable", "true")         // habilita drag
        linha.setAttribute("data-id", tarefa.id)        // guarda id no elemento

        if (tarefa.custo >= 1000) {
            linha.classList.add("custo-alto")
        }

        //botão subir desaparece no primeiro, descer no último
        let btnSubir  = index === 0                  ? "" : `<button onclick="subir(${tarefa.id})">▲</button>`
        let btnDescer = index === tarefas.length - 1 ? "" : `<button onclick="descer(${tarefa.id})">▼</button>`

        linha.innerHTML = `
            <td>${tarefa.nome}</td>
            <td>${formatarCusto(tarefa.custo)}</td>
            <td>${formatarData(tarefa.data)}</td>
            <td>
                ${btnSubir}
                ${btnDescer}
                <button onclick="abrirEdicao(${tarefa.id})">Editar</button>
                <button onclick="excluirTarefa(${tarefa.id})">Excluir</button>
            </td>
        `

        // eventos de drag-and-drop
        linha.addEventListener("dragstart", dragStart)
        linha.addEventListener("dragover",  dragOver)
        linha.addEventListener("drop",      drop)
        linha.addEventListener("dragend",   dragEnd)

        lista.appendChild(linha)

        total += tarefa.custo
    })

    //total em formato brasileiro
    document.getElementById("totalCustos").innerText = formatarCusto(total)
}

//Excluir
function excluirTarefa(id) {
    if (!confirm("Deseja excluir essa tarefa?")) return
    tarefas = tarefas.filter(t => t.id !== id)
    renderizarTarefas()
}

//Editar (popup simples)
function abrirEdicao(id) {
    let tarefa = tarefas.find(t => t.id === id)
    if (!tarefa) return

    let novoNome  = prompt("Nome da tarefa:", tarefa.nome)
    if (novoNome === null) return // cancelou
    novoNome = novoNome.trim()

    let novoCusto = prompt("Custo (R$):", tarefa.custo)
    if (novoCusto === null) return
    novoCusto = parseFloat(novoCusto)

    // converte data para o formato do prompt (YYYY-MM-DD → DD/MM/AAAA e volta)
    let novaData = prompt("Data limite (AAAA-MM-DD):", tarefa.data)
    if (novaData === null) return
    novaData = novaData.trim()

    if (novoNome === "" || isNaN(novoCusto) || novaData === "") {
        alert("Nenhum campo pode ficar vazio")
        return
    }

    // verifica nome duplicado (ignorando a própria tarefa)
    let repetida = tarefas.find(t => t.nome.toLowerCase() === novoNome.toLowerCase() && t.id !== id)
    if (repetida) {
        alert("Já existe outra tarefa com esse nome")
        return
    }

    tarefa.nome  = novoNome
    tarefa.custo = novoCusto
    tarefa.data  = novaData

    renderizarTarefas()
}

//Reordenar: subir/descer 
function subir(id) {
    let index = tarefas.findIndex(t => t.id === id)
    if (index > 0) {
        // troca o campo "ordem" com o anterior
        let ordemTemp       = tarefas[index].ordem
        tarefas[index].ordem     = tarefas[index - 1].ordem
        tarefas[index - 1].ordem = ordemTemp
    }
    renderizarTarefas() // ← nome correto da função (estava "renderizar()" antes — bug!)
}

function descer(id) {
    let index = tarefas.findIndex(t => t.id === id)
    if (index < tarefas.length - 1) {
        let ordemTemp            = tarefas[index].ordem
        tarefas[index].ordem     = tarefas[index + 1].ordem
        tarefas[index + 1].ordem = ordemTemp
    }
    renderizarTarefas() // ← mesmo bug corrigido aqui
}

//Drag and Drop
let dragId = null // guarda o id da tarefa sendo arrastada

function dragStart(e) {
    dragId = parseInt(this.getAttribute("data-id"))
    this.classList.add("arrastando")
}

function dragOver(e) {
    e.preventDefault() // necessário para permitir o drop
}

function drop(e) {
    e.preventDefault()
    let alvoId = parseInt(this.getAttribute("data-id"))

    if (dragId === alvoId) return // soltou em si mesmo

    // troca a ordem entre a tarefa arrastada e a tarefa alvo
    let origem = tarefas.find(t => t.id === dragId)
    let alvo   = tarefas.find(t => t.id === alvoId)

    let ordemTemp  = origem.ordem
    origem.ordem   = alvo.ordem
    alvo.ordem     = ordemTemp

    renderizarTarefas()
}

function dragEnd() {
    this.classList.remove("arrastando")
    dragId = null
}