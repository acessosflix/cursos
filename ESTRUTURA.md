# 📁 Estrutura do Projeto

```
training-platform/
│
├── 📄 package.json              # Dependências e scripts do backend
├── 📄 server.js                 # Servidor Express principal
├── 📄 .env.example              # Exemplo de variáveis de ambiente
├── 📄 .gitignore               # Arquivos ignorados pelo git
├── 📄 vercel.json              # Configuração para deploy no Vercel
├── 📄 setup.sh                 # Script de instalação rápida
├── 📄 README.md                # Documentação completa
│
├── 📂 database/
│   └── 📄 db.js                # Configuração e inicialização do SQLite
│
├── 📂 middleware/
│   └── 📄 auth.js              # Middleware de autenticação e autorização
│
├── 📂 routes/
│   ├── 📄 auth.js              # Rotas de autenticação (login, registro)
│   ├── 📄 videos.js            # Rotas de vídeos
│   ├── 📄 quiz.js              # Rotas de quiz
│   ├── 📄 progress.js          # Rotas de progresso de vídeos
│   └── 📄 admin.js             # Rotas administrativas
│
└── 📂 client/                   # Frontend React
    ├── 📄 package.json          # Dependências do frontend
    │
    ├── 📂 public/
    │   └── 📄 index.html        # HTML principal
    │
    └── 📂 src/
        ├── 📄 index.js          # Entry point do React
        ├── 📄 App.js            # Componente principal
        ├── 📄 App.css           # Estilos do App
        ├── 📄 index.css         # Estilos globais
        │
        ├── 📂 context/
        │   └── 📄 AuthContext.js # Context API para autenticação
        │
        ├── 📂 components/
        │   ├── 📄 Navbar.js     # Barra de navegação
        │   ├── 📄 PrivateRoute.js # Rota protegida
        │   └── 📄 AdminRoute.js   # Rota apenas para admin
        │
        └── 📂 pages/
            ├── 📄 Login.js      # Página de login
            ├── 📄 Register.js   # Página de cadastro
            ├── 📄 Dashboard.js  # Dashboard principal
            ├── 📄 VideoPlayer.js # Player de vídeo
            ├── 📄 Quiz.js       # Página de quiz
            └── 📄 AdminPanel.js  # Painel administrativo
```

## 🔑 Pontos Importantes

### Backend
- **server.js**: Inicializa o servidor Express e configura as rotas
- **database/db.js**: Cria todas as tabelas e usuário admin padrão
- **middleware/auth.js**: Gerencia autenticação JWT e níveis de acesso
- **routes/**: Todas as rotas da API RESTful

### Frontend
- **AuthContext**: Gerencia estado global de autenticação
- **PrivateRoute/AdminRoute**: Protege rotas baseado em autenticação/nível
- **Pages**: Componentes principais da aplicação
- **Bootstrap**: UI responsiva e moderna

### Banco de Dados (SQLite)
- **users**: Usuários e níveis de acesso
- **videos**: Vídeos cadastrados
- **questions**: Perguntas dos quizzes
- **video_progress**: Progresso de visualização
- **quiz_attempts**: Histórico de tentativas de quiz

## 🚀 Como Começar

1. Execute `./setup.sh` ou instale manualmente as dependências
2. Configure o arquivo `.env`
3. Execute `npm run dev` para iniciar backend e frontend
4. Acesse http://localhost:3000
5. Faça login com admin@training.com / admin123

## 📝 Próximos Passos

- Adicione vídeos através do painel admin
- Crie perguntas para cada vídeo (recomendado: 20+ perguntas)
- Cadastre usuários ou permita auto-cadastro
- Configure para produção seguindo as instruções do README
