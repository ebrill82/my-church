import type { User, Church } from './store'

const API_BASE = '/api'

class ApiClient {
  private async request<T>(path: string, options?: RequestInit): Promise<T> {
    const res = await fetch(`${API_BASE}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    })

    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: 'Erreur serveur' }))
      throw new Error(error.message || 'Erreur serveur')
    }

    return res.json()
  }

  // Auth
  async login(email: string, password: string) {
    return this.request<{ user: User; church?: Church }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
  }

  async register(data: {
    email: string
    password: string
    firstName: string
    lastName: string
    phone?: string
    churchId?: string
  }) {
    return this.request<{ user: User; church?: Church }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async getMe() {
    return this.request<{ user: User; church?: Church }>('/auth/me')
  }

  async logout() {
    return this.request('/auth/logout', { method: 'POST' })
  }

  // Churches
  async getChurches() {
    return this.request<Church[]>('/churches')
  }

  async getChurch(id: string) {
    return this.request<Church>(`/churches/${id}`)
  }

  // Activities
  async getActivities(churchId: string, params?: Record<string, string>) {
    const searchParams = new URLSearchParams({ churchId })
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value) searchParams.set(key, value)
      })
    }
    return this.request(`/activities?${searchParams.toString()}`)
  }

  async createActivity(data: Record<string, unknown>) {
    return this.request('/activities', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  // Appointments
  async getAppointments(churchId: string, params?: Record<string, string>) {
    const query = params ? '&' + new URLSearchParams(params).toString() : ''
    return this.request(`/appointments?churchId=${churchId}${query}`)
  }

  async createAppointment(data: Record<string, unknown>) {
    return this.request('/appointments', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  // Groups
  async getGroups(churchId: string) {
    return this.request(`/groups?churchId=${churchId}`)
  }

  async createGroup(data: Record<string, unknown>) {
    return this.request('/groups', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  // Donations
  async getDonations(churchId: string, params?: Record<string, string>) {
    const query = params ? '&' + new URLSearchParams(params).toString() : ''
    return this.request(`/donations?churchId=${churchId}${query}`)
  }

  async createDonation(data: Record<string, unknown>) {
    return this.request('/donations', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  // Certificates
  async getCertificates(churchId: string) {
    return this.request(`/certificates?churchId=${churchId}`)
  }

  async createCertificate(data: Record<string, unknown>) {
    return this.request('/certificates', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  // Members
  async getMembers(churchId: string, params?: Record<string, string>) {
    const query = params ? '&' + new URLSearchParams(params).toString() : ''
    return this.request(`/churches/${churchId}/members${query ? '?' + query : ''}`)
  }

  // Stats
  async getDashboardStats(churchId: string) {
    return this.request(`/stats?churchId=${churchId}`)
  }
}

export const api = new ApiClient()
