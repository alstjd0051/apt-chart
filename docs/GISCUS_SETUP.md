# Giscus 댓글 설정 가이드 (Private 레포 대응)

Private 레포에서는 Utterances/Giscus가 직접 동작하지 않습니다. **별도 Public 댓글 전용 레포**를 만들어 사용합니다.

## 1. Public 댓글 전용 레포 생성

```bash
# GitHub CLI로 생성 (또는 웹에서 수동 생성)
gh repo create alstjd0051/apt-chart-comments --public --description "apt-chart 댓글 전용"
```

## 2. Discussions 활성화

1. 레포 **Settings** → **General**
2. **Features** → **Discussions** 체크

## 3. 카테고리 (기본값 사용)

Discussions 활성화 시 기본 카테고리 **Q&A** (`DIC_kwDORTg8Ss4C2v-L`)가 생성됩니다. 별도 생성 불필요.

## 4. Giscus 앱 설치

1. https://github.com/apps/giscus 접속
2. **Install** → `apt-chart-comments` 레포 선택

## 5. Giscus 설정 값 (적용 완료)

| 항목 | 값 |
|------|-----|
| repo | alstjd0051/apt-chart-comments |
| repoId | R_kgDORTg8Sg |
| category | Q&A |
| categoryId | DIC_kwDORTg8Ss4C2v-L |

## 6. .env (이미 적용됨)

`.env`에 위 값이 설정되어 있으며, `scripts/setup-secrets.sh`로 GitHub/Vercel에 반영 완료.

## 7. GitHub Secrets & Vercel 환경변수 적용

```bash
chmod +x scripts/setup-secrets.sh
./scripts/setup-secrets.sh
```

- **GitHub Secrets**: `VITE_GISCUS_REPO_ID`, `VITE_GISCUS_CATEGORY_ID`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`
- **Vercel**: production/preview/development 환경변수
- **VERCEL_TOKEN** (선택): GitHub Actions 자동 배포용. `export VERCEL_TOKEN=xxx` 후 스크립트 실행

## 8. GitHub Actions 자동 배포

`main` 브랜치 push 시 `.github/workflows/deploy.yml`이 실행됩니다.

1. **Build**: Giscus 설정으로 빌드 검증
2. **Deploy**: `VERCEL_TOKEN`이 설정된 경우 Vercel 프로덕션 배포

## 9. 토큰 생성 및 적용 (gh, vercel CLI)

```bash
bun run tokens:setup
```

- 브라우저에서 **GitHub** / **Vercel** 토큰 생성 페이지 자동 오픈
- 토큰 붙여넣기 → `gh secret set`으로 GitHub Secrets 적용
- 토큰은 웹에서만 생성 가능 (GitHub/Vercel 보안 정책)

## 10. 시크릿 자동 적용 (gh)

`.github/workflows/sync-secrets.yml`이 **gh**로 시크릿을 자동 적용합니다.

**트리거**: `workflow_dispatch` 또는 `.env.example`, `giscus.ts` 등 변경 시 push

**초기 설정**: `bun run tokens:setup` 또는 GitHub Settings → Secrets에 `GH_PAT` 추가

## 완료

앱을 다시 빌드/실행하면 댓글이 활성화됩니다.
