"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Header } from "@/components/header";
import { useAuth } from "@/contexts/auth-context";
import { projectAPI, storeAPI, contentAPI } from "@/lib/api";
import type { Project } from "@/types";

function AuthenticatedDashboard() {
  const router = useRouter();
  const { logout } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [storeCount, setStoreCount] = useState(0);
  const [totalAds, setTotalAds] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const [projectsData, storesData] = await Promise.all([
        projectAPI.getAll(),
        storeAPI.getAll(),
      ]);
      const validProjects = Array.isArray(projectsData) ? projectsData : [];
      setProjects(validProjects);
      setStoreCount(Array.isArray(storesData) ? storesData.length : 0);

      // 전체 광고 생성 개수(Contents) 합산
      let total = 0;
      for (const p of validProjects) {
        try {
          const contents = await contentAPI.getAll(p.id);
          if (Array.isArray(contents)) {
            total += contents.length;
          }
        } catch {
          // 에러 무시
        }
      }
      setTotalAds(total);
    } catch {
      setProjects([]);
      setStoreCount(0);
      setTotalAds(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
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
      <div className="container mx-auto px-4 py-8 pt-28">
        <div className="mb-8">
          <h1 className="text-4xl font-black mb-2">대시보드</h1>
          <p className="text-muted-foreground">
            안녕하세요! AI 광고 생성을 시작해보세요
          </p>
        </div>

        {/* 통계 카드 - 실제 데이터 */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <div className="text-5xl mb-4">🏪</div>
            <h3 className="text-2xl font-bold mb-2">내 가게</h3>
            <p className="text-4xl font-black text-blue-600 mb-2">
              {loading ? "..." : storeCount}
            </p>
            <p className="text-sm text-muted-foreground">등록된 가게</p>
          </Card>

          <Card className="p-6">
            <div className="text-5xl mb-4">📁</div>
            <h3 className="text-2xl font-bold mb-2">프로젝트</h3>
            <p className="text-4xl font-black text-purple-600 mb-2">
              {loading ? "..." : projects.length}
            </p>
            <p className="text-sm text-muted-foreground">전체 프로젝트</p>
          </Card>

          <Card className="p-6">
            <div className="text-5xl mb-4">✅</div>
            <h3 className="text-2xl font-bold mb-2">생성된 광고</h3>
            <p className="text-4xl font-black text-green-500 mb-2">
              {loading ? "..." : totalAds}
            </p>
            <p className="text-sm text-muted-foreground">총 누적 생성</p>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* 최근 프로젝트 - 실제 API 데이터 */}
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-4">최근 프로젝트</h2>
            {loading ? (
              <p className="text-muted-foreground text-sm">불러오는 중...</p>
            ) : projects.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-5xl mb-4">📂</div>
                <p className="text-muted-foreground mb-4">
                  아직 프로젝트가 없습니다
                </p>
                <Button
                  size="sm"
                  onClick={() => router.push("/projects")}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                >
                  첫 프로젝트 만들기
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {projects.slice(0, 5).map((project) => (
                  <div
                    key={project.id}
                    className="flex items-center gap-4 p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => router.push(`/projects/${project.id}`)}
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
                      {project.title?.charAt(0) || "P"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">
                        {project.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {project.created_at
                          ? new Date(project.created_at).toLocaleDateString()
                          : ""}
                      </p>
                    </div>
                    <Button size="sm" variant="outline">
                      보기
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* 빠른 시작 */}
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-4">빠른 시작</h2>
            <div className="space-y-3">
              {storeCount === 0 ? (
                <>
                  <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg mb-4">
                    <p className="text-sm font-medium text-amber-600">
                      ⚠️ 광고를 만들려면 먼저 가게를 등록하세요!
                    </p>
                  </div>
                  <Button
                    className="w-full h-14 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white justify-start"
                    onClick={() => router.push("/stores")}
                  >
                    <span className="text-2xl mr-3">🏪</span>내 가게 등록하기
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    className="w-full h-14 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white justify-start"
                    onClick={() => router.push("/projects")}
                  >
                    <span className="text-2xl mr-3">🎨</span>새 광고 만들기
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full h-14 justify-start"
                    onClick={() => router.push("/stores")}
                  >
                    <span className="text-2xl mr-3">🏪</span>가게 관리
                  </Button>
                </>
              )}
              <Button
                variant="outline"
                className="w-full h-14 justify-start"
                onClick={() => router.push("/settings")}
              >
                <span className="text-2xl mr-3">⚙️</span>
                설정
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  // 로딩 중일 때
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">로딩 중...</p>
        </div>
      </div>
    );
  }

  // 로그인된 사용자 - 대시보드 표시
  if (isAuthenticated) {
    return <AuthenticatedDashboard />;
  }

  // 로그인 안 된 사용자 - 랜딩 페이지 표시

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      <Header showMenu={true} />

      {/* 히어로 섹션 - 차가운 색상 */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-purple-600/10 to-cyan-500/10"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_50%)]"></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-5xl mx-auto text-center space-y-12">
            <div className="space-y-6 animate-fade-in">
              <div className="inline-block px-4 py-2 bg-blue-600/10 border border-blue-600/20 rounded-full">
                <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                  🚀 AI 기반 광고 자동 생성
                </span>
              </div>

              <h1 className="text-6xl md:text-8xl font-black tracking-tight">
                소상공인을 위한
                <br />
                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-500 bg-clip-text text-transparent">
                  스마트 광고 솔루션
                </span>
              </h1>

              <p className="text-xl md:text-2xl text-muted-foreground font-light max-w-3xl mx-auto">
                디자인 지식 없이도 AI가 자동으로 인스타그램, 틱톡, 당근마켓,
                네이버 블로그에 최적화된 광고 이미지를 생성합니다
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Button
                size="lg"
                onClick={() => router.push("/register")}
                className="h-14 px-10 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
              >
                무료로 시작하기 →
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => router.push("/login")}
                className="h-14 px-10 text-lg font-semibold"
              >
                로그인
              </Button>
            </div>

            <div className="pt-12 flex flex-wrap justify-center gap-12 text-center">
              <div>
                <div className="text-4xl font-black text-blue-600">30초</div>
                <div className="text-sm text-muted-foreground mt-2">
                  생성 시간
                </div>
              </div>
              <div className="w-px bg-border"></div>
              <div>
                <div className="text-4xl font-black text-purple-600">AI</div>
                <div className="text-sm text-muted-foreground mt-2">
                  자동 생성
                </div>
              </div>
              <div className="w-px bg-border"></div>
              <div>
                <div className="text-4xl font-black text-cyan-500">4+</div>
                <div className="text-sm text-muted-foreground mt-2">
                  플랫폼 지원
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-muted-foreground rounded-full flex justify-center">
            <div className="w-1 h-3 bg-muted-foreground rounded-full mt-2"></div>
          </div>
        </div>
      </section>

      {/* 주요 기능 */}
      <section id="features" className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="text-sm font-semibold text-blue-600 uppercase tracking-wide mb-4">
              핵심 기능
            </div>
            <h2 className="text-4xl md:text-5xl font-black mb-6">
              AI가 만드는 완벽한 광고
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              복잡한 디자인 툴 없이도 전문가 수준의 광고 콘텐츠를 생성할 수
              있습니다
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <Card className="p-8 hover:shadow-xl transition-all border-2 hover:border-blue-600/50">
              <div className="text-5xl mb-4">🎨</div>
              <h3 className="text-2xl font-bold mb-3">제품 보존 편집</h3>
              <p className="text-muted-foreground">
                제품 이미지를 업로드하면 AI가 자동으로 배경을 제거하고 매력적인
                새 배경으로 교체합니다
              </p>
            </Card>

            <Card className="p-8 hover:shadow-xl transition-all border-2 hover:border-purple-600/50">
              <div className="text-5xl mb-4">✨</div>
              <h3 className="text-2xl font-bold mb-3">한글 텍스트 오버레이</h3>
              <p className="text-muted-foreground">
                상품명, 가격, 할인율 등을 자연스럽게 이미지에 삽입합니다
              </p>
            </Card>

            <Card className="p-8 hover:shadow-xl transition-all border-2 hover:border-cyan-500/50">
              <div className="text-5xl mb-4">📱</div>
              <h3 className="text-2xl font-bold mb-3">플랫폼별 최적화</h3>
              <p className="text-muted-foreground">
                각 플랫폼의 가이드라인에 맞춘 이미지를 자동으로 생성합니다
              </p>
            </Card>

            <Card className="p-8 hover:shadow-xl transition-all border-2 hover:border-blue-600/50">
              <div className="text-5xl mb-4">🎯</div>
              <h3 className="text-2xl font-bold mb-3">스타일 템플릿</h3>
              <p className="text-muted-foreground">
                업종별, 시즌별 디자인 템플릿으로 일관된 광고를 만들 수 있습니다
              </p>
            </Card>

            <Card className="p-8 hover:shadow-xl transition-all border-2 hover:border-purple-600/50">
              <div className="text-5xl mb-4">⚡</div>
              <h3 className="text-2xl font-bold mb-3">빠른 생성 속도</h3>
              <p className="text-muted-foreground">
                최적화된 AI 모델로 30초 이내에 고품질 이미지를 생성합니다
              </p>
            </Card>

            <Card className="p-8 hover:shadow-xl transition-all border-2 hover:border-cyan-500/50">
              <div className="text-5xl mb-4">💬</div>
              <h3 className="text-2xl font-bold mb-3">AI 광고 문구</h3>
              <p className="text-muted-foreground">
                제품 분석을 통해 매력적인 광고 카피를 자동으로 생성합니다
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* 플랫폼 섹션 */}
      <section id="platforms" className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="text-sm font-semibold text-blue-600 uppercase tracking-wide mb-4">
              지원 플랫폼
            </div>
            <h2 className="text-4xl md:text-5xl font-black mb-6">
              어디든 최적화된 광고
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              주요 온라인 판매 채널에 맞춤형 광고를 한 번에 생성하세요
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            <Card className="p-8 text-center hover:shadow-xl transition-all">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/인스타그램 로고.png"
                alt="인스타그램"
                className="w-16 h-16 mx-auto mb-4 rounded-xl object-cover"
              />
              <h3 className="text-xl font-bold mb-2">인스타그램</h3>
              <p className="text-sm text-muted-foreground">
                1:1 비율의 감각적인 이미지
              </p>
            </Card>

            <Card className="p-8 text-center hover:shadow-xl transition-all">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/틱톡 로고.jpg"
                alt="틱톡"
                className="w-16 h-16 mx-auto mb-4 rounded-xl object-cover"
              />
              <h3 className="text-xl font-bold mb-2">틱톡</h3>
              <p className="text-sm text-muted-foreground">
                9:16 숏폼 영상용 썸네일
              </p>
            </Card>

            <Card className="p-8 text-center hover:shadow-xl transition-all">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/당근마켓 로고.png"
                alt="당근마켓"
                className="w-16 h-16 mx-auto mb-4 rounded-xl object-cover"
              />
              <h3 className="text-xl font-bold mb-2">당근마켓</h3>
              <p className="text-sm text-muted-foreground">
                4:3 비율의 신뢰감 있는 사진
              </p>
            </Card>

            <Card className="p-8 text-center hover:shadow-xl transition-all">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/네이버 블로그 로고.avif"
                alt="네이버 블로그"
                className="w-16 h-16 mx-auto mb-4 rounded-xl object-cover"
              />
              <h3 className="text-xl font-bold mb-2">네이버 블로그</h3>
              <p className="text-sm text-muted-foreground">
                16:9 블로그 포스트 대표 이미지
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* 작동 방식 */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-6">
              어떻게 작동하나요?
            </h2>
            <p className="text-lg text-muted-foreground">
              복잡한 과정은 없습니다
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="relative">
              <div className="absolute left-8 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-600 via-purple-600 to-cyan-500 hidden md:block"></div>

              <div className="relative pl-0 md:pl-24 pb-16">
                <div className="absolute left-0 top-0 w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center text-2xl font-bold hidden md:flex">
                  1
                </div>
                <Card className="p-8 border-2">
                  <h3 className="text-2xl font-bold mb-3">프로젝트 생성</h3>
                  <p className="text-muted-foreground">
                    가게 이름, 업종, 타겟 고객 등 기본 정보만 입력하세요
                  </p>
                </Card>
              </div>

              <div className="relative pl-0 md:pl-24 pb-16">
                <div className="absolute left-0 top-0 w-16 h-16 bg-purple-600 text-white rounded-2xl flex items-center justify-center text-2xl font-bold hidden md:flex">
                  2
                </div>
                <Card className="p-8 border-2">
                  <h3 className="text-2xl font-bold mb-3">AI 생성 요청</h3>
                  <p className="text-muted-foreground">
                    원하는 스타일과 플랫폼을 선택하면 AI가 즉시 작업을
                    시작합니다
                  </p>
                </Card>
              </div>

              <div className="relative pl-0 md:pl-24">
                <div className="absolute left-0 top-0 w-16 h-16 bg-cyan-500 text-white rounded-2xl flex items-center justify-center text-2xl font-bold hidden md:flex">
                  3
                </div>
                <Card className="p-8 border-2">
                  <h3 className="text-2xl font-bold mb-3">완성!</h3>
                  <p className="text-muted-foreground">
                    고품질 광고 이미지와 문구를 다운받아 바로 사용하세요
                  </p>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 최종 CTA */}
      <section id="pricing" className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-purple-600/10 to-cyan-500/10"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_50%)]"></div>

        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="max-w-4xl mx-auto space-y-10">
            <h2 className="text-4xl md:text-6xl font-black">
              지금 바로 시작하세요
            </h2>
            <p className="text-xl md:text-2xl text-muted-foreground">
              무료 체험으로 AI 광고 생성의 놀라운 효과를 직접 경험해보세요
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Button
                size="lg"
                onClick={() => router.push("/register")}
                className="h-14 px-10 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
              >
                무료로 시작하기
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => router.push("/login")}
                className="h-14 px-10 text-lg font-semibold"
              >
                로그인
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* 푸터 */}
      <footer className="bg-background border-t border-border py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              AdGenius
            </div>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">
                이용약관
              </a>
              <a href="#" className="hover:text-foreground transition-colors">
                개인정보처리방침
              </a>
              <a href="#" className="hover:text-foreground transition-colors">
                고객지원
              </a>
            </div>
          </div>
        </div>
      </footer>

      <style jsx global>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }
      `}</style>
    </div>
  );
}
