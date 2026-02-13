'use client'

import { useRouter } from 'next/navigation'
import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export default function DashboardPage() {
  const router = useRouter()

  const handleLogout = () => {
    // 로그아웃 로직
    router.push('/')
  }

  return (
    <>
      {/* 대시보드 - 여러 버튼 표시 */}
      <Header 
        rightButtons={
          <>
            <Button 
              variant="ghost"
              onClick={() => router.push('/projects')}
            >
              내 프로젝트
            </Button>
            <Button 
              variant="ghost"
              onClick={() => router.push('/settings')}
            >
              설정
            </Button>
            <Button 
              onClick={handleLogout}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
            >
              로그아웃
            </Button>
          </>
        }
      />
      
      <div className="min-h-screen pt-20 bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-black mb-2">대시보드</h1>
            <p className="text-muted-foreground">
              안녕하세요! AI 광고 생성을 시작해보세요
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <Card className="p-6">
              <div className="text-5xl mb-4">📊</div>
              <h3 className="text-2xl font-bold mb-2">생성된 광고</h3>
              <p className="text-4xl font-black text-blue-600 mb-2">12</p>
              <p className="text-sm text-muted-foreground">이번 달</p>
            </Card>

            <Card className="p-6">
              <div className="text-5xl mb-4">⚡</div>
              <h3 className="text-2xl font-bold mb-2">진행 중</h3>
              <p className="text-4xl font-black text-purple-600 mb-2">3</p>
              <p className="text-sm text-muted-foreground">현재 작업</p>
            </Card>

            <Card className="p-6">
              <div className="text-5xl mb-4">✅</div>
              <h3 className="text-2xl font-bold mb-2">완료</h3>
              <p className="text-4xl font-black text-green-500 mb-2">9</p>
              <p className="text-sm text-muted-foreground">성공적으로 완료</p>
            </Card>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-4">최근 프로젝트</h2>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-4 p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors cursor-pointer">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg"></div>
                    <div className="flex-1">
                      <h3 className="font-semibold">인스타그램 광고 {i}</h3>
                      <p className="text-sm text-muted-foreground">2시간 전</p>
                    </div>
                    <Button size="sm" variant="outline">보기</Button>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-4">빠른 시작</h2>
              <div className="space-y-3">
                <Button 
                  className="w-full h-14 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white justify-start"
                  onClick={() => router.push('/dashboard/new')}
                >
                  <span className="text-2xl mr-3">🎨</span>
                  새 광고 만들기
                </Button>
                <Button 
                  variant="outline"
                  className="w-full h-14 justify-start"
                >
                  <span className="text-2xl mr-3">📸</span>
                  템플릿 둘러보기
                </Button>
                <Button 
                  variant="outline"
                  className="w-full h-14 justify-start"
                >
                  <span className="text-2xl mr-3">📚</span>
                  사용 가이드
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </>
  )
}
