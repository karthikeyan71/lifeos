"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Newsreader } from "next/font/google";
import { createHabit } from "@/features/habits/actions/create-habit";
import { updateHabit } from "@/features/habits/actions/update-habit";

const newsreader = Newsreader({ subsets: ["latin"], weight: ["400", "500"] });

const NAME_MAX = 200;

export type HabitCategory = { id: string; name: string };

type Frequency = "daily" | "weekly";

type HabitFormPanelProps = {
  mode: "create" | "edit";
  habitId?: string;
  categories: HabitCategory[];
  initialValues?: {
    name: string;
    description: string | null;
    frequency: Frequency;
    categoryId: string | null;
    startDate: string | null;
    endDate: string | null;
    isActive: boolean;
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

function RepeatIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" className="size-full">
      <path d="M3 7V5.5A2.5 2.5 0 0 1 5.5 3H12M12 3l-2-2M12 3l-2 2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M13 9v1.5A2.5 2.5 0 0 1 10.5 13H4M4 13l2 2M4 13l2-2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function HabitFormPanel({ mode, habitId, categories, initialValues, onClose }: HabitFormPanelProps) {
  const router = useRouter();
  const nameInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(initialValues?.name ?? "");
  const [description, setDescription] = useState(initialValues?.description ?? "");
  const [frequency, setFrequency] = useState<Frequency>(initialValues?.frequency ?? "daily");
  const [categoryId, setCategoryId] = useState(initialValues?.categoryId ?? "");
  const [startDate, setStartDate] = useState(initialValues?.startDate ?? "");
  const [endDate, setEndDate] = useState(initialValues?.endDate ?? "");
  const [isActive, setIsActive] = useState(initialValues?.isActive ?? true);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    nameInputRef.current?.focus();
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
      name,
      description: description || undefined,
      frequency,
      categoryId: categoryId || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      isActive,
    };

    const result = mode === "create" ? await createHabit(input) : await updateHabit(habitId!, input);

    setIsSubmitting(false);

    if (!result.success) {
      setError(typeof result.error === "string" ? result.error : "Something went wrong. Please try again.");
      return;
    }

    router.refresh();
    onClose();
  }

  const headingId = "habit-form-heading";
  const nameTooLong = name.length > NAME_MAX;

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
        className="flex max-h-[92dvh] w-full max-w-[40rem] flex-col overflow-hidden rounded-t-2xl bg-white shadow-[0_24px_48px_-12px_rgba(22,44,38,0.18)] sm:rounded-xl"
      >
        <div className="flex items-start justify-between gap-4 bg-[#faf9f6] px-6 pb-5 pt-6 sm:px-8 sm:pt-7">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#2c423b] text-white">
              <span className="size-4">
                <RepeatIcon />
              </span>
            </span>
            <div className="flex min-w-0 flex-col gap-0.5">
              <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#605e5a]">
                Rhythm Configuration
              </span>
              <h2
                id={headingId}
                className={`${newsreader.className} text-[22px] font-medium leading-[28px] tracking-[-0.01em] text-[#162c26]`}
              >
                {mode === "create" ? "Create a new habit" : "Edit habit"}
              </h2>
            </div>
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
          <p className="text-[13px] leading-[19px] text-[#605e5a]">
            Habits track recurring behavior over time. Occurrences are logged per day and are not tied to goals or tasks.
          </p>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="habit-name" className="text-[14px] font-semibold text-[#162c26]">
                Habit name <span className="text-[#4a170c]">*</span>
              </label>
              <span className={`text-[11px] tabular-nums ${nameTooLong ? "text-[#ba1a1a]" : "text-[#605e5a]"}`}>
                {name.length}/{NAME_MAX}
              </span>
            </div>
            <input
              id="habit-name"
              ref={nameInputRef}
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="e.g. Morning meditation"
              required
              className="h-11 rounded-lg bg-[#f4f3f1] px-3.5 text-[15px] text-[#1a1c1a] outline-none placeholder:text-[#727875] focus:bg-white focus:ring-1 focus:ring-[#2c423b]"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="habit-description" className="text-[14px] font-semibold text-[#162c26]">
              Description <span className="font-normal text-[#605e5a]">(optional)</span>
            </label>
            <textarea
              id="habit-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="What does this practice look like on a good day?"
              rows={2}
              className="resize-none rounded-lg bg-[#f4f3f1] px-3.5 py-2.5 text-[14px] leading-[21px] text-[#1a1c1a] outline-none placeholder:text-[#727875] focus:bg-white focus:ring-1 focus:ring-[#2c423b]"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-[14px] font-semibold text-[#162c26]">Cadence</span>
            <div className="flex items-center rounded-lg border border-[#c2c8c4]/40 bg-[#f4f3f1] p-0.5">
              {(
                [
                  { key: "daily", label: "Daily routine" },
                  { key: "weekly", label: "Weekly target" },
                ] as const
              ).map((option) => (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => setFrequency(option.key)}
                  aria-pressed={frequency === option.key}
                  className={`flex-1 rounded-md px-3 py-2 text-[13px] font-semibold transition-colors ${
                    frequency === option.key ? "bg-white text-[#162c26] shadow-sm" : "text-[#605e5a] hover:text-[#1a1c1a]"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="habit-category" className="text-[14px] font-semibold text-[#162c26]">
                Category <span className="font-normal text-[#605e5a]">(optional)</span>
              </label>
              <select
                id="habit-category"
                value={categoryId}
                onChange={(event) => setCategoryId(event.target.value)}
                className="h-11 rounded-lg bg-[#f4f3f1] px-3 text-[14px] text-[#1a1c1a] outline-none focus:bg-white focus:ring-1 focus:ring-[#2c423b] disabled:text-[#a8a29e]"
                disabled={categories.length === 0}
              >
                <option value="">{categories.length === 0 ? "No categories yet" : "No category"}</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col justify-end gap-1.5">
              <span className="text-[14px] font-semibold text-[#162c26]">Active</span>
              <button
                type="button"
                role="switch"
                aria-checked={isActive}
                onClick={() => setIsActive((value) => !value)}
                className={`flex h-11 items-center justify-between rounded-lg px-3.5 text-[13px] font-medium transition-colors ${
                  isActive ? "bg-[#cfe8de]/50 text-[#162c26]" : "bg-[#f4f3f1] text-[#605e5a]"
                }`}
              >
                {isActive ? "Tracking" : "Paused"}
                <span
                  className={`relative h-5 w-9 rounded-full transition-colors ${isActive ? "bg-[#2c423b]" : "bg-[#c2c8c4]"}`}
                >
                  <span
                    className={`absolute top-0.5 size-4 rounded-full bg-white transition-all ${isActive ? "left-4" : "left-0.5"}`}
                  />
                </span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="habit-start" className="text-[14px] font-semibold text-[#162c26]">
                Start date <span className="font-normal text-[#605e5a]">(optional)</span>
              </label>
              <input
                id="habit-start"
                type="date"
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
                className="h-11 rounded-lg bg-[#f4f3f1] px-3 text-[14px] text-[#1a1c1a] outline-none focus:bg-white focus:ring-1 focus:ring-[#2c423b]"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="habit-end" className="text-[14px] font-semibold text-[#162c26]">
                End date <span className="font-normal text-[#605e5a]">(optional)</span>
              </label>
              <input
                id="habit-end"
                type="date"
                value={endDate}
                onChange={(event) => setEndDate(event.target.value)}
                className="h-11 rounded-lg bg-[#f4f3f1] px-3 text-[14px] text-[#1a1c1a] outline-none focus:bg-white focus:ring-1 focus:ring-[#2c423b]"
              />
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
              className="flex h-10 items-center justify-center rounded-lg bg-[#2c423b] px-5 text-[13px] font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {isSubmitting
                ? mode === "create"
                  ? "Creating habit…"
                  : "Saving…"
                : mode === "create"
                  ? "Create habit"
                  : "Save changes"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
