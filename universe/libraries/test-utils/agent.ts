import { RawDocument } from '@interfaces/common';
import { envconfig } from '@libraries/envconfig';
import fetch from 'cross-fetch';

const Request = async <T>(
  method: 'POST' | 'GET' | 'PUT' | 'DELETE',
  path: string,
  options?: RequestInit
) => {
  const response = await fetch(`${agent.Endpoint}/${path}`, {
    ...options,
    method,
    headers: {
      'Content-Type': 'application/json',
      Cookie: agent.cookies,
      ...options?.headers
    },
    credentials: 'include'
  });

  const { headers } = response;

  const setCookieHeader = headers.get('set-cookie');

  if (typeof setCookieHeader === 'string') {
    agent.cookies = setCookieHeader;
  }

  let data: T | null = null;

  // Safely parse JSON if the Content-Type is application/json
  if (response.headers.get('Content-Type')?.includes('application/json')) {
    try {
      data = (await response.json()) as T;
    } catch (error) {
      console.error('Failed to parse JSON:', error);
      throw new Error(`Invalid JSON response from ${path}`);
    }
  }

  return {
    status: response.status,
    headers: response.headers,
    data
  };
};

const Post = async <ResponseBody, RequestBody = RawDocument>(
  path: string,
  data: RequestBody,
  options?: RequestInit
) =>
  Request<ResponseBody>('POST', path, {
    ...options,
    body: JSON.stringify(data)
  });

const Get = async <T>(path: string, options?: RequestInit) =>
  Request<T>('GET', path, options);

const Put = async <ResponseBody, RequestBody = RawDocument>(
  path: string,
  data: RequestBody,
  options?: RequestInit
) =>
  Request<ResponseBody>('PUT', path, {
    ...options,
    body: JSON.stringify(data)
  });

const Remove = async <T>(path: string, options?: RequestInit) =>
  Request<T>('DELETE', path, options);

export const agent = {
  cookies: '',
  // Endpoint: envconfig.url.platform,
  Endpoint: "http://localhost:3000",
  Post,
  Get,
  Put,
  Remove
};
