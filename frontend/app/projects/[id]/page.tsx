'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { projectAPI, contentAPI } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function ProjectDetailPage() {
  const router = useRouter()
  const params = useParams()
  const projectId = params.id as string

  const [project, setProject] = useState<any>(null)
  const [contents, setContents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProjectData()
  }, [])

  const loadProjectData = async () => {
    try {
      const projectData = await projectAPI.getById(projectId)
      const contentsData = await contentAPI.getAll(projectId)
      
      setProject(projectData)
      setContents(contentsData)
    } catch (error) {
      console.error('프로젝트 로딩 실패:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-muted-foreground">로딩 중...</div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-muted-foreground">프로젝트를 찾을 수 없습니다.</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Button
          onClick={() => router.push('/dashboard')}
          variant="ghost"
          className="mb-6"
        >
          ← 대시보드로 돌아가기
        </Button>

        {/* 헤더 */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">{project.name}</h1>
            <p className="text-muted-foreground">
              생성일: {new Date(project.createdAt).toLocaleDateString('ko-KR')}
            </p>
          </div>
          
          <Button
            onClick={() => router.push(`/projects/${projectId}/generate`)}
            size="lg"
          >
            ✨ AI 콘텐츠 생성
          </Button>
        </div>

        {/* 생성된 콘텐츠 */}
        <div>
          <h2 className="text-2xl font-semibold mb-6">생성된 콘텐츠</h2>
          
          {contents.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent className="space-y-4">
                <div className="text-6xl">🎨</div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">
                    아직 생성된 콘텐츠가 없습니다
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    AI를 활용해 첫 광고 콘텐츠를 만들어보세요
                  </p>
                </div>
                <Button
                  onClick={() => router.push(`/projects/${projectId}/generate`)}
                  size="lg"
                >
                  첫 콘텐츠 만들기
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {contents.map((content) => (
                <Card key={content.id}>
                  {content.type === 'image' ? (
                    <div className="aspect-video bg-muted rounded-t-lg flex items-center justify-center">
                      <span className="text-4xl">🖼️</span>
                    </div>
                  ) : (
                    <CardContent className="pt-6">
                      <div className="bg-muted rounded-lg p-4 min-h-[100px]">
                        <p className="text-sm line-clamp-4">{content.content}</p>
                      </div>
                    </CardContent>
                  )}
                  
                  <CardHeader>
                    <CardDescription className="text-xs">
                      {content.type === 'image' ? '이미지' : '텍스트'}
                    </CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}