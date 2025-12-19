# 🚀 Guia de Deploy - Running Tracker

Este guia mostra como fazer deploy da aplicação para acessar de qualquer dispositivo.

## 📋 Pré-requisitos

1. Conta no GitHub (para versionamento)
2. Conta em uma das plataformas de deploy (Vercel, Netlify, etc.)

## 🎯 Opção 1: Vercel (RECOMENDADO - Mais Fácil)

### Por que Vercel?
- ✅ Deploy automático em segundos
- ✅ Gratuito e ilimitado
- ✅ HTTPS automático
- ✅ Domínio personalizado gratuito
- ✅ Integração perfeita com GitHub
- ✅ Preview de cada commit

### Passo a Passo:

1. **Preparar o código no GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/SEU_USUARIO/running-tracker.git
   git push -u origin main
   ```

2. **Fazer deploy na Vercel:**
   - Acesse [vercel.com](https://vercel.com)
   - Clique em "Sign Up" e faça login com GitHub
   - Clique em "Add New Project"
   - Selecione o repositório `running-tracker`
   - A Vercel detecta automaticamente que é um projeto Vite
   - Clique em "Deploy"
   - Pronto! Sua aplicação estará online em segundos

3. **Acessar:**
   - Você receberá uma URL como: `running-tracker.vercel.app`
   - Pode personalizar o domínio nas configurações

### Configuração Automática:
O arquivo `vercel.json` já está configurado. A Vercel usará automaticamente.

---

## 🌐 Opção 2: Netlify

### Passo a Passo:

1. **Preparar o código no GitHub** (mesmo processo acima)

2. **Fazer deploy na Netlify:**
   - Acesse [netlify.com](https://netlify.com)
   - Clique em "Sign up" e faça login com GitHub
   - Clique em "Add new site" > "Import an existing project"
   - Selecione o repositório `running-tracker`
   - Configure:
     - Build command: `npm run build`
     - Publish directory: `dist`
   - Clique em "Deploy site"

3. **Acessar:**
   - Você receberá uma URL como: `running-tracker.netlify.app`

### Configuração Automática:
O arquivo `netlify.toml` já está configurado.

---

## 📦 Opção 3: GitHub Pages

### Passo a Passo:

1. **Instalar gh-pages:**
   ```bash
   npm install --save-dev gh-pages
   ```

2. **Adicionar script no package.json:**
   ```json
   "scripts": {
     "predeploy": "npm run build",
     "deploy": "gh-pages -d dist"
   }
   ```

3. **Configurar base no vite.config.js:**
   ```js
   export default defineConfig({
     plugins: [react()],
     base: '/running-tracker/' // ou '/' se usar domínio customizado
   })
   ```

4. **Fazer deploy:**
   ```bash
   npm run deploy
   ```

5. **Ativar GitHub Pages:**
   - Vá em Settings > Pages no repositório
   - Selecione branch `gh-pages` e pasta `/root`
   - Acesse: `https://SEU_USUARIO.github.io/running-tracker`

---

## ⚡ Opção 4: Cloudflare Pages

### Passo a Passo:

1. **Preparar o código no GitHub**

2. **Fazer deploy:**
   - Acesse [dash.cloudflare.com](https://dash.cloudflare.com)
   - Vá em Pages > Create a project
   - Conecte com GitHub e selecione o repositório
   - Configure:
     - Framework preset: Vite
     - Build command: `npm run build`
     - Build output directory: `dist`
   - Clique em "Save and Deploy"

3. **Acessar:**
   - URL: `running-tracker.pages.dev`

---

## 🔧 Opção 5: Render

### Passo a Passo:

1. **Preparar o código no GitHub**

2. **Fazer deploy:**
   - Acesse [render.com](https://render.com)
   - Clique em "New" > "Static Site"
   - Conecte com GitHub e selecione o repositório
   - Configure:
     - Build command: `npm run build`
     - Publish directory: `dist`
   - Clique em "Create Static Site"

---

## 📱 Acessar de Qualquer Dispositivo

Após o deploy, você pode:

1. **Acessar pelo navegador:**
   - Abra o navegador em qualquer dispositivo
   - Digite a URL fornecida pela plataforma
   - A aplicação funcionará normalmente

2. **Adicionar à tela inicial (mobile):**
   - **iOS:** Safari > Compartilhar > Adicionar à Tela de Início
   - **Android:** Chrome > Menu > Adicionar à tela inicial

3. **Usar como PWA (opcional):**
   - A aplicação pode ser instalada como app
   - Funciona offline (dados ficam no localStorage)

---

## 🔄 Deploy Automático

Todas as plataformas acima oferecem **deploy automático**:
- Toda vez que você fizer `git push`, o site será atualizado automaticamente
- Você pode trabalhar localmente e as mudanças aparecerão online

---

## 💡 Recomendação Final

**Use Vercel** - É a opção mais simples e rápida:
- Deploy em menos de 1 minuto
- Zero configuração necessária
- Performance excelente
- Gratuito para uso pessoal

---

## 🆘 Problemas Comuns

### Erro 404 ao navegar
- Certifique-se de que o arquivo de configuração de redirects está presente
- Vercel: `vercel.json` ✓
- Netlify: `netlify.toml` ✓

### Build falha
- Verifique se todas as dependências estão no `package.json`
- Execute `npm install` localmente para testar

### Dados não persistem
- O localStorage é específico por domínio
- Cada dispositivo terá seus próprios dados
- Use a funcionalidade de Backup/Restore para sincronizar

---

## 📝 Notas Importantes

⚠️ **LocalStorage é específico por domínio:**
- Dados salvos em `app.vercel.app` não aparecem em `app.netlify.app`
- Use a funcionalidade de Backup/Restore para transferir dados entre dispositivos

✅ **HTTPS automático:**
- Todas as plataformas fornecem HTTPS gratuito
- Necessário para algumas funcionalidades do navegador

✅ **Domínio personalizado:**
- Todas as plataformas permitem usar seu próprio domínio
- Configure nas opções do projeto

