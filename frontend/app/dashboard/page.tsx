'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { projectAPI } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

export default function DashboardPage() {
  const router = useRouter()
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (!token) {
      router.push('/login')
      return
    }

    loadProjects()
  }, [])

  const loadProjects = async () => {
    try {
      const data = await projectAPI.getAll()
      setProjects(data)
    } catch (error) {
      console.error('프로젝트 목록 로딩 실패:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-muted-foreground">로딩 중...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">내 프로젝트</h1>
            <p className="text-muted-foreground mt-1">
              AI로 광고 콘텐츠를 만들어보세요
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => router.push('/projects/new')}
              size="lg"
            >
              + 새 프로젝트
            </Button>
            <Button
              onClick={() => router.push('/settings')}
              variant="outline"
              size="lg"
            >
              ⚙️ 설정
            </Button>
            <Button
              onClick={handleLogout}
              variant="ghost"
              size="lg"
            >
              로그아웃
            </Button>
          </div>
        </div>

        {/* 프로젝트 목록 */}
        {projects.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent className="space-y-4">
              <div className="text-6xl">📝</div>
              <div>
                <h2 className="text-2xl font-semibold mb-2">아직 프로젝트가 없습니다</h2>
                <p className="text-muted-foreground mb-6">
                  첫 프로젝트를 만들고 AI로 광고 이미지를 생성해보세요!
                </p>
              </div>
              <Button
                onClick={() => router.push('/projects/new')}
                size="lg"
              >
                첫 프로젝트 만들기
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <Card
                key={project.id}
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => router.push(`/projects/${project.id}`)}
              >
                {/* 썸네일 영역 */}
                <div className="aspect-video bg-muted rounded-t-lg flex items-center justify-center">
                  <span className="text-4xl">📸</span>
                </div>

                <CardHeader>
                  <CardTitle>{project.name}</CardTitle>
                  <CardDescription>
                    {new Date(project.createdAt).toLocaleDateString('ko-KR')}
                  </CardDescription>
                </CardHeader>

                {project.storeId && (
                  <CardFooter>
                    <p className="text-xs text-muted-foreground">
                      가게 이름: {project.storeName}
                    </p>
                  </CardFooter>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}