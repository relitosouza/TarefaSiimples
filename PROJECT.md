# TarefaSimples - Sistema de Gerenciamento de Tarefas

Sistema de To-Do List moderno e minimalista construído com Next.js 15, utilizando Google Sheets como banco de dados persistente.

## 🎯 Objetivos do Projeto
- Interface intuitiva para adição e gerenciamento de tarefas.
- Persistência em tempo real no Google Sheets.
- Sugestões inteligentes (Auto-complete) baseadas no histórico da planilha.
- Relatório diário automatizado com aviso pop-up às 17:30.

## 🛠️ Stack Técnica
- **Framework**: Next.js 15 (App Router)
- **Estilização**: Tailwind CSS (Dark Mode nativo)
- **UI Components**: shadcn/ui (Radix UI)
- **Banco de Dados**: Google Sheets API (via `google-spreadsheet`)
- **Lógica de Estado**: React Hooks + Server Actions

## 📋 Funcionalidades Principais
1. **Dashboard de Tarefas**: Lista de tarefas pendentes com checkbox para conclusão.
2. **Entrada Inteligente**: Input de tarefas com autocomplete dinâmico puxando dados da planilha.
3. **Relatório Diário (17:30)**: Gatilho automático às 17:30 que exibe um resumo das tarefas concluídas e pendentes do dia.
4. **Gerenciamento de Status**: Atualização imediata do status (Pendente, Parcial, Concluída) na planilha.

## 🔐 Requisitos de Ambiente
- `GOOGLE_SERVICE_ACCOUNT_EMAIL`
- `GOOGLE_PRIVATE_KEY`
- `GOOGLE_SHEET_ID`
