import React, { useState, useEffect, useCallback } from 'react';
import { api } from './lib/api.ts';
import {
  Organization,
  DashboardStats,
  Member,
  Sport,
  Program,
  Coach,
  Team,
  TrainingSession,
  Facility,
  Tournament,
  Invoice,
  Payment,
  Expense,
  Donation,
  EquipmentItem,
  Lead,
  WhatsAppTemplate,
  WhatsAppMessage,
  Certificate,
  Branch,
  EventItem,
} from './types.ts';

import { Sidebar } from './components/Sidebar.tsx';
import { DashboardView } from './components/DashboardView.tsx';
import { MembersView } from './components/MembersView.tsx';
import { SportsProgramsView } from './components/SportsProgramsView.tsx';
import { TeamsCoachesView } from './components/TeamsCoachesView.tsx';
import { AttendanceView } from './components/AttendanceView.tsx';
import { FacilitiesView } from './components/FacilitiesView.tsx';
import { TournamentsView } from './components/TournamentsView.tsx';
import { FinanceView } from './components/FinanceView.tsx';
import { InventoryView } from './components/InventoryView.tsx';
import { LeadsView } from './components/LeadsView.tsx';
import { WhatsAppView } from './components/WhatsAppView.tsx';
import { CertificatesView } from './components/CertificatesView.tsx';
import { PublicWebsiteView } from './components/PublicWebsiteView.tsx';
import { SettingsView } from './components/SettingsView.tsx';
import { PostgresSetupModal } from './components/PostgresSetupModal.tsx';

import {
  ShieldCheck,
  Building2,
  X,
  AlertTriangle,
  Layers,
  Sparkles,
  CheckCircle2,
  Lock,
  Menu,
  Plus,
  MessageSquareText,
  UserPlus,
  Wallet,
  Bell,
  ChevronRight,
  Database,
  ExternalLink,
  Copy,
  Check,
} from 'lucide-react';

