import { UtterancesComments } from "../components/UtterancesComments";
import { QUESTIONS } from "../config/questions";
import { memo } from "react";

export const CommentsPage = memo(function CommentsPage() {
  return (
    <div className="space-y-10">
      <div className="rounded-xl bg-indigo-50 border border-indigo-100 p-5">
        <h2 className="text-xl font-bold text-indigo-900 mb-2">질문 & 댓글</h2>
        <p className="text-sm text-indigo-700">
          주제별로 질문을 남겨주세요. GitHub 로그인으로 댓글 작성이 가능합니다.
        </p>
      </div>

      <div className="space-y-8">
        {QUESTIONS.map((q) => (
          <section
            key={q.id}
            className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
          >
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-800">{q.title}</h3>
              {q.description && (
                <p className="mt-1 text-sm text-gray-500">{q.description}</p>
              )}
            </div>
            <UtterancesComments
              issueTerm={`comments-${q.id}`}
              title="댓글"
            />
          </section>
        ))}
      </div>
    </div>
  );
});
