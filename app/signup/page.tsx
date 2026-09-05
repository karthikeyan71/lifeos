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

const signupSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  email: z.string().trim().min(1, "Email is required").email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

function getPasswordStrength(password: string) {
  if (!password) return { score: 0, label: "" };

  let score = 0;
  if (password.length >= 6) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password) || /[^A-Za-z0-9]/.test(password)) score++;

  const labels = ["Weak", "Fair", "Good", "Strong", "Resilient"];
  return { score, label: labels[score] };
}

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

export default function SignupPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ name?: string; email?: string; password?: string }>({});
  const [formError, setFormError] = useState("");
  const [formNotice, setFormNotice] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const strength = getPasswordStrength(password);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setFormError("");
    setFormNotice("");

    const validated = signupSchema.safeParse({ name, email, password });

    if (!validated.success) {
      const errors = validated.error.flatten().fieldErrors;
      setFieldErrors({
        name: errors.name?.[0],
        email: errors.email?.[0],
        password: errors.password?.[0],
      });
      return;
    }

    setFieldErrors({});
    setIsSubmitting(true);

    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name: validated.data.name } },
    });

    setIsSubmitting(false);

    if (error) {
      setFormError(error.message);
      return;
    }

    if (data.session) {
      router.push("/dashboard");
      router.refresh();
      return;
    }

    setFormNotice("Account created. Please confirm your email, then log in.");
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
          <div className="w-full rounded-xl bg-white p-6 shadow-[0_1px_1px_rgba(0,0,0,0.05)] sm:p-12">
            <div className="flex w-full flex-col items-center pb-8 text-center">
              <div className="mb-2 flex size-9 items-center justify-center rounded-lg bg-[#2c423b]/10">
                <Image src={brandMark} alt="" width={20} height={20} />
              </div>
              <h2
                className={`${newsreader.className} text-[26px] font-medium leading-[34px] tracking-[-0.02em] text-[#162c26] sm:text-[32px] sm:font-normal sm:leading-[40px]`}
              >
                Create your account
              </h2>
              <p className="pt-1 text-[14px] leading-[22px] text-[#605e5a]">
                Start building a better way to plan your life.
              </p>
            </div>

            <form onSubmit={handleSubmit} noValidate className="flex w-full flex-col gap-6">
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="name" className="text-[13px] font-semibold tracking-[0.005em] text-[#162c26]">
                    Name
                  </label>
                  <span className="text-[12px] tracking-[0.02em] text-[#727875]">Required</span>
                </div>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Your name"
                  autoComplete="name"
                  className="h-11 w-full rounded-lg border border-[#e3dfda] bg-white px-3.5 text-[14px] text-[#1a1c1a] outline-none focus:border-[#2c423b] focus:ring-1 focus:ring-[#2c423b]"
                />
                {fieldErrors.name && <p className="text-[12px] text-[#b3462c]">{fieldErrors.name}</p>}
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="email" className="text-[13px] font-semibold tracking-[0.005em] text-[#162c26]">
                    Email
                  </label>
                  <span className="text-[12px] tracking-[0.02em] text-[#727875]">Required</span>
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  className="h-11 w-full rounded-lg border border-[#e3dfda] bg-white px-3.5 text-[14px] text-[#1a1c1a] outline-none focus:border-[#2c423b] focus:ring-1 focus:ring-[#2c423b]"
                />
                {fieldErrors.email && (
                  <p className="text-[12px] text-[#b3462c]">{fieldErrors.email}</p>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="text-[13px] font-semibold tracking-[0.005em] text-[#162c26]">
                    Password
                  </label>
                  <span className="text-[12px] tracking-[0.02em] text-[#605e5a]">
                    {password.length} chars
                  </span>
                </div>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    minLength={6}
                    className="h-11 w-full rounded-lg border border-[#e3dfda] bg-white pl-3.5 pr-11 text-[14px] text-[#1a1c1a] outline-none focus:border-[#2c423b] focus:ring-1 focus:ring-[#2c423b]"
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
                <p
                  className={`flex items-center gap-1 text-[11px] tracking-[0.05em] ${
                    fieldErrors.password ? "text-[#b3462c]" : "text-[#605e5a]"
                  }`}
                >
                  <span
                    className={`size-1.5 rounded-full ${
                      fieldErrors.password ? "bg-[#b3462c]" : "bg-[#c2c8c4]"
                    }`}
                  />
                  {fieldErrors.password ?? "Password must be at least 6 characters."}
                </p>
              </div>

              {password && (
                <div className="-mt-2 flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.05em] text-[#605e5a]">
                      Entropy score
                    </span>
                    <span className="text-[11px] font-semibold tracking-[0.05em] text-[#162c26]">
                      {strength.label}
                    </span>
                  </div>
                  <div className="flex h-1 gap-1">
                    {[0, 1, 2, 3].map((segment) => (
                      <div
                        key={segment}
                        className={`h-full flex-1 rounded-full ${
                          segment < strength.score ? "bg-[#162c26]" : "bg-[#e3e2e0]"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}

              {formError && <p className="text-[13px] text-[#b3462c]">{formError}</p>}
              {formNotice && <p className="text-[13px] text-[#2c423b]">{formNotice}</p>}

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex h-11 w-full items-center justify-center gap-1 rounded-lg bg-[#2c423b] text-[14px] font-medium text-white transition-opacity disabled:opacity-60"
              >
                {isSubmitting ? "Creating account..." : "Create account"}
                {!isSubmitting && (
                  <span className="size-3">
                    <ArrowRightIcon />
                  </span>
                )}
              </button>

              <p className="text-center text-[12px] leading-[19.5px] tracking-[0.02em] text-[#605e5a]">
                By continuing, you agree to the LifeOS{" "}
                <span className="underline">Terms of Service</span> and{" "}
                <span className="underline">Privacy Policy</span>.
              </p>
            </form>

            <div className="my-6 h-px w-full bg-[#efeeeb]" />

            <p className="text-center text-[13px] tracking-[0.005em] text-[#605e5a]">
              Already have an account?{" "}
              <Link href="/login" className="font-semibold text-[#162c26]">
                Log in
              </Link>
            </p>
          </div>

          <div className="flex items-center gap-3 pt-6">
            <div className="flex items-center gap-1 text-[12px] tracking-[0.02em] text-[#605e5a]">
              <span className="size-3">
                <ShieldIcon />
              </span>
              Local Zero-Knowledge Enclave
            </div>
            <span className="text-[#c2c8c4]">•</span>
            <span className="text-[12px] tracking-[0.02em] text-[#605e5a]">v2.4 LTS</span>
          </div>
        </div>
      </main>
    </div>
  );
}
