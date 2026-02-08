'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { contentAPI, storeAPI } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function GeneratePage() {
  const router = useRouter()
  const params = useParams()
  const projectId = params.id as string

  const [stores, setStores] = useState<any[]>([])
  const [formData, setFormData] = useState({
    storeId: '',
    contentType: 'image',
    imageMode: 'text-to-image',
    prompt: '',
    imageFile: null as File | null,
    style: 'modern',
  })
  const [generating, setGenerating] = useState(false)
  const [result, setResult] = useState<any>(null)

  useEffect(() => {
    loadStores()
  }, [])

  const loadStores = async () => {
    try {
      const data = await storeAPI.getAll()
      setStores(data)
      if (data.length > 0) {
        setFormData(prev => ({ ...prev, storeId: data[0].id }))
      }
    } catch (error) {
      console.error('가게 목록 로딩 실패:', error)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({
        ...formData,
        imageFile: e.target.files[0]
      })
    }
  }

  const handleGenerate = async () => {
    setGenerating(true)
    setResult(null)

    try {
      let uploadedImageUrl = null
      if (formData.imageFile) {
        const uploadFormData = new FormData()
        uploadFormData.append('file', formData.imageFile)
        const uploadResult = await contentAPI.upload(uploadFormData)
        uploadedImageUrl = uploadResult.url
      }

      const generateData = {
        projectId,
        storeId: formData.storeId,
        type: formData.contentType,
        imageMode: formData.imageMode,
        prompt: formData.prompt,
        style: formData.style,
        referenceImageUrl: uploadedImageUrl,
      }

      const result = await contentAPI.generate(generateData)
      setResult(result)
    } catch (error) {
      console.error('생성 실패:', error)
      alert('콘텐츠 생성에 실패했습니다.')
    } finally {
      setGenerating(false)
    }
  }

  const imageModes = [
    { value: 'text-to-image', label: '📝 텍스트로 생성', desc: '텍스트 설명만으로 새로운 이미지를 생성합니다.' },
    { value: 'image-to-image', label: '🖼️ 레퍼런스 이미지 사용', desc: '업로드한 이미지를 참고하여 유사한 스타일의 이미지를 생성합니다.' },
    { value: 'inpainting', label: '🎨 제품 사진 보존', desc: '제품 사진을 유지하면서 배경이나 주변 요소를 변경합니다.' },
    { value: 'controlnet', label: '✏️ 스케치로 생성', desc: '스케치나 윤곽선을 기반으로 이미지를 생성합니다.' },
  ]

  const styles = [
    { value: 'modern', label: '🌟 모던' },
    { value: 'minimal', label: '⚪ 미니멀' },
    { value: 'vintage', label: '📜 빈티지' },
    { value: 'colorful', label: '🎨 화려한' },
    { value: 'professional', label: '💼 전문적' },
    { value: 'cute', label: '🐰 귀여운' },
  ]

  const selectedMode = imageModes.find(m => m.value === formData.imageMode)

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Button
          onClick={() => router.push(`/projects/${projectId}`)}
          variant="ghost"
          className="mb-6"
        >
          ← 프로젝트로 돌아가기
        </Button>

        <h1 className="text-3xl font-bold mb-8">AI 콘텐츠 생성</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 왼쪽: 입력 폼 */}
          <div className="space-y-6">
            {/* 가게 선택 */}
            <Card>
              <CardHeader>
                <CardTitle>가게 선택</CardTitle>
              </CardHeader>
              <CardContent>
                <Select
                  value={formData.storeId}
                  onValueChange={(value) => setFormData({ ...formData, storeId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="가게를 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    {stores.map(store => (
                      <SelectItem key={store.id} value={store.id}>
                        {store.name} - {store.category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {stores.length === 0 && (
                  <p className="text-sm text-muted-foreground mt-2">
                    가게가 없습니다. 설정에서 가게를 먼저 등록해주세요.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* 콘텐츠 타입 */}
            <Card>
              <CardHeader>
                <CardTitle>생성 타입</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    type="button"
                    variant={formData.contentType === 'image' ? 'default' : 'outline'}
                    onClick={() => setFormData({ ...formData, contentType: 'image' })}
                    className="w-full"
                  >
                    🖼️ 이미지
                  </Button>
                  <Button
                    type="button"
                    variant={formData.contentType === 'text' ? 'default' : 'outline'}
                    onClick={() => setFormData({ ...formData, contentType: 'text' })}
                    className="w-full"
                  >
                    ✍️ 텍스트
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* 이미지 모드 (이미지일 때만) */}
            {formData.contentType === 'image' && (
              <Card>
                <CardHeader>
                  <CardTitle>이미지 생성 방식</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Select
                    value={formData.imageMode}
                    onValueChange={(value) => setFormData({ ...formData, imageMode: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {imageModes.map(mode => (
                        <SelectItem key={mode.value} value={mode.value}>
                          {mode.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  {selectedMode && (
                    <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                      {selectedMode.desc}
                    </p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* 스타일 (이미지일 때만) */}
            {formData.contentType === 'image' && (
              <Card>
                <CardHeader>
                  <CardTitle>스타일</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-2">
                    {styles.map(style => (
                      <Button
                        key={style.value}
                        type="button"
                        variant={formData.style === style.value ? 'default' : 'outline'}
                        onClick={() => setFormData({ ...formData, style: style.value })}
                        className="w-full"
                        size="sm"
                      >
                        {style.label}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 프롬프트 */}
            <Card>
              <CardHeader>
                <CardTitle>
                  {formData.contentType === 'image' ? '이미지 설명' : '광고 문구 요청사항'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  name="prompt"
                  value={formData.prompt}
                  onChange={handleChange}
                  placeholder={
                    formData.contentType === 'image' 
                      ? "예: 봄 신메뉴를 홍보하는 따뜻한 분위기의 배너 이미지"
                      : "예: 20대 여성을 타겟으로 한 세련되고 감성적인 광고 문구"
                  }
                  rows={6}
                />
              </CardContent>
            </Card>

            {/* 이미지 업로드 */}
            {formData.contentType === 'image' && 
             (formData.imageMode === 'image-to-image' || 
              formData.imageMode === 'inpainting' || 
              formData.imageMode === 'controlnet') && (
              <Card>
                <CardHeader>
                  <CardTitle>
                    {formData.imageMode === 'image-to-image' && '레퍼런스 이미지'}
                    {formData.imageMode === 'inpainting' && '제품 사진'}
                    {formData.imageMode === 'controlnet' && '스케치 이미지'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                  {formData.imageFile && (
                    <p className="text-sm text-muted-foreground mt-2">
                      선택됨: {formData.imageFile.name}
                    </p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* 생성 버튼 */}
            <Button
              onClick={handleGenerate}
              disabled={generating || !formData.storeId || !formData.prompt}
              className="w-full"
              size="lg"
            >
              {generating ? '생성 중...' : '✨ 생성하기'}
            </Button>
          </div>

          {/* 오른쪽: 결과 미리보기 */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>미리보기</CardTitle>
              </CardHeader>
              <CardContent className="min-h-[400px] flex items-center justify-center">
                {generating ? (
                  <div className="text-center space-y-4">
                    <div className="text-6xl">⏳</div>
                    <p className="text-muted-foreground">AI가 콘텐츠를 생성하고 있습니다...</p>
                  </div>
                ) : result ? (
                  <div className="w-full space-y-4">
                    {formData.contentType === 'image' ? (
                      <div>
                        <div className="aspect-video bg-muted rounded-lg flex items-center justify-center mb-4">
                          <span className="text-6xl">🖼️</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          모드: {formData.imageMode} | 스타일: {formData.style}
                        </p>
                      </div>
                    ) : (
                      <div className="bg-muted rounded-lg p-6">
                        <p className="text-lg leading-relaxed">{result.text}</p>
                      </div>
                    )}
                    
                    <Button
                      onClick={() => router.push(`/projects/${projectId}`)}
                      className="w-full"
                    >
                      프로젝트로 돌아가기
                    </Button>
                  </div>
                ) : (
                  <div className="text-center space-y-4">
                    <div className="text-6xl">✨</div>
                    <p className="text-muted-foreground">
                      생성 버튼을 눌러 AI 콘텐츠를 만들어보세요
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}