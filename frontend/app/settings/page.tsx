'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { storeAPI } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function SettingsPage() {
  const router = useRouter()
  const [stores, setStores] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingStore, setEditingStore] = useState<any>(null)
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    address: '',
    description: '',
  })

  useEffect(() => {
    loadStores()
  }, [])

  const loadStores = async () => {
    try {
      const data = await storeAPI.getAll()
      setStores(data)
    } catch (error) {
      console.error('가게 목록 로딩 실패:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleAddStore = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await storeAPI.create(formData)
      setFormData({ name: '', category: '', address: '', description: '' })
      setShowAddForm(false)
      loadStores()
      alert('가게가 추가되었습니다!')
    } catch (error) {
      alert('가게 추가에 실패했습니다.')
    }
  }

  const handleEditStore = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingStore) return

    try {
      await storeAPI.update(editingStore.id, formData)
      setFormData({ name: '', category: '', address: '', description: '' })
      setEditingStore(null)
      loadStores()
      alert('가게 정보가 수정되었습니다!')
    } catch (error) {
      alert('가게 수정에 실패했습니다.')
    }
  }

  const handleDeleteStore = async (storeId: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return

    try {
      await storeAPI.delete(storeId)
      loadStores()
      alert('가게가 삭제되었습니다.')
    } catch (error) {
      alert('가게 삭제에 실패했습니다.')
    }
  }

  const startEdit = (store: any) => {
    setEditingStore(store)
    setFormData({
      name: store.name,
      category: store.category,
      address: store.address,
      description: store.description || '',
    })
    setShowAddForm(false)
  }

  const cancelEdit = () => {
    setEditingStore(null)
    setFormData({ name: '', category: '', address: '', description: '' })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-muted-foreground">로딩 중...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button
          onClick={() => router.push('/dashboard')}
          variant="ghost"
          className="mb-6"
        >
          ← 대시보드로 돌아가기
        </Button>

        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">설정</h1>
            <p className="text-muted-foreground mt-1">가게 정보를 관리하세요</p>
          </div>
          <Button
            onClick={() => {
              setShowAddForm(!showAddForm)
              setEditingStore(null)
              setFormData({ name: '', category: '', address: '', description: '' })
            }}
          >
            {showAddForm ? '취소' : '+ 가게 추가'}
          </Button>
        </div>

        {/* 가게 추가 폼 */}
        {showAddForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>새 가게 추가</CardTitle>
            </CardHeader>
            <form onSubmit={handleAddStore}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="add-name">가게 이름 *</Label>
                  <Input
                    id="add-name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="예: 현민 카페"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="add-category">업종 *</Label>
                  <Input
                    id="add-category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    placeholder="예: 카페, 음식점, 제과점"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="add-address">주소 *</Label>
                  <Input
                    id="add-address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="예: 서울시 강남구"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="add-description">설명 (선택)</Label>
                  <Textarea
                    id="add-description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="가게에 대한 간단한 설명"
                    rows={3}
                  />
                </div>

                <Button type="submit" className="w-full">
                  추가하기
                </Button>
              </CardContent>
            </form>
          </Card>
        )}

        {/* 가게 수정 폼 */}
        {editingStore && (
          <Card className="mb-6 border-primary">
            <CardHeader>
              <CardTitle>가게 정보 수정</CardTitle>
            </CardHeader>
            <form onSubmit={handleEditStore}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">가게 이름 *</Label>
                  <Input
                    id="edit-name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-category">업종 *</Label>
                  <Input
                    id="edit-category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-address">주소 *</Label>
                  <Input
                    id="edit-address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-description">설명 (선택)</Label>
                  <Textarea
                    id="edit-description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={3}
                  />
                </div>

                <div className="flex gap-3">
                  <Button type="submit" className="flex-1">
                    수정하기
                  </Button>
                  <Button type="button" variant="outline" onClick={cancelEdit}>
                    취소
                  </Button>
                </div>
              </CardContent>
            </form>
          </Card>
        )}

        {/* 가게 목록 */}
        <div>
          <h2 className="text-xl font-semibold mb-4">등록된 가게 ({stores.length})</h2>
          
          {stores.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <p className="text-muted-foreground">등록된 가게가 없습니다.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {stores.map((store) => (
                <Card key={store.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle>{store.name}</CardTitle>
                        <CardDescription className="mt-1">
                          {store.category} · {store.address}
                        </CardDescription>
                        {store.description && (
                          <p className="text-sm text-muted-foreground mt-2">
                            {store.description}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          onClick={() => startEdit(store)}
                          variant="outline"
                          size="sm"
                        >
                          수정
                        </Button>
                        <Button
                          onClick={() => handleDeleteStore(store.id)}
                          variant="destructive"
                          size="sm"
                        >
                          삭제
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}