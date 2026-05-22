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

## Sister repo

Backend (Node + Lambda container + DynamoDB): [portfolio-backend](https://github.com/OneTrickSupport/portfolio-backend)
