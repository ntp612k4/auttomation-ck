FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 80

# Chạy server dev ở cổng 80 để khớp với docker-compose (ánh xạ 8080:80)
# Lưu ý: Create React App mặc định chạy 3000, ta cần set PORT=80
ENV PORT=80
CMD ["npm", "start"]