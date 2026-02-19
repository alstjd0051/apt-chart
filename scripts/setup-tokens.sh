#!/usr/bin/env bash
# 토큰 생성 페이지 열기 + gh/vercel CLI로 적용
# 토큰은 웹에서만 생성 가능 (GitHub/Vercel 보안 정책)
set -e
cd "$(dirname "$0")/.."

REPO="alstjd0051/apt-chart"
GITHUB_TOKEN_URL="https://github.com/settings/tokens/new?description=apt-chart-secrets&scopes=repo,admin:repo_hook,workflow"
VERCEL_TOKEN_URL="https://vercel.com/account/tokens"

get_env() {
  local f=".env"
  [[ -f ".env.local" ]] && f=".env.local"
  grep -E "^${1}=" "$f" 2>/dev/null | cut -d= -f2- | tr -d '"' | tr -d "'" || echo ""
}

open_url() {
  if command -v open &>/dev/null; then
    open "$1"
  elif command -v xdg-open &>/dev/null; then
    xdg-open "$1"
  else
    echo "   브라우저에서 열기: $1"
  fi
}

echo "🔑 토큰 생성 및 적용 (gh, vercel CLI)"
echo ""
echo "※ 토큰은 GitHub/Vercel 웹에서만 생성 가능합니다."
echo ""

APPLIED_GH=0
APPLIED_VC=0

# 1. GitHub 토큰
GH_PAT="${GH_PAT:-$(get_env GH_PAT)}"
if [[ -z "$GH_PAT" ]]; then
  echo "1️⃣ GitHub 토큰 (GH_PAT) - admin:repo, workflow scope"
  open_url "$GITHUB_TOKEN_URL"
  echo ""
  read -rp "   토큰 붙여넣기 (Enter=건너뛰기): " GH_PAT
  if [[ -n "$GH_PAT" ]]; then
    echo "$GH_PAT" | gh secret set GH_PAT --repo "$REPO"
    echo "   ✅ GH_PAT → GitHub Secrets"
    APPLIED_GH=1
  fi
  echo ""
fi

# 2. Vercel 토큰
VERCEL_TOKEN="${VERCEL_TOKEN:-$(get_env VERCEL_TOKEN)}"
if [[ -z "$VERCEL_TOKEN" ]]; then
  echo "2️⃣ Vercel 토큰 (VERCEL_TOKEN)"
  open_url "$VERCEL_TOKEN_URL"
  echo ""
  read -rp "   토큰 붙여넣기 (Enter=건너뛰기): " VERCEL_TOKEN
  if [[ -n "$VERCEL_TOKEN" ]]; then
    echo "$VERCEL_TOKEN" | gh secret set VERCEL_TOKEN --repo "$REPO"
    echo "   ✅ VERCEL_TOKEN → GitHub Secrets"
    APPLIED_VC=1
  fi
  echo ""
fi

# 3. .env에 플레이스홀더 추가 (secrets:setup 연동용)
if [[ $APPLIED_GH -eq 1 ]] || [[ $APPLIED_VC -eq 1 ]]; then
  ENV_FILE=".env"
  [[ -f ".env.local" ]] && ENV_FILE=".env.local"
  [[ ! -f "$ENV_FILE" ]] && cp .env.example "$ENV_FILE" 2>/dev/null || true
  [[ -f "$ENV_FILE" ]] && [[ $APPLIED_GH -eq 1 ]] && ! grep -q "^GH_PAT=" "$ENV_FILE" 2>/dev/null && echo "" >> "$ENV_FILE" && echo "# setup-tokens로 적용됨. 로컬 secrets:setup용으로 .env에 GH_PAT=xxx 추가 가능" >> "$ENV_FILE"
  [[ -f "$ENV_FILE" ]] && [[ $APPLIED_VC -eq 1 ]] && ! grep -q "^VERCEL_TOKEN=" "$ENV_FILE" 2>/dev/null && echo "# VERCEL_TOKEN=xxx" >> "$ENV_FILE"
fi

echo ""
echo "🎉 완료. bun run secrets:setup 로 Vercel 시크릿 적용"
