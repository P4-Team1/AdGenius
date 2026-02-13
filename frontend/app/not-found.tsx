'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-6">
        <div className="text-8xl font-black text-muted-foreground/30">404</div>
        <h1 className="text-3xl font-bold">페이지를 찾을 수 없습니다</h1>
        <p className="text-muted-foreground max-w-md mx-auto">
          요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.
        </p>
        <div className="flex gap-4 justify-center">
          <Button
            variant="outline"
            onClick={() => router.back()}
          >
            ← 뒤로 가기
          </Button>
          <Button
            onClick={() => router.push('/')}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
          >
            홈으로 이동
          </Button>
        </div>
      </div>
    </div>
  )
}