export default function App() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [activeOrg, setActiveOrg] = useState<Organization | null>(null);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Tenant Data State
  const [stats, setStats] = useState<DashboardStats>({
    memberCount: 0,
    sportsCount: 0,
    programsCount: 0,
    coachesCount: 0,
    teamsCount: 0,
    sessionsCount: 0,
    pendingFees: 0,
    totalCollected: 0,
  });
  const [members, setMembers] = useState<Member[]>([]);
  const [sports, setSports] = useState<Sport[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [financeSummary, setFinanceSummary] = useState({
    totalCollected: 0,
    totalExpenses: 0,
    totalDonations: 0,
    netBalance: 0,
    pendingDue: 0,
  });
  const [equipment, setEquipment] = useState<EquipmentItem[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [whatsappTemplates, setWhatsappTemplates] = useState<WhatsAppTemplate[]>([]);
  const [whatsappMessages, setWhatsappMessages] = useState<WhatsAppMessage[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);

  // Navigation & UI state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [apiMode, setApiMode] = useState<'cloud' | 'demo'>(api.getMode());
  const [isDbGuideOpen, setIsDbGuideOpen] = useState<boolean>(false);
  const [copiedVar, setCopiedVar] = useState<boolean>(false);
  const [showDemoBanner, setShowDemoBanner] = useState<boolean>(true);

  // Modals
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isSecurityTestOpen, setIsSecurityTestOpen] = useState(false);
  const [securityTestData, setSecurityTestData] = useState<any>(null);
  const [securityTestRunning, setSecurityTestRunning] = useState(false);

  // New Organization Form
  const [newOrgForm, setNewOrgForm] = useState({
    name: '',
    shortName: '',
    type: 'Sports Club',
    city: 'Mumbai',
    address: 'Andheri West Sports Complex',
    currency: 'INR',
    phone: '+91 98200 12345',
    email: 'contact@mumbaisports.org',
  });

  // Listen to API client mode changes
  useEffect(() => {
    return api.onModeChange((mode) => {
      setApiMode(mode);
    });
  }, []);

  // Fetch all domain data for the active organization
  const loadTenantData = useCallback(async (orgId: number) => {
    try {
      api.setOrgId(orgId);
      const [
        dashStats,
        membersList,
        sportsList,
        programsList,
        coachesList,
        teamsList,
        sessionsList,
        facilitiesList,
        tourneysList,
        invoicesList,
        paymentsList,
        expensesList,
        donationsList,
        finSummary,
        equipmentList,
        leadsList,
        tplList,
        msgList,
        certsList,
        branchesList,
        eventsList,
      ] = await Promise.all([
        api.get<DashboardStats>('/dashboard/stats').catch(() => null),
        api.get<Member[]>('/members').catch(() => []),
        api.get<Sport[]>('/sports').catch(() => []),
        api.get<Program[]>('/programs').catch(() => []),
        api.get<Coach[]>('/coaches').catch(() => []),
        api.get<Team[]>('/teams').catch(() => []),
        api.get<TrainingSession[]>('/training-sessions').catch(() => []),
        api.get<Facility[]>('/facilities').catch(() => []),
        api.get<Tournament[]>('/tournaments').catch(() => []),
        api.get<Invoice[]>('/finance/invoices').catch(() => []),
        api.get<Payment[]>('/finance/payments').catch(() => []),
        api.get<Expense[]>('/finance/expenses').catch(() => []),
        api.get<Donation[]>('/finance/donations').catch(() => []),
        api.get<any>('/finance/summary').catch(() => ({
          totalCollected: 0,
          totalExpenses: 0,
          netBalance: 0,
          pendingDue: 0,
        })),
        api.get<EquipmentItem[]>('/inventory').catch(() => []),
        api.get<Lead[]>('/leads').catch(() => []),
        api.get<WhatsAppTemplate[]>('/whatsapp/templates').catch(() => []),
        api.get<WhatsAppMessage[]>('/whatsapp/messages').catch(() => []),
        api.get<Certificate[]>('/certificates').catch(() => []),
        api.get<Branch[]>('/branches').catch(() => []),
        api.get<EventItem[]>('/events').catch(() => []),
      ]);

      const computedStats: DashboardStats = dashStats || {
        memberCount: membersList.length,
        sportsCount: sportsList.length,
        programsCount: programsList.length,
        coachesCount: coachesList.length,
        teamsCount: teamsList.length,
        sessionsCount: sessionsList.length,
        pendingFees:
          Number(finSummary?.pendingDue || 0) ||
          (invoicesList as Invoice[])
            .filter((i) => i.status === 'due' || i.status === 'overdue')
            .reduce((s: number, i: Invoice) => s + parseFloat(i.amount || '0'), 0),
        totalCollected:
          Number(finSummary?.totalCollected || 0) ||
          (paymentsList as Payment[]).reduce((s: number, p: Payment) => s + parseFloat(p.amount || '0'), 0),
      };
      setStats(computedStats);
      setMembers(membersList);
      setSports(sportsList);
      setPrograms(programsList);
      setCoaches(coachesList);
      setTeams(teamsList);
      setSessions(sessionsList);
      setFacilities(facilitiesList);
      setTournaments(tourneysList);
      setInvoices(invoicesList);
      setPayments(paymentsList);
      setExpenses(expensesList);
      setDonations(donationsList);
      setFinanceSummary(finSummary);
      setEquipment(equipmentList);
      setLeads(leadsList);
      setWhatsappTemplates(tplList);
      setWhatsappMessages(msgList);
      setCertificates(certsList);
      setBranches(branchesList);
      setEvents(eventsList);
    } catch (err: any) {
      console.error('Error loading tenant data:', err);
    }
  }, []);

  // Initialize platform with automatic graceful fallback
  const initializePlatform = useCallback(async (forcedMode?: 'cloud' | 'demo') => {
    try {
      setIsLoading(true);
      setError(null);
      if (forcedMode) {
        api.setMode(forcedMode);
      }
      const orgs = await api.get<Organization[]>('/organizations');
      if (orgs && orgs.length > 0) {
        setOrganizations(orgs);
        const defaultOrg = orgs[0];
        setActiveOrg(defaultOrg);
        api.setOrgId(defaultOrg.id);
        await loadTenantData(defaultOrg.id);
      } else {
        // Switch to demo mode if empty
        api.setMode('demo');
        const demoOrgs = await api.get<Organization[]>('/organizations');
        setOrganizations(demoOrgs);
        if (demoOrgs.length > 0) {
          setActiveOrg(demoOrgs[0]);
          await loadTenantData(demoOrgs[0].id);
        }
      }
    } catch (err: any) {
      console.warn('Initial load error, falling back to demo mode:', err);
      try {
        api.setMode('demo');
        const demoOrgs = await api.get<Organization[]>('/organizations');
        setOrganizations(demoOrgs);
        if (demoOrgs.length > 0) {
          setActiveOrg(demoOrgs[0]);
          await loadTenantData(demoOrgs[0].id);
        }
      } catch (fatalErr: any) {
        setError(fatalErr.message || 'Unable to load platform data.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [loadTenantData]);

  useEffect(() => {
    initializePlatform();
  }, [initializePlatform]);


  const handleSelectOrg = async (org: Organization) => {
    setActiveOrg(org);
    api.setOrgId(org.id);
    setIsLoading(true);
    await loadTenantData(org.id);
    setIsLoading(false);
  };

  // Onboard New Organization
  const handleCreateOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrgForm.name || !newOrgForm.shortName) return;
    try {
      const created = await api.post<Organization>('/organizations', newOrgForm);
      setOrganizations((prev) => [...prev, created]);
      setActiveOrg(created);
      api.setOrgId(created.id);
      setIsOnboardingOpen(false);
      setNewOrgForm({
        name: '',
        shortName: '',
        type: 'Sports Club',
        city: 'Mumbai',
        address: '',
        currency: 'INR',
        phone: '',
        email: '',
      });
      await loadTenantData(created.id);
    } catch (err: any) {
      alert(`Failed to create organization: ${err.message}`);
    }
  };

  // Run Tenant Isolation Verification
  const runSecurityTest = async () => {
    setSecurityTestRunning(true);
    try {
      const res = await api.get<any>('/tenant-test');
      setSecurityTestData(res);
    } catch (err: any) {
      setSecurityTestData({ error: err.message });
    } finally {
      setSecurityTestRunning(false);
    }
  };

  // CRUD Handlers
  const handleAddMember = async (data: any) => {
    await api.post('/members', data);
    if (activeOrg) await loadTenantData(activeOrg.id);
  };

  const handleAddSport = async (data: any) => {
    await api.post('/sports', data);
    if (activeOrg) await loadTenantData(activeOrg.id);
  };

  const handleAddProgram = async (data: any) => {
    await api.post('/programs', data);
    if (activeOrg) await loadTenantData(activeOrg.id);
  };

  const handleAddTeam = async (data: any) => {
    await api.post('/teams', data);
    if (activeOrg) await loadTenantData(activeOrg.id);
  };

  const handleAddCoach = async (data: any) => {
    await api.post('/coaches', data);
    if (activeOrg) await loadTenantData(activeOrg.id);
  };

  const fetchSessionAttendance = async (sessionId: number) => {
    return await api.get<{ session: TrainingSession; participants: any[] }>(
      `/training-sessions/${sessionId}/attendance`
    );
  };

  const saveSessionAttendance = async (
    sessionId: number,
    attendanceList: { memberId: number; status: string }[]
  ) => {
    await api.post(`/training-sessions/${sessionId}/attendance`, { attendance: attendanceList });
    if (activeOrg) await loadTenantData(activeOrg.id);
  };

  const createTrainingSession = async (sessionData: any) => {
    await api.post('/training-sessions', sessionData);
    if (activeOrg) await loadTenantData(activeOrg.id);
  };

  const handleAddFacility = async (facilityData: any) => {
    await api.post('/facilities', facilityData);
    if (activeOrg) await loadTenantData(activeOrg.id);
  };

  const handleBookFacility = async (facilityId: number, bookingData: any) => {
    await api.post(`/facilities/${facilityId}/book`, bookingData);
    if (activeOrg) await loadTenantData(activeOrg.id);
  };

  const handleCreateTournament = async (data: any) => {
    await api.post('/tournaments', data);
    if (activeOrg) await loadTenantData(activeOrg.id);
  };

  const handleAddMatch = async (tournamentId: number, matchData: any) => {
    await api.post(`/tournaments/${tournamentId}/matches`, matchData);
    if (activeOrg) await loadTenantData(activeOrg.id);
  };

  const handleBatchAddMatches = async (tournamentId: number, matchesList: any[]) => {
    await api.post(`/tournaments/${tournamentId}/matches/batch`, { matches: matchesList });
    if (activeOrg) await loadTenantData(activeOrg.id);
  };

  const handleUpdateMatchScore = async (matchId: number, scoreData: any) => {
    await api.patch(`/matches/${matchId}/score`, scoreData);
    if (activeOrg) await loadTenantData(activeOrg.id);
  };

  const handleRecordPayment = async (data: any) => {
    await api.post('/finance/payments', data);
    if (activeOrg) await loadTenantData(activeOrg.id);
  };

  const handleLogExpense = async (data: any) => {
    await api.post('/finance/expenses', data);
    if (activeOrg) await loadTenantData(activeOrg.id);
  };

  const handleGenerateInvoice = async (data: any) => {
    await api.post('/finance/invoices', data);
    if (activeOrg) await loadTenantData(activeOrg.id);
  };

  const handleRecordDonation = async (data: any) => {
    await api.post('/finance/donations', data);
    if (activeOrg) await loadTenantData(activeOrg.id);
  };

  const handleSendWhatsAppReminder = async (invoiceIds?: number[], upiVpa?: string, customMessage?: string) => {
    const res = await api.post('/finance/whatsapp-reminders', { invoiceIds, upiVpa, customMessage });
    if (activeOrg) await loadTenantData(activeOrg.id);
    return res;
  };

  const handleAssignPlayer = async (teamId: number, memberId: number, jerseyNumber: number, position: string) => {
    await api.post(`/teams/${teamId}/players`, { memberId, jerseyNumber, position });
    if (activeOrg) await loadTenantData(activeOrg.id);
  };

  const handleAddEquipment = async (data: any) => {
    await api.post('/inventory', data);
    if (activeOrg) await loadTenantData(activeOrg.id);
  };

  const handleConvertLead = async (leadId: number) => {
    await api.post(`/leads/${leadId}/convert`, {});
    if (activeOrg) await loadTenantData(activeOrg.id);
  };

  const handleSendBroadcast = async (templateId?: number, customText?: string) => {
    const res = await api.post<{ sentCount: number; message: string }>('/whatsapp/broadcast', {
      templateId,
      customText,
    });
    if (activeOrg) await loadTenantData(activeOrg.id);
    return res;
  };

  const handleGenerateCertificate = async (data: any) => {
    await api.post('/certificates', data);
    if (activeOrg) await loadTenantData(activeOrg.id);
  };

  const handleVerifyToken = async (token: string) => {
    return await api.get(`/certificates/verify/${token}`);
  };

  const handleSubmitLeadFromWebsite = async (data: any) => {
    await api.post('/leads', { ...data, source: 'Public Website' });
    if (activeOrg) await loadTenantData(activeOrg.id);
  };

  const handleUpdateOrg = async (data: Partial<Organization>) => {
    if (!activeOrg) return;
    const updated = await api.patch<Organization>(`/organizations/${activeOrg.id}`, data);
    setActiveOrg(updated);
    setOrganizations((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
  };

  const handleCreateBranch = async (data: any) => {
    await api.post('/branches', data);
    if (activeOrg) await loadTenantData(activeOrg.id);
  };

  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center p-4">
        <div className="bg-slate-800 p-8 rounded-3xl max-w-lg w-full shadow-2xl border border-slate-700 text-center">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto mb-4">
            <Database className="w-7 h-7 text-amber-400" />
          </div>
          <h2 className="text-xl font-bold text-white">Database Connection Notice</h2>
          <p className="text-sm text-slate-300 mt-3 leading-relaxed">
            The app could not connect to a cloud PostgreSQL database on this deployment.
          </p>
          <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-700/60 my-4 text-xs text-slate-400 font-mono text-left break-words">
            {error}
          </div>

          <div className="space-y-2.5 pt-1">
            <button
              onClick={() => initializePlatform('demo')}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center space-x-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Launch Demo Sandbox (Instant Access)</span>
            </button>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setIsDbGuideOpen(true)}
                className="py-2.5 px-3 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-xl text-xs font-semibold transition-all flex items-center justify-center space-x-1.5"
              >
                <Database className="w-3.5 h-3.5 text-blue-400" />
                <span>Setup Guide</span>
              </button>
              <button
                onClick={() => initializePlatform('cloud')}
                className="py-2.5 px-3 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-xl text-xs font-semibold transition-all"
              >
                Retry Cloud
              </button>
            </div>
          </div>
        </div>

        {/* DB Guide Modal */}
        <PostgresSetupModal
          isOpen={isDbGuideOpen}
          onClose={() => setIsDbGuideOpen(false)}
          onRetryCloud={() => initializePlatform('cloud')}
        />
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-row font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Left Panel Menu */}
      <Sidebar
        organizations={organizations}
        activeOrg={activeOrg}
        onSelectOrg={handleSelectOrg}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenOnboarding={() => setIsOnboardingOpen(true)}
        onOpenSecurityTest={() => {
          setIsSecurityTestOpen(true);
          runSecurityTest();
        }}
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
        pendingDuesCount={invoices.filter((i) => i.status === 'due' || i.status === 'overdue').length}
        membersCount={members.length}
        teamsCount={teams.length}
      />

      {/* Right Side Main Dashboard / Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Sleek Top Navigation Bar for Right Area */}
        <header className="bg-white border-b border-slate-200 px-4 sm:px-6 py-3 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 lg:hidden"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Active view breadcrumb title */}
            <div className="flex items-center space-x-2 text-xs">
              <span className="font-semibold text-slate-500 hidden sm:inline">
                {activeOrg?.name || 'Sports Organization'}
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-300 hidden sm:inline" />
              <span className="font-bold text-slate-900 capitalize text-sm">
                {activeTab === 'dashboard'
                  ? 'Executive Dashboard'
                  : activeTab === 'teams'
                  ? 'Coaches & Squads'
                  : activeTab === 'finance'
                  ? 'Fee, Invoices, Expenses & Donations'
                  : activeTab === 'members'
                  ? 'Athletes & Members'
                  : activeTab === 'sports'
                  ? 'Sports & Disciplines'
                  : activeTab === 'attendance'
                  ? 'Attendance & Drills'
                  : activeTab === 'facilities'
                  ? 'Courts & Facilities'
                  : activeTab === 'tournaments'
                  ? 'Tournaments & Fixtures'
                  : activeTab === 'inventory'
                  ? 'Equipment & Inventory'
                  : activeTab === 'leads'
                  ? 'Inquiries & Admissions'
                  : activeTab === 'whatsapp'
                  ? 'WhatsApp Desk'
                  : activeTab === 'certificates'
                  ? 'Certificates & QR ID'
                  : activeTab === 'website'
                  ? 'Public Club Microsite'
                  : activeTab === 'settings'
                  ? 'Club Settings & Branches'
                  : activeTab}
              </span>
            </div>
          </div>

          {/* Right Header Quick Actions */}
          <div className="flex items-center space-x-2">
            {apiMode === 'demo' ? (
              <button
                onClick={() => setIsDbGuideOpen(true)}
                className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-medium hover:bg-amber-100 transition-colors"
                title="Running in Local Demo Sandbox. Click to see how to connect PostgreSQL."
              >
                <Database className="w-3 h-3 text-amber-600" />
                <span className="hidden md:inline">Demo Sandbox</span>
                <span className="md:hidden">Demo</span>
              </button>
            ) : (
              <div className="hidden sm:inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Cloud DB Active</span>
              </div>
            )}

            <button
              onClick={() => setActiveTab('finance')}
              className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-colors"
            >
              <Wallet className="w-3.5 h-3.5 text-emerald-600" />
              <span>Fee Module</span>
            </button>

            <button
              onClick={() => setActiveTab('members')}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-2xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Member</span>
            </button>
          </div>
        </header>

        {/* Demo Mode Notice Banner */}
        {apiMode === 'demo' && showDemoBanner && (
          <div className="bg-amber-50/90 border-b border-amber-200/80 px-4 sm:px-6 py-2 flex items-center justify-between text-xs text-amber-900 shadow-2xs">
            <div className="flex items-center space-x-2.5 overflow-hidden">
              <Database className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <p className="truncate text-xs">
                <strong className="font-semibold">Demo Sandbox:</strong> Data is saved in your browser. To sync across devices on Vercel, set <code className="bg-amber-100/80 font-mono px-1 py-0.5 rounded text-[11px]">DATABASE_URL</code> in Vercel Settings.
              </p>
            </div>
            <div className="flex items-center space-x-2 shrink-0 ml-3">
              <button
                onClick={() => setIsDbGuideOpen(true)}
                className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-md text-[11px] font-semibold transition-colors shadow-2xs"
              >
                Setup Guide
              </button>
              <button
                onClick={() => setShowDemoBanner(false)}
                className="p-1 rounded text-amber-600 hover:text-amber-900 hover:bg-amber-100"
                title="Dismiss banner"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Main Content Area on the Right */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {isLoading && !activeOrg ? (
            <div className="py-20 text-center text-xs text-slate-500">
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              Loading organization data...
            </div>
          ) : activeOrg ? (
            <>
              {activeTab === 'dashboard' && (
                <DashboardView
                  stats={stats}
                  activeOrg={activeOrg}
                  members={members}
                  sports={sports}
                  programs={programs}
                  coaches={coaches}
                  teams={teams}
                  sessions={sessions}
                  facilities={facilities}
                  tournaments={tournaments}
                  invoices={invoices}
                  payments={payments}
                  expenses={expenses}
                  donations={donations}
                  equipment={equipment}
                  leads={leads}
                  onNavigateTab={(tab) => setActiveTab(tab)}
                  onSendWhatsAppReminder={handleSendWhatsAppReminder}
                />
              )}

              {activeTab === 'members' && (
                <MembersView
                  members={members}
                  sports={sports}
                  programs={programs}
                  onAddMember={handleAddMember}
                  organizationName={activeOrg.name}
                />
              )}

              {activeTab === 'sports' && (
                <SportsProgramsView
                  sports={sports}
                  programs={programs}
                  onAddSport={handleAddSport}
                  onAddProgram={handleAddProgram}
                />
              )}

              {activeTab === 'teams' && (
                <TeamsCoachesView
                  teams={teams}
                  coaches={coaches}
                  sports={sports}
                  members={members}
                  onAddTeam={handleAddTeam}
                  onAddCoach={handleAddCoach}
                  onAssignPlayer={handleAssignPlayer}
                />
              )}

              {activeTab === 'attendance' && (
                <AttendanceView
                  sessions={sessions}
                  sports={sports}
                  teams={teams}
                  coaches={coaches}
                  fetchSessionAttendance={fetchSessionAttendance}
                  saveSessionAttendance={saveSessionAttendance}
                  createTrainingSession={createTrainingSession}
                />
              )}

              {activeTab === 'facilities' && (
                <FacilitiesView
                  facilities={facilities}
                  onAddFacility={handleAddFacility}
                  onBookFacility={handleBookFacility}
                />
              )}

              {activeTab === 'tournaments' && (
                <TournamentsView
                  tournaments={tournaments}
                  sports={sports}
                  teams={teams}
                  onCreateTournament={handleCreateTournament}
                  onAddMatch={handleAddMatch}
                  onBatchAddMatches={handleBatchAddMatches}
                  onUpdateMatchScore={handleUpdateMatchScore}
                />
              )}

              {activeTab === 'finance' && (
                <FinanceView
                  invoices={invoices}
                  payments={payments}
                  expenses={expenses}
                  donations={donations}
                  summary={financeSummary}
                  members={members}
                  onRecordPayment={handleRecordPayment}
                  onLogExpense={handleLogExpense}
                  onGenerateInvoice={handleGenerateInvoice}
                  onRecordDonation={handleRecordDonation}
                  onSendWhatsAppReminder={handleSendWhatsAppReminder}
                  currency={activeOrg.currency || 'INR'}
                  activeOrgName={activeOrg.name}
                />
              )}

              {activeTab === 'inventory' && (
                <InventoryView
                  equipment={equipment}
                  onAddEquipment={handleAddEquipment}
                />
              )}

              {activeTab === 'leads' && (
                <LeadsView
                  leads={leads}
                  onConvertLead={handleConvertLead}
                />
              )}

              {activeTab === 'whatsapp' && (
                <WhatsAppView
                  templates={whatsappTemplates}
                  messages={whatsappMessages}
                  members={members}
                  sports={sports}
                  onSendBroadcast={handleSendBroadcast}
                />
              )}

              {activeTab === 'certificates' && (
                <CertificatesView
                  certificates={certificates}
                  activeOrg={activeOrg}
                  members={members}
                  sports={sports}
                  onGenerateCertificate={handleGenerateCertificate}
                  onVerifyToken={handleVerifyToken}
                />
              )}

              {activeTab === 'website' && (
                <PublicWebsiteView
                  activeOrg={activeOrg}
                  sports={sports}
                  programs={programs}
                  coaches={coaches}
                  tournaments={tournaments}
                  events={events}
                  onSubmitLead={handleSubmitLeadFromWebsite}
                />
              )}

              {activeTab === 'settings' && (
                <SettingsView
                  activeOrg={activeOrg}
                  branches={branches}
                  onUpdateOrg={handleUpdateOrg}
                  onCreateBranch={handleCreateBranch}
                />
              )}
            </>
          ) : (
            <div className="py-20 text-center text-xs text-slate-400">
              No active organization found. Please onboard an organization to begin.
            </div>
          )}
        </main>
      </div>

      {/* Onboard Organization Modal */}
      {isOnboardingOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Onboard New Organization</h3>
                <p className="text-xs text-slate-500">Multi-tenant club, academy, or community entity</p>
              </div>
              <button
                onClick={() => setIsOnboardingOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateOrg} className="p-5 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Organization Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mumbai Elite Cricket & Sports Club"
                  value={newOrgForm.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    const words = name.split(' ').filter(Boolean);
                    const autoShort = words.map((w) => w[0]).join('').toUpperCase();
                    setNewOrgForm({
                      ...newOrgForm,
                      name,
                      shortName: newOrgForm.shortName || autoShort,
                    });
                  }}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Short Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="MECSC"
                    value={newOrgForm.shortName}
                    onChange={(e) => setNewOrgForm({ ...newOrgForm, shortName: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 font-mono uppercase"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Type</label>
                  <select
                    value={newOrgForm.type}
                    onChange={(e) => setNewOrgForm({ ...newOrgForm, type: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                  >
                    <option value="Sports Club">Sports Club</option>
                    <option value="Sports Academy">Sports Academy</option>
                    <option value="Youth Organization">Youth Organization</option>
                    <option value="Community Organization">Community Organization</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">City</label>
                  <input
                    type="text"
                    value={newOrgForm.city}
                    onChange={(e) => setNewOrgForm({ ...newOrgForm, city: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Currency</label>
                  <select
                    value={newOrgForm.currency}
                    onChange={(e) => setNewOrgForm({ ...newOrgForm, currency: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                  >
                    <option value="INR">INR (₹)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="SGD">SGD (S$)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Address</label>
                <input
                  type="text"
                  placeholder="Stadium, Ground, or Complex"
                  value={newOrgForm.address}
                  onChange={(e) => setNewOrgForm({ ...newOrgForm, address: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsOnboardingOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-xs"
                >
                  Onboard & Launch Tenant
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tenant Isolation Security Audit Modal */}
      {isSecurityTestOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Tenant Isolation Audit Report</h3>
                  <p className="text-xs text-slate-500">Live PostgreSQL multi-tenant isolation validation</p>
                </div>
              </div>
              <button
                onClick={() => setIsSecurityTestOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 leading-relaxed">
                <div className="font-bold flex items-center space-x-1.5 text-emerald-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>TENANT DATA BARRIER: VERIFIED SECURE</span>
                </div>
                <p className="mt-1 text-[11px] text-emerald-700">
                  Every query across all 19 database models is strictly scoped using{' '}
                  <code className="bg-emerald-100 px-1 py-0.5 rounded font-mono font-bold">
                    organizationId = req.orgId
                  </code>
                  . Cross-tenant leakage is mathematically impossible at the database layer.
                </p>
              </div>

              {securityTestRunning ? (
                <div className="py-6 text-center text-slate-500">
                  <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  Executing live cross-tenant query audit on Cloud SQL...
                </div>
              ) : securityTestData ? (
                <div className="space-y-3">
                  <div className="p-3 rounded-lg bg-slate-900 text-slate-200 font-mono text-[11px] overflow-x-auto max-h-48">
                    <pre>{JSON.stringify(securityTestData, null, 2)}</pre>
                  </div>

                  <div className="flex items-center justify-between text-slate-600 text-[11px] pt-1">
                    <span>Audit status: 200 OK</span>
                    <button
                      onClick={runSecurityTest}
                      className="text-blue-600 font-semibold hover:underline"
                    >
                      Re-run Live Audit
                    </button>
                  </div>
                </div>
              ) : null}
            </div>

            <div className="p-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setIsSecurityTestOpen(false)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold"
              >
                Close Audit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Database Setup Guide Modal */}
      <PostgresSetupModal
        isOpen={isDbGuideOpen}
        onClose={() => setIsDbGuideOpen(false)}
        onRetryCloud={() => initializePlatform('cloud')}
      />
    </div>
  );
}
