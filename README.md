# 🎓 Plataforma de Treinamento Online

Uma plataforma completa de treinamento online com autenticação de usuários, três níveis de acesso, sistema de vídeos integrado com YouTube, quizzes interativos e painel administrativo.

## 📋 Funcionalidades

### Autenticação e Níveis de Acesso
- ✅ Sistema de cadastro e login seguro
- ✅ Três níveis de usuários:
  - **Nível 1**: Colaboradores iniciantes - acesso a vídeos básicos
  - **Nível 2**: Colaboradores experientes - acesso a vídeos avançados
  - **Nível 3**: Gerentes e diretores - acesso a vídeos avançados e relatórios
- ✅ Usuário admin com acesso ao painel administrativo

### Sistema de Vídeos
- ✅ Integração com YouTube (vídeos privados)
- ✅ Player integrado na plataforma
- ✅ Salvamento automático do progresso de visualização
- ✅ Retomada do vídeo do ponto onde parou
- ✅ Botão de quiz habilitado após 90% de visualização

### Sistema de Quiz
- ✅ 8 perguntas aleatórias de um banco de ~20 questões por vídeo
- ✅ Registro de pontuação de cada tentativa
- ✅ Sistema de pontuação proporcional (100 pontos se todas corretas)
- ✅ Gráfico de pizza com resultados ao finalizar

### Painel Administrativo
- ✅ Cadastro de novos vídeos e links privados do YouTube
- ✅ Gerenciamento de perguntas e respostas dos quizzes
- ✅ Visualização de usuários cadastrados
- ✅ Interface intuitiva e responsiva

## 🛠️ Tecnologias Utilizadas

### Backend
- **Node.js** com Express
- **SQLite** para banco de dados
- **JWT** para autenticação
- **bcryptjs** para hash de senhas

### Frontend
- **React** 18
- **React Router** para navegação
- **Bootstrap 5** para UI responsiva
- **React Bootstrap** para componentes
- **React YouTube** para player de vídeo
- **Recharts** para gráficos
- **Axios** para requisições HTTP

## 📦 Instalação

### Pré-requisitos
- Node.js (versão 14 ou superior)
- npm ou yarn

### Passos para Instalação

1. **Clone o repositório ou navegue até a pasta do projeto**

```bash
cd /workspace
```

2. **Instale as dependências do backend e frontend**

```bash
npm run install-all
```

Ou instale manualmente:

```bash
# Instalar dependências do backend
npm install

# Instalar dependências do frontend
cd client
npm install
cd ..
```

3. **Configure as variáveis de ambiente**

Crie um arquivo `.env` na raiz do projeto:

```env
PORT=5000
JWT_SECRET=sua-chave-secreta-aqui-altere-em-producao
NODE_ENV=development
```

4. **Inicialize o banco de dados**

O banco de dados SQLite será criado automaticamente na primeira execução do servidor.

5. **Execute a aplicação**

Para desenvolvimento (backend e frontend simultaneamente):

```bash
npm run dev
```

Ou execute separadamente:

```bash
# Terminal 1 - Backend
npm run server

# Terminal 2 - Frontend
npm run client
```

6. **Acesse a aplicação**

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 🔐 Credenciais Padrão

Após a primeira inicialização, um usuário admin padrão é criado:

- **Email**: admin@training.com
- **Senha**: admin123

⚠️ **IMPORTANTE**: Altere essas credenciais em produção!

## 📖 Como Usar

### Para Usuários

1. **Cadastro/Login**
   - Acesse a página de cadastro para criar uma nova conta
   - Escolha seu nível de acesso durante o cadastro
   - Faça login com suas credenciais

2. **Assistir Vídeos**
   - No dashboard, visualize os vídeos disponíveis para seu nível
   - Clique em "Assistir" para abrir o player
   - O progresso é salvo automaticamente
   - Após assistir 90% do vídeo, o botão "Fazer Quiz" será habilitado

3. **Responder Quizzes**
   - Após assistir 90% do vídeo, acesse o quiz
   - Responda as 8 perguntas aleatórias
   - Visualize seu resultado com gráfico de pizza
   - Veja sua pontuação e quantas questões acertou

### Para Administradores

1. **Acessar Painel Admin**
   - Faça login como admin
   - Clique em "Admin" no menu de navegação

2. **Gerenciar Vídeos**
   - Clique em "Novo Vídeo"
   - Preencha: Título, Descrição, YouTube ID (apenas o ID, não a URL completa), Nível
   - Salve o vídeo

3. **Gerenciar Perguntas**
   - Na lista de vídeos, clique em "Perguntas" ao lado do vídeo desejado
   - Adicione novas perguntas com 4 opções (A, B, C, D)
   - Selecione a resposta correta
   - É recomendado ter pelo menos 20 perguntas por vídeo para garantir variedade

