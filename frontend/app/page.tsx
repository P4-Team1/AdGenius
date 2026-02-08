"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-4xl w-full space-y-8">
        {/* 헤더 */}
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-bold tracking-tight">
            소상공인 광고 생성 서비스
          </h1>
          <p className="text-xl text-muted-foreground">
            AI로 간편하게 광고 콘텐츠를 만들어보세요
          </p>
        </div>

        {/* 기능 카드 */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <div className="text-4xl mb-2">🖼️</div>
              <CardTitle>이미지 생성</CardTitle>
              <CardDescription>
                AI가 광고 이미지를 자동으로 생성해드립니다
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="text-4xl mb-2">✍️</div>
              <CardTitle>문구 생성</CardTitle>
              <CardDescription>
                매력적인 광고 문구를 AI가 제안해드립니다
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="text-4xl mb-2">🎨</div>
              <CardTitle>다양한 스타일</CardTitle>
              <CardDescription>
                모던, 빈티지 등 다양한 스타일 지원
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* CTA 버튼 */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={() => router.push("/login")}
            size="lg"
            className="text-lg px-8"
          >
            로그인
          </Button>
          <Button
            onClick={() => router.push("/register")}
            variant="outline"
            size="lg"
            className="text-lg px-8"
          >
            회원가입
          </Button>
        </div>

        {/* 추가 정보 */}
        <Card className="bg-muted/50">
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2">🚀 빠른 제작</h3>
                <p className="text-sm text-muted-foreground">
                  몇 번의 클릭만으로 전문가 수준의 광고 콘텐츠를 만들 수
                  있습니다
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">💰 비용 절감</h3>
                <p className="text-sm text-muted-foreground">
                  디자이너 없이도 고퀄리티 광고를 제작할 수 있습니다
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">🎯 맞춤형 콘텐츠</h3>
                <p className="text-sm text-muted-foreground">
                  가게별 특성에 맞는 광고를 AI가 자동으로 생성합니다
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">📱 간편한 사용</h3>
                <p className="text-sm text-muted-foreground">
                  복잡한 도구 없이 누구나 쉽게 사용할 수 있습니다
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
