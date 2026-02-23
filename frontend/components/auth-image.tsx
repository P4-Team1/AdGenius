"use client";

import { useEffect, useState } from "react";

interface AuthImageProps {
  src: string;
  alt: string;
  className?: string;
  fallback?: React.ReactNode;
}

/**
 * Authorization 헤더가 필요한 Backend 이미지를 로드하는 컴포넌트.
 * 일반 <img> 태그는 Authorization 헤더를 보낼 수 없으므로
 * fetch로 Blob을 가져와 Object URL을 만들어 표시합니다.
 */
export function AuthImage({ src, alt, className, fallback }: AuthImageProps) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const token = localStorage.getItem("access_token");

    fetch(src, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((res) => {
        if (!res.ok) throw new Error("load failed");
        return res.blob();
      })
      .then((blob) => {
        if (!cancelled) {
          setBlobUrl(URL.createObjectURL(blob));
        }
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });

    return () => {
      cancelled = true;
    };
  }, [src]);

  // Blob URL cleanup
  useEffect(() => {
    return () => {
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
  }, [blobUrl]);

  if (error) {
    return fallback ? <>{fallback}</> : null;
  }

  if (!blobUrl) {
    return (
      <div className={`flex items-center justify-center ${className || ""}`}>
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // eslint-disable-next-line @next/next/no-img-element
  return <img src={blobUrl} alt={alt} className={className} />;
}
