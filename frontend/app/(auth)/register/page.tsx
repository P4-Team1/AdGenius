'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/auth-context'

export default function RegisterPage() {
  const router = useRouter()
  const { register } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [agreed, setAgreed] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!name.trim() || !email.trim() || !password.trim()) {
      setError('모든 필드를 입력해주세요')
      return
    }

    if (password !== passwordConfirm) {
      setError('비밀번호가 일치하지 않습니다')
      return
    }

    if (password.length < 8) {
      setError('비밀번호는 8자 이상이어야 합니다')
      return
    }

    if (!agreed) {
      setError('이용약관에 동의해주세요')
      return
    }

    setIsLoading(true)
    try {
      await register({ name, email, password })
    } catch {
      setError('회원가입에 실패했습니다. 다시 시도해주세요.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-5rem)]">
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto p-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-black mb-2">회원가입</h1>
            <p className="text-muted-foreground">
              무료로 시작해보세요
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 rounded-lg bg-red-600/10 border border-red-600/20 text-red-600 text-sm">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">이름</Label>
              <Input
                id="name"
                type="text"
                placeholder="홍길동"
                className="h-12"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">이메일</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                className="h-12"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">비밀번호</Label>
              <Input
                id="password"
                type="password"
                placeholder="8자 이상 입력하세요"
                className="h-12"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password-confirm">비밀번호 확인</Label>
              <Input
                id="password-confirm"
                type="password"
                placeholder="비밀번호를 다시 입력하세요"
                className="h-12"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
              />
            </div>

            <div className="flex items-start gap-2 text-sm">
              <input
                type="checkbox"
                className="mt-1 rounded"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
              />
              <span className="text-muted-foreground">
                <a href="#" className="text-blue-600 hover:underline">이용약관</a> 및{' '}
                <a href="#" className="text-blue-600 hover:underline">개인정보처리방침</a>에 동의합니다
              </span>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-lg font-semibold"
            >
              {isLoading ? '가입 중...' : '회원가입'}
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
  )
}
