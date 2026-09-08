export class ApiClient {
  private orgId: number = 1;

  setOrgId(id: number) {
    this.orgId = id;
  }

  getOrgId(): number {
    return this.orgId;
  }

  private getHeaders(): HeadersInit {
    return {
      'Content-Type': 'application/json',
      'x-organization-id': String(this.orgId),
    };
  }

  async get<T>(path: string): Promise<T> {
    const res = await fetch(`/api/v1${path}`, {
      headers: this.getHeaders(),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(err.error || `HTTP ${res.status}`);
    }
    return res.json();
  }

  async post<T>(path: string, body: any): Promise<T> {
    const res = await fetch(`/api/v1${path}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(err.error || `HTTP ${res.status}`);
    }
    return res.json();
  }

  async patch<T>(path: string, body: any): Promise<T> {
    const res = await fetch(`/api/v1${path}`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(err.error || `HTTP ${res.status}`);
    }
    return res.json();
  }
}

export const api = new ApiClient();
