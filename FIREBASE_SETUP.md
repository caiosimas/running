# 🔥 Configuração do Firebase

Este guia explica como configurar o Firebase para o Running Tracker.

## 📋 Pré-requisitos

1. Conta Google
2. Projeto criado no [Firebase Console](https://console.firebase.google.com)

## 🚀 Passo a Passo

### 1. Criar Projeto no Firebase

1. Acesse [Firebase Console](https://console.firebase.google.com)
2. Clique em "Adicionar projeto" ou "Create a project"
3. Dê um nome ao projeto (ex: "Running Tracker")
4. Siga os passos para criar o projeto

### 2. Habilitar Autenticação por Email/Senha

1. No menu lateral, vá em **"Authentication"** (Autenticação)
2. Clique em **"Get started"** (Começar)
3. Vá na aba **"Sign-in method"** (Método de login)
4. Clique em **"Email/Password"**
5. Ative a opção **"Enable"** (Habilitar)
6. Clique em **"Save"** (Salvar)

### 3. Criar Banco de Dados Firestore

1. No menu lateral, vá em **"Firestore Database"**
2. Clique em **"Create database"** (Criar banco de dados)
3. Escolha **"Start in test mode"** (Iniciar em modo de teste) - você pode configurar regras depois
4. Escolha a localização do banco de dados (escolha a mais próxima)
5. Clique em **"Enable"** (Habilitar)

### 4. Configurar Regras de Segurança do Firestore

1. Vá em **"Firestore Database"** > **"Rules"** (Regras)
2. Substitua as regras por:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Regras para treinos
    match /workouts/{workoutId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
    
    // Regras para planos de treino
    match /trainingPlans/{planId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
    
    // Regras para rotas
    match /routes/{routeId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
  }
}
```

3. Clique em **"Publish"** (Publicar)

### 5. Obter Credenciais do Firebase

1. No menu lateral, vá em **"Project settings"** (Configurações do projeto) (ícone de engrenagem)
2. Role até a seção **"Your apps"** (Seus apps)
3. Clique no ícone **"</>"** (Web)
4. Dê um nome ao app (ex: "Running Tracker Web")
5. Copie as credenciais que aparecem

### 6. Configurar Variáveis de Ambiente

1. Crie um arquivo `.env` na raiz do projeto
2. Copie o conteúdo de `.env.example`
3. Preencha com suas credenciais do Firebase:

```env
VITE_FIREBASE_API_KEY=sua_api_key
VITE_FIREBASE_AUTH_DOMAIN=seu_projeto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=seu_projeto_id
VITE_FIREBASE_STORAGE_BUCKET=seu_projeto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=seu_messaging_sender_id
VITE_FIREBASE_APP_ID=seu_app_id
```

### 7. Criar Índices do Firestore

O Firestore pode pedir para criar índices. Se aparecer um link de erro, clique nele e crie o índice automaticamente.

**Índices necessários:**
- Collection: `workouts`
  - Fields: `userId` (Ascending), `date` (Descending)

## ✅ Verificação

1. Execute `npm install` para instalar as dependências
2. Execute `npm run dev` para iniciar o servidor
3. Acesse a aplicação
4. Tente criar uma conta
5. Verifique se os dados aparecem no Firestore

## 🔒 Segurança

- As regras do Firestore garantem que cada usuário só acesse seus próprios dados
- A autenticação é obrigatória para todas as operações
- Os dados são isolados por `userId`

## 📝 Estrutura dos Dados

### Collection: `workouts`
```javascript
{
  userId: string,
  date: string,
  distance: number,
  duration: number,
  pace: string,
  type: string,
  notes: string,
  createdAt: string
}
```

### Collection: `trainingPlans`
```javascript
{
  userId: string,
  name: string,
  duration: string,
  description: string,
  workouts: array,
  createdAt: string
}
```

## 🆘 Problemas Comuns

### Erro: "Missing or insufficient permissions"
- Verifique se as regras do Firestore estão configuradas corretamente
- Certifique-se de que o usuário está autenticado

### Erro: "Firebase: Error (auth/invalid-email)"
- Verifique se o email está no formato correto
- Certifique-se de que a autenticação por email/senha está habilitada

### Dados não aparecem
- Verifique se os índices do Firestore foram criados
- Verifique o console do navegador para erros
- Certifique-se de que as variáveis de ambiente estão configuradas

