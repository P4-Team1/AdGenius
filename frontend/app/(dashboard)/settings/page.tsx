"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useTheme, type ThemeMode } from "@/hooks/use-theme";
import { projectAPI } from "@/lib/api";


export default function SettingsPage() {
  const router = useRouter();
  const { mode, setThemeMode } = useTheme();

  const [isDeletingProjects, setIsDeletingProjects] = useState(false);

  const themeOptions: { value: ThemeMode; label: string; icon: string }[] = [
    { value: "light", label: "라이트", icon: "☀️" },
    { value: "dark", label: "다크", icon: "🌙" },
    { value: "system", label: "시스템 설정", icon: "💻" },
  ];

  const handleDeleteAllProjects = async () => {
    if (
      !window.confirm(
        "정말 모든 프로젝트를 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.",
      )
    )
      return;

    if (
      !window.confirm(
        "⚠️ 최종 확인: 생성된 모든 광고와 프로젝트가 영구 삭제됩니다.\n계속하시겠습니까?",
      )
    )
      return;

    try {
      setIsDeletingProjects(true);
      const projects = await projectAPI.getAll();
      for (const project of projects) {
        await projectAPI.delete(project.id);
      }
      alert("모든 프로젝트가 삭제되었습니다.");
      router.push("/");
    } catch (error) {
      console.error("Failed to delete all projects:", error);
      alert("프로젝트 삭제 중 오류가 발생했습니다.");
    } finally {
      setIsDeletingProjects(false);
    }
  };

  const handleDeleteAccount = () => {
    alert("계정 삭제 기능은 현재 준비 중입니다.\n문의: support@adgenius.com");
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* 헤더 */}
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => router.push("/")}
          className="mb-4"
        >
          ← 대시보드로 돌아가기
        </Button>
        <h1 className="text-4xl font-black mb-2">설정</h1>
        <p className="text-muted-foreground">
          계정 및 서비스 설정을 관리하세요
        </p>
      </div>

      <div className="space-y-6">
        {/* 기본 설정 */}
        <Card className="p-8">
          <h2 className="text-2xl font-bold mb-6">기본 설정</h2>

          <div className="space-y-6">
            {/* 테마 선택 */}
            <div className="grid gap-3">
              <Label>테마</Label>
              <div className="flex gap-3">
                {themeOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setThemeMode(opt.value)}
                    className={`flex-1 flex items-center justify-center gap-2 p-4 rounded-lg border-2 transition-all ${
                      mode === opt.value
                        ? "border-blue-600 bg-blue-600/10 text-blue-600 font-semibold"
                        : "border-border hover:border-blue-600/30 hover:bg-muted/50"
                    }`}
                  >
                    <span className="text-xl">{opt.icon}</span>
                    <span className="text-sm">{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* === AI 생성 설정 (베타 - 추후 활성화) === */}
        {/*
        <Card className="p-8">
          <h2 className="text-2xl font-bold mb-6">AI 생성 설정</h2>
          <div className="space-y-6">
            <div className="grid gap-2">
              <Label htmlFor="quality">기본 품질</Label>
              <select id="quality" className="h-12 px-4 rounded-lg border border-border bg-background">
                <option>표준 (빠름)</option>
                <option>고품질 (권장)</option>
                <option>최고품질 (느림)</option>
              </select>
              <p className="text-sm text-muted-foreground">품질이 높을수록 생성 시간이 길어집니다</p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="variations">변형 개수</Label>
              <select id="variations" className="h-12 px-4 rounded-lg border border-border bg-background">
                <option>1개</option>
                <option>3개 (권장)</option>
                <option>5개</option>
              </select>
              <p className="text-sm text-muted-foreground">한 번에 생성할 변형 버전의 수</p>
            </div>
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div>
                <div className="font-semibold">자동 저장</div>
                <div className="text-sm text-muted-foreground">생성된 이미지를 자동으로 프로젝트에 저장</div>
              </div>
              <input type="checkbox" className="w-5 h-5 rounded" defaultChecked />
            </div>
          </div>
        </Card>
        */}

        {/* === 사용량 (베타 - 추후 활성화) === */}
        {/*
        <Card className="p-8">
          <h2 className="text-2xl font-bold mb-6">사용량</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">이번 달 생성 횟수</span>
                <span className="text-sm font-bold">12 / 100</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full w-[12%] bg-gradient-to-r from-blue-600 to-purple-600"></div>
              </div>
            </div>
            <div className="p-4 bg-blue-600/10 border border-blue-600/20 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="text-2xl">✨</div>
                <div className="flex-1">
                  <div className="font-semibold mb-1">프로 플랜으로 업그레이드</div>
                  <div className="text-sm text-muted-foreground mb-3">무제한 생성, 고급 기능, 우선 처리</div>
                  <Button size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                    업그레이드 →
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Card>
        */}

        {/* 위험 구역 */}
        <Card className="p-8 border-red-200 dark:border-red-900">
          <h2 className="text-2xl font-bold mb-6 text-red-600">위험 구역</h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-border rounded-lg">
              <div>
                <div className="font-semibold">모든 프로젝트 삭제</div>
                <div className="text-sm text-muted-foreground">
                  생성한 모든 광고와 프로젝트가 영구 삭제됩니다
                </div>
              </div>
              <Button
                variant="outline"
                className="text-red-600 border-red-600 hover:bg-red-600 hover:text-white"
                onClick={handleDeleteAllProjects}
                disabled={isDeletingProjects}
              >
                {isDeletingProjects ? "삭제 중..." : "삭제"}
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 border border-border rounded-lg">
              <div>
                <div className="font-semibold">계정 삭제</div>
                <div className="text-sm text-muted-foreground">
                  계정과 모든 데이터가 영구 삭제됩니다
                </div>
              </div>
              <Button
                variant="outline"
                className="text-red-600 border-red-600 hover:bg-red-600 hover:text-white"
                onClick={handleDeleteAccount}
              >
                계정 삭제
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
