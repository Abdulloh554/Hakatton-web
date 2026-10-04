"use client";

import { ArrowRight, CircleHelp, Loader2, RotateCcw, Target } from "lucide-react";
import type { PublicQuestion } from "@hakaton/shared";

export type QuizStatus = "loading" | "ready" | "unavailable";

/** The server decides what is correct; `picked` is kept locally only to highlight the choice. */
export interface QuizAnswerState {
  picked: number;
  correct: boolean;
  correctAnswer: number;
  explanation: string;
}

export function QuizSection({
  status,
  questions,
  index,
  answers,
  summaryVisible,
  pending,
  onAnswer,
  onNext,
  onRestart,
}: {
  status: QuizStatus;
  questions: PublicQuestion[];
  index: number;
  answers: Record<string, QuizAnswerState>;
  summaryVisible: boolean;
  pending: boolean;
  onAnswer: (questionId: string, option: number) => void;
  onNext: () => void;
  onRestart: () => void;
}) {
  const answered = Object.keys(answers).length;
  const score = Object.values(answers).filter((item) => item.correct).length;
  const question = questions[index];
  const current = question ? answers[question.id] : undefined;
  // The summary only replaces the last question after the user has seen its explanation.
  const finished = status === "ready" && questions.length > 0 && answered === questions.length && summaryVisible;

  return (
    <section className="quiz-section" id="quiz">
      <div>
        <p className="eyebrow"><span /> Kichik sinov</p>
        <h2>Bilimingizni<br /><em>sinab ko‘ring.</em></h2>
        <p>Javob serverda tekshiriladi. To‘g‘ri javobdan keyin qisqa ilmiy izoh beriladi.</p>
      </div>
      <div className="quiz-card">
        {status === "loading" && (
          <div className="quiz-loading">
            <Loader2 size={27} className="spin" />
            <p>Quiz savollari yuklanmoqda…</p>
          </div>
        )}
        {status === "unavailable" && (
          <div className="quiz-loading">
            <CircleHelp size={29} />
            <p>
              Quiz xizmati hozircha mavjud emas. Savollar serverda tekshiriladi, shuning uchun ularni
              brauzerda ko‘rsatib bo‘lmaydi.
            </p>
          </div>
        )}
        {status === "ready" && finished && (
          <div className="quiz-summary">
            <Target size={26} />
            <h3>{score} / {questions.length}</h3>
            <p>
              {score === questions.length
                ? "Ajoyib! Barcha savollar to‘g‘ri. Endi atlasda o‘z joylaringizni tanlang."
                : "Yaxshi urinish. Xato javoblar izohlari bilan birga ko‘rsatildi — atlas bilan tekshirib ko‘ring."}
            </p>
            <button type="button" className="primary-button" onClick={onRestart}>Qayta o‘ynash <RotateCcw size={15} /></button>
          </div>
        )}
        {status === "ready" && !finished && question && (
          <>
            <span className="quiz-progress">Savol {index + 1} / {questions.length} · to‘g‘ri {score}</span>
            <h3>{question.prompt}</h3>
            <div className="answers">
              {question.options.map((option, optionIndex) => (
                <button
                  key={option}
                  type="button"
                  disabled={Boolean(current) || pending}
                  className={
                    !current
                      ? ""
                      : optionIndex === current.correctAnswer
                        ? "correct"
                        : optionIndex === current.picked
                          ? "wrong"
                          : "muted"
                  }
                  onClick={() => onAnswer(question.id, optionIndex)}
                >
                  {String.fromCharCode(65 + optionIndex)}
                  <span>{option}</span>
                </button>
              ))}
            </div>
            {pending && <p className="quiz-pending"><Loader2 size={14} className="spin" /> Javob tekshirilmoqda…</p>}
            {current && (
              <div className={`feedback ${current.correct ? "correct" : "incorrect"}`}>
                <b>{current.correct ? "To‘g‘ri javob." : "Bu safar xato."}</b>
                <p>{current.explanation}</p>
                <button type="button" onClick={onNext}>
                  {answered === questions.length ? "Natija" : "Keyingi savol"} <ArrowRight size={15} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}