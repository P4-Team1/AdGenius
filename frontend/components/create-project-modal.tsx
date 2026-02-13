'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface CreateProjectModalProps {
  open: boolean
  onClose: () => void
}

export function CreateProjectModal({ open, onClose }: CreateProjectModalProps) {
  const router = useRouter()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  if (!open) return null

  const handleCreate = async () => {
    if (!name.trim()) {
      alert('프로젝트 이름을 입력해주세요')
      return
    }

    setIsCreating(true)
    
    // TODO: API 호출로 프로젝트 생성
    // const newProject = await createProject({ name, description })
    
    // 임시: 2초 후 프로젝트 상세 페이지로 이동
    setTimeout(() => {
      const projectId = Date.now() // 임시 ID
      router.push(`/projects/${projectId}`)
      onClose()
      setIsCreating(false)
    }, 500)
  }

  return (
    <>
      {/* 배경 오버레이 */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-in fade-in duration-200"
        onClick={onClose}
      />
      
      {/* 모달 */}
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg animate-in zoom-in-95 duration-200">
        <div className="bg-background border-2 border-border rounded-2xl shadow-2xl p-8">
          <div className="mb-6">
            <h2 className="text-3xl font-black mb-2">새 프로젝트 만들기</h2>
            <p className="text-muted-foreground">
              프로젝트를 만들고 광고를 생성해보세요
            </p>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="project-name">
                프로젝트 이름 <span className="text-red-500">*</span>
              </Label>
              <Input 
                id="project-name"
                placeholder="예: 봄 신상품 프로모션"
                className="h-12 text-base"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="project-description">
                설명 (선택)
              </Label>
              <textarea
                id="project-description"
                placeholder="프로젝트에 대해 간단히 설명해주세요"
                className="w-full px-4 py-3 rounded-lg border border-border bg-background resize-none text-base"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>

          <div className="flex gap-3 mt-8">
            <Button 
              variant="outline" 
              className="flex-1 h-12"
              onClick={onClose}
              disabled={isCreating}
            >
              취소
            </Button>
            <Button 
              className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold"
              onClick={handleCreate}
              disabled={isCreating}
            >
              {isCreating ? '생성 중...' : '프로젝트 생성'}
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
