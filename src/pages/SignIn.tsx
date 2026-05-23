import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  signIn,
  signUp,
  confirmSignUp,
  signInWithRedirect,
} from "aws-amplify/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Step = "signin" | "signup" | "confirm";

export default function SignIn() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("signin");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const result = await signIn({ username: email, password });
      if (result.isSignedIn) {
        navigate("/demo", { replace: true });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await signUp({
        username: email,
        password,
        options: {
          userAttributes: {
            email,
            name: name.trim() || undefined,
          },
        },
      });
      setStep("confirm");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign up failed");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await confirmSignUp({ username: email, confirmationCode: code });
      const result = await signIn({ username: email, password });
      if (result.isSignedIn) {
        navigate("/demo", { replace: true });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Confirmation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-sm mx-auto space-y-6">
      {step === "signin" && (
        <>
          <div>
            <h1 className="text-2xl font-bold">Sign in</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Welcome back. Sign in to your account.
            </p>
          </div>
          <form onSubmit={(e) => void handleSignIn(e)} className="space-y-3">
            <Input
              type="email"
              placeholder="Email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              type="password"
              placeholder="Password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in…" : "Sign in"}
            </Button>
          </form>
          <p className="text-sm text-center text-muted-foreground">
            No account?{" "}
            <button
              type="button"
              className="underline"
              onClick={() => {
                setError(null);
                setStep("signup");
              }}
            >
              Create one
            </button>
          </p>
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground">or</span>
            <div className="h-px flex-1 bg-border" />
          </div>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => void signInWithRedirect({ provider: "Google" })}
          >
            Sign in with Google
          </Button>
        </>
      )}

      {step === "signup" && (
        <>
          <div>
            <h1 className="text-2xl font-bold">Create account</h1>
            <p className="text-sm text-muted-foreground mt-1">
              You'll receive a verification code by email.
            </p>
          </div>
          <form onSubmit={(e) => void handleSignUp(e)} className="space-y-3">
            <Input
              type="email"
              placeholder="Email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              type="text"
              placeholder="Name (optional)"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Input
              type="password"
              placeholder="Password (min 8 chars, upper + lower + number)"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating account…" : "Create account"}
            </Button>
          </form>
          <p className="text-sm text-center text-muted-foreground">
            Already have an account?{" "}
            <button
              type="button"
              className="underline"
              onClick={() => {
                setError(null);
                setStep("signin");
              }}
            >
              Sign in
            </button>
          </p>
        </>
      )}

      {step === "confirm" && (
        <>
          <div>
            <h1 className="text-2xl font-bold">Verify email</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Enter the 6-digit code sent to <strong>{email}</strong>.
            </p>
          </div>
          <form onSubmit={(e) => void handleConfirm(e)} className="space-y-3">
            <Input
              type="text"
              placeholder="Verification code"
              inputMode="numeric"
              autoComplete="one-time-code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Verifying…" : "Verify & sign in"}
            </Button>
          </form>
        </>
      )}
    </div>
  );
}
