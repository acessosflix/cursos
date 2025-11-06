#!/bin/bash

echo "🚀 Configurando Plataforma de Treinamento Online..."
echo ""

# Verificar Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não encontrado. Por favor, instale Node.js primeiro."
    exit 1
fi

echo "✅ Node.js encontrado: $(node --version)"
echo ""

# Instalar dependências do backend
echo "📦 Instalando dependências do backend..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Erro ao instalar dependências do backend"
    exit 1
fi

# Instalar dependências do frontend
echo "📦 Instalando dependências do frontend..."
cd client
npm install

if [ $? -ne 0 ]; then
    echo "❌ Erro ao instalar dependências do frontend"
    exit 1
fi

cd ..

# Criar arquivo .env se não existir
if [ ! -f .env ]; then
    echo "📝 Criando arquivo .env..."
    cp .env.example .env
    echo "✅ Arquivo .env criado. Por favor, configure as variáveis de ambiente."
else
    echo "✅ Arquivo .env já existe"
fi

echo ""
echo "✅ Instalação concluída!"
echo ""
echo "Para iniciar a aplicação:"
echo "  npm run dev          # Inicia backend e frontend simultaneamente"
echo "  npm run server       # Apenas backend (porta 5000)"
echo "  npm run client       # Apenas frontend (porta 3000)"
echo ""
echo "Credenciais padrão do admin:"
echo "  Email: admin@training.com"
echo "  Senha: admin123"
echo ""
