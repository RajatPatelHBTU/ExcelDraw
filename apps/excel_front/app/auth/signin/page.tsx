"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Mail, Lock, Loader2, ArrowLeft, CheckCircle2, AlertCircle, KeyRound } from "lucide-react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import axios from "axios";
import { HTTP_BACKEND } from "@/config";

function SignIn() {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  // Reset password states
  const [isResetMode, setIsResetMode] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetMessage, setResetMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await axios.post(`${HTTP_BACKEND}/signin`, {
        email,
        password,
      });
      if (response.status === 200 && response.data.token !== undefined) {
        Cookies.set("token", response.data.token, {
          expires: 1,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
        });
        setTimeout(() => {
          alert("Signed in successfully");
        }, 500);
        router.push("/dashboard");
      }
    } catch (error: any) {
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        "Sign in failed. Please check your credentials.";
      alert(msg);
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetMessage(null);

    if (!resetEmail) {
      setResetMessage({ type: "error", text: "Please enter your email address." });
      return;
    }
    if (newPassword.length < 8) {
      setResetMessage({ type: "error", text: "Password must be at least 8 characters long." });
      return;
    }
    if (newPassword !== confirmPassword) {
      setResetMessage({ type: "error", text: "Passwords do not match." });
      return;
    }

    setResetLoading(true);
    try {
      const response = await axios.post(`${HTTP_BACKEND}/reset-password`, {
        email: resetEmail,
        newPassword,
      });

      setResetMessage({
        type: "success",
        text: response.data.message || "Password updated successfully!",
      });

      // Pre-fill email and new password for easy sign-in
      setEmail(resetEmail);
      setPassword(newPassword);

      setTimeout(() => {
        setIsResetMode(false);
        setResetMessage(null);
        setNewPassword("");
        setConfirmPassword("");
      }, 1800);
    } catch (error: any) {
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to reset password. Please check your email and try again.";
      setResetMessage({ type: "error", text: msg });
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <Card className="p-6 backdrop-blur-md bg-card/80 border-border shadow-2xl">
      {isResetMode ? (
        <div className="space-y-6">
          <div className="space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">Reset Password</h1>
            <p className="text-sm text-muted-foreground">
              Enter your registered email and a new password
            </p>
          </div>

          {resetMessage && (
            <div
              className={`p-3 rounded-lg text-sm flex items-start gap-2 border ${
                resetMessage.type === "success"
                  ? "bg-green-500/10 border-green-500/30 text-green-400"
                  : "bg-red-500/10 border-red-500/30 text-red-400"
              }`}
            >
              {resetMessage.type === "success" ? (
                <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
              )}
              <span>{resetMessage.text}</span>
            </div>
          )}

          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reset-email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="reset-email"
                  placeholder="Enter your email"
                  type="email"
                  value={resetEmail}
                  required
                  className="pl-9"
                  onChange={(e) => setResetEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="new-password"
                  placeholder="At least 8 characters"
                  type="password"
                  value={newPassword}
                  required
                  minLength={8}
                  className="pl-9"
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirm-password"
                  placeholder="Re-enter your new password"
                  type="password"
                  value={confirmPassword}
                  required
                  minLength={8}
                  className="pl-9"
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 transition-all duration-200 shadow-lg hover:shadow-blue-500/25"
              disabled={resetLoading}
            >
              {resetLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {resetLoading ? "Updating Password..." : "Update Password"}
            </Button>
          </form>

          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                setIsResetMode(false);
                setResetMessage(null);
              }}
              className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4 mr-1.5" />
              Back to Sign In
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
            <p className="text-sm text-muted-foreground">
              Enter your credentials to sign in
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  placeholder="Enter your email"
                  type="email"
                  value={email}
                  required
                  className="pl-9"
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                    setEmail(event.target.value);
                  }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  placeholder="Enter your password"
                  type="password"
                  value={password}
                  required
                  className="pl-9"
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                    setPassword(event.target.value);
                  }}
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 transition-all duration-200 shadow-lg hover:shadow-blue-500/25"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Sign In
            </Button>
          </form>

          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                setResetEmail(email);
                setResetMessage(null);
                setIsResetMode(true);
              }}
              className="text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer underline-offset-4 hover:underline"
            >
              Forgot your password?
            </button>
          </div>
        </div>
      )}
    </Card>
  );
}

export default SignIn;