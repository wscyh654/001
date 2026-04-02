FROM node:18-alpine

WORKDIR /app

# 安装 pnpm
RUN npm install -g pnpm@9

# 复制所有文件
COPY . .

# 安装依赖
RUN pnpm install --no-frozen-lockfile

# 构建
RUN cd server && pnpm build

# 暴露端口
EXPOSE 3000

# 启动服务
CMD ["node", "server/dist/main.js"]
