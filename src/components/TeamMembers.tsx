import { useGitHubProfiles } from "../hooks/useGitHubProfiles";
import { memo, useRef, useEffect } from "react";
import { gsap } from "gsap";

export const TeamMembers = memo(function TeamMembers() {
  const { members } = useGitHubProfiles();
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<HTMLAnchorElement[]>([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        containerRef.current,
        { opacity: 0, x: 20 },
        { opacity: 1, x: 0, duration: 0.5, ease: "power2.out", delay: 0.3 },
      );
      gsap.fromTo(
        itemRefs.current.filter(Boolean),
        { opacity: 0, x: 12 },
        {
          opacity: 1,
          x: 0,
          duration: 0.35,
          stagger: 0.08,
          delay: 0.5,
          ease: "power2.out",
        },
      );
    });
    return () => ctx.revert();
  }, [members.length]);

  return (
    <div
      ref={containerRef}
      className="fixed top-20 right-4 z-40 sm:top-24 sm:right-6 md:right-8"
      style={{ marginTop: "env(safe-area-inset-top, 0)" }}
    >
      <div
        className="pointer-events-none rounded-2xl border border-white/50 px-3 py-2.5 shadow-lg [&_a]:pointer-events-auto sm:px-4 sm:py-3"
        style={{ backgroundColor: "rgba(255,255,255,0.35)", backdropFilter: "blur(8px)" }}
      >
        <p className="mb-2 hidden text-[11px] font-semibold uppercase tracking-widest text-indigo-600/80 sm:block">
          Team
        </p>
        <div className="flex items-center gap-3 sm:flex-col sm:items-stretch sm:gap-2">
          {members.map((m, i) => (
            <a
              ref={(el) => {
                if (el) itemRefs.current[i] = el;
              }}
              key={m.username}
              href={m.profile?.html_url ?? `https://github.com/${m.username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-2.5 rounded-xl px-2 py-1.5 transition-colors hover:bg-indigo-50/70 sm:px-3 sm:py-2"
            >
              <div className="relative shrink-0">
                {m.loading ? (
                  <div className="h-9 w-9 animate-pulse rounded-full bg-gray-200 sm:h-10 sm:w-10" />
                ) : m.profile?.avatar_url ? (
                  <img
                    src={m.profile.avatar_url}
                    alt={m.displayName}
                    className="h-9 w-9 rounded-full object-cover ring-2 ring-white shadow-sm transition-transform group-hover:scale-105 sm:h-10 sm:w-10"
                  />
                ) : (
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-indigo-100 to-indigo-50 text-sm font-bold text-indigo-600 shadow-sm sm:h-10 sm:w-10 sm:text-base">
                    {m.displayName[0]}
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1 sm:text-center">
                <p className="truncate text-sm font-semibold text-gray-800 group-hover:text-indigo-700">
                  {m.displayName}
                </p>
                <p className="text-[11px] text-gray-500 sm:text-xs">
                  @{m.username}
                </p>
              </div>
              <svg
                className="hidden h-3.5 w-3.5 shrink-0 text-gray-400 transition group-hover:translate-x-0.5 group-hover:text-indigo-500 sm:block"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
});
