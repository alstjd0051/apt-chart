#!/usr/bin/env bash
# Utterances 댓글 앱 설치/재설치
# GitHub App 설치는 웹에서 수동으로 진행해야 합니다.

set -e

REPO="alstjd0051/apt-chart-comments"
INSTALL_URL="https://github.com/apps/utterances/installations/new"
CONFIGURE_URL="https://github.com/settings/installations"

echo "📝 Utterances 댓글 앱 설치/재설치"
echo ""
echo "댓글 저장 레포: $REPO"
echo ""
echo "1. 기존 설치가 있다면 먼저 제거:"
echo "   $CONFIGURE_URL"
echo "   → Utterances 찾기 → Configure → Uninstall"
echo ""
echo "2. 새로 설치:"
echo "   $INSTALL_URL"
echo "   → Install → 'Only select repositories' → $REPO 선택"
echo ""
read -p "브라우저에서 설치 페이지를 열까요? [y/N] " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  open "$INSTALL_URL" 2>/dev/null || xdg-open "$INSTALL_URL" 2>/dev/null || echo "수동으로 열기: $INSTALL_URL"
fi
