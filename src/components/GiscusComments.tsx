import Giscus from "@giscus/react";
import { memo } from "react";
import { GISCUS_CONFIG, isGiscusConfigured } from "../config/giscus";

interface Props {
  /** 질문별 별도 Discussion 매핑용 식별자 */
  term: string;
  title?: string;
}

export const GiscusComments = memo(function GiscusComments({ term, title }: Props) {
  if (!isGiscusConfigured()) {
    return (
      <div className="w-full rounded-lg border border-amber-200 bg-amber-50 p-6">
        <h4 className="mb-2 text-sm font-semibold text-amber-800">
          댓글 설정이 필요합니다
        </h4>
        <p className="text-sm text-amber-700">
          <a
            href="https://giscus.app/ko"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            giscus.app
          </a>
          에서 설정 후 <code className="rounded bg-amber-100 px-1">.env</code>에{" "}
          <code className="rounded bg-amber-100 px-1">VITE_GISCUS_REPO_ID</code>,{" "}
          <code className="rounded bg-amber-100 px-1">VITE_GISCUS_CATEGORY_ID</code>를
          추가해주세요. (Public 댓글 전용 레포 필요)
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {title && (
        <h4 className="mb-3 text-sm font-semibold text-gray-700">{title}</h4>
      )}
      <Giscus
        repo={GISCUS_CONFIG.repo as `${string}/${string}`}
        repoId={GISCUS_CONFIG.repoId}
        category={GISCUS_CONFIG.category}
        categoryId={GISCUS_CONFIG.categoryId}
        mapping="specific"
        term={term}
        theme="light"
        lang="ko"
        reactionsEnabled="1"
        emitMetadata="0"
        inputPosition="bottom"
      />
    </div>
  );
});
