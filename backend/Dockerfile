# Usar imagen oficial de Node.js
FROM node:18-alpine

# Crear directorio de trabajo
WORKDIR /app

# Crear usuario no-root para seguridad
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodeuser -u 1001

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm install --only=production && npm cache clean --force

# Copiar código fuente
COPY server.js ./

# Cambiar propietario de archivos
RUN chown -R nodeuser:nodejs /app

# Cambiar a usuario no-root
USER nodeuser

# Exponer puerto
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/api/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) }).on('error', () => process.exit(1))"

# Comando por defecto
CMD ["npm", "start"]