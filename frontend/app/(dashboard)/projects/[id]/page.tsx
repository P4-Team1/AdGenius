"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { projectAPI, contentAPI } from "@/lib/api";
import type { Project, Content } from "@/types";
import { useAuth } from "@/contexts/auth-context";
import { AuthImage } from "@/components/auth-image";

export default function ProjectDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const [project, setProject] = useState<Project | null>(null);
  const [contents, setContents] = useState<Content[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.push("/login");
        return;
      }
      if (params.id) {
        loadProject(params.id as string);
      }
    }
  }, [authLoading, isAuthenticated, params.id, router]);

  const loadProject = async (projectId: string) => {
    try {
      setIsLoading(true);
      const data = await projectAPI.getById(projectId);
      setProject(data);
      const contentsData = await contentAPI.getAll(projectId);
      setContents(contentsData);
    } catch (error) {
      console.error("Failed to load project:", error);
      alert("프로젝트 정보를 불러오는 데 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center">
        <p className="text-muted-foreground">프로젝트 정보를 불러오는 중...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center">
        <p className="text-muted-foreground">프로젝트를 찾을 수 없습니다.</p>
      </div>
    );
  }

  const handleDeleteProject = async () => {
    if (
      !window.confirm(
        "정말로 이 프로젝트를 삭제하시겠습니까? 관련 광고도 모두 삭제될 수 있습니다.",
      )
    )
      return;

    try {
      setIsLoading(true);
      await projectAPI.delete(project!.id);
      router.push("/projects");
    } catch (error) {
      console.error("Failed to delete project:", error);
      alert("프로젝트 삭제에 실패했습니다.");
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 헤더 */}
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => router.push("/projects")}
          className="mb-4"
        >
          ← 프로젝트 목록으로
        </Button>

        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-4xl font-black mb-2">{project.title}</h1>
            {project.description && (
              <p className="text-muted-foreground text-lg mb-2">
                {project.description}
              </p>
            )}
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>
                생성: {new Date(project.created_at).toLocaleDateString()}
              </span>
              <span>•</span>
              <span>{contents.length}개 광고</span>
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="outline">프로젝트 편집</Button>
            <Button variant="destructive" onClick={handleDeleteProject}>
              프로젝트 삭제
            </Button>
            <Button
              onClick={() => router.push(`/projects/${params.id}/ads/new`)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
            >
              <span className="text-xl mr-2">+</span>새 광고 만들기
            </Button>
          </div>
        </div>
      </div>

      {/* 광고 목록 */}
      {contents.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {contents.map((content) => (
            <Card
              key={content.id}
              className="overflow-hidden hover:shadow-xl transition-all cursor-pointer border-2 hover:border-blue-600/50 group"
              onClick={() =>
                router.push(`/projects/${params.id}/ads/${content.id}`)
              }
            >
              {/* 썸네일 */}
              <div className="h-48 bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-6xl overflow-hidden">
                {content.result_image_path ? (
                  <AuthImage
                    src={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1"}/contents/${content.id}/image`}
                    alt="광고 이미지"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>✨</span>
                )}
              </div>

              {/* 정보 */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-bold text-lg line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {content.user_prompt || "생성된 이미지 내용 없음"}
                  </h3>
                  <span
                    className={`text-sm font-semibold whitespace-nowrap ml-2 ${
                      content.is_success ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {content.is_success ? "완료" : "실패/생성중"}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-2">
                    <span>{content.type}</span>
                  </div>
                  <span>
                    {new Date(content.created_at).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/projects/${params.id}/ads/${content.id}`);
                    }}
                  >
                    상세보기
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex-1"
                    onClick={async (e) => {
                      e.stopPropagation();
                      if (!content.result_image_path) {
                        alert("이미지가 아직 없습니다.");
                        return;
                      }
                      try {
                        const API_URL =
                          process.env.NEXT_PUBLIC_API_URL ||
                          "http://localhost:8000/api/v1";
                        const token = localStorage.getItem("access_token");
                        const res = await fetch(
                          `${API_URL}/contents/${content.id}/image`,
                          {
                            headers: token
                              ? { Authorization: `Bearer ${token}` }
                              : {},
                          },
                        );
                        if (!res.ok) throw new Error("download failed");
                        const blob = await res.blob();
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = `ad_${content.id}.png`;
                        document.body.appendChild(a);
                        a.click();
                        a.remove();
                        URL.revokeObjectURL(url);
                      } catch {
                        alert("다운로드에 실패했습니다.");
                      }
                    }}
                  >
                    다운로드
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <div className="text-6xl mb-4">🎨</div>
          <h3 className="text-2xl font-bold mb-2">광고가 없습니다</h3>
          <p className="text-muted-foreground mb-6">
            첫 번째 광고를 만들어보세요!
          </p>
          <Button
            onClick={() => router.push(`/projects/${params.id}/ads/new`)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
          >
            새 광고 만들기
          </Button>
        </Card>
      )}
    </div>
  );
}
