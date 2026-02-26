"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { contentAPI } from "@/lib/api";
import type { Content } from "@/types";
import { useAuth } from "@/contexts/auth-context";
import { AuthImage } from "@/components/auth-image";

export default function AdDetailPage() {
  const router = useRouter();
  const params = useParams();

  const platforms = [
    {
      id: "instagram",
      name: "인스타그램",
      logo: "/인스타그램 로고.jpg",
      ratio: "1:1",
      description: "감각적인 피드 이미지",
      color: "from-pink-500 to-purple-500",
      postUrl: "https://www.instagram.com/",
    },
    {
      id: "tiktok",
      name: "틱톡",
      logo: "/틱톡 로고.jpg",
      ratio: "9:16",
      description: "숏폼 영상용 썸네일",
      color: "from-gray-900 to-gray-700",
      postUrl: "https://www.tiktok.com/upload",
    },
    {
      id: "danggeun",
      name: "당근마켓",
      logo: "/당근마켓 로고.png",
      ratio: "4:3",
      description: "신뢰감 있는 중고거래 사진",
      color: "from-orange-500 to-amber-500",
      postUrl: "https://business.daangn.com/profile/login",
    },
    {
      id: "naver_blog",
      name: "네이버 블로그",
      logo: "/네이버 블로그 로고.avif",
      ratio: "16:9",
      description: "블로그 포스트 대표 이미지",
      color: "from-green-500 to-emerald-500",
      postUrl: "https://blog.naver.com/",
    },
  ];

  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [content, setContent] = useState<Content | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 이미지 다운로드 헬퍼
  const downloadImage = async () => {
    if (!content?.result_image_path) return;
    try {
      const API_URL =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
      const token = localStorage.getItem("access_token");
      const res = await fetch(`${API_URL}/contents/${content.id}/image`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error("download failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ad_${content.id}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      console.error("이미지 다운로드 실패");
    }
  };

  // 플랫폼 배포 핸들러
  const handlePublish = async (platform: (typeof platforms)[0]) => {
    // 1. 광고 문구 클립보드 복사
    const adText = content?.ad_copy || content?.user_prompt || "";
    if (adText) {
      try {
        await navigator.clipboard.writeText(adText);
      } catch {
        const ta = document.createElement("textarea");
        ta.value = adText;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
    }

    // 2. 이미지 다운로드
    await downloadImage();

    // 3. 플랫폼 글쓰기 페이지 열기
    window.open(platform.postUrl, "_blank");
  };

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (params.adId && isAuthenticated) {
      loadContent(params.adId as string);
    }
  }, [params.adId, isAuthenticated]);

  const loadContent = async (contentId: string) => {
    try {
      setIsLoading(true);
      const data = await contentAPI.getById(contentId);
      setContent(data);
    } catch (error) {
      console.error("Failed to load content:", error);
      alert("광고 정보를 불러오는 데 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-xl font-bold animate-pulse text-muted-foreground">
          로딩 중...
        </div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-xl font-bold text-muted-foreground">
          광고 데이터를 찾을 수 없습니다.
        </div>
      </div>
    );
  }

  const handleDelete = async () => {
    if (!window.confirm("정말 이 광고를 삭제하시겠습니까?")) return;
    try {
      await contentAPI.delete(content.id);
      router.push(`/projects/${params.id}`);
    } catch (error) {
      console.error("Failed to delete ad:", error);
      alert("삭제에 실패했습니다.");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 헤더 */}
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => router.push(`/projects/${params.id}`)}
          className="mb-4"
        >
          ← 프로젝트로 돌아가기
        </Button>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-4xl">📸</span>
              <h1 className="text-4xl font-black">
                {content.user_prompt || "생성된 내용 없음"}
              </h1>
            </div>
            <div className="flex items-center gap-4 text-muted-foreground">
              <span className="uppercase text-blue-600 font-bold">
                {content.type}
              </span>
              <span>•</span>
              <span>생성: {new Date(content.created_at).toLocaleString()}</span>
              <span>•</span>
              <span
                className={`font-semibold ${content.is_success ? "text-green-600" : "text-red-600"}`}
              >
                {content.is_success ? "완료" : "생성 실패"}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => loadContent(content.id.toString())}
            >
              새로고침
            </Button>
            <Button
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
              onClick={() => {
                const API_URL =
                  process.env.NEXT_PUBLIC_API_URL ||
                  "http://localhost:8000/api/v1";
                window.open(
                  `${API_URL}/contents/${content.id}/image`,
                  "_blank",
                );
              }}
              disabled={!content.result_image_path}
            >
              이미지 원본 열기
            </Button>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* 메인 이미지 */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-8">
            <h2 className="text-xl font-bold mb-4">생성된 이미지</h2>
            <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center overflow-hidden border">
              {content.result_image_path ? (
                <AuthImage
                  src={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1"}/contents/${content.id}/image`}
                  alt="생성된 광고 이미지"
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="text-center text-muted-foreground">
                  <div className="text-8xl mb-4">✨</div>
                  <p className="text-2xl font-bold">이미지가 없습니다</p>
                  <p className="text-sm opacity-80 mt-2">
                    {content.error_message || "생성 중이거나 실패했습니다."}
                  </p>
                </div>
              )}
            </div>
          </Card>

          {/* 플랫폼 배포 패널 */}
          <Card className="p-8">
            <h2 className="text-xl font-bold mb-2">
              이 광고를 어디에 올릴까요?
            </h2>
            <p className="text-muted-foreground mb-6">
              플랫폼을 선택하면 광고 문구가 복사되고, 이미지가 다운로드된 후
              해당 플랫폼 페이지가 열립니다.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {platforms.map((platform) => (
                <div
                  key={platform.id}
                  className="bg-card border-2 hover:border-blue-500 rounded-xl p-4 cursor-pointer hover:shadow-lg transition-all text-center group"
                  onClick={() => handlePublish(platform)}
                >
                  <div
                    className={`w-16 h-16 mx-auto rounded-full bg-gradient-to-br ${platform.color} p-0.5 mb-3 group-hover:scale-110 transition-transform`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={platform.logo}
                      alt={platform.name}
                      className="w-full h-full rounded-full object-cover bg-white"
                    />
                  </div>
                  <h3 className="font-bold mb-1">{platform.name}</h3>
                  <p className="text-xs text-muted-foreground whitespace-pre-wrap">
                    {platform.ratio}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* 사이드바 - 정보 */}
        <div className="space-y-6">
          {/* 광고 설정 */}
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">광고 설정 및 결과</h2>
            <div className="space-y-4">
              <div>
                <div className="text-sm text-muted-foreground mb-1">타입</div>
                <div className="font-semibold uppercase">{content.type}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">
                  소요 시간
                </div>
                <div className="font-semibold">
                  {content.generation_time} 초
                </div>
              </div>
              {content.ad_copy && (
                <div>
                  <div className="text-sm text-muted-foreground mb-1">
                    AI 광고 문구 (카피)
                  </div>
                  <div className="font-semibold text-sm bg-blue-50 p-3 rounded-md border border-blue-100 dark:bg-blue-900/20 dark:border-blue-800">
                    {content.ad_copy}
                  </div>
                </div>
              )}
              {content.ai_config &&
                (() => {
                  const labels: Record<string, string> = {
                    seed: "시드 (Seed)",
                    steps: "스텝 수",
                    width: "너비 (px)",
                    height: "높이 (px)",
                  };
                  const entries = Object.entries(content.ai_config).filter(
                    ([key]) => key in labels,
                  );
                  if (entries.length === 0) return null;
                  return (
                    <div>
                      <div className="text-sm text-muted-foreground mb-2">
                        생성 설정
                      </div>
                      <div className="space-y-1">
                        {entries.map(([key, value]) => (
                          <div
                            key={key}
                            className="flex justify-between text-sm"
                          >
                            <span className="text-muted-foreground">
                              {labels[key]}
                            </span>
                            <span className="font-medium">
                              {value != null ? String(value) : "자동"}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}
            </div>
          </Card>

          {/* 프롬프트 */}
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">기본 프롬프트</h2>
            <p className="text-muted-foreground text-sm leading-relaxed mb-4">
              {content.image_prompt}
            </p>
            {content.optimized_prompt && (
              <>
                <h2 className="text-sm font-bold mb-2 text-blue-600">
                  AI 최적화 영문 프롬프트
                </h2>
                <p className="text-muted-foreground text-sm leading-relaxed bg-muted/50 p-3 rounded-md">
                  {content.optimized_prompt}
                </p>
              </>
            )}
          </Card>

          {/* 액션 버튼들 */}
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">작업</h2>
            <div className="space-y-2">
              {content.ad_copy && (
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => {
                    navigator.clipboard.writeText(content.ad_copy || "");
                    alert("광고 문구가 클립보드에 복사되었습니다!");
                  }}
                >
                  📋 광고 문구 복사하기
                </Button>
              )}
              {content.result_image_path && (
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={downloadImage}
                >
                  📥 이미지 다운로드
                </Button>
              )}
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => router.push(`/projects/${params.id}/ads/new`)}
              >
                🔄 새로운 광고 생성하기
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start text-red-600 hover:text-red-600"
                onClick={handleDelete}
              >
                🗑️ 삭제하기
              </Button>
            </div>
          </Card>

          {/* 히스토리 */}
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">일시</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">생성됨</span>
                <span>{new Date(content.created_at).toLocaleString()}</span>
              </div>
              {content.updated_at && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">마지막 수정</span>
                  <span>{new Date(content.updated_at).toLocaleString()}</span>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
