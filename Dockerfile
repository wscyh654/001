FROM node:18-alpine

WORKDIR /app

# 安装 pnpm
RUN npm install -g pnpm@9

# 复制 package.json 文件
COPY package.json ./
COPY server/package.json ./server/
COPY pnpm-lock.yaml* ./

# 安装依赖
RUN pnpm install --no-frozen-lockfile

# 复制源代码
COPY server ./server

# 构建
RUN cd server && pnpm build

# 暴露端口
EXPOSE 3000

# 启动服务
CMD ["node", "server/dist/main.js"]
