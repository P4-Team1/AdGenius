const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
const USE_MOCK = false;

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem("access_token");

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      if (typeof window !== "undefined" && !endpoint.includes("/auth/login")) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("user");
        window.location.href = "/login";
      }
    }
    // Backend의 detail 메시지를 가져와서 더 유용한 에러를 throw
    let errorMessage = `API Error: ${response.status}`;
    try {
      const errorBody = await response.json();
      if (errorBody.detail) {
        errorMessage =
          typeof errorBody.detail === "string"
            ? errorBody.detail
            : JSON.stringify(errorBody.detail);
      }
    } catch {
      // JSON 파싱 실패 시 기본 메시지 유지
    }
    throw new Error(errorMessage);
  }

  return response.json();
}

async function apiCall<T>(
  mockData: T,
  realAPICall: () => Promise<T>,
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
      {
        access_token: "mock-token",
        refresh_token: "mock-refresh",
        user: { email },
      },
      () =>
        fetchAPI("/auth/login", {
          method: "POST",
          body: JSON.stringify({ email, password }),
        }),
    );
  },

  register: async (userData: {
    username: string;
    email: string;
    password: string;
    business_type: string;
  }) => {
    return apiCall({ success: true, message: "회원가입 성공" }, () =>
      fetchAPI("/auth/register", {
        method: "POST",
        body: JSON.stringify(userData),
      }),
    );
  },

  getMe: async () => {
    return apiCall(
      {
        id: 1,
        email: "test@test.com",
        username: "testuser",
        business_type: "restaurant",
        is_verified: true,
        is_active: true,
      },
      () => fetchAPI("/users/me"),
    );
  },

  refresh: async (refreshToken: string) => {
    return apiCall({ access_token: "new-mock-token" }, () =>
      fetchAPI("/auth/refresh", {
        method: "POST",
        body: JSON.stringify({ refresh_token: refreshToken }),
      }),
    );
  },
};

// 가게 API
export const storeAPI = {
  getAll: async () => {
    return fetchAPI("/stores/");
  },

  create: async (storeData: Record<string, unknown>) => {
    return fetchAPI("/stores/", {
      method: "POST",
      body: JSON.stringify(storeData),
    });
  },

  update: async (id: string | number, storeData: Record<string, unknown>) => {
    return fetchAPI(`/stores/${id}`, {
      method: "PUT",
      body: JSON.stringify(storeData),
    });
  },

  delete: async (id: string | number) => {
    return fetchAPI(`/stores/${id}`, {
      method: "DELETE",
    });
  },
};

// 프로젝트 API
export const projectAPI = {
  getAll: async () => {
    return fetchAPI("/projects/");
  },

  getById: async (id: string | number) => {
    return fetchAPI(`/projects/${id}`);
  },

  create: async (projectData: Record<string, unknown>) => {
    return fetchAPI("/projects/", {
      method: "POST",
      body: JSON.stringify(projectData),
    });
  },

  update: async (id: string | number, projectData: Record<string, unknown>) => {
    return fetchAPI(`/projects/${id}`, {
      method: "PUT",
      body: JSON.stringify(projectData),
    });
  },

  delete: async (id: string | number) => {
    return fetchAPI(`/projects/${id}`, {
      method: "DELETE",
    });
  },
};

// 콘텐츠 API
export const contentAPI = {
  generate: async (generateData: Record<string, unknown>) => {
    return fetchAPI("/contents/generate", {
      method: "POST",
      body: JSON.stringify(generateData),
    });
  },

  upload: async (formData: FormData) => {
    return fetch(`${API_BASE_URL}/contents/upload`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
      body: formData,
    }).then((res) => {
      if (!res.ok) {
        if (res.status === 401 && typeof window !== "undefined") {
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          localStorage.removeItem("user");
          window.location.href = "/login";
        }
        throw new Error(`API Error: ${res.status}`);
      }
      return res.json();
    });
  },

  getAll: async (projectId: string | number) => {
    return fetchAPI(`/contents/?project_id=${projectId}`);
  },

  getById: async (id: string | number) => {
    return fetchAPI(`/contents/${id}`);
  },

  delete: async (id: string | number) => {
    return fetchAPI(`/contents/${id}`, {
      method: "DELETE",
    });
  },
};