4. **Visualizar Usuários**
   - Na aba "Usuários", visualize todos os usuários cadastrados
   - Veja níveis de acesso e datas de cadastro

## 🗄️ Estrutura do Banco de Dados

O banco SQLite contém as seguintes tabelas:

- **users**: Usuários do sistema (id, name, email, password, level, is_admin)
- **videos**: Vídeos cadastrados (id, title, description, youtube_id, level)
- **questions**: Perguntas dos quizzes (id, video_id, question, option_a/b/c/d, correct_answer)
- **video_progress**: Progresso de visualização (user_id, video_id, progress_percentage, last_position, completed)
- **quiz_attempts**: Tentativas de quiz (user_id, video_id, score, total_questions, answers, created_at)

## 🚀 Deploy no Vercel

### Preparação

1. **Build do frontend**

```bash
cd client
npm run build
cd ..
```

2. **Configure o Vercel**

Crie um arquivo `vercel.json` na raiz:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    },
    {
      "src": "client/build/**",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "server.js"
    },
    {
      "src": "/(.*)",
      "dest": "client/build/$1"
    }
  ]
}
```

3. **Variáveis de Ambiente no Vercel**

Configure no painel do Vercel:
- `JWT_SECRET`: Uma chave secreta forte
- `NODE_ENV`: `production`

4. **SQLite no Vercel**

⚠️ **Nota**: O Vercel usa sistema de arquivos somente leitura. Para produção, considere migrar para um banco de dados como PostgreSQL (usando Vercel Postgres) ou usar um serviço de banco de dados externo.

### Alternativa: Usar PostgreSQL

Para escalabilidade, você pode migrar para PostgreSQL:

1. Instale `pg` e `pg-hstore`
2. Configure a conexão com banco PostgreSQL
3. Adapte as queries SQL para PostgreSQL

## 🔒 Segurança

### Implementado
- ✅ Senhas hasheadas com bcrypt
- ✅ Autenticação JWT
- ✅ Proteção de rotas por nível de acesso
- ✅ Validação de entrada nos formulários
- ✅ Proteção de rotas admin

### Recomendações para Produção
- [ ] Use HTTPS em produção
- [ ] Configure CORS adequadamente
- [ ] Implemente rate limiting
- [ ] Use variáveis de ambiente para secrets
- [ ] Adicione validação mais robusta de inputs
- [ ] Implemente logs de auditoria
- [ ] Configure backup automático do banco de dados
- [ ] Use um banco de dados mais robusto (PostgreSQL, MySQL)

## 📈 Escalabilidade e Melhorias Futuras

### Dicas para Escalar

1. **Banco de Dados**
   - Migre para PostgreSQL ou MySQL para melhor performance
   - Implemente índices nas colunas frequentemente consultadas
   - Considere cache (Redis) para dados frequentemente acessados

2. **Backend**
   - Implemente cache de respostas da API
   - Use filas (Bull/BullMQ) para processamento assíncrono
   - Adicione paginação nas listagens
   - Implemente busca e filtros avançados

3. **Frontend**
   - Implemente code splitting para reduzir bundle inicial
   - Use lazy loading para componentes pesados
   - Adicione service workers para cache offline
   - Otimize imagens e assets

4. **Infraestrutura**
   - Use CDN para assets estáticos
   - Implemente load balancing
   - Configure monitoramento (Sentry, LogRocket)
   - Use containerização (Docker)

5. **Funcionalidades Adicionais**
   - Sistema de notificações
   - Certificados de conclusão
   - Relatórios avançados para admin
   - Exportação de dados (CSV, PDF)
   - Sistema de comentários nos vídeos
   - Playlists personalizadas
   - Busca de vídeos e perguntas

## 🐛 Troubleshooting

### Problemas Comuns

1. **Erro ao iniciar o servidor**
   - Verifique se a porta 5000 está disponível
   - Confirme que todas as dependências foram instaladas

2. **Erro de autenticação**
   - Verifique se o token está sendo enviado no header
   - Confirme que o JWT_SECRET está configurado

3. **Vídeo não carrega**
   - Verifique se o YouTube ID está correto
   - Confirme que o vídeo está configurado como privado no YouTube
   - Verifique as configurações de privacidade do vídeo

4. **Quiz não aparece**
   - Confirme que assistiu pelo menos 90% do vídeo
   - Verifique se há perguntas cadastradas para o vídeo

## 📝 Licença

Este projeto é de código aberto e está disponível sob a licença MIT.

## 👥 Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues ou pull requests.

## 📧 Suporte

Para dúvidas ou problemas, abra uma issue no repositório.

---

**Desenvolvido com ❤️ para treinamento online**
