'use client'

import { useRouter } from 'next/navigation'
import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function LoginPage() {
  const router = useRouter()

  return (
    <>
      {/* 로그인 페이지 - 회원가입 버튼 표시 */}
      <Header 
        rightButtons={
          <Button 
            variant="outline"
            onClick={() => router.push('/register')}
          >
            회원가입
          </Button>
        }
      />
      
      <div className="min-h-screen pt-20 bg-background flex items-center justify-center">
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-md mx-auto p-8">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-black mb-2">로그인</h1>
              <p className="text-muted-foreground">
                AdGenius에 오신 것을 환영합니다
              </p>
            </div>

            <form className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">이메일</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="your@email.com"
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">비밀번호</Label>
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="••••••••"
                  className="h-12"
                />
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="rounded" />
                  <span className="text-muted-foreground">로그인 상태 유지</span>
                </label>
                <a href="#" className="text-blue-600 hover:underline">
                  비밀번호 찾기
                </a>
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-lg font-semibold"
              >
                로그인
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-muted-foreground">
              계정이 없으신가요?{' '}
              <button 
                onClick={() => router.push('/register')}
                className="text-blue-600 hover:underline font-semibold"
              >
                회원가입
              </button>
            </div>
          </Card>
        </div>
      </div>
    </>
  )
}
