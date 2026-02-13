'use client'

import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export default function ProjectDetailPage() {
  const router = useRouter()
  const params = useParams()

  // 임시 프로젝트 데이터
  const project = {
    id: params.id,
    name: '봄 신상품 프로모션',
    description: '3월 신상품 출시 기념 SNS 광고',
    createdAt: '2024-02-10',
    adsCount: 5
  }

  // 임시 광고 데이터
  const ads = [
    {
      id: '1',
      name: '인스타그램 메인 광고',
      platform: 'instagram',
      platformIcon: '📸',
      platformName: '인스타그램',
      status: 'completed',
      statusText: '완료',
      statusColor: 'text-green-600',
      createdAt: '2024-02-10',
      thumbnail: 'from-pink-500 to-purple-500'
    },
    {
      id: '2',
      name: '당근마켓 상품 사진',
      platform: 'danggeun',
      platformIcon: '🥕',
      platformName: '당근마켓',
      status: 'processing',
      statusText: '생성 중',
      statusColor: 'text-purple-600',
      createdAt: '2024-02-12',
      thumbnail: 'from-orange-500 to-amber-500'
    },
    {
      id: '3',
      name: '쿠팡 상세 이미지',
      platform: 'coupang',
      platformIcon: '📦',
      platformName: '쿠팡',
      status: 'completed',
      statusText: '완료',
      statusColor: 'text-green-600',
      createdAt: '2024-02-11',
      thumbnail: 'from-blue-500 to-cyan-500'
    }
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 헤더 */}
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => router.push('/projects')}
          className="mb-4"
        >
          ← 프로젝트 목록으로
        </Button>

        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-4xl font-black mb-2">{project.name}</h1>
            {project.description && (
              <p className="text-muted-foreground text-lg mb-2">
                {project.description}
              </p>
            )}
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>생성: {project.createdAt}</span>
              <span>•</span>
              <span>{ads.length}개 광고</span>
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="outline">
              프로젝트 편집
            </Button>
            <Button
              onClick={() => router.push(`/projects/${params.id}/ads`)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
            >
              <span className="text-xl mr-2">+</span>
              새 광고 만들기
            </Button>
          </div>
        </div>
      </div>

      {/* 광고 목록 */}
      {ads.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ads.map((ad) => (
            <Card
              key={ad.id}
              className="overflow-hidden hover:shadow-xl transition-all cursor-pointer border-2 hover:border-blue-600/50 group"
              onClick={() => router.push(`/projects/${params.id}/ads/${ad.id}`)}
            >
              {/* 썸네일 */}
              <div className={`h-48 bg-gradient-to-br ${ad.thumbnail} flex items-center justify-center text-6xl`}>
                {ad.platformIcon}
              </div>

              {/* 정보 */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-bold text-lg line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {ad.name}
                  </h3>
                  <span className={`text-sm font-semibold whitespace-nowrap ml-2 ${ad.statusColor}`}>
                    {ad.statusText}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-2">
                    <span>{ad.platformIcon}</span>
                    <span>{ad.platformName}</span>
                  </div>
                  <span>{ad.createdAt}</span>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex-1"
                    onClick={(e) => {
                      e.stopPropagation()
                    }}
                  >
                    편집
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex-1"
                    onClick={(e) => {
                      e.stopPropagation()
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
            onClick={() => router.push(`/projects/${params.id}/ads`)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
          >
            새 광고 만들기
          </Button>
        </Card>
      )}
    </div>
  )
}
