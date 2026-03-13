# Sistema de Lista de Tarefas

Aplicação web para cadastro e gerenciamento de tarefas.

## Links
- **Aplicação:** https://sistema-tarefas-production-28b8.up.railway.app
- **Repositório:** https://github.com/irlanoemy/sistema-tarefas

## Funcionalidades
- Listar tarefas ordenadas por ordem de apresentação
- Adicionar nova tarefa (nome, custo, data limite)
- Editar tarefa existente
- Excluir tarefa com confirmação
- Reordenar tarefas por drag-and-drop ou botões ▲▼
- Destaque em amarelo para tarefas com custo >= R$ 1.000,00
- Somatório dos custos no rodapé
- Validação de nome duplicado

## Tecnologias
- **Frontend:** HTML, CSS, JavaScript
- **Backend:** Node.js, Express
- **Banco de dados:** PGlite (PostgreSQL no browser, sem instalação)

## Como executar localmente
1. Clone o repositório
   git clone https://github.com/irlanoemy/sistema-tarefas.git

2. Entre na pasta
   cd sistema-tarefas

3. Instale as dependências
   npm install

4. Inicie o servidor
   node server.js

5. Acesse no navegador
   http://localhost:3000