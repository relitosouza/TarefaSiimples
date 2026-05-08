# Passo a Passo: Configuração da API do Google Sheets

Siga estas etapas para conectar o sistema à sua planilha.

## 1. Criar um Projeto no Google Cloud
1. Acesse o [Google Cloud Console](https://console.cloud.google.com/).
2. Clique em **Select a project** > **New Project**.
3. Dê um nome ao projeto (ex: `TarefaSimples`) e clique em **Create**.

## 2. Ativar a API do Google Sheets
1. No menu lateral, vá em **APIs & Services** > **Library**.
2. Pesquise por **Google Sheets API**.
3. Clique em **Enable**.
4. Repita o processo para a **Google Drive API** (necessária para algumas permissões).

## 3. Criar uma Service Account (Conta de Serviço)
1. Vá em **APIs & Services** > **Credentials**.
2. Clique em **+ Create Credentials** > **Service Account**.
3. Preencha o nome e clique em **Create and Continue**.
4. Em **Role**, selecione **Editor** (ou `Project > Editor`).
5. Clique em **Done**.

## 4. Gerar a Chave JSON
1. Na lista de "Service Accounts", clique no e-mail da conta que você acabou de criar.
2. Vá na aba **Keys**.
3. Clique em **Add Key** > **Create new key**.
4. Escolha **JSON** e clique em **Create**.
5. Um arquivo será baixado. **Guarde este arquivo**, precisaremos dos valores `client_email` e `private_key`.

## 5. Compartilhar a Planilha
1. Abra a sua planilha do Google: [Link da Planilha](https://docs.google.com/spreadsheets/d/19QuN-YEq7QopPK-AVeL17sNI0vvKp4C2H6lbTvlJSK8/edit).
2. Clique no botão **Compartilhar** (Share).
3. Cole o e-mail da Service Account (ex: `tarefasimples@...iam.gserviceaccount.com`).
4. Garanta que ela tenha permissão de **Editor**.
5. Desmarque "Notificar pessoas" e clique em **Compartilhar**.

## 6. Configurar as Variáveis de Ambiente
No arquivo `.env.local` (que eu criarei no projeto), você deverá preencher:

```env
GOOGLE_SERVICE_ACCOUNT_EMAIL=seu-email-da-service-account
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..." # Cole a chave completa entre aspas
GOOGLE_SHEET_ID=19QuN-YEq7QopPK-AVeL17sNI0vvKp4C2H6lbTvlJSK8
```
