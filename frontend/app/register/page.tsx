'use client'

import { useRouter } from 'next/navigation'
import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function RegisterPage() {
  const router = useRouter()

  return (
    <>
      {/* 회원가입 페이지 - 로그인 버튼 표시 */}
      <Header 
        rightButtons={
          <Button 
            variant="outline"
            onClick={() => router.push('/login')}
          >
            로그인
          </Button>
        }
      />
      
      <div className="min-h-screen pt-20 bg-background flex items-center justify-center">
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-md mx-auto p-8">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-black mb-2">회원가입</h1>
              <p className="text-muted-foreground">
                무료로 시작해보세요
              </p>
            </div>

            <form className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">이름</Label>
                <Input 
                  id="name" 
                  type="text" 
                  placeholder="홍길동"
                  className="h-12"
                />
              </div>

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
                  placeholder="8자 이상 입력하세요"
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password-confirm">비밀번호 확인</Label>
                <Input 
                  id="password-confirm" 
                  type="password" 
                  placeholder="비밀번호를 다시 입력하세요"
                  className="h-12"
                />
              </div>

              <div className="flex items-start gap-2 text-sm">
                <input type="checkbox" className="mt-1 rounded" />
                <span className="text-muted-foreground">
                  <a href="#" className="text-blue-600 hover:underline">이용약관</a> 및{' '}
                  <a href="#" className="text-blue-600 hover:underline">개인정보처리방침</a>에 동의합니다
                </span>
              </div>

              <Button 
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-lg font-semibold"
              >
                회원가입
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-muted-foreground">
              이미 계정이 있으신가요?{' '}
              <button 
                onClick={() => router.push('/login')}
                className="text-blue-600 hover:underline font-semibold"
              >
                로그인
              </button>
            </div>
          </Card>
        </div>
      </div>
    </>
  )
}
