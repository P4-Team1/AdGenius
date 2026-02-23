# 1단계: 의존성 설치
FROM node:20-alpine AS deps
WORKDIR /app

# package.json과 lock 파일 복사
COPY package*.json ./
RUN npm ci

# 2단계: 빌드
FROM node:20-alpine AS builder
WORKDIR /app

# 의존성 복사
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.js 빌드
ENV NEXT_TELEMETRY_DISABLED=1
ARG NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
RUN npm run build

# 3단계: 실행
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# 필요한 파일만 복사
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# 포트 노출
EXPOSE 3000

ENV PORT=3000

# 실행
CMD ["node", "server.js"]