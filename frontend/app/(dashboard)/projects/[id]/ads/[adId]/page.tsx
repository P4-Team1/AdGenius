'use client'

import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export default function AdDetailPage() {
  const router = useRouter()
  const params = useParams()

  // 임시 광고 데이터
  const ad = {
    id: params.adId,
    projectId: params.id,
    name: '인스타그램 메인 광고',
    platform: 'instagram',
    platformIcon: '📸',
    platformName: '인스타그램',
    status: 'completed',
    statusText: '완료',
    createdAt: '2024-02-10 14:30',
    updatedAt: '2024-02-10 15:45',
    prompt: '봄을 맞아 새로 출시된 꽃무늬 원피스를 홍보하는 감각적인 인스타그램 광고 이미지. 밝고 경쾌한 분위기',
    settings: {
      ratio: '1:1',
      style: '밝고 경쾌한',
      colors: ['핑크', '화이트', '연두'],
      resolution: '1080 x 1080px'
    }
  }

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
              <span className="text-4xl">{ad.platformIcon}</span>
              <h1 className="text-4xl font-black">{ad.name}</h1>
            </div>
            <div className="flex items-center gap-4 text-muted-foreground">
              <span>{ad.platformName}</span>
              <span>•</span>
              <span>생성: {ad.createdAt}</span>
              <span>•</span>
              <span className="text-green-600 font-semibold">{ad.statusText}</span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              다시 생성
            </Button>
            <Button
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
            >
              다운로드
            </Button>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* 메인 이미지 */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-8">
            <h2 className="text-xl font-bold mb-4">생성된 이미지</h2>
            <div className="aspect-square bg-gradient-to-br from-pink-500 to-purple-500 rounded-lg flex items-center justify-center">
              <div className="text-center text-white">
                <div className="text-8xl mb-4">📸</div>
                <p className="text-2xl font-bold">광고 이미지 미리보기</p>
                <p className="text-sm opacity-80 mt-2">{ad.settings.resolution}</p>
              </div>
            </div>
          </Card>

          {/* 변형 버전들 */}
          <Card className="p-8">
            <h2 className="text-xl font-bold mb-4">다른 버전</h2>
            <div className="grid grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="aspect-square bg-gradient-to-br from-pink-400 to-purple-400 rounded-lg cursor-pointer hover:ring-4 ring-blue-600 transition-all"
                >
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* 사이드바 - 정보 */}
        <div className="space-y-6">
          {/* 광고 설정 */}
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">광고 설정</h2>
            <div className="space-y-4">
              <div>
                <div className="text-sm text-muted-foreground mb-1">플랫폼</div>
                <div className="font-semibold">{ad.platformName}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">비율</div>
                <div className="font-semibold">{ad.settings.ratio}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">해상도</div>
                <div className="font-semibold">{ad.settings.resolution}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">스타일</div>
                <div className="font-semibold">{ad.settings.style}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">주요 색상</div>
                <div className="flex gap-2">
                  {ad.settings.colors.map((color) => (
                    <span
                      key={color}
                      className="px-3 py-1 bg-muted rounded-full text-sm font-medium"
                    >
                      {color}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* 프롬프트 */}
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">사용한 프롬프트</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {ad.prompt}
            </p>
          </Card>

          {/* 액션 버튼들 */}
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">작업</h2>
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                🔄 다시 생성하기
              </Button>
              <Button variant="outline" className="w-full justify-start">
                ✏️ 프롬프트 수정
              </Button>
              <Button variant="outline" className="w-full justify-start">
                📋 복사하기
              </Button>
              <Button variant="outline" className="w-full justify-start">
                📥 다운로드
              </Button>
              <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-600">
                🗑️ 삭제하기
              </Button>
            </div>
          </Card>

          {/* 히스토리 */}
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">히스토리</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">생성됨</span>
                <span>{ad.createdAt}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">마지막 수정</span>
                <span>{ad.updatedAt}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">다운로드</span>
                <span>2회</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
