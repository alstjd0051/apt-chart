import { useEffect, useRef, memo } from "react";

const REPO = "alstjd0051/apt-chart-comments";

interface Props {
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
