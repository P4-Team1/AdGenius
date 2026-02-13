'use client'

import { useRouter, usePathname } from 'next/navigation'
import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()

  const isLogin = pathname === '/login'

  return (
    <>
      <Header
        rightButtons={
          <Button
            variant="outline"
            onClick={() => router.push(isLogin ? '/register' : '/login')}
          >
            {isLogin ? '회원가입' : '로그인'}
          </Button>
        }
      />
      <main className="min-h-screen pt-20 bg-background">
        {children}
      </main>
    </>
  )
}
