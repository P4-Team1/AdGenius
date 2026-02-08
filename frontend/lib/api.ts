const API_BASE_URL = 'http://localhost:8000/api/v1';
const USE_MOCK = true;

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('access_token');
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  return response.json();
}

async function apiCall<T>(
  mockData: T,
  realAPICall: () => Promise<T>
): Promise<T> {
  if (USE_MOCK) {
    await delay(500);
    return mockData;
  }
  return realAPICall();
}

// 인증 API
export const authAPI = {
  login: async (email: string, password: string) => {
    return apiCall(
      { access_token: 'mock-token', refresh_token: 'mock-refresh', user: { email } },
      () => fetchAPI('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      })
    );
  },

  register: async (userData: any) => {
    return apiCall(
      { success: true, message: '회원가입 성공' },
      () => fetchAPI('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      })
    );
  },

  refresh: async (refreshToken: string) => {
    return apiCall(
      { access_token: 'new-mock-token' },
      () => fetchAPI('/auth/refresh', {
        method: 'POST',
        body: JSON.stringify({ refresh_token: refreshToken }),
      })
    );
  },
};

// 가게 API
export const storeAPI = {
  getAll: async () => {
    return apiCall(
      [
        { id: '1', name: '현민 카페', category: '카페', address: '서울시 강남구' },
        { id: '2', name: '현민 베이커리', category: '제과점', address: '서울시 서초구' },
      ],
      () => fetchAPI('/stores')
    );
  },

  create: async (storeData: any) => {
    return apiCall(
      { id: '3', ...storeData },
      () => fetchAPI('/stores', {
        method: 'POST',
        body: JSON.stringify(storeData),
      })
    );
  },

  update: async (id: string, storeData: any) => {
    return apiCall(
      { success: true },
      () => fetchAPI(`/stores/${id}`, {
        method: 'PUT',
        body: JSON.stringify(storeData),
      })
    );
  },

  delete: async (id: string) => {
    return apiCall(
      { success: true },
      () => fetchAPI(`/stores/${id}`, {
        method: 'DELETE',
      })
    );
  },
};

// 프로젝트 API
export const projectAPI = {
  getAll: async () => {
    return apiCall(
      [
        { id: '1', storeId: '1', name: '크리스마스 이벤트', createdAt: '2026-01-15', storeName: '현민 카페' },
        { id: '2', storeId: '1', name: '신메뉴 홍보', createdAt: '2026-02-01', storeName: '현민 베이커리' },
      ],
      () => fetchAPI('/projects')
    );
  },

  getById: async (id: string) => {
    return apiCall(
      { id: '1', storeId: '1', name: '크리스마스 이벤트', createdAt: '2026-01-15' },
      () => fetchAPI(`/projects/${id}`)
    );
  },

  create: async (projectData: any) => {
    return apiCall(
      { id: '3', ...projectData },
      () => fetchAPI('/projects', {
        method: 'POST',
        body: JSON.stringify(projectData),
      })
    );
  },

  update: async (id: string, projectData: any) => {
    return apiCall(
      { success: true },
      () => fetchAPI(`/projects/${id}`, {
        method: 'PUT',
        body: JSON.stringify(projectData),
      })
    );
  },

  delete: async (id: string) => {
    return apiCall(
      { success: true },
      () => fetchAPI(`/projects/${id}`, {
        method: 'DELETE',
      })
    );
  },
};

// 콘텐츠 API
export const contentAPI = {
  generate: async (generateData: any) => {
    return apiCall(
      { id: '1', imageUrl: 'mock-image.jpg', text: 'Mock 생성 텍스트' },
      () => fetchAPI('/contents/generate', {
        method: 'POST',
        body: JSON.stringify(generateData),
      })
    );
  },

  upload: async (formData: FormData) => {
    if (USE_MOCK) {
      await delay(500);
      return { id: '1', url: 'mock-uploaded.jpg' };
    }
    return fetch(`${API_BASE_URL}/contents/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
      },
      body: formData,
    }).then(res => res.json());
  },

  getAll: async (projectId?: string) => {
    return apiCall(
      [
        { id: '1', projectId: '1', type: 'image', url: 'content1.jpg' },
        { id: '2', projectId: '1', type: 'text', content: '광고 문구입니다' },
      ],
      () => fetchAPI(`/contents${projectId ? `?project_id=${projectId}` : ''}`)
    );
  },

  getById: async (id: string) => {
    return apiCall(
      { id: '1', projectId: '1', type: 'image', url: 'content1.jpg' },
      () => fetchAPI(`/contents/${id}`)
    );
  },

  delete: async (id: string) => {
    return apiCall(
      { success: true },
      () => fetchAPI(`/contents/${id}`, {
        method: 'DELETE',
      })
    );
  },
};