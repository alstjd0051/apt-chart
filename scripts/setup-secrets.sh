#!/usr/bin/env bash
# Giscus 시크릿을 GitHub Actions 및 Vercel에 적용
# 사용법: ./scripts/setup-secrets.sh
# 사전: .env에 VITE_GISCUS_REPO_ID, VITE_GISCUS_CATEGORY_ID 설정

set -e
cd "$(dirname "$0")/.."

ENV_FILE=".env"
if [[ -f ".env.local" ]]; then
  ENV_FILE=".env.local"
fi

if [[ ! -f "$ENV_FILE" ]]; then
  echo "❌ $ENV_FILE 없음. cp .env.example .env 후 VITE_GISCUS_CATEGORY_ID를 설정하세요."
  exit 1
fi

# .env에서 값 추출
get_env() {
  grep -E "^${1}=" "$ENV_FILE" 2>/dev/null | cut -d= -f2- | tr -d '"' | tr -d "'" || echo ""
}
REPO_ID=$(get_env VITE_GISCUS_REPO_ID)
CATEGORY_ID=$(get_env VITE_GISCUS_CATEGORY_ID)
REPO_ID="${REPO_ID:-R_kgDORTg8Sg}"
VERCEL_TOKEN="${VERCEL_TOKEN:-$(get_env VERCEL_TOKEN)}"
GH_PAT="${GH_PAT:-$(get_env GH_PAT)}"

if [[ -z "$CATEGORY_ID" ]]; then
  echo "❌ VITE_GISCUS_CATEGORY_ID가 비어있습니다."
  echo "   https://giscus.app/ko 에서 categoryId를 복사 후 .env에 추가하세요."
  exit 1
fi

echo "📦 GitHub Secrets 적용 (alstjd0051/apt-chart)..."
echo "$REPO_ID" | gh secret set VITE_GISCUS_REPO_ID --repo alstjd0051/apt-chart
echo "$CATEGORY_ID" | gh secret set VITE_GISCUS_CATEGORY_ID --repo alstjd0051/apt-chart

# Vercel 배포용 (GitHub Actions deploy.yml)
if [[ -n "$VERCEL_TOKEN" ]]; then
  echo "$VERCEL_TOKEN" | gh secret set VERCEL_TOKEN --repo alstjd0051/apt-chart
  echo "  VERCEL_TOKEN ✅"
fi
VERCEL_ORG_ID="${VERCEL_ORG_ID:-team_iIHvK8awOTcdLEdDGQKUFGzV}"
VERCEL_PROJECT_ID="${VERCEL_PROJECT_ID:-prj_86gsYyAkmdFapV0quMNQVRfqJmsU}"
echo "$VERCEL_ORG_ID" | gh secret set VERCEL_ORG_ID --repo alstjd0051/apt-chart
echo "$VERCEL_PROJECT_ID" | gh secret set VERCEL_PROJECT_ID --repo alstjd0051/apt-chart
echo "  VERCEL_ORG_ID, VERCEL_PROJECT_ID ✅"
if [[ -n "$GH_PAT" ]]; then
  echo "$GH_PAT" | gh secret set GH_PAT --repo alstjd0051/apt-chart
  echo "  GH_PAT ✅ (sync-secrets 워크플로우 자동 실행용)"
fi
echo "✅ GitHub Secrets 완료"

echo ""
echo "📦 Vercel 환경변수 적용..."
add_vercel_env() {
  local name=$1 value=$2 env=$3
  if echo "$value" | vercel env add "$name" "$env" --yes 2>/dev/null; then
    return 0
  fi
  echo "$value" | vercel env add "$name" "$env" --force --yes 2>/dev/null || true
}
for env in production preview development; do
  add_vercel_env VITE_GISCUS_REPO_ID "$REPO_ID" "$env"
  add_vercel_env VITE_GISCUS_CATEGORY_ID "$CATEGORY_ID" "$env"
done
echo "✅ Vercel 환경변수 완료"

echo ""
echo "🎉 완료. Vercel 재배포 시 댓글이 활성화됩니다."
