import { useState, useEffect, useCallback } from "react";
import { TEAM_MEMBERS } from "../config/teamMembers";

export interface GitHubProfile {
  login: string;
  avatar_url: string;
  html_url: string;
  name: string | null;
  bio: string | null;
  public_repos: number;
  followers: number;
  following: number;
}

export interface TeamMemberWithProfile {
  displayName: string;
  username: string;
  profile: GitHubProfile | null;
  loading: boolean;
  error: string | null;
}

const GITHUB_API = "https://api.github.com/users";

async function fetchProfile(username: string): Promise<GitHubProfile> {
  const res = await fetch(`${GITHUB_API}/${username}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export function useGitHubProfiles() {
  const [members, setMembers] = useState<TeamMemberWithProfile[]>(
    TEAM_MEMBERS.map((m) => ({
      displayName: m.displayName,
      username: m.username,
      profile: null,
      loading: true,
      error: null,
    })),
  );

  const fetchAll = useCallback(async () => {
    const results = await Promise.allSettled(
      TEAM_MEMBERS.map((m) => fetchProfile(m.username)),
    );

    setMembers(
      TEAM_MEMBERS.map((m, i) => {
        const result = results[i];
        if (result.status === "fulfilled") {
          return {
            displayName: m.displayName,
            username: m.username,
            profile: result.value,
            loading: false,
            error: null,
          };
        }
        return {
          displayName: m.displayName,
          username: m.username,
          profile: null,
          loading: false,
          error: (result.reason as Error).message,
        };
      }),
    );
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return { members, refetch: fetchAll };
}
