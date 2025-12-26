# 🏃 Running Tracker

Aplicação web para registrar treinos de corrida e gerenciar planos de treino.

## Funcionalidades

- ✅ **Registrar Treinos**: Registre seus treinos com distância, duração, ritmo e observações
- ✅ **Histórico**: Visualize todos os seus treinos registrados com estatísticas
- ✅ **Planos de Treino**: Importe e gerencie planos de treino em formato JSON
- ✅ **Filtros**: Filtre treinos por tipo (treino, longão, tiro, recuperação)
- ✅ **Estatísticas**: Veja distância total, tempo total e número de treinos
- ✅ **Sincronização Firebase**: Seus dados são sincronizados automaticamente em todos os dispositivos

## Como usar

### Instalação Local

1. Instale as dependências:
```bash
npm install
```

2. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

3. Abra o navegador em `http://localhost:5173`

### Build para produção

```bash
npm run build
```

Os arquivos estarão na pasta `dist/`.

### Deploy para Produção

Para acessar de qualquer dispositivo, faça o deploy em uma plataforma de hospedagem.

**🚀 Opção mais fácil: Vercel**
1. Faça push do código para o GitHub
2. Acesse [vercel.com](https://vercel.com) e conecte com GitHub
3. Selecione o repositório e clique em "Deploy"
4. Pronto! Sua aplicação estará online em segundos

**📖 Guia completo:** Veja [DEPLOY.md](./DEPLOY.md) para instruções detalhadas de deploy em várias plataformas.

## Estrutura do Projeto

```
running/
├── src/
│   ├── components/
│   │   ├── WorkoutForm.jsx      # Formulário para registrar treinos
│   │   ├── WorkoutList.jsx      # Lista e histórico de treinos
│   │   └── TrainingPlans.jsx    # Gerenciamento de planos
│   ├── styles/
│   │   ├── index.css            # Estilos globais
│   │   ├── App.css              # Estilos do app principal
│   │   ├── WorkoutForm.css      # Estilos do formulário
│   │   ├── WorkoutList.css      # Estilos da lista
│   │   └── TrainingPlans.css    # Estilos dos planos
│   ├── App.jsx                  # Componente principal
│   └── main.jsx                 # Ponto de entrada
├── index.html
├── package.json
└── vite.config.js
```

## Formato de Importação de Planos

Os planos devem ser importados em formato JSON seguindo esta estrutura:

```json
[
  {
    "id": 1,
    "name": "Plano de 5K - Iniciante",
    "duration": "8 semanas",
    "description": "Plano para correr 5km em 8 semanas",
    "weeks": [
      {
        "week": 1,
        "workouts": [
          {
            "day": "Segunda",
            "type": "Corrida leve",
            "distance": "3km",
            "duration": "20min"
          }
        ]
      }
    ]
  }
]
```

## Tecnologias

- React 18
- Vite
- CSS3 (sem frameworks)
- LocalStorage para persistência

## Licença

MIT

