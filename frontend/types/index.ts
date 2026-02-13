export interface User {
  id: string
  name: string
  email: string
}

export interface Project {
  id: string
  name: string
  description?: string
  storeId?: string
  storeName?: string
  adsCount: number
  createdAt: string
  thumbnail?: string
}

export interface Ad {
  id: string
  projectId: string
  name: string
  platform: string
  platformIcon: string
  platformName: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  statusText: string
  statusColor: string
  createdAt: string
  updatedAt?: string
  thumbnail?: string
  prompt?: string
  settings?: AdSettings
}

export interface AdSettings {
  ratio: string
  style: string
  colors: string[]
  resolution: string
}

export interface Platform {
  id: string
  name: string
  icon: string
  ratio: string
  description: string
  color: string
  features?: string[]
}

export interface Store {
  id: string
  name: string
  category: string
  address: string
}
