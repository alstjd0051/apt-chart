#!/usr/bin/env bash
# Vercel 배포용 시크릿을 GitHub Actions에 적용
# 사용법: ./scripts/setup-secrets.sh
set -e
cd "$(dirname "$0")/.."

ENV_FILE=".env"
[[ -f ".env.local" ]] && ENV_FILE=".env.local"

get_env() {
  [[ -f "$ENV_FILE" ]] && grep -E "^${1}=" "$ENV_FILE" 2>/dev/null | cut -d= -f2- | tr -d '"' | tr -d "'" || echo ""
}
VERCEL_TOKEN="${VERCEL_TOKEN:-$(get_env VERCEL_TOKEN)}"
GH_PAT="${GH_PAT:-$(get_env GH_PAT)}"

echo "📦 GitHub Secrets 적용 (alstjd0051/apt-chart)..."
if [[ -n "$VERCEL_TOKEN" ]]; then
  echo "$VERCEL_TOKEN" | gh secret set VERCEL_TOKEN --repo alstjd0051/apt-chart
  echo "  VERCEL_TOKEN ✅"
fi
echo "team_iIHvK8awOTcdLEdDGQKUFGzV" | gh secret set VERCEL_ORG_ID --repo alstjd0051/apt-chart
echo "prj_86gsYyAkmdFapV0quMNQVRfqJmsU" | gh secret set VERCEL_PROJECT_ID --repo alstjd0051/apt-chart
echo "  VERCEL_ORG_ID, VERCEL_PROJECT_ID ✅"
if [[ -n "$GH_PAT" ]]; then
  echo "$GH_PAT" | gh secret set GH_PAT --repo alstjd0051/apt-chart
  echo "  GH_PAT ✅"
fi
echo "✅ 완료"
