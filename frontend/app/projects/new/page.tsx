'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { projectAPI } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

export default function NewProjectPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const newProject = await projectAPI.create(formData)
      router.push(`/projects/${newProject.id}`)
    } catch (err) {
      setError('프로젝트 생성에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Button
          onClick={() => router.push('/dashboard')}
          variant="ghost"
          className="mb-6"
        >
          ← 대시보드로 돌아가기
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">새 프로젝트 만들기</CardTitle>
            <CardDescription>
              광고 캠페인 프로젝트를 생성하고 AI 콘텐츠를 만들어보세요
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              {error && (
                <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-md text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="name">프로젝트 이름 *</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="예: 봄 신메뉴 홍보"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">설명 (선택)</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="프로젝트에 대한 간단한 설명을 입력하세요"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                />
              </div>
            </CardContent>

            <CardFooter className="flex gap-3">
              <Button
                type="submit"
                disabled={loading}
                className="flex-1"
              >
                {loading ? '생성 중...' : '프로젝트 만들기'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/dashboard')}
              >
                취소
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}