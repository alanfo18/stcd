FROM node:22-alpine

WORKDIR /app

# Copiar package.json e pnpm-lock.yaml
COPY package.json pnpm-lock.yaml ./

# Instalar dependências
RUN npm install -g pnpm && pnpm install --frozen-lockfile --prefer-offline

# Copiar código-fonte
COPY . .

# Build
RUN pnpm run build

# Expor porta
EXPOSE 3000

# Iniciar aplicação
CMD ["node", "dist/index.js"]

