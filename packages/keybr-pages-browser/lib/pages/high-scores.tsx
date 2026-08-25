import { Layout } from "@keybr/keyboard";
import { type Entry, HighScoresPage } from "@keybr/page-highscores";
import { type AnyUser } from "@keybr/pages-shared";
import { ResultLoader } from "@keybr/result-loader";
import { type Result, useResults } from "@keybr/result";
import { useMemo } from "react";

const you: AnyUser = { id: null, name: "You", imageUrl: null };

export default function Page() {
  return (
    <ResultLoader>
      <LocalHighScoresPage />
    </ResultLoader>
  );
}

function LocalHighScoresPage() {
  const { results } = useResults();
  const entries = useMemo(() => makeEntries(results), [results]);
  return <HighScoresPage entries={entries} />;
}

function makeEntries(results: readonly Result[]): Entry[] {
  const bestByLayout = new Map<Layout, Result>();
  for (const result of results) {
    const best = bestByLayout.get(result.layout);
    if (best == null || result.score > best.score) {
      bestByLayout.set(result.layout, result);
    }
  }
  return [...bestByLayout.values()]
    .sort((a, b) => b.speed - a.speed)
    .slice(0, 100)
    .map((result) => ({
      user: you,
      layout: result.layout,
      speed: result.speed,
      score: result.score,
    }));
}
