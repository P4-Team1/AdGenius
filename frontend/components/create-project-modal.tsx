"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { storeAPI, projectAPI } from "@/lib/api";
import type { Store } from "@/types";

interface CreateProjectModalProps {
  open: boolean;
  onClose: () => void;
}

export function CreateProjectModal({ open, onClose }: CreateProjectModalProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [storeId, setStoreId] = useState<number | "">("");
  const [stores, setStores] = useState<Store[]>([]);
  const [isLoadingStores, setIsLoadingStores] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (open) {
      loadStores();
    } else {
      // 모달 닫힐 때 상태 초기화
      setName("");
      setDescription("");
      setStoreId("");
    }
  }, [open]);

  if (!open) return null;

  const loadStores = async () => {
    try {
      setIsLoadingStores(true);
      const data = await storeAPI.getAll();
      setStores(data);
      if (data.length > 0) {
        setStoreId(data[0].id);
      }
    } catch (error) {
      console.error("Failed to load stores:", error);
    } finally {
      setIsLoadingStores(false);
    }
  };

  const handleCreate = async () => {
    if (!name.trim()) {
      alert("프로젝트 이름을 입력해주세요");
      return;
    }
    if (!storeId) {
      alert("연결할 가게를 선택해주세요. 가게가 없다면 먼저 생성해야 합니다.");
      return;
    }

    try {
      setIsCreating(true);
      const newProject = await projectAPI.create({
        title: name,
        description: description,
        store_id: storeId,
      });

      router.push(`/projects/${newProject.id}`);
      onClose();
    } catch (error) {
      console.error("Failed to create project:", error);
      alert("프로젝트 생성에 실패했습니다.");
    } finally {
      setIsCreating(false);
    }
  };

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
              <Label htmlFor="store-select">
                연결할 가게 <span className="text-red-500">*</span>
              </Label>
              {isLoadingStores ? (
                <div className="text-sm text-muted-foreground py-2">
                  가게 목록 불러오는 중...
                </div>
              ) : stores.length > 0 ? (
                <select
                  id="store-select"
                  className="w-full h-12 px-3 border border-border rounded-lg bg-background text-base"
                  value={storeId}
                  onChange={(e) => setStoreId(Number(e.target.value))}
                >
                  <option value="" disabled>
                    가게를 선택해주세요
                  </option>
                  {stores.map((store) => (
                    <option key={store.id} value={store.id}>
                      {store.brand_name}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="p-4 bg-muted/50 rounded-lg text-sm text-center">
                  <p className="mb-2">아직 등록된 가게가 없습니다.</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      onClose();
                      router.push("/stores");
                    }}
                  >
                    새 가게 등록하기 →
                  </Button>
                </div>
              )}
            </div>

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
              <Label htmlFor="project-description">설명 (선택)</Label>
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
              {isCreating ? "생성 중..." : "프로젝트 생성"}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
