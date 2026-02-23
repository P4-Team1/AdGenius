"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("이메일과 비밀번호를 입력해주세요");
      return;
    }

    setIsLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      const message = err instanceof Error ? err.message : "";
      if (
        message.includes("API Error") ||
        message.includes("인증") ||
        message.includes("Unauthorized")
      ) {
        setError("이메일 또는 비밀번호가 일치하지 않습니다.");
      } else if (message) {
        setError(message);
      } else {
        setError("로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-5rem)]">
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto p-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-black mb-2">로그인</h1>
            <p className="text-muted-foreground">
              AdGenius에 오신 것을 환영합니다
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 rounded-lg bg-red-600/10 border border-red-600/20 text-red-600 text-sm">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">이메일</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                className="h-12"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">비밀번호</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                className="h-12"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded" />
                <span className="text-muted-foreground">로그인 상태 유지</span>
              </label>
              <a href="#" className="text-blue-600 hover:underline">
                비밀번호 찾기
              </a>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-lg font-semibold"
            >
              {isLoading ? "로그인 중..." : "로그인"}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            계정이 없으신가요?{" "}
            <button
              onClick={() => router.push("/register")}
              className="text-blue-600 hover:underline font-semibold"
            >
              회원가입
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}
