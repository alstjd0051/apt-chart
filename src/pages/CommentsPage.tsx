import { UtterancesComments } from "../components/UtterancesComments";
import { TopicChart } from "../components/TopicChart";
import { QUESTIONS } from "../config/questions";
import type { SummaryData } from "../types";
import { memo, useEffect } from "react";

interface Props {
  data: SummaryData | null;
}

/** 현재 페이지의 섹션별 고유 URL 생성 (GitHub 이슈 제목 = 이 URL로 매핑) */
function getSectionIssueTerm(sectionId: string): string {
  if (typeof window === "undefined") return `comments-${sectionId}`;
  const base =
    `${window.location.origin}${window.location.pathname}`.replace(/\/$/, "") ||
    window.location.origin;
  return `${base}#comments-${sectionId}`;
}

export const CommentsPage = memo(function CommentsPage({ data }: Props) {
  // URL 해시(#comments-xxx)로 진입 시 해당 섹션으로 스크롤
  useEffect(() => {
    const hash = window.location.hash;
    if (!hash || !hash.startsWith("#comments-")) return;
    const id = hash.slice(1);
    const el = document.getElementById(id);
    if (el) {
      requestAnimationFrame(() => {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
  }, []);

  // 해시 변경 시 스크롤 (뒤로가기 등)
  useEffect(() => {
    const onHashChange = () => {
      const hash = window.location.hash;
      if (!hash || !hash.startsWith("#comments-")) return;
      const id = hash.slice(1);
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  return (
    <div className="space-y-10">
      <div className="rounded-xl px-5 py-1.5">
        <h2 className="text-xl font-bold text-indigo-900 mb-2">질문 & 댓글</h2>
      </div>

      <div className="space-y-10">
        {QUESTIONS.map((q) => (
          <CommentSection
            key={q.id}
            question={q}
            data={data}
            issueTerm={getSectionIssueTerm(q.id)}
          />
        ))}
      </div>
    </div>
  );
});

function CommentSection({
  question,
  data,
  issueTerm,
}: {
  question: (typeof QUESTIONS)[0];
  data: SummaryData | null;
  issueTerm: string;
}) {
  const sectionId = `comments-${question.id}`;

  return (
    <section
      id={sectionId}
      className="scroll-mt-28 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
    >
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">
            {question.title}
          </h3>
          {question.description && (
            <p className="mt-1 text-sm text-gray-500">{question.description}</p>
          )}
        </div>
      </div>

      <div className="mb-6">
        <TopicChart topicId={question.id} data={data} />
      </div>

      <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50/50 overflow-hidden">
        <div className="p-4 bg-white min-h-[320px]">
          <UtterancesComments issueTerm={issueTerm} />
        </div>
      </div>
    </section>
  );
}
