"use client";

// Login page should always be fresh (no cache)
export const dynamic = "force-dynamic";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn } from "@/lib/auth-client";
import { Loader2, Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { siteConfig } from "@/site.config";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email.trim() || !formData.password.trim()) {
      toast.error("Please enter your email and password");
      return;
    }

    try {
      setLoading(true);
      const { error } = await signIn.email({
        email: formData.email,
        password: formData.password,
        callbackURL: "/",
      });

      if (error) {
        if (error.message?.includes("verify")) {
          toast.error("Please verify your email before signing in");
        } else {
          toast.error(error.message || "Invalid email or password");
        }
        return;
      }

      toast.success("Welcome back!");
      router.push("/");
    } catch (error) {
      toast.error("An unexpected error occurred");
      console.error("Sign-in error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setGoogleLoading(true);
      await signIn.social({
        provider: "google",
        callbackURL: "/",
      });
    } catch (error) {
      toast.error("Error during sign-in. Please try again.");
      console.error("Error during sign-in:", error);
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <main className="py-20 flex items-center justify-center px-4 min-h-[60vh]">
      <div className="w-full max-w-md bg-white/5 backdrop-blur-xs rounded-lg shadow-sm border border-gray-200">
        <div className="p-8 md:p-10">
          {/* Logo */}
          <div className="flex justify-center items-center mx-auto mb-6 relative rounded-lg w-32 h-10">
            <Image
              src={siteConfig.logo.path}
              alt={siteConfig.logo.alt}
              fill
              sizes="128px"
              className="object-contain"
            />
          </div>

          {/* Headings */}
          <h1 className="text-3xl font-bold text-center text-foreground mb-2 tracking-tight">
            Welcome Back
          </h1>
          <p className="text-center font-semibold text-muted-foreground mb-8 text-sm">
            Sign in to {siteConfig.title}
          </p>

          {/* Email/Password Sign-in Form */}
          <form onSubmit={handleEmailSignIn} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link href="/forgot-password" className="text-xs text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  disabled={loading}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>

          {/* Google Sign-in Button */}
          <Button
            variant="outline"
            className="w-full py-5 text-[15px] font-semibold flex items-center justify-center gap-2 hover:bg-neutral-50 transition-colors"
            onClick={handleGoogleSignIn}
            disabled={googleLoading || loading}
            type="button"
          >
            {!googleLoading ? (
              <Image
                src="/images/google.svg"
                alt="Google"
                width={20}
                height={20}
                className="mr-1"
              />
            ) : (
              <Loader2 className="animate-spin mr-1" />
            )}
            Continue with Google
          </Button>

          {/* Sign Up Link */}
          <p className="text-center text-sm text-muted-foreground mt-6">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="font-semibold text-primary hover:underline">
              Create account
            </Link>
          </p>

          {/* Footer */}
          <p className="text-center text-xs text-muted-foreground mt-6">
            By continuing, you agree to our{" "}
            <a href="/terms-and-conditions" className="underline hover:text-primary">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="/privacy-policy" className="underline hover:text-primary">
              Privacy Policy
            </a>
            .
          </p>
        </div>
      </div>
    </main>
  );
}
