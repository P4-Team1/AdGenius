"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { storeAPI } from "@/lib/api";
import type { Store } from "@/types";
import { Header } from "@/components/header";
import { useAuth } from "@/contexts/auth-context";

export default function StoresPage() {
  const router = useRouter();
  const { logout, isAuthenticated, isLoading: authLoading } = useAuth();
  const [stores, setStores] = useState<Store[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 생성 모달 상태
  const [showModal, setShowModal] = useState(false);
  const [brandName, setBrandName] = useState("");
  const [brandTone, setBrandTone] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.push("/login");
      } else {
        loadStores();
      }
    }
  }, [authLoading, isAuthenticated, router]);

  const loadStores = async () => {
    try {
      setIsLoading(true);
      const data = await storeAPI.getAll();
      setStores(data);
    } catch (error) {
      console.error("Failed to load stores:", error);
      alert("가게 목록을 불러오는데 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateStore = async () => {
    if (!brandName.trim()) {
      alert("브랜드 이름을 입력해주세요.");
      return;
    }

    try {
      setIsSubmitting(true);
      await storeAPI.create({
        brand_name: brandName,
        brand_tone: brandTone,
        description: description,
      });

      // 상태 초기화 및 닫기
      setBrandName("");
      setBrandTone("");
      setDescription("");
      setShowModal(false);

      // 목록 다시 불러오기
      await loadStores();
    } catch (error) {
      console.error("Failed to create store:", error);
      alert("가게 생성에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteStore = async (id: number) => {
    if (
      !confirm(
        "정말로 이 가게를 삭제하시겠습니까? 관련 프로젝트도 영향을 받을 수 있습니다.",
      )
    )
      return;

    try {
      await storeAPI.delete(id);
      await loadStores();
    } catch (error) {
      console.error("Failed to delete store:", error);
      alert("가게 삭제에 실패했습니다.");
    }
  };

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      <Header
        rightButtons={
          <>
            <Button variant="ghost" onClick={() => router.push("/")}>
              대시보드
            </Button>
            <Button variant="ghost" onClick={() => router.push("/projects")}>
              내 프로젝트
            </Button>
            <Button variant="ghost" onClick={() => router.push("/settings")}>
              설정
            </Button>
            <Button
              onClick={logout}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
            >
              로그아웃
            </Button>
          </>
        }
      />

      <div className="container mx-auto px-4 py-8 pt-28 max-w-5xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-black mb-2">내 가게 관리</h1>
            <p className="text-muted-foreground">
              광고를 생성할 브랜드(가게) 프로필을 관리하세요
            </p>
          </div>
          <Button
            onClick={() => setShowModal(true)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white h-12 px-6"
          >
            <span className="text-xl mr-2">+</span>새 가게 등록하기
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stores.length === 0 ? (
              <div className="col-span-full py-12 text-center border-2 border-dashed border-border rounded-xl">
                <div className="text-4xl mb-4">🏪</div>
                <h3 className="text-xl font-bold mb-2">
                  등록된 가게가 없습니다
                </h3>
                <p className="text-muted-foreground mb-6">
                  첫 가게를 등록하고 광고 생성을 시작하세요
                </p>
                <Button variant="outline" onClick={() => setShowModal(true)}>
                  가게 등록하기
                </Button>
              </div>
            ) : (
              stores.map((store) => (
                <Card
                  key={store.id}
                  className="p-6 flex flex-col h-full border-2 hover:border-blue-600/50 transition-colors"
                >
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2 text-foreground">
                      {store.brand_name}
                    </h3>
                    {store.brand_tone && (
                      <div className="inline-block px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-xs font-semibold mb-4">
                        {store.brand_tone}
                      </div>
                    )}
                    {store.description && (
                      <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                        {store.description}
                      </p>
                    )}
                  </div>
                  <div className="pt-4 border-t border-border mt-auto flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => alert("수정 기능 창 띄우기 (진행 예정)")}
                    >
                      수정
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                      onClick={() => handleDeleteStore(store.id)}
                    >
                      삭제
                    </Button>
                  </div>
                </Card>
              ))
            )}
          </div>
        )}
      </div>

      {/* 가게 생성 모달 */}
      {showModal && (
        <>
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-in fade-in duration-200"
            onClick={() => !isSubmitting && setShowModal(false)}
          />
          <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg animate-in zoom-in-95 duration-200">
            <div className="bg-background border-2 border-border rounded-2xl shadow-2xl p-8">
              <div className="mb-6">
                <h2 className="text-3xl font-black mb-2">새 가게 등록</h2>
                <p className="text-muted-foreground">
                  광고의 기준이 될 브랜드 정보를 입력하세요
                </p>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="brand-name">
                    브랜드(가게) 이름 <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="brand-name"
                    placeholder="예: 현민 카페"
                    className="h-12"
                    value={brandName}
                    onChange={(e) => setBrandName(e.target.value)}
                    autoFocus
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="brand-tone">브랜드 톤앤매너</Label>
                  <Input
                    id="brand-tone"
                    placeholder="예: 따뜻한, 전문적인, 친근한"
                    className="h-12"
                    value={brandTone}
                    onChange={(e) => setBrandTone(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="store-description">가게 설명</Label>
                  <textarea
                    id="store-description"
                    placeholder="가게의 주요 특징이나 주력 상품을 설명해주세요"
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
                  onClick={() => setShowModal(false)}
                  disabled={isSubmitting}
                >
                  취소
                </Button>
                <Button
                  className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold"
                  onClick={handleCreateStore}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "등록 중..." : "가게 등록"}
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
