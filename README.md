# Cross Stitch Tracker

A web app for tracking cross stitch progress on a pattern. Upload a pattern exported from [FlossCross](https://flosscross.com) as JSON and track your work stitch by stitch, color by color, row by row.

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

### What works

- Parses a FlossCross `.json` export and parses the pattern
- **Grid view** — canvas-rendered pattern grid, click any stitch to mark it done/undone, grid lines every 10 cells
- **Colors tab** — all thread colors listed in DMC number order with per-color progress bars
- **Row guide** — select a thread color, set a hoop column range, and work through the pattern row by row:
  - Displays column numbers for each stitch in the current hoop range for that color
  - Mark progress by: clicking individual column chips or clicking "Mark all done" button for the current row

## Getting Started

First, run the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Tech Stack

- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Supabase](https://supabase.com/) (planned)

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
