# 🔄 Configuração do Google Drive Sync

Este guia explica como configurar a sincronização automática com Google Drive.

## 📋 Pré-requisitos

1. Conta Google
2. Acesso ao [Google Cloud Console](https://console.cloud.google.com)

## 🚀 Passo a Passo

### 1. Criar Projeto no Google Cloud

1. Acesse [Google Cloud Console](https://console.cloud.google.com)
2. Clique em "Select a project" no topo
3. Clique em "New Project"
4. Dê um nome ao projeto (ex: "Running Tracker")
5. Clique em "Create"
6. Aguarde alguns segundos e selecione o projeto criado

### 2. Habilitar Google Drive API

1. No menu lateral, vá em **"APIs & Services"** > **"Library"**
2. Na busca, digite **"Google Drive API"**
3. Clique no resultado **"Google Drive API"**
4. Clique no botão **"Enable"**
5. Aguarde a ativação

### 3. Criar Credenciais OAuth

1. No menu lateral, vá em **"APIs & Services"** > **"Credentials"**
2. Clique em **"+ CREATE CREDENTIALS"** no topo
3. Selecione **"OAuth client ID"**
4. Se for a primeira vez, você precisará configurar o **OAuth consent screen**:
   - Escolha **"External"** (para uso pessoal)
   - Clique em **"Create"**
   - Preencha:
     - **App name**: Running Tracker
     - **User support email**: Seu email
     - **Developer contact information**: Seu email
   - Clique em **"Save and Continue"**
   - Em "Scopes", clique em **"Save and Continue"**
   - Em "Test users", adicione seu email e clique em **"Save and Continue"**
   - Revise e clique em **"Back to Dashboard"**

5. Agora volte em **"Credentials"** e clique em **"+ CREATE CREDENTIALS"** > **"OAuth client ID"**
6. Configure:
   - **Application type**: Web application
   - **Name**: Running Tracker Web Client
   - **Authorized JavaScript origins**: 
     - `http://localhost:5173` (para desenvolvimento)
     - `https://seu-dominio.vercel.app` (para produção - substitua pelo seu domínio)
   - **Authorized redirect URIs**:
     - `http://localhost:5173` (para desenvolvimento)
     - `https://seu-dominio.vercel.app` (para produção)
     - `https://seu-dominio.vercel.app/oauth-callback.html` (opcional)
7. Clique em **"Create"**

### 4. Copiar Client ID

1. Após criar, uma janela aparecerá com suas credenciais
2. **Copie o Client ID** (não precisa do Client Secret)
3. Cole o Client ID na aba "Sincronizar" da aplicação

## ⚙️ Configuração na Aplicação

1. Abra a aplicação
2. Vá na aba **"Sincronizar"**
3. Cole o **Client ID** no campo
4. Clique em **"Salvar Client ID"**
5. Clique em **"Conectar com Google"**
6. Autorize o acesso ao Google Drive
7. Pronto! A sincronização estará ativa

## 🔄 Como Funciona

- **Upload Manual**: Clique em "Enviar para Drive" para sincronizar imediatamente
- **Download Manual**: Clique em "Baixar do Drive" para buscar dados do Drive
- **Sincronização Automática**: Ative para sincronizar a cada 5 minutos automaticamente

## 📱 Sincronização entre Dispositivos

1. Configure o Google Drive Sync em todos os dispositivos
2. Use o mesmo Client ID em todos
3. Faça login com a mesma conta Google
4. Os dados serão sincronizados automaticamente entre dispositivos

## 🔒 Segurança

- O Client ID é público e seguro de compartilhar
- Os dados são salvos em um arquivo privado no seu Google Drive
- Apenas você tem acesso aos seus dados
- O token de acesso expira e precisa ser renovado periodicamente

## ⚠️ Troubleshooting

### Erro: "redirect_uri_mismatch"
- Verifique se o redirect URI na aplicação corresponde ao configurado no Google Cloud
- Certifique-se de adicionar tanto `http://localhost:5173` quanto sua URL de produção

### Erro: "Token expirado"
- Faça logout e login novamente
- O token expira após algumas horas de inatividade

### Sincronização não funciona
- Verifique se a Google Drive API está habilitada
- Certifique-se de estar logado com a mesma conta Google em todos os dispositivos
- Verifique a conexão com a internet

## 📝 Notas

- A sincronização automática verifica mudanças a cada 5 minutos
- Mudanças locais são enviadas automaticamente quando a sincronização automática está ativa
- Os dados são mesclados, não substituídos (evita perda de dados)
- O arquivo no Drive se chama `running-tracker-data.json`

