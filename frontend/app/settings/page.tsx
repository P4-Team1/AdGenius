'use client'

import { useRouter } from 'next/navigation'
import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function SettingsPage() {
  const router = useRouter()

  const handleLogout = () => {
    router.push('/')
  }

  return (
    <>
      <Header 
        rightButtons={
          <>
            <Button 
              variant="ghost"
              onClick={() => router.push('/dashboard/projects')}
            >
              내 프로젝트
            </Button>
            <Button 
              variant="ghost"
              onClick={() => router.push('/dashboard/settings')}
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
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {/* 헤더 */}
          <div className="mb-8">
            <Button 
              variant="ghost" 
              onClick={() => router.push('/dashboard')}
              className="mb-4"
            >
              ← 대시보드로 돌아가기
            </Button>
            <h1 className="text-4xl font-black mb-2">설정</h1>
            <p className="text-muted-foreground">
              계정 및 서비스 설정을 관리하세요
            </p>
          </div>

          {/* 탭 메뉴 */}
          <div className="flex gap-2 mb-8 border-b border-border">
            <Button variant="ghost" className="border-b-2 border-blue-600 rounded-none">
              일반
            </Button>
            <Button variant="ghost" className="rounded-none">
              알림
            </Button>
            <Button variant="ghost" className="rounded-none">
              결제
            </Button>
            <Button variant="ghost" className="rounded-none">
              보안
            </Button>
          </div>

          <div className="space-y-6">
            {/* 기본 설정 */}
            <Card className="p-8">
              <h2 className="text-2xl font-bold mb-6">기본 설정</h2>
              
              <div className="space-y-6">
                <div className="grid gap-2">
                  <Label htmlFor="language">언어</Label>
                  <select 
                    id="language"
                    className="h-12 px-4 rounded-lg border border-border bg-background"
                  >
                    <option>한국어</option>
                    <option>English</option>
                    <option>日本語</option>
                  </select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="timezone">시간대</Label>
                  <select 
                    id="timezone"
                    className="h-12 px-4 rounded-lg border border-border bg-background"
                  >
                    <option>Asia/Seoul (GMT+9)</option>
                    <option>America/New_York (GMT-5)</option>
                    <option>Europe/London (GMT+0)</option>
                  </select>
                </div>

                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div>
                    <div className="font-semibold">다크 모드</div>
                    <div className="text-sm text-muted-foreground">
                      시스템 설정에 따라 자동으로 전환됩니다
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    시스템 설정 사용
                  </Button>
                </div>
              </div>
            </Card>

            {/* AI 설정 */}
            <Card className="p-8">
              <h2 className="text-2xl font-bold mb-6">AI 생성 설정</h2>
              
              <div className="space-y-6">
                <div className="grid gap-2">
                  <Label htmlFor="quality">기본 품질</Label>
                  <select 
                    id="quality"
                    className="h-12 px-4 rounded-lg border border-border bg-background"
                  >
                    <option>표준 (빠름)</option>
                    <option>고품질 (권장)</option>
                    <option>최고품질 (느림)</option>
                  </select>
                  <p className="text-sm text-muted-foreground">
                    품질이 높을수록 생성 시간이 길어집니다
                  </p>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="variations">변형 개수</Label>
                  <select 
                    id="variations"
                    className="h-12 px-4 rounded-lg border border-border bg-background"
                  >
                    <option>1개</option>
                    <option>3개 (권장)</option>
                    <option>5개</option>
                  </select>
                  <p className="text-sm text-muted-foreground">
                    한 번에 생성할 변형 버전의 수
                  </p>
                </div>

                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div>
                    <div className="font-semibold">자동 저장</div>
                    <div className="text-sm text-muted-foreground">
                      생성된 이미지를 자동으로 프로젝트에 저장
                    </div>
                  </div>
                  <input type="checkbox" className="w-5 h-5 rounded" defaultChecked />
                </div>
              </div>
            </Card>

            {/* 사용량 */}
            <Card className="p-8">
              <h2 className="text-2xl font-bold mb-6">사용량</h2>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">이번 달 생성 횟수</span>
                    <span className="text-sm font-bold">12 / 100</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full w-[12%] bg-gradient-to-r from-blue-600 to-purple-600"></div>
                  </div>
                </div>

                <div className="p-4 bg-blue-600/10 border border-blue-600/20 rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">✨</div>
                    <div className="flex-1">
                      <div className="font-semibold mb-1">프로 플랜으로 업그레이드</div>
                      <div className="text-sm text-muted-foreground mb-3">
                        무제한 생성, 고급 기능, 우선 처리
                      </div>
                      <Button 
                        size="sm"
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                      >
                        업그레이드 →
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* 위험 구역 */}
            <Card className="p-8 border-red-200 dark:border-red-900">
              <h2 className="text-2xl font-bold mb-6 text-red-600">위험 구역</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div>
                    <div className="font-semibold">모든 프로젝트 삭제</div>
                    <div className="text-sm text-muted-foreground">
                      생성한 모든 광고와 프로젝트가 영구 삭제됩니다
                    </div>
                  </div>
                  <Button variant="outline" className="text-red-600 border-red-600 hover:bg-red-600 hover:text-white">
                    삭제
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div>
                    <div className="font-semibold">계정 삭제</div>
                    <div className="text-sm text-muted-foreground">
                      계정과 모든 데이터가 영구 삭제됩니다
                    </div>
                  </div>
                  <Button variant="outline" className="text-red-600 border-red-600 hover:bg-red-600 hover:text-white">
                    계정 삭제
                  </Button>
                </div>
              </div>
            </Card>

            {/* 저장 버튼 */}
            <div className="flex justify-end gap-4">
              <Button variant="outline">
                취소
              </Button>
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                변경사항 저장
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
