import { LocalDataStore } from './localDataStore.ts';

export type ApiMode = 'cloud' | 'demo';

type ModeChangeListener = (mode: ApiMode) => void;

export class ApiClient {
  private orgId: number = 1;
  private mode: ApiMode = 'cloud';
  private listeners: ModeChangeListener[] = [];

  constructor() {
    // Check if user previously chose demo mode
    try {
      const savedMode = localStorage.getItem('bys_app_mode');
      if (savedMode === 'demo') {
        this.mode = 'demo';
      }
    } catch {
      // ignore
    }
  }

  getMode(): ApiMode {
    return this.mode;
  }

  setMode(mode: ApiMode) {
    this.mode = mode;
    try {
      localStorage.setItem('bys_app_mode', mode);
    } catch {
      // ignore
    }
    this.notifyModeChange();
  }

  onModeChange(fn: ModeChangeListener) {
    this.listeners.push(fn);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== fn);
    };
  }

  private notifyModeChange() {
    this.listeners.forEach((l) => l(this.mode));
  }

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
    // If explicitly in demo mode, serve from local store immediately
    if (this.mode === 'demo') {
      return this.getLocal<T>(path);
    }

    try {
      const res = await fetch(`/api/v1${path}`, {
        headers: this.getHeaders(),
      });

      if (!res.ok) {
        // Backend returned non-200 (e.g. 500 DB connection error on Vercel)
        console.warn(`API /api/v1${path} returned HTTP ${res.status}. Falling back to Local Data Sandbox.`);
        this.setMode('demo');
        return this.getLocal<T>(path);
      }

      return await res.json();
    } catch (err) {
      console.warn(`Network error fetching /api/v1${path}. Switching to Local Data Sandbox.`, err);
      this.setMode('demo');
      return this.getLocal<T>(path);
    }
  }

  async post<T>(path: string, body: any): Promise<T> {
    if (this.mode === 'demo') {
      return this.postLocal<T>(path, body);
    }

    try {
      const res = await fetch(`/api/v1${path}`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        console.warn(`POST /api/v1${path} returned HTTP ${res.status}. Storing locally.`);
        this.setMode('demo');
        return this.postLocal<T>(path, body);
      }

      return await res.json();
    } catch (err) {
      console.warn(`Network error posting /api/v1${path}. Storing locally.`, err);
      this.setMode('demo');
      return this.postLocal<T>(path, body);
    }
  }

  async patch<T>(path: string, body: any): Promise<T> {
    if (this.mode === 'demo') {
      return this.patchLocal<T>(path, body);
    }

    try {
      const res = await fetch(`/api/v1${path}`, {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        console.warn(`PATCH /api/v1${path} returned HTTP ${res.status}. Applying locally.`);
        this.setMode('demo');
        return this.patchLocal<T>(path, body);
      }

      return await res.json();
    } catch (err) {
      console.warn(`Network error patching /api/v1${path}. Applying locally.`, err);
      this.setMode('demo');
      return this.patchLocal<T>(path, body);
    }
  }

  // Router for local data GET queries
  private getLocal<T>(path: string): T {
    const cleanPath = path.split('?')[0];

    if (cleanPath === '/organizations') {
      return LocalDataStore.getOrganizations() as unknown as T;
    }
    if (cleanPath.startsWith('/organizations/')) {
      const orgs = LocalDataStore.getOrganizations();
      const idOrSlug = cleanPath.replace('/organizations/', '');
      const org = orgs.find((o: any) => String(o.id) === idOrSlug || o.slug === idOrSlug) || orgs[0];
      return org as unknown as T;
    }
    if (cleanPath === '/dashboard/stats') {
      return LocalDataStore.getStats() as unknown as T;
    }
    if (cleanPath === '/members') {
      return LocalDataStore.getMembers() as unknown as T;
    }
    if (cleanPath === '/sports') {
      return LocalDataStore.getSports() as unknown as T;
    }
    if (cleanPath === '/programs') {
      return LocalDataStore.getPrograms() as unknown as T;
    }
    if (cleanPath === '/coaches') {
      return LocalDataStore.getCoaches() as unknown as T;
    }
    if (cleanPath === '/teams') {
      return LocalDataStore.getTeams() as unknown as T;
    }
    if (cleanPath === '/training-sessions') {
      return LocalDataStore.getSessions() as unknown as T;
    }
    if (cleanPath === '/facilities') {
      return LocalDataStore.getFacilities() as unknown as T;
    }
    if (cleanPath === '/tournaments') {
      return LocalDataStore.getTournaments() as unknown as T;
    }
    if (cleanPath.startsWith('/tournaments/') && cleanPath.endsWith('/matches')) {
      const tourneys = LocalDataStore.getTournaments();
      const parts = cleanPath.split('/');
      const tourneyId = Number(parts[2]);
      const found = tourneys.find((t: any) => t.id === tourneyId);
      return (found?.matches || []) as unknown as T;
    }
    if (cleanPath === '/finance/invoices') {
      return LocalDataStore.getInvoices() as unknown as T;
    }
    if (cleanPath === '/finance/payments') {
      return LocalDataStore.getPayments() as unknown as T;
    }
    if (cleanPath === '/finance/expenses') {
      return LocalDataStore.getExpenses() as unknown as T;
    }
    if (cleanPath === '/finance/donations') {
      return LocalDataStore.getDonations() as unknown as T;
    }
    if (cleanPath === '/finance/summary') {
      return LocalDataStore.getFinanceSummary() as unknown as T;
    }
    if (cleanPath === '/inventory') {
      return LocalDataStore.getEquipment() as unknown as T;
    }
    if (cleanPath === '/leads') {
      return LocalDataStore.getLeads() as unknown as T;
    }
    if (cleanPath === '/whatsapp/templates') {
      return LocalDataStore.getTemplates() as unknown as T;
    }
    if (cleanPath === '/whatsapp/messages') {
      return LocalDataStore.getMessages() as unknown as T;
    }
    if (cleanPath === '/certificates') {
      return LocalDataStore.getCertificates() as unknown as T;
    }
    if (cleanPath.startsWith('/certificates/verify/')) {
      const token = cleanPath.replace('/certificates/verify/', '');
      const certs = LocalDataStore.getCertificates();
      const match = certs.find((c: any) => c.verificationToken === token);
      return { verified: Boolean(match), certificate: match || null } as unknown as T;
    }
    if (cleanPath === '/branches') {
      return LocalDataStore.getBranches() as unknown as T;
    }
    if (cleanPath === '/events') {
      return LocalDataStore.getEvents() as unknown as T;
    }

    return [] as unknown as T;
  }

  // Router for local data POST queries
  private postLocal<T>(path: string, body: any): T {
    const cleanPath = path.split('?')[0];

    if (cleanPath === '/tournaments') {
      return LocalDataStore.saveItem('tournaments', LocalDataStore.getTournaments(), {
        ...body,
        status: body.status || 'Upcoming',
        matches: body.matches || [],
      }) as unknown as T;
    }
    if (cleanPath.startsWith('/tournaments/') && cleanPath.endsWith('/matches')) {
      const parts = cleanPath.split('/');
      const tourneyId = Number(parts[2]);
      const tourneys = LocalDataStore.getTournaments();
      const tourney = tourneys.find((t: any) => t.id === tourneyId);
      const newMatch = { id: Date.now(), tournamentId: tourneyId, ...body };
      if (tourney) {
        tourney.matches = tourney.matches || [];
        tourney.matches.push(newMatch);
        LocalDataStore.saveItem('tournaments', tourneys, tourney);
      }
      return newMatch as unknown as T;
    }
    if (cleanPath === '/members') {
      return LocalDataStore.saveItem('members', LocalDataStore.getMembers(), {
        ...body,
        memberNumber: body.memberNumber || `BYS-2026-${Math.floor(100 + Math.random() * 900)}`,
        status: body.status || 'Active',
      }) as unknown as T;
    }
    if (cleanPath === '/teams') {
      return LocalDataStore.saveItem('teams', LocalDataStore.getTeams(), body) as unknown as T;
    }
    if (cleanPath === '/coaches') {
      return LocalDataStore.saveItem('coaches', LocalDataStore.getCoaches(), body) as unknown as T;
    }
    if (cleanPath === '/sports') {
      return LocalDataStore.saveItem('sports', LocalDataStore.getSports(), body) as unknown as T;
    }
    if (cleanPath === '/facilities') {
      return LocalDataStore.saveItem('facilities', LocalDataStore.getFacilities(), body) as unknown as T;
    }
    if (cleanPath === '/training-sessions') {
      return LocalDataStore.saveItem('sessions', LocalDataStore.getSessions(), body) as unknown as T;
    }
    if (cleanPath === '/finance/invoices') {
      return LocalDataStore.saveItem('invoices', LocalDataStore.getInvoices(), {
        ...body,
        invoiceNumber: body.invoiceNumber || `INV-2026-${Math.floor(100 + Math.random() * 900)}`,
        status: body.status || 'due',
      }) as unknown as T;
    }
    if (cleanPath === '/finance/payments') {
      return LocalDataStore.saveItem('payments', LocalDataStore.getPayments(), {
        ...body,
        paidAt: body.paidAt || new Date().toISOString().split('T')[0],
      }) as unknown as T;
    }
    if (cleanPath === '/finance/expenses') {
      return LocalDataStore.saveItem('expenses', LocalDataStore.getExpenses(), body) as unknown as T;
    }
    if (cleanPath === '/finance/donations') {
      return LocalDataStore.saveItem('donations', LocalDataStore.getDonations(), body) as unknown as T;
    }
    if (cleanPath === '/inventory') {
      return LocalDataStore.saveItem('equipment', LocalDataStore.getEquipment(), body) as unknown as T;
    }
    if (cleanPath === '/leads') {
      return LocalDataStore.saveItem('leads', LocalDataStore.getLeads(), {
        ...body,
        createdAt: new Date().toISOString(),
      }) as unknown as T;
    }
    if (cleanPath === '/certificates') {
      return LocalDataStore.saveItem('certificates', LocalDataStore.getCertificates(), {
        ...body,
        certificateNumber: body.certificateNumber || `CERT-${Date.now()}`,
        verificationToken: `v-${Math.random().toString(36).substring(2, 9)}`,
      }) as unknown as T;
    }
    if (cleanPath === '/branches') {
      return LocalDataStore.saveItem('branches', LocalDataStore.getBranches(), body) as unknown as T;
    }
    if (cleanPath === '/organizations') {
      return LocalDataStore.saveItem('organizations', LocalDataStore.getOrganizations(), body) as unknown as T;
    }

    return body as T;
  }

  // Router for local data PATCH queries
  private patchLocal<T>(path: string, body: any): T {
    const cleanPath = path.split('?')[0];

    if (cleanPath.startsWith('/matches/')) {
      const matchId = Number(cleanPath.replace('/matches/', ''));
      const updated = LocalDataStore.updateMatch(matchId, body);
      return updated as unknown as T;
    }
    if (cleanPath.startsWith('/organizations/')) {
      const orgId = Number(cleanPath.replace('/organizations/', ''));
      const orgs = LocalDataStore.getOrganizations();
      const updated = LocalDataStore.saveItem('organizations', orgs, { id: orgId, ...body });
      return updated as unknown as T;
    }
    if (cleanPath.startsWith('/members/')) {
      const memberId = Number(cleanPath.replace('/members/', ''));
      const members = LocalDataStore.getMembers();
      const updated = LocalDataStore.saveItem('members', members, { id: memberId, ...body });
      return updated as unknown as T;
    }
    if (cleanPath.startsWith('/tournaments/')) {
      const tourneyId = Number(cleanPath.replace('/tournaments/', ''));
      const tourneys = LocalDataStore.getTournaments();
      const updated = LocalDataStore.saveItem('tournaments', tourneys, { id: tourneyId, ...body });
      return updated as unknown as T;
    }

    return body as T;
  }
}

export const api = new ApiClient();
