import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE ?? 'http://localhost:8000';

export const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.detail ||
      error.message ||
      'Không thể kết nối tới máy chủ. Vui lòng thử lại.';
    console.error('API error:', error);
    return Promise.reject(new Error(message));
  },
);

export interface GenerateResponse {
  private_key: string;
  public_key: string;
  address: string;
}

export interface SignPayload {
  message: string;
  private_key: string;
  personal?: boolean;
}

export interface SignResponse {
  signature: string;
  message: string;
  address: string;
  message_hash: string;
  v: number;
  r: string;
  s: string;
  is_low_s: boolean;
}

export interface VerifyPayload {
  message: string;
  signature: string;
  personal?: boolean;
  address?: string;
  public_key?: string;
}

export interface VerifyResponse {
  valid: boolean;
  address?: string | null;
  message_hash?: string | null;
  match_expected?: boolean | null;
}

export const walletApi = {
  generate: async (): Promise<GenerateResponse> => {
    const { data } = await api.post<GenerateResponse>('/api/wallet/generate');
    return data;
  },
  sign: async (payload: SignPayload): Promise<SignResponse> => {
    const { data } = await api.post<SignResponse>('/api/wallet/sign', payload);
    return data;
  },
  verify: async (payload: VerifyPayload): Promise<VerifyResponse> => {
    const { data } = await api.post<VerifyResponse>('/api/wallet/verify', payload);
    return data;
  },
};

