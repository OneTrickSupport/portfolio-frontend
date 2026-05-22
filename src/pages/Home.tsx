import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-4xl font-bold">Hi, I'm Karl Nilros.</h1>
      <p className="text-lg text-muted-foreground">
        Developer working across the stack. This site is itself a portfolio piece —
        React + TypeScript + shadcn/ui on the frontend, Node + TypeScript on AWS
        Lambda (container image) for the backend, DynamoDB for storage, Cognito + Google
        for sign-in, Terraform for infrastructure, and GitHub Actions for CI/CD.
      </p>
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold">Try it</h2>
        <p>
          Sign in with Google in the top right, then visit the{" "}
          <Link to="/demo" className="underline">
            Demo
          </Link>{" "}
          page to write items to DynamoDB.
        </p>
      </div>
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold">Code</h2>
        <ul className="list-disc list-inside text-sm space-y-1">
          <li>
            <a
              className="underline"
              href="https://github.com/OneTrickSupport/portfolio-frontend"
            >
              github.com/OneTrickSupport/portfolio-frontend
            </a>
          </li>
          <li>
            <a
              className="underline"
              href="https://github.com/OneTrickSupport/portfolio-backend"
            >
              github.com/OneTrickSupport/portfolio-backend
            </a>{" "}
            (includes Terraform under <code>infra/</code>)
          </li>
        </ul>
      </div>
    </div>
  );
}
