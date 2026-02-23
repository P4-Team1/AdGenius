"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { contentAPI } from "@/lib/api";
import { useAuth } from "@/contexts/auth-context";

export default function CreateAdPage() {
  const router = useRouter();
  const params = useParams();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  const [adDescription, setAdDescription] = useState("");
  const [imagePrompt, setImagePrompt] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleGenerate = async () => {
    if (!adDescription.trim() || !imagePrompt.trim()) {
      alert("광고 설명과 이미지 묘사를 모두 입력해주세요.");
      return;
    }

    try {
      setIsSubmitting(true);
      const projectId = parseInt(params.id as string, 10);

      const payload = {
        ad_description: adDescription,
        image_prompt: imagePrompt,
        project_id: projectId,
      };

      const result = await contentAPI.generate(payload);

      if (result.success) {
        // 생성된 광고 상세 화면으로 이동
        router.push(`/projects/${projectId}/ads/${result.content_id}`);
      } else {
        alert("광고 생성에 실패했습니다: " + result.message);
      }
    } catch (error) {
      console.error("Failed to generate ad:", error);
      alert("광고 생성 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => router.push(`/projects/${params.id}`)}
          className="mb-4"
        >
          ← 프로젝트 상세로 돌아가기
        </Button>
        <h1 className="text-4xl font-black mb-2">원천 광고 소스 생성</h1>
        <p className="text-muted-foreground text-lg">
          AI가 제품 정보와 이미지 묘사를 바탕으로 공통된 광고 이미지와 문구를
          먼저 만들어냅니다.
          <br className="mt-1" />
          이후 생성된 원본을 바탕으로 인스타그램, 당근마켓 등 원하는 플랫폼에
          맞게 편집 및 최적화할 수 있습니다.
        </p>
      </div>

      <Card className="p-8 space-y-8">
        <div className="space-y-4">
          <Label htmlFor="ad-desc" className="text-lg font-bold">
            어떤 제품/가게를 광고하시나요?{" "}
            <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="ad-desc"
            placeholder="예: 우리 가게는 홍대입구역 근처에 있는 매운 떡볶이 전문점입니다. 스트레스가 확 풀리는 맛있게 매운맛이 특징입니다."
            className="h-32 resize-none"
            value={adDescription}
            onChange={(e) => setAdDescription(e.target.value)}
          />
        </div>

        <div className="space-y-4">
          <Label htmlFor="img-prompt" className="text-lg font-bold">
            생성하고 싶은 이미지의 모습을 묘사해주세요{" "}
            <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="img-prompt"
            placeholder="예: 김이 모락모락 나는 새빨간 떡볶이가 담긴 클래식한 접시. 조명이 은은하게 비추어 먹음직스러움이 강조됨."
            className="h-32 resize-none"
            value={imagePrompt}
            onChange={(e) => setImagePrompt(e.target.value)}
          />
        </div>

        <Button
          className="w-full h-14 text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold"
          onClick={handleGenerate}
          disabled={isSubmitting}
        >
          {isSubmitting
            ? "AI가 마법을 부리는 중... (최대 30초 대기)"
            : "내 광고 자동 생성하기 ✨"}
        </Button>
      </Card>
    </div>
  );
}
