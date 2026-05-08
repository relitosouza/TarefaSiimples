# Roadmap - TarefaSimples

## 🟢 Fase 1: Setup e Infraestrutura
- [ ] Inicialização do Next.js 15 (App Router).
- [ ] Configuração do Tailwind CSS v4.
- [ ] Instalação de dependências (`google-spreadsheet`, `lucide-react`, `clsx`, `tailwind-merge`).
- [ ] Configuração do `shadcn/ui` (Button, Input, Checkbox, Dialog/Modal).

## 🟡 Fase 2: Integração Google Sheets
- [ ] Criação do arquivo de utilitário para conexão com a planilha.
- [ ] Implementação de Server Actions para CRUD de tarefas:
    - `getTasks()`: Busca tarefas e histórico para autocomplete.
    - `addTask(taskName)`: Adiciona nova tarefa com timestamp.
    - `updateTaskStatus(id, status)`: Atualiza status e data de conclusão.

## 🔵 Fase 3: Interface do Usuário (UI)
- [ ] Layout principal com suporte a Dark Mode.
- [ ] Componente de Input com Autocomplete (Combobox).
- [ ] Lista de tarefas pendentes com interações suaves.
- [ ] Lógica do temporizador para as 17:30.

## 🟣 Fase 4: Relatório e Polimento
- [ ] Modal de Relatório Diário (Pop-up das 17:30).
- [ ] Lógica de agregação de dados para o relatório (Concluídas vs Pendentes).
- [ ] Testes de usabilidade e ajustes de design.
