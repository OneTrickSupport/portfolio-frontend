# portfolio-frontend

React + TypeScript + shadcn/ui frontend for [@OneTrickSupport](https://github.com/OneTrickSupport)'s developer portfolio.

## Stack

- Vite + React 18 + TypeScript
- Tailwind CSS + shadcn/ui
- React Router + TanStack Query
- AWS Amplify (Cognito Hosted UI, Google federation)
- Deployed to S3 + CloudFront via GitHub Actions (OIDC, no long-lived AWS keys)

## Local development

```bash
cp .env.example .env.local   # fill in Cognito + API URL
npm install
npm run dev                  # http://localhost:5173
```

## Apartment planner (`/planner`)

A furniture planner for a real apartment, in 2D and 3D. Visitors can change anything without signing in; saving a design, liking and commenting need an account. All saved designs are public.

- `moblera/` is the planner itself: plain JavaScript + three.js, built as a second page (`dist/moblera/index.html`) so it stays out of the main bundle. Its interface is in Swedish.
- `src/pages/planner/` is the React side: the gallery (`/planner`) and the editor (`/planner/new`, `/planner/d/:id`), which shows the planner in an iframe and talks to the API in `src/lib/planner.ts`.
- Unsaved changes are kept as a draft in the browser (`localStorage`, one per design), so they survive a reload and the trip to the sign-in page.
- Plans from other people are sanitised when loaded (`moblera/src/sanitize.js`) as well as validated by the backend.

Open `http://localhost:5173/moblera/index.html` to run the planner on its own.

## Sister repo

Backend (Node + Lambda container + DynamoDB): [portfolio-backend](https://github.com/OneTrickSupport/portfolio-backend)
