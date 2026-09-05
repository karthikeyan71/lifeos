This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Reminder notifications

Task / goal / habit reminders are delivered as Web Push notifications. Copy
`.env.example` to `.env.local` and fill in:

1. **VAPID keys** — run `npx web-push generate-vapid-keys` once. Put the public
   key in **both** `VAPID_PUBLIC_KEY` and `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, the
   private key in `VAPID_PRIVATE_KEY`, and a contact URL in `VAPID_SUBJECT`
   (e.g. `mailto:you@example.com`).
2. **`CRON_SECRET`** — any random string. The dispatch endpoint
   (`GET /api/reminders/dispatch`) requires `Authorization: Bearer <CRON_SECRET>`.

Nothing is scheduled automatically. Point a scheduler of your choice at the
dispatch endpoint (e.g. every minute) with the bearer header — an external cron
service, a GitHub Actions schedule, or add a `vercel.json` `crons` entry (Vercel
then sends `CRON_SECRET` for you; per-minute needs a Pro plan). Each user opts
their devices in from **Settings → Reminder notifications**.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
