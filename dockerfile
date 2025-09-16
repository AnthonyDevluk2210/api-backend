# --- ETAPA 1: BUILD ---
# Usa uma imagem Node como base para a construção
FROM node:18-alpine AS builder

# Define o diretório de trabalho dentro do container
WORKDIR /app

# Copia os arquivos de manifesto de pacotes
COPY package*.json ./

# Instala as dependências de produção e desenvolvimento
RUN npm install

# Copia todo o resto do código da aplicação
COPY . .

# Executa o script de build para compilar o TypeScript para JavaScript
RUN npm run build

# Remove as dependências de desenvolvimento para limpar
RUN npm prune --production

# --- ETAPA 2: PRODUÇÃO ---
# Começa uma nova imagem limpa para o ambiente final
FROM node:18-alpine

WORKDIR /app

# Copia apenas os artefatos necessários da etapa 'builder'
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist

# Expõe a porta em que a aplicação irá rodar
EXPOSE 3000

# O comando para iniciar a aplicação quando o container for executado
CMD ["node", "dist/main"]