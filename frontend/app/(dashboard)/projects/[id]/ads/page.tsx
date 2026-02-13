'use client'

import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import type { Platform } from '@/types'

export default function NewAdPage() {
  const router = useRouter()
  const params = useParams()

  const platforms: Platform[] = [
    {
      id: 'instagram',
      name: '인스타그램',
      icon: '📸',
      ratio: '1:1',
      description: '정사각형 비율의 감각적인 피드 이미지',
      features: ['감성적 디자인', '트렌디한 색감', '해시태그 최적화'],
      color: 'from-pink-500 to-purple-500'
    },
    {
      id: 'danggeun',
      name: '당근마켓',
      icon: '🥕',
      ratio: '4:3',
      description: '신뢰감 있는 중고거래 상품 사진',
      features: ['깔끔한 배경', '제품 강조', '가격 표시'],
      color: 'from-orange-500 to-amber-500'
    },
    {
      id: 'coupang',
      name: '쿠팡',
      icon: '📦',
      ratio: '1:1',
      description: '순백 배경의 전문적인 상품 이미지',
      features: ['화이트 배경', '고해상도', '상세 표현'],
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'youtube',
      name: '유튜브',
      icon: '🎬',
      ratio: '16:9',
      description: '시선을 끄는 썸네일 이미지',
      features: ['강렬한 비주얼', '텍스트 오버레이', '클릭 유도'],
      color: 'from-red-500 to-pink-500'
    }
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 헤더 */}
      <div className="mb-12">
        <Button
          variant="ghost"
          onClick={() => router.push(`/projects/${params.id}`)}
          className="mb-4"
        >
          ← 프로젝트로 돌아가기
        </Button>
        <h1 className="text-4xl font-black mb-2">새 광고 만들기</h1>
        <p className="text-muted-foreground text-lg">
          어떤 플랫폼의 광고를 만들까요?
        </p>
      </div>

      {/* 플랫폼 선택 */}
      <div className="grid md:grid-cols-2 gap-6 max-w-5xl">
        {platforms.map((platform) => (
          <Card
            key={platform.id}
            className="p-8 hover:shadow-2xl transition-all cursor-pointer border-2 hover:border-blue-600/50 group"
            onClick={() => {
              alert(`${platform.name} 광고 생성 페이지로 이동 (준비중)`)
            }}
          >
            <div className="flex items-start gap-6">
              <div className={`text-7xl p-4 rounded-2xl bg-gradient-to-br ${platform.color} bg-opacity-10 flex-shrink-0`}>
                {platform.icon}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-2xl font-bold">{platform.name}</h3>
                  <span className="text-sm px-3 py-1 bg-muted rounded-full font-mono">
                    {platform.ratio}
                  </span>
                </div>
                <p className="text-muted-foreground mb-4">
                  {platform.description}
                </p>

                {/* 특징 */}
                {platform.features && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {platform.features.map((feature) => (
                      <span
                        key={feature}
                        className="text-xs px-3 py-1 bg-blue-600/10 text-blue-600 dark:text-blue-400 rounded-full font-medium"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-2 text-blue-600 font-semibold group-hover:gap-4 transition-all">
                  선택하기
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* 안내 */}
      <Card className="mt-12 p-8 bg-blue-600/5 border-blue-600/20 max-w-5xl">
        <div className="flex gap-4">
          <div className="text-4xl">💡</div>
          <div>
            <h3 className="font-bold text-lg mb-2">처음 사용하시나요?</h3>
            <p className="text-muted-foreground mb-4">
              각 플랫폼은 최적화된 이미지 비율과 스타일이 다릅니다.
              원하는 플랫폼을 선택하면 AI가 자동으로 맞춤 광고를 생성해드립니다.
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                <span>제품 이미지만 업로드하면 자동으로 배경 제거</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                <span>플랫폼별 최적 비율로 자동 조정</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                <span>한글 텍스트 오버레이 지원</span>
              </li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  )
}
