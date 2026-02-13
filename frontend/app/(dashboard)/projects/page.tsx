'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { CreateProjectModal } from '@/components/create-project-modal'

export default function ProjectsPage() {
  const router = useRouter()
  const [showModal, setShowModal] = useState(false)

  // 임시 프로젝트 데이터
  const projects = [
    {
      id: '1',
      name: '봄 신상품 프로모션',
      description: '3월 신상품 출시 기념 SNS 광고',
      adsCount: 5,
      createdAt: '2024-02-10',
      thumbnail: 'from-pink-500 to-purple-500'
    },
    {
      id: '2',
      name: '여름 세일 캠페인',
      description: '여름 시즌 특가 세일 광고',
      adsCount: 3,
      createdAt: '2024-02-12',
      thumbnail: 'from-orange-500 to-amber-500'
    },
    {
      id: '3',
      name: '신제품 런칭',
      description: '',
      adsCount: 8,
      createdAt: '2024-02-09',
      thumbnail: 'from-blue-500 to-cyan-500'
    }
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 헤더 */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-black mb-2">내 프로젝트</h1>
          <p className="text-muted-foreground">
            총 {projects.length}개의 프로젝트
          </p>
        </div>
        <Button
          onClick={() => setShowModal(true)}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white h-12 px-6"
        >
          <span className="text-xl mr-2">+</span>
          새 프로젝트 만들기
        </Button>
      </div>

      {/* 검색 & 필터 */}
      <Card className="p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <Input
            placeholder="프로젝트 검색..."
            className="md:max-w-sm"
          />
          <div className="flex gap-2">
            <Button variant="outline" size="sm">전체</Button>
            <Button variant="outline" size="sm">최근 수정</Button>
            <Button variant="outline" size="sm">이름순</Button>
          </div>
        </div>
      </Card>

      {/* 프로젝트 그리드 */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <Card
            key={project.id}
            className="overflow-hidden hover:shadow-xl transition-all cursor-pointer border-2 hover:border-blue-600/50 group"
            onClick={() => router.push(`/projects/${project.id}`)}
          >
            {/* 썸네일 */}
            <div className={`h-48 bg-gradient-to-br ${project.thumbnail} flex items-center justify-center`}>
              <div className="text-center text-white">
                <div className="text-6xl mb-2">📁</div>
                <div className="text-2xl font-bold">{project.adsCount}개 광고</div>
              </div>
            </div>

            {/* 정보 */}
            <div className="p-6">
              <h3 className="font-bold text-xl mb-2 group-hover:text-blue-600 transition-colors">
                {project.name}
              </h3>

              {project.description && (
                <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                  {project.description}
                </p>
              )}

              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>{project.createdAt}</span>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      router.push(`/projects/${project.id}`)
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
      {projects.length === 0 && (
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
  )
}
