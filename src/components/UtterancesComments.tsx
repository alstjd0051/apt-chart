import { useEffect, useRef, memo } from "react";

const REPO = "alstjd0051/apt-chart-comments";

interface Props {
  /** issue-term: GitHub 이슈 제목으로 사용. URL+해시를 사용하면 이슈 클릭 시 해당 섹션으로 바로 이동 가능 */
  issueTerm: string;
  title?: string;
}

export const UtterancesComments = memo(function UtterancesComments({
  issueTerm,
  title,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const existing = containerRef.current.querySelector("iframe");
    if (existing) existing.remove();

    const script = document.createElement("script");
    script.src = "https://utteranc.es/client.js";
    script.setAttribute("repo", REPO);
    script.setAttribute("issue-term", issueTerm);
    script.setAttribute("theme", "github-light");
    script.setAttribute("crossorigin", "anonymous");
    script.async = true;

    containerRef.current.appendChild(script);
  }, [issueTerm]);

  return (
    <div className="w-full">
      {title && (
        <h4 className="mb-3 text-sm font-semibold text-gray-700">{title}</h4>
      )}
      <div ref={containerRef} className="min-h-[200px] w-full" />
    </div>
  );
});
