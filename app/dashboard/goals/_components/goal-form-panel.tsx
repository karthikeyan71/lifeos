"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Newsreader } from "next/font/google";
import { createGoal } from "@/features/goals/actions/create-goal";
import { updateGoal } from "@/features/goals/actions/update-goal";

const newsreader = Newsreader({ subsets: ["latin"], weight: ["400", "500"] });

const TITLE_MAX = 200;

type GoalFormPanelProps = {
  mode: "create" | "edit";
  goalId?: string;
  initialValues?: {
    title: string;
    description: string | null;
    startDate: string | null;
    targetDate: string | null;
  };
  onClose: () => void;
};

function XIcon() {
  return (
    <svg viewBox="0 0 14 14" fill="none" className="size-full">
      <path d="M1.5 1.5l11 11M12.5 1.5l-11 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function SignpostIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" className="size-full">
      <path d="M8 1.5v13M4 4h7l1.5 1.75L11 7.5H4V4ZM12 9H5L3.5 10.75 5 12.5h7V9Z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg viewBox="0 0 14 14" fill="none" className="size-full">
      <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function GoalFormPanel({ mode, goalId, initialValues, onClose }: GoalFormPanelProps) {
  const router = useRouter();
  const titleInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState(initialValues?.title ?? "");
  const [description, setDescription] = useState(initialValues?.description ?? "");
  const [startDate, setStartDate] = useState(initialValues?.startDate ?? "");
  const [targetDate, setTargetDate] = useState(initialValues?.targetDate ?? "");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    titleInputRef.current?.focus();
  }, []);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !isSubmitting) onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isSubmitting, onClose]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setIsSubmitting(true);

    const input = {
      title,
      description: description || undefined,
      startDate: startDate || undefined,
      targetDate: targetDate || undefined,
    };

    const result = mode === "create" ? await createGoal(input) : await updateGoal(goalId!, input);

    setIsSubmitting(false);

    if (!result.success) {
      setError(typeof result.error === "string" ? result.error : "Something went wrong. Please try again.");
      return;
    }

    router.refresh();
    onClose();
  }

  const headingId = "goal-form-heading";
  const titleTooLong = title.length > TITLE_MAX;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-[#1a1c1a]/25 backdrop-blur-sm sm:items-center sm:p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isSubmitting) onClose();
      }}
    >
      <form
        onSubmit={handleSubmit}
        role="dialog"
        aria-modal="true"
        aria-labelledby={headingId}
        className="flex max-h-[92dvh] w-full max-w-[42rem] flex-col overflow-hidden rounded-t-2xl bg-white shadow-[0_24px_48px_-12px_rgba(22,44,38,0.18)] sm:rounded-xl"
      >
        <div className="flex items-start justify-between gap-4 bg-[#faf9f6] px-6 pb-5 pt-6 sm:px-8 sm:pt-7">
          <div className="flex min-w-0 flex-col gap-1">
            <div className="flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-[#4a170c]" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#605e5a]">
                Goal Architecture
              </span>
            </div>
            <h2
              id={headingId}
              className={`${newsreader.className} pt-0.5 text-[24px] font-medium leading-[30px] tracking-[-0.01em] text-[#162c26]`}
            >
              {mode === "create" ? "Create a new goal" : "Edit goal"}
            </h2>
            <p className="pt-1 text-[13px] leading-[19px] text-[#424845]">
              {mode === "create"
                ? "Set a long-horizon intention. You'll shape milestones and daily tasks from here."
                : "Refine the intention. Milestones and tasks stay attached."}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Close"
            className="flex size-8 shrink-0 items-center justify-center rounded-lg text-[#605e5a] hover:bg-[#e9e8e5] hover:text-[#1a1c1a] disabled:opacity-50"
          >
            <span className="size-3.5">
              <XIcon />
            </span>
          </button>
        </div>

        <div className="flex flex-col gap-5 overflow-y-auto px-6 py-6 sm:px-8">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="goal-title" className="text-[14px] font-semibold text-[#162c26]">
                Goal title <span className="text-[#4a170c]">*</span>
              </label>
              <span className={`text-[11px] tabular-nums ${titleTooLong ? "text-[#ba1a1a]" : "text-[#605e5a]"}`}>
                {title.length}/{TITLE_MAX}
              </span>
            </div>
            <input
              id="goal-title"
              ref={titleInputRef}
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="e.g. Master distributed systems"
              required
              className="h-11 rounded-lg bg-[#f4f3f1] px-3.5 text-[15px] text-[#1a1c1a] outline-none placeholder:text-[#727875] focus:bg-white focus:ring-1 focus:ring-[#2c423b]"
            />
            <p className="text-[12px] text-[#605e5a]">Give your goal a clear, inspiring outcome.</p>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="goal-description" className="text-[14px] font-semibold text-[#162c26]">
              Description <span className="font-normal text-[#605e5a]">(optional)</span>
            </label>
            <textarea
              id="goal-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Why does this goal matter right now? What does success look like?"
              rows={3}
              className="resize-none rounded-lg bg-[#f4f3f1] px-3.5 py-2.5 text-[14px] leading-[21px] text-[#1a1c1a] outline-none placeholder:text-[#727875] focus:bg-white focus:ring-1 focus:ring-[#2c423b]"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="goal-start" className="text-[14px] font-semibold text-[#162c26]">
                Start date <span className="font-normal text-[#605e5a]">(optional)</span>
              </label>
              <input
                id="goal-start"
                type="date"
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
                className="h-11 rounded-lg bg-[#f4f3f1] px-3 text-[14px] text-[#1a1c1a] outline-none focus:bg-white focus:ring-1 focus:ring-[#2c423b]"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="goal-target" className="text-[14px] font-semibold text-[#162c26]">
                Target date <span className="font-normal text-[#605e5a]">(optional)</span>
              </label>
              <input
                id="goal-target"
                type="date"
                value={targetDate}
                onChange={(event) => setTargetDate(event.target.value)}
                className="h-11 rounded-lg bg-[#f4f3f1] px-3 text-[14px] text-[#1a1c1a] outline-none focus:bg-white focus:ring-1 focus:ring-[#2c423b]"
              />
            </div>
          </div>

          <div className="flex items-start gap-2.5 rounded-lg bg-[#f4f3f1] p-3.5">
            <span className="mt-0.5 size-4 shrink-0 text-[#2c423b]">
              <SignpostIcon />
            </span>
            <div className="flex flex-col">
              <span className="text-[12px] font-semibold text-[#162c26]">Next step: break it into milestones</span>
              <p className="pt-0.5 text-[12px] leading-[17px] text-[#424845]">
                After creating this goal, add the checkpoints that mark real progress, then attach tasks to your schedule.
              </p>
            </div>
          </div>

          {error && (
            <p role="alert" className="text-[13px] font-medium text-[#ba1a1a]">
              {error}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 bg-[#faf9f6] px-6 py-4 sm:px-8">
          <div className="hidden items-center gap-1.5 text-[#605e5a] sm:flex">
            <kbd className="rounded bg-[#e9e8e5] px-1.5 py-0.5 text-[11px] font-medium">Esc</kbd>
            <span className="text-[12px]">to dismiss</span>
          </div>
          <div className="flex flex-1 items-center justify-end gap-2 sm:flex-none">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex h-10 items-center justify-center rounded-lg px-4 text-[13px] font-medium text-[#424845] hover:bg-[#e9e8e5] disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex h-10 items-center justify-center gap-1.5 rounded-lg bg-[#2c423b] px-5 text-[13px] font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {isSubmitting
                ? mode === "create"
                  ? "Creating goal…"
                  : "Saving…"
                : mode === "create"
                  ? "Create goal"
                  : "Save changes"}
              {!isSubmitting && (
                <span className="size-3.5">
                  <ArrowRightIcon />
                </span>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}