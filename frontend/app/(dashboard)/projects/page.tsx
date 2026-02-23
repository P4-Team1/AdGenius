"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { CreateProjectModal } from "@/components/create-project-modal";
import { projectAPI } from "@/lib/api";
import type { Project } from "@/types";
import { useAuth } from "@/contexts/auth-context";

export default function ProjectsPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [showModal, setShowModal] = useState(false);

  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"recent" | "name">("recent");

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.push("/login");
      } else {
        loadProjects();
      }
    }
  }, [authLoading, isAuthenticated, router]);

  const loadProjects = async () => {
    try {
      setIsLoading(true);
      const data = await projectAPI.getAll();
      setProjects(data);
    } catch (error) {
      console.error("Failed to load projects:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // 검색 + 정렬 적용
  const filteredProjects = projects
    .filter((p) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        p.title?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      if (sortBy === "name")
        return (a.title || "").localeCompare(b.title || "");
      return (
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    });

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 헤더 */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-black mb-2">내 프로젝트</h1>
          <p className="text-muted-foreground">
            총 {filteredProjects.length}개의 프로젝트
          </p>
        </div>
        <Button
          onClick={() => setShowModal(true)}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white h-12 px-6"
        >
          <span className="text-xl mr-2">+</span>새 프로젝트 만들기
        </Button>
      </div>

      {isLoading && (
        <div className="flex justify-center my-12">
          <p className="text-muted-foreground text-lg">
            프로젝트를 불러오는 중입니다...
          </p>
        </div>
      )}

      {/* 검색 & 필터 */}
      <Card className="p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <Input
            placeholder="프로젝트 검색..."
            className="md:max-w-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className="flex gap-2">
            <Button
              variant={sortBy === "recent" ? "default" : "outline"}
              size="sm"
              onClick={() => setSortBy("recent")}
            >
              최근 수정
            </Button>
            <Button
              variant={sortBy === "name" ? "default" : "outline"}
              size="sm"
              onClick={() => setSortBy("name")}
            >
              이름순
            </Button>
          </div>
        </div>
      </Card>

      {/* 프로젝트 그리드 */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project) => (
          <Card
            key={project.id}
            className="overflow-hidden hover:shadow-xl transition-all cursor-pointer border-2 hover:border-blue-600/50 group"
            onClick={() => router.push(`/projects/${project.id}`)}
          >
            {/* 썸네일 (임시 색상) */}
            <div
              className={`h-48 bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center`}
            >
              <div className="text-center text-white">
                <div className="text-6xl mb-2">📁</div>
                <div className="text-2xl font-bold">{project.status}</div>
              </div>
            </div>

            {/* 정보 */}
            <div className="p-6">
              <h3 className="font-bold text-xl mb-2 group-hover:text-blue-600 transition-colors">
                {project.title}
              </h3>

              {project.description && (
                <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                  {project.description}
                </p>
              )}

              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>{new Date(project.created_at).toLocaleDateString()}</span>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/projects/${project.id}`);
                    }}
                  >
                    열기 →
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {!isLoading && projects.length === 0 && (
        <Card className="p-12 text-center">
          <div className="text-6xl mb-4">📂</div>
          <h3 className="text-2xl font-bold mb-2">프로젝트가 없습니다</h3>
          <p className="text-muted-foreground mb-6">
            첫 번째 프로젝트를 만들어보세요!
          </p>
          <Button
            onClick={() => setShowModal(true)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
          >
            새 프로젝트 만들기
          </Button>
        </Card>
      )}

      {/* 프로젝트 생성 모달 */}
      <CreateProjectModal
        open={showModal}
        onClose={() => setShowModal(false)}
      />
    </div>
  );
}
