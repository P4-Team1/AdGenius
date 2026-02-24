"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTheme } from "@/hooks/use-theme";
import { ReactNode } from "react";

interface HeaderProps {
  showMenu?: boolean;
  rightButtons?: ReactNode;
}

export function Header({ showMenu = false, rightButtons }: HeaderProps) {
  const router = useRouter();
  const { mode, setThemeMode, mounted } = useTheme();

  const cycleTheme = () => {
    const next: Record<string, "light" | "dark" | "system"> = {
      light: "dark",
      dark: "system",
      system: "light",
    };
    setThemeMode(next[mode] || "light");
  };

  const themeIcon = mode === "light" ? "☀️" : mode === "dark" ? "🌙" : "💻";

  const handleLogoClick = () => {
    router.push("/");
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div
          onClick={handleLogoClick}
          className="text-2xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent cursor-pointer hover:opacity-80 transition-opacity"
        >
          AdGenius
        </div>

        <div className="flex items-center gap-6">
          {/* 홈 페이지 메뉴 (showMenu가 true일 때만) */}
          {showMenu && (
            <div className="hidden md:flex gap-6">
              <Link
                href="/#features"
                className="text-muted-foreground hover:text-foreground transition-colors font-medium cursor-pointer"
              >
                기능
              </Link>
              <Link
                href="/#platforms"
                className="text-muted-foreground hover:text-foreground transition-colors font-medium cursor-pointer"
              >
                플랫폼
              </Link>
              <Link
                href="/#pricing"
                className="text-muted-foreground hover:text-foreground transition-colors font-medium cursor-pointer"
              >
                가격
              </Link>
            </div>
          )}

          {/* 커스텀 버튼 영역 */}
          {rightButtons && (
            <div className="flex items-center gap-4">{rightButtons}</div>
          )}

          {/* 테마 토글 버튼 */}
          {mounted && (
            <button
              onClick={cycleTheme}
              className="w-10 h-10 rounded-full bg-muted hover:bg-muted/80 flex items-center justify-center transition-all hover:rotate-180 duration-500"
              aria-label="테마 전환"
              title={`현재: ${mode === "light" ? "라이트" : mode === "dark" ? "다크" : "시스템"}`}
            >
              {themeIcon}
            </button>
          )}
        </div>
      </nav>
    </header>
  );
}
