/**
 * Giscus 설정 — Private 레포 대신 별도 Public 댓글 전용 레포 사용
 *
 * 설정 방법:
 * 1. GitHub에 Public 레포 생성 (예: alstjd0051/apt-chart-comments)
 * 2. 레포 Settings → General → Discussions 활성화
 * 3. Discussions 탭에서 카테고리 생성 (예: "Comments")
 * 4. https://github.com/apps/giscus 에서 Giscus 앱 설치
 * 5. https://giscus.app/ko 에서 설정 후 repoId, categoryId 복사
 * 6. .env에 아래 변수 설정
 */
/** apt-chart-comments Public 레포 (이미 생성됨) */
export const GISCUS_CONFIG = {
  repo: (import.meta.env.VITE_GISCUS_REPO as string) || "alstjd0051/apt-chart-comments",
  repoId: (import.meta.env.VITE_GISCUS_REPO_ID as string) || "R_kgDORTg8Sg",
  category: (import.meta.env.VITE_GISCUS_CATEGORY as string) || "Q&A",
  categoryId: (import.meta.env.VITE_GISCUS_CATEGORY_ID as string) || "DIC_kwDORTg8Ss4C2v-L",
} as const;

export const isGiscusConfigured = (): boolean => true;
