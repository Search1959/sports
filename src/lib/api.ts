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

  async put<T>(path: string, body: any): Promise<T> {
    if (this.mode === 'demo') {
      return this.putLocal<T>(path, body);
    }

    try {
      const res = await fetch(`/api/v1${path}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        console.warn(`PUT /api/v1${path} returned HTTP ${res.status}. Applying locally.`);
        this.setMode('demo');
        return this.putLocal<T>(path, body);
      }

      return await res.json();
    } catch (err) {
      console.warn(`Network error putting to /api/v1${path}. Applying locally.`, err);
      this.setMode('demo');
      return this.putLocal<T>(path, body);
    }
  }

  async delete<T>(path: string): Promise<T> {
    if (this.mode === 'demo') {
      return this.deleteLocal<T>(path);
    }

    try {
      const res = await fetch(`/api/v1${path}`, {
        method: 'DELETE',
        headers: this.getHeaders(),
      });

      if (!res.ok) {
        console.warn(`DELETE /api/v1${path} returned HTTP ${res.status}. Applying locally.`);
        this.setMode('demo');
        return this.deleteLocal<T>(path);
      }

      return await res.json();
    } catch (err) {
      console.warn(`Network error deleting /api/v1${path}. Applying locally.`, err);
      this.setMode('demo');
      return this.deleteLocal<T>(path);
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
    if (cleanPath.startsWith('/training-sessions/') && cleanPath.endsWith('/attendance')) {
      const parts = cleanPath.split('/');
      const sessionId = Number(parts[2]);
      return LocalDataStore.getSessionAttendance(sessionId) as unknown as T;
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
      const allMembers = LocalDataStore.getMembers();
      const nextId = allMembers.length + 1;
      const code = `M-${String(nextId).padStart(6, '0')}`;
      const fullName = body.fullName || `${body.firstName || ''} ${body.lastName || ''}`.trim() || 'New Athlete';
      const mobile = body.mobile || body.phone || '+91 98300 00000';
      const sports = Array.isArray(body.sportsList)
        ? body.sportsList.map((sp: any) => ({
            memberId: nextId,
            sportId: sp.sportId,
            sportName: sp.sportName || 'Sport',
            skillLevel: sp.skillLevel || 'Intermediate',
            position: sp.position || 'Player',
          }))
        : (body.sports || []);

      return LocalDataStore.saveItem('members', allMembers, {
        ...body,
        id: body.id || nextId,
        memberCode: body.memberCode || code,
        memberNumber: body.memberNumber || code,
        fullName,
        firstName: body.firstName || fullName.split(' ')[0],
        lastName: body.lastName || fullName.split(' ').slice(1).join(' '),
        mobile,
        phone: mobile,
        whatsapp: body.whatsapp || mobile,
        whatsappOptIn: body.whatsappOptIn !== undefined ? body.whatsappOptIn : true,
        status: body.status || 'Active',
        sports,
        joiningDate: body.joiningDate || new Date().toISOString().split('T')[0],
        expiryDate: body.expiryDate || new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString().split('T')[0],
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
    if (cleanPath.startsWith('/training-sessions/') && cleanPath.endsWith('/attendance')) {
      const parts = cleanPath.split('/');
      const sessionId = Number(parts[2]);
      const list = body.attendance || body.attendanceList || [];
      return LocalDataStore.saveSessionAttendance(sessionId, list) as unknown as T;
    }
    if (cleanPath === '/training-sessions') {
      return LocalDataStore.saveItem('sessions', LocalDataStore.getSessions(), body) as unknown as T;
    }
    if (cleanPath === '/finance/whatsapp-reminders') {
      return LocalDataStore.sendWhatsAppFeeReminders(body) as unknown as T;
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
    if (cleanPath.startsWith('/sports/')) {
      const sportId = Number(cleanPath.replace('/sports/', ''));
      const sports = LocalDataStore.getSports();
      const updated = LocalDataStore.saveItem('sports', sports, { id: sportId, ...body });
      return updated as unknown as T;
    }
    if (cleanPath.startsWith('/programs/')) {
      const programId = Number(cleanPath.replace('/programs/', ''));
      const programs = LocalDataStore.getPrograms();
      const updated = LocalDataStore.saveItem('programs', programs, { id: programId, ...body });
      return updated as unknown as T;
    }
    if (cleanPath.startsWith('/teams/')) {
      const teamId = Number(cleanPath.replace('/teams/', ''));
      const teams = LocalDataStore.getTeams();
      const updated = LocalDataStore.saveItem('teams', teams, { id: teamId, ...body });
      return updated as unknown as T;
    }
    if (cleanPath.startsWith('/coaches/')) {
      const coachId = Number(cleanPath.replace('/coaches/', ''));
      const coaches = LocalDataStore.getCoaches();
      const updated = LocalDataStore.saveItem('coaches', coaches, { id: coachId, ...body });
      return updated as unknown as T;
    }
    if (cleanPath.startsWith('/facilities/')) {
      const facilityId = Number(cleanPath.replace('/facilities/', ''));
      const facilities = LocalDataStore.getFacilities();
      const updated = LocalDataStore.saveItem('facilities', facilities, { id: facilityId, ...body });
      return updated as unknown as T;
    }
    if (cleanPath.startsWith('/facility-bookings/')) {
      const bookingId = Number(cleanPath.replace('/facility-bookings/', ''));
      const facilities = LocalDataStore.getFacilities();
      let updatedBooking = null;
      for (const fac of facilities) {
        const f = fac as any;
        if (f.bookings && Array.isArray(f.bookings)) {
          const b = f.bookings.find((x: any) => Number(x.id) === Number(bookingId));
          if (b) {
            Object.assign(b, body);
            updatedBooking = b;
            break;
          }
        }
      }
      LocalDataStore.saveItem('facilities', facilities, facilities[0]);
      return (updatedBooking || body) as unknown as T;
    }
    if (cleanPath.includes('/matches/')) {
      const parts = cleanPath.split('/');
      const matchId = Number(parts[parts.length - 1]);
      const updated = LocalDataStore.updateMatch(matchId, body);
      return (updated || body) as unknown as T;
    }
    if (cleanPath.startsWith('/tournaments/')) {
      const tourneyId = Number(cleanPath.replace('/tournaments/', ''));
      const tourneys = LocalDataStore.getTournaments();
      const updated = LocalDataStore.saveItem('tournaments', tourneys, { id: tourneyId, ...body });
      return updated as unknown as T;
    }
    if (cleanPath.startsWith('/training-sessions/')) {
      const sessionId = Number(cleanPath.replace('/training-sessions/', ''));
      const sessions = LocalDataStore.getSessions();
      const updated = LocalDataStore.saveItem('sessions', sessions, { id: sessionId, ...body });
      return updated as unknown as T;
    }
    if (cleanPath.startsWith('/finance/invoices/')) {
      const invoiceId = Number(cleanPath.replace('/finance/invoices/', ''));
      const invoices = LocalDataStore.getInvoices();
      const updated = LocalDataStore.saveItem('invoices', invoices, { id: invoiceId, ...body });
      return updated as unknown as T;
    }
    if (cleanPath.startsWith('/finance/payments/')) {
      const paymentId = Number(cleanPath.replace('/finance/payments/', ''));
      const payments = LocalDataStore.getPayments();
      const updated = LocalDataStore.saveItem('payments', payments, { id: paymentId, ...body });
      return updated as unknown as T;
    }
    if (cleanPath.startsWith('/finance/expenses/')) {
      const expenseId = Number(cleanPath.replace('/finance/expenses/', ''));
      const expenses = LocalDataStore.getExpenses();
      const updated = LocalDataStore.saveItem('expenses', expenses, { id: expenseId, ...body });
      return updated as unknown as T;
    }
    if (cleanPath.startsWith('/finance/donations/')) {
      const donationId = Number(cleanPath.replace('/finance/donations/', ''));
      const donations = LocalDataStore.getDonations();
      const updated = LocalDataStore.saveItem('donations', donations, { id: donationId, ...body });
      return updated as unknown as T;
    }
    if (cleanPath.startsWith('/inventory/')) {
      const equipId = Number(cleanPath.replace('/inventory/', ''));
      const equipment = LocalDataStore.getEquipment();
      const updated = LocalDataStore.saveItem('equipment', equipment, { id: equipId, ...body });
      return updated as unknown as T;
    }
    if (cleanPath.startsWith('/leads/')) {
      const leadId = Number(cleanPath.replace('/leads/', ''));
      const leads = LocalDataStore.getLeads();
      const updated = LocalDataStore.saveItem('leads', leads, { id: leadId, ...body });
      return updated as unknown as T;
    }
    if (cleanPath.startsWith('/certificates/')) {
      const certId = Number(cleanPath.replace('/certificates/', ''));
      const certs = LocalDataStore.getCertificates();
      const updated = LocalDataStore.saveItem('certificates', certs, { id: certId, ...body });
      return updated as unknown as T;
    }
    if (cleanPath.startsWith('/branches/')) {
      const branchId = Number(cleanPath.replace('/branches/', ''));
      const branches = LocalDataStore.getBranches();
      const updated = LocalDataStore.saveItem('branches', branches, { id: branchId, ...body });
      return updated as unknown as T;
    }

    return body as T;
  }

  // Router for local data PUT queries
  private putLocal<T>(path: string, body: any): T {
    return this.patchLocal<T>(path, body);
  }

  // Router for local data DELETE queries
  private deleteLocal<T>(path: string): T {
    const cleanPath = path.split('?')[0];

    if (cleanPath.startsWith('/members/')) {
      const memberId = Number(cleanPath.replace('/members/', ''));
      const success = LocalDataStore.deleteItem('members', LocalDataStore.getMembers(), memberId);
      return { success, id: memberId } as unknown as T;
    }
    if (cleanPath.startsWith('/sports/')) {
      const sportId = Number(cleanPath.replace('/sports/', ''));
      const success = LocalDataStore.deleteItem('sports', LocalDataStore.getSports(), sportId);
      return { success, id: sportId } as unknown as T;
    }
    if (cleanPath.startsWith('/programs/')) {
      const programId = Number(cleanPath.replace('/programs/', ''));
      const success = LocalDataStore.deleteItem('programs', LocalDataStore.getPrograms(), programId);
      return { success, id: programId } as unknown as T;
    }
    if (cleanPath.includes('/players/')) {
      // /teams/:teamId/players/:memberId
      const parts = cleanPath.split('/');
      const teamId = Number(parts[2]);
      const memberId = Number(parts[4]);
      const success = LocalDataStore.removeTeamPlayer(teamId, memberId);
      return { success, teamId, memberId } as unknown as T;
    }
    if (cleanPath.startsWith('/teams/')) {
      const teamId = Number(cleanPath.replace('/teams/', ''));
      const success = LocalDataStore.deleteItem('teams', LocalDataStore.getTeams(), teamId);
      return { success, id: teamId } as unknown as T;
    }
    if (cleanPath.startsWith('/coaches/')) {
      const coachId = Number(cleanPath.replace('/coaches/', ''));
      const success = LocalDataStore.deleteItem('coaches', LocalDataStore.getCoaches(), coachId);
      return { success, id: coachId } as unknown as T;
    }
    if (cleanPath.startsWith('/facilities/')) {
      const facilityId = Number(cleanPath.replace('/facilities/', ''));
      const success = LocalDataStore.deleteItem('facilities', LocalDataStore.getFacilities(), facilityId);
      return { success, id: facilityId } as unknown as T;
    }
    if (cleanPath.startsWith('/facility-bookings/')) {
      const bookingId = Number(cleanPath.replace('/facility-bookings/', ''));
      const success = LocalDataStore.deleteBooking(bookingId);
      return { success, id: bookingId } as unknown as T;
    }
    if (cleanPath.includes('/matches/')) {
      const parts = cleanPath.split('/');
      const matchId = Number(parts[parts.length - 1]);
      const success = LocalDataStore.deleteMatch(matchId);
      return { success, id: matchId } as unknown as T;
    }
    if (cleanPath.startsWith('/tournaments/')) {
      const tourneyId = Number(cleanPath.replace('/tournaments/', ''));
      const success = LocalDataStore.deleteItem('tournaments', LocalDataStore.getTournaments(), tourneyId);
      return { success, id: tourneyId } as unknown as T;
    }
    if (cleanPath.startsWith('/training-sessions/')) {
      const sessionId = Number(cleanPath.replace('/training-sessions/', ''));
      const success = LocalDataStore.deleteItem('sessions', LocalDataStore.getSessions(), sessionId);
      return { success, id: sessionId } as unknown as T;
    }
    if (cleanPath.startsWith('/finance/invoices/')) {
      const invoiceId = Number(cleanPath.replace('/finance/invoices/', ''));
      const success = LocalDataStore.deleteItem('invoices', LocalDataStore.getInvoices(), invoiceId);
      return { success, id: invoiceId } as unknown as T;
    }
    if (cleanPath.startsWith('/finance/payments/')) {
      const paymentId = Number(cleanPath.replace('/finance/payments/', ''));
      const success = LocalDataStore.deleteItem('payments', LocalDataStore.getPayments(), paymentId);
      return { success, id: paymentId } as unknown as T;
    }
    if (cleanPath.startsWith('/finance/expenses/')) {
      const expenseId = Number(cleanPath.replace('/finance/expenses/', ''));
      const success = LocalDataStore.deleteItem('expenses', LocalDataStore.getExpenses(), expenseId);
      return { success, id: expenseId } as unknown as T;
    }
    if (cleanPath.startsWith('/finance/donations/')) {
      const donationId = Number(cleanPath.replace('/finance/donations/', ''));
      const success = LocalDataStore.deleteItem('donations', LocalDataStore.getDonations(), donationId);
      return { success, id: donationId } as unknown as T;
    }
    if (cleanPath.startsWith('/inventory/')) {
      const equipId = Number(cleanPath.replace('/inventory/', ''));
      const success = LocalDataStore.deleteItem('equipment', LocalDataStore.getEquipment(), equipId);
      return { success, id: equipId } as unknown as T;
    }
    if (cleanPath.startsWith('/leads/')) {
      const leadId = Number(cleanPath.replace('/leads/', ''));
      const success = LocalDataStore.deleteItem('leads', LocalDataStore.getLeads(), leadId);
      return { success, id: leadId } as unknown as T;
    }
    if (cleanPath.startsWith('/certificates/')) {
      const certId = Number(cleanPath.replace('/certificates/', ''));
      const success = LocalDataStore.deleteItem('certificates', LocalDataStore.getCertificates(), certId);
      return { success, id: certId } as unknown as T;
    }
    if (cleanPath.startsWith('/branches/')) {
      const branchId = Number(cleanPath.replace('/branches/', ''));
      const success = LocalDataStore.deleteItem('branches', LocalDataStore.getBranches(), branchId);
      return { success, id: branchId } as unknown as T;
    }

    return { success: true } as unknown as T;
  }
}

export const api = new ApiClient();
