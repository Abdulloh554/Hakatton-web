"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { filterLocations, type Location, type PublicQuestion } from "@hakaton/shared";
import { AtlasSection, type ScopeFilter, type TargetFilter } from "./atlas-section";
import { CompareSection } from "./compare-section";
import { QuizSection, type QuizAnswerState, type QuizStatus } from "./quiz-section";
import { BotSection, MethodSection, SiteFooter } from "./info-sections";
import { AppHeader } from "./app-header";
import PlanetPlaces from "./planet-places";
import { api } from "../lib/api";

const ALL_TERRAINS = "Barchasi";

interface QuizPayload {
  questions: PublicQuestion[];
}
interface QuizSubmitPayload {
  results: { questionId: string; correct: boolean; correctAnswer: number; explanation: string }[];
}

export default function Explorer({ initialLocations, botUsername }: { initialLocations: Location[]; botUsername?: string }) {
  const [selectedId, setSelectedId] = useState("");
  const [target, setTarget] = useState<TargetFilter>("Barchasi");
  const [terrain, setTerrain] = useState(ALL_TERRAINS);
  const [query, setQuery] = useState("");
  const [scope, setScope] = useState<ScopeFilter>("all");
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [notice, setNotice] = useState("");
  const [questions, setQuestions] = useState<PublicQuestion[]>([]);
  const [quizStatus, setQuizStatus] = useState<QuizStatus>("loading");
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, QuizAnswerState>>({});
  const [quizSummaryVisible, setQuizSummaryVisible] = useState(false);
  const [quizPending, setQuizPending] = useState(false);

  // Plain code-point order, not localeCompare: Node and the browser disagree on the
  // "uz" collation, which would hydrate the <select> options in a different order.
  const terrains = useMemo(
    () => [ALL_TERRAINS, ...Array.from(new Set(initialLocations.map((item) => item.terrain))).sort()],
    [initialLocations],
  );

  // One filtering implementation for the browser, the API and the bot: @hakaton/shared.
  const visible = useMemo(() => {
    const matched = filterLocations({ q: query, target, terrain }, initialLocations);
    return scope === "saved" ? matched.filter((item) => savedIds.includes(item.id)) : matched;
  }, [initialLocations, query, target, terrain, scope, savedIds]);

  const selected = useMemo(
    () => initialLocations.find((item) => item.id === selectedId) ?? visible[0] ?? initialLocations[0],
    [initialLocations, selectedId, visible],
  );
  const selectedVisible = Boolean(selected && visible.some((item) => item.id === selected.id));
  const compareItems = useMemo(
    () => compareIds.map((id) => initialLocations.find((item) => item.id === id)).filter((item): item is Location => Boolean(item)),
    [compareIds, initialLocations],
  );

  useEffect(() => {
    let active = true;
    api<{ ids: string[] }>("/bookmarks")
      .then(({ ids }) => { if (active) setSavedIds(ids.filter((id) => initialLocations.some((item) => item.id === id))); })
      .catch(() => { if (active) setNotice("Saqlangan joylar xizmati vaqtincha ishlamayapti."); });
    return () => { active = false; };
  }, [initialLocations]);

  useEffect(() => {
    let active = true;
    api<QuizPayload>("/quiz")
      .then(({ questions: list }) => {
        if (!active) return;
        if (!Array.isArray(list) || list.length === 0) throw new Error("empty");
        setQuestions(list);
        setQuizStatus("ready");
      })
      .catch(() => { if (active) setQuizStatus("unavailable"); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(""), 4500);
    return () => window.clearTimeout(timer);
  }, [notice]);

  // Deep links: /?joy=<id> opens the atlas with that location selected. The URL is read
  // after mount rather than during render, and re-reading it must stay idempotent.
  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const requested = new URLSearchParams(window.location.search).get("joy");
      if (!requested || !initialLocations.some((item) => item.id === requested)) return;
      setSelectedId((current) => (current === requested ? current : requested));
      document.getElementById("atlas")?.scrollIntoView({ block: "start" });
    });
    return () => window.cancelAnimationFrame(frame);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resetFilters = useCallback(() => {
    setTarget("Barchasi");
    setTerrain(ALL_TERRAINS);
    setQuery("");
    setScope("all");
  }, []);

  const toggleSave = useCallback(async (id: string) => {
    const removing = savedIds.includes(id);
    const previous = savedIds;
    setSavedIds(removing ? savedIds.filter((item) => item !== id) : [...savedIds, id]);
    try {
      await api(removing ? `/bookmarks/${encodeURIComponent(id)}` : "/bookmarks", {
        method: removing ? "DELETE" : "POST",
        body: removing ? undefined : JSON.stringify({ locationId: id }),
      });
      setNotice(removing ? "Joy saqlanganlardan olib tashlandi." : "Joy saqlandi.");
    } catch (error) {
      setSavedIds(previous);
      setNotice(error instanceof Error ? error.message : "Joyni saqlab bo‘lmadi.");
    }
  }, [savedIds]);

  const toggleCompare = useCallback((id: string) => {
    setCompareIds((items) =>
      items.includes(id) ? items.filter((item) => item !== id) : items.length < 2 ? [...items, id] : [items[1], id],
    );
  }, []);

  const share = useCallback(async (id: string) => {
    const url = new URL(window.location.href);
    url.searchParams.set("joy", id);
    url.hash = "atlas";
    try {
      if (navigator.share) await navigator.share({ title: "Terra Analog", url: url.toString() });
      else await navigator.clipboard.writeText(url.toString());
      setNotice("Havola nusxalandi.");
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") return;
      setNotice("Havolani nusxalab bo‘lmadi. Manzil satridan foydalaning.");
    }
  }, []);

  const answerQuiz = useCallback(async (questionId: string, option: number) => {
    if (quizPending || quizAnswers[questionId]) return;
    setQuizPending(true);
    try {
      const payload = await api<QuizSubmitPayload>("/quiz/submit", {
        method: "POST",
        body: JSON.stringify({ answers: [{ questionId, answer: option }] }),
      });
      const result = payload.results?.[0];
      if (!result) throw new Error("Javobni tekshirib bo‘lmadi.");
      setQuizSummaryVisible(false);
      setQuizAnswers((current) => ({
        ...current,
        [questionId]: {
          picked: option,
          correct: result.correct,
          correctAnswer: result.correctAnswer,
          explanation: result.explanation,
        },
      }));
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Javob tekshirilmadi.");
    } finally {
      setQuizPending(false);
    }
  }, [quizAnswers, quizPending]);

  const nextQuestion = useCallback(() => {
    if (Object.keys(quizAnswers).length >= questions.length) {
      setQuizSummaryVisible(true);
      return;
    }
    setQuizIndex((index) => (index + 1) % questions.length);
  }, [quizAnswers, questions.length]);

  const restartQuiz = useCallback(() => {
    setQuizAnswers({});
    setQuizIndex(0);
    setQuizSummaryVisible(false);
  }, []);

  return (
    <>
      <AppHeader botUsername={botUsername} />
      <main>
        <a className="skip-link" href="#atlas">Asosiy mazmunga o‘tish</a>
        <AtlasSection
          locations={initialLocations}
          visible={visible}
          selected={selected}
          filteredOut={!selectedVisible}
          terrains={terrains}
          target={target}
          terrain={terrain}
          query={query}
          scope={scope}
          savedIds={savedIds}
          compareIds={compareIds}
          compareReady={compareItems.length === 2}
          onTarget={setTarget}
          onTerrain={setTerrain}
          onQuery={setQuery}
          onScope={setScope}
          onSelect={setSelectedId}
          onToggleSave={(id) => void toggleSave(id)}
          onToggleCompare={toggleCompare}
          onShare={(id) => void share(id)}
          onResetFilters={resetFilters}
        />
        <CompareSection items={compareItems} onRemove={(id) => setCompareIds((items) => items.filter((item) => item !== id))} />
        <PlanetPlaces />
        <MethodSection />
        <QuizSection
          status={quizStatus}
          questions={questions}
          index={quizIndex}
          answers={quizAnswers}
          summaryVisible={quizSummaryVisible}
          pending={quizPending}
          onAnswer={(questionId, option) => void answerQuiz(questionId, option)}
          onNext={nextQuestion}
          onRestart={restartQuiz}
        />
        <BotSection botUsername={botUsername} />
        <SiteFooter />
        {notice && <div className="toast" role="status">{notice}</div>}
      </main>
    </>
  );
}
