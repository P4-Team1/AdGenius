export interface User {
  id: number;
  username: string;
  email: string;
  business_type: string;
  is_verified: boolean;
  is_active: boolean;
}

export interface Project {
  id: number;
  store_id: number;
  title: string;
  description?: string;
  status: "draft" | "completed" | "archived";
  created_at: string;
  updated_at?: string;
}

export interface Content {
  id: number;
  project_id: number;
  type: "text_ad" | "image_gen" | "background_removal" | "sketch_to_image";
  user_prompt?: string;
  image_prompt?: string;
  optimized_prompt?: string;
  ad_copy?: string;
  original_image_path?: string;
  result_image_path?: string;
  ai_config?: Record<string, unknown>;
  generation_time?: number;
  is_success: boolean;
  error_message?: string;
  created_at: string;
  updated_at?: string;
}

export interface AdSettings {
  ratio: string;
  style: string;
  colors: string[];
  resolution: string;
}

export interface Platform {
  id: string;
  name: string;
  icon: string;
  ratio: string;
  description: string;
  color: string;
  features?: string[];
}

export interface Store {
  id: number;
  user_id: number;
  brand_name: string;
  brand_tone: string;
  description?: string;
}
