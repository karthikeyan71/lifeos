"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Newsreader } from "next/font/google";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";
import brandMark from "@/public/brand/lifeos-mark.png";

const newsreader = Newsreader({ subsets: ["latin"], weight: ["400", "500"] });

const loginSchema = z.object({
  email: z.string().trim().min(1, "Email is required").email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

function EyeIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="size-full">
      <path
        d="M1.5 10S4.5 4 10 4s8.5 6 8.5 6-3 6-8.5 6-8.5-6-8.5-6Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="10" cy="10" r="2.25" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="size-full">
      <path
        d="M2.5 2.5l15 15M8.35 8.4a2.25 2.25 0 0 0 3.25 3.24M6.2 6.24C3.94 7.5 2.5 10 2.5 10s3 6 7.5 6c1.35 0 2.55-.35 3.58-.9M13.9 5.02A8.6 8.6 0 0 1 17.5 10s-.68 1.36-2 2.72"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg viewBox="0 0 12 12" fill="none" className="size-full">
      <path
        d="M2.5 6h7M6.5 2.5 10 6l-3.5 3.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChevronLeftIcon() {
  return (
    <svg viewBox="0 0 12 12" fill="none" className="size-full">
      <path
        d="M7.5 2 3.5 6l4 4"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg viewBox="0 0 12 14" fill="none" className="size-full">
      <path
        d="M6 1 1.5 2.75V6.5c0 3 1.9 4.9 4.5 6 2.6-1.1 4.5-3 4.5-6V2.75L6 1Z"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 12 10" fill="none" className="size-full">
      <path
        d="M1 5 4.3 8.3 11 1.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setFormError("");

    const validated = loginSchema.safeParse({ email, password });

    if (!validated.success) {
      const errors = validated.error.flatten().fieldErrors;
      setFieldErrors({
        email: errors.email?.[0],
        password: errors.password?.[0],
      });
      return;
    }

    setFieldErrors({});
    setIsSubmitting(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    setIsSubmitting(false);

    if (error) {
      setFormError(error.message);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="flex min-h-full flex-col bg-[#faf9f6]">
      <div className="sticky top-0 z-10 flex items-center gap-2 border-b border-[#efeeeb] bg-[#faf9f6]/80 px-4 py-3 backdrop-blur-md sm:hidden">
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="Go back"
          className="flex size-9 items-center justify-center text-[#424845]"
        >
          <span className="size-3.5">
            <ChevronLeftIcon />
          </span>
        </button>
        <Image src={brandMark} alt="" width={24} height={24} className="rounded-md" />
        <span className="font-semibold text-[#162c26] tracking-[-0.02em]">LifeOS</span>
      </div>

      <main className="flex flex-1 flex-col items-center px-4 pt-8 pb-8 sm:px-10 sm:pt-12">
        <div className="flex w-full flex-col items-center pb-6 sm:pb-8">
          <Image src={brandMark} alt="LifeOS" width={40} height={40} className="rounded-md" />
          <h1
            className={`${newsreader.className} pt-2 text-center text-[26px] font-medium leading-[34px] tracking-[-0.02em] text-[#162c26]`}
          >
            LifeOS
          </h1>
          <p className="pt-1 text-center text-[13px] leading-[18px] tracking-[0.005em] text-[#424845]">
            Your personal operating system
          </p>
        </div>

        <div className="flex w-full max-w-[420px] flex-col items-center">
          <div className="w-full rounded-xl bg-white p-6 shadow-[0_1px_1px_rgba(0,0,0,0.05)] sm:p-8">
            <div className="flex w-full flex-col items-center pb-8 text-center">
              <div className="mb-3 flex size-9 items-center justify-center rounded-lg bg-[#2c423b]/10">
                <Image src={brandMark} alt="" width={20} height={20} />
              </div>
              <h2
                className={`${newsreader.className} text-[26px] font-medium leading-[34px] tracking-[-0.02em] text-[#162c26]`}
              >
                Welcome back
              </h2>
              <p className="pt-1 text-[14px] leading-[22px] text-[#424845]">
                Continue where you left off.
              </p>
            </div>

            <form onSubmit={handleSubmit} noValidate className="flex w-full flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label htmlFor="email" className="text-[13px] tracking-[0.005em] text-[#162c26]">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  className="h-11 w-full rounded-lg bg-[#f4f3f1] px-3.5 text-[14px] text-[#1a1c1a] outline-none focus:ring-1 focus:ring-[#162c26]"
                />
                {fieldErrors.email && (
                  <p className="text-[12px] text-[#b3462c]">{fieldErrors.email}</p>
                )}
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="text-[13px] tracking-[0.005em] text-[#162c26]">
                    Password
                  </label>
                  <span className="text-[13px] tracking-[0.005em] text-[#424845]">Forgot?</span>
                </div>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    className="h-11 w-full rounded-lg bg-[#f4f3f1] pl-3.5 pr-11 text-[14px] text-[#1a1c1a] outline-none focus:ring-1 focus:ring-[#162c26]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-0 top-0 flex h-11 w-11 items-center justify-center text-[#727875]"
                  >
                    <span className="size-4">{showPassword ? <EyeOffIcon /> : <EyeIcon />}</span>
                  </button>
                </div>
                {fieldErrors.password && (
                  <p className="text-[12px] text-[#b3462c]">{fieldErrors.password}</p>
                )}
              </div>

              <label className="flex items-center gap-2 py-0.5">
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={rememberMe}
                  onClick={() => setRememberMe((value) => !value)}
                  className={`flex size-4 items-center justify-center rounded ${
                    rememberMe ? "bg-[#162c26] text-white" : "bg-[#f4f3f1] text-transparent"
                  }`}
                >
                  <span className="size-2.5">
                    <CheckIcon />
                  </span>
                </button>
                <span className="text-[13px] tracking-[0.005em] text-[#424845]">
                  Stay signed in for 30 days
                </span>
              </label>

              {formError && <p className="text-[13px] text-[#b3462c]">{formError}</p>}

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex h-11 w-full items-center justify-center gap-1 rounded-lg bg-[#162c26] text-[16px] font-semibold text-white transition-opacity disabled:opacity-60"
              >
                {isSubmitting ? "Logging in..." : "Log in"}
                {!isSubmitting && (
                  <span className="size-3">
                    <ArrowRightIcon />
                  </span>
                )}
              </button>
            </form>

            <p className="pt-6 text-center text-[13px] tracking-[0.005em] text-[#424845]">
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="font-semibold text-[#162c26]">
                Sign up
              </Link>
            </p>

            <div className="flex items-center justify-center gap-1 pt-3 text-[12px] tracking-[0.02em] text-[#727875]">
              <span className="size-3">
                <ShieldIcon />
              </span>
              End-to-end encrypted session
            </div>
          </div>

          <div className="flex w-full flex-col items-start rounded-xl bg-[#f4f3f1] p-4 sm:hidden mt-6">
            <span className="text-[11px] font-semibold tracking-[0.05em] text-[#424845]">
              DAILY PROMISE
            </span>
            <p className="pt-0.5 text-[13px] leading-[18px] tracking-[0.005em] text-[#1a1c1a]">
              &ldquo;Simplicity is the deliberate reduction of the non-essential.&rdquo;
            </p>
          </div>
        </div>
      </main>

      <footer className="hidden w-full flex-col items-center gap-1 py-8 sm:flex">
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-semibold uppercase tracking-[0.05em] text-[#424845]">
            Privacy Policy
          </span>
          <span className="size-1 rounded-full bg-[#c2c8c4]" />
          <span className="text-[11px] font-semibold uppercase tracking-[0.05em] text-[#424845]">
            Terms of Service
          </span>
          <span className="size-1 rounded-full bg-[#c2c8c4]" />
          <span className="text-[11px] font-semibold uppercase tracking-[0.05em] text-[#424845]">
            Security
          </span>
        </div>
        <p className="text-[12px] tracking-[0.02em] text-[#605e5a]">
          © {new Date().getFullYear()} LifeOS. Crafted for digital quietude and intentional focus.
        </p>
      </footer>
    </div>
  );
}
