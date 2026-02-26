"use client";

import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { logout } = useAuth();

  return (
    <>
      <Header
        rightButtons={
          <>
            <Button variant="ghost" onClick={() => router.push("/stores")}>
              가게 관리
            </Button>
            <Button variant="ghost" onClick={() => router.push("/projects")}>
              내 프로젝트
            </Button>
            <Button variant="ghost" onClick={() => router.push("/settings")}>
              설정
            </Button>
            <Button
              onClick={logout}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
            >
              로그아웃
            </Button>
          </>
        }
      />
      <main className="min-h-screen pt-20 bg-background">{children}</main>
    </>
  );
}
