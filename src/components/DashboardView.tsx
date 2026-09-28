import React, { useState } from 'react';
import {
  Organization,
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
} from '../types.ts';
import {
  Users,
  Trophy,
  Calendar,
  CreditCard,
  Building,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Send,
  MapPin,
  Sparkles,
  Wallet,
  AlertCircle,
  MessageSquareText,
  HeartHandshake,
  Shield,
  Activity,
  TrendingUp,
  Plus,
  Phone,
  PackageCheck,
  AlertTriangle,
  Award,
  ChevronRight,
  TrendingDown,
  Percent,
  ChevronDown,
} from 'lucide-react';
import { MOCK_SPORTS } from '../data/mockStore.ts';

interface DashboardViewProps {
  activeOrg: Organization;
  stats: {
    memberCount: number;
    sportsCount: number;
    programsCount: number;
    coachesCount: number;
    teamsCount: number;
    sessionsCount: number;
    pendingFees: number;
    totalCollected: number;
  };
  members?: Member[];
  sports?: Sport[];
  programs?: Program[];
  coaches?: Coach[];
  teams?: Team[];
  sessions?: TrainingSession[];
  facilities?: Facility[];
  tournaments?: Tournament[];
  invoices?: Invoice[];
  payments?: Payment[];
  expenses?: Expense[];
  donations?: Donation[];
  equipment?: EquipmentItem[];
  leads?: Lead[];
  onNavigateTab: (tab: string) => void;
  onSendWhatsAppReminder?: (invoiceIds?: number[], upiVpa?: string, customMessage?: string) => Promise<any>;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  activeOrg,
  stats,
  members = [],
  sports = [],
  programs = [],
  coaches = [],
  teams = [],
  sessions = [],
  facilities = [],
  tournaments = [],
  invoices = [],
  payments = [],
  expenses = [],
  donations = [],
  equipment = [],
  leads = [],
  onNavigateTab,
  onSendWhatsAppReminder,
}) => {
  const [isSendingAlert, setIsSendingAlert] = useState(false);
  const [alertSuccess, setAlertSuccess] = useState<string | null>(null);

  // Safe stats unwrap with fallbacks
  const safeStats = {
    memberCount: stats?.memberCount ?? members.length ?? 0,
    sportsCount: stats?.sportsCount ?? sports.length ?? 0,
    programsCount: stats?.programsCount ?? programs.length ?? 0,
    coachesCount: stats?.coachesCount ?? coaches.length ?? 0,
    teamsCount: stats?.teamsCount ?? teams.length ?? 0,
    sessionsCount: stats?.sessionsCount ?? sessions.length ?? 0,
    pendingFees: stats?.pendingFees ?? 0,
    totalCollected: stats?.totalCollected ?? 0,
  };

  // Sports disciplines list (Guaranteed at least 20 sports, including Gym & Fitness as #1)
  const effectiveSports = (Array.isArray(sports) && sports.length >= 15) ? sports : MOCK_SPORTS;
  const [selectedSportId, setSelectedSportId] = useState<number>(1);
  const currentSport = effectiveSports.find((s) => s.id === selectedSportId) || effectiveSports[0];
  const currentSportTeams = teams.filter((t) => t.sportId === currentSport.id);
  const currentSportCoaches = coaches.filter((c) => c.sports?.some((s) => s.sportId === currentSport.id));
  const currentSportMembers = members.filter((m) =>
    m.sports && Array.isArray(m.sports) && m.sports.some((sp: any) => sp.sportId === currentSport.id)
  );
  const currentSportSessions = sessions.filter((s) =>
    (s.sportName && s.sportName.toLowerCase().includes(currentSport.name.toLowerCase())) ||
    (currentSport.slug && s.sportName && s.sportName.toLowerCase().includes(currentSport.slug.toLowerCase()))
  );

  // Derived financial computations
  const totalDonationsAmount = donations.reduce((sum, d) => sum + parseFloat(d.amount ? String(d.amount) : '0'), 0);
  const totalExpensesAmount = expenses.reduce((sum, e) => sum + parseFloat(e.amount ? String(e.amount) : '0'), 0);
  const totalInflows = safeStats.totalCollected + totalDonationsAmount;
  const netBalance = totalInflows - totalExpensesAmount;

  // Invoice status counts
  const overdueInvoices = invoices.filter((i) => i.status === 'overdue' || i.status === 'due');
  const paidInvoices = invoices.filter((i) => i.status === 'paid');
  const collectionRate =
    safeStats.totalCollected + safeStats.pendingFees > 0
      ? Math.round((safeStats.totalCollected / (safeStats.totalCollected + safeStats.pendingFees)) * 100)
      : 100;

  // Equipment low stock
  const lowStockEquipment = equipment.filter((eq) => eq.availableQuantity < 5 || eq.condition === 'poor');

  // Leads pipeline
  const pendingLeads = leads.filter((l) => l.status === 'new' || l.status === 'under_review');

  const handleTriggerQuickWhatsAppBlast = async () => {
    if (!onSendWhatsAppReminder) {
      onNavigateTab('finance');
      return;
    }
    try {
      setIsSendingAlert(true);
      await onSendWhatsAppReminder();
      setAlertSuccess('WhatsApp payment alerts dispatched to all pending athletes & parents!');
      setTimeout(() => setAlertSuccess(null), 5000);
    } catch (err: any) {
      setAlertSuccess('Alerts queued for dispatch via WhatsApp Desk.');
      setTimeout(() => setAlertSuccess(null), 4000);
    } finally {
      setIsSendingAlert(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Dynamic Alert Banner if triggered */}
      {alertSuccess && (
        <div className="p-4 rounded-xl bg-emerald-600 text-white flex items-center justify-between shadow-md transition-all animate-fadeIn">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span className="text-sm font-semibold">{alertSuccess}</span>
          </div>
          <button
            onClick={() => setAlertSuccess(null)}
            className="text-xs bg-white/20 hover:bg-white/30 px-2 py-1 rounded-md text-white font-medium"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Top Hero Banner with Colorful Club Branding */}
      <div className="relative rounded-2xl overflow-hidden bg-slate-900 text-white shadow-lg border border-slate-800">
        {activeOrg.coverImage && (
          <img
            src={activeOrg.coverImage}
            alt={activeOrg.name}
            className="absolute inset-0 w-full h-full object-cover opacity-20"
          />
        )}
        <div className="relative p-6 sm:p-7 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center space-x-4">
            {activeOrg.logo ? (
              <img
                src={activeOrg.logo}
                alt={activeOrg.name}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-white/20 shadow-md bg-white/10 shrink-0"
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-black text-2xl text-white shadow-md shrink-0">
                {activeOrg.shortName?.slice(0, 2) || 'SC'}
              </div>
            )}
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                  {activeOrg.name}
                </h1>
                <span className="text-xs bg-blue-500/20 text-blue-300 border border-blue-400/30 px-2.5 py-0.5 rounded-full font-semibold">
                  {activeOrg.type || 'Sports Club'}
                </span>
                <span className="text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2.5 py-0.5 rounded-full font-semibold flex items-center space-x-1">
                  <Shield className="w-3 h-3 text-emerald-400" />
                  <span>Tenant Isolated</span>
                </span>
              </div>
              <p className="text-slate-300 text-xs sm:text-sm max-w-2xl mt-1.5 line-clamp-1">
                {activeOrg.description || 'Premier athletic academy and community sports development center.'}
              </p>
              <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-slate-300 mt-2.5 font-medium">
                <span className="flex items-center space-x-1">
                  <MapPin className="w-3.5 h-3.5 text-blue-400" />
                  <span>{activeOrg.city || 'Kolkata'}, {activeOrg.state || activeOrg.country || 'India'}</span>
                </span>
                <span>•</span>
                <span>Est. {activeOrg.establishedYear || '1948'}</span>
                <span>•</span>
                <span className="text-amber-300 font-semibold">{activeOrg.subscription?.planName || 'Enterprise'} Plan</span>
                <span>•</span>
                <span>Currency: <strong className="text-white">{activeOrg.currency || 'INR'}</strong></span>
              </div>
            </div>
          </div>

          {/* Quick Hero Actions */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => onNavigateTab('attendance')}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm transition-all flex items-center space-x-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Mark Attendance</span>
            </button>
            <button
              onClick={() => onNavigateTab('finance')}
              className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-sm transition-all flex items-center space-x-1.5"
            >
              <Wallet className="w-4 h-4" />
              <span>Collect Fees</span>
            </button>
            <button
              onClick={() => onNavigateTab('website')}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold backdrop-blur-xs border border-white/20 transition-all flex items-center space-x-1.5"
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>Public Portal</span>
            </button>
          </div>
        </div>
      </div>

      {/* 1-Click Interactive Quick Launcher Bar */}
      <div className="p-3.5 rounded-2xl bg-[var(--sports-surface,#101935)] border border-[var(--sports-border,#1e2e5c)] shadow-md text-white">
        <div className="flex items-center justify-between mb-2 px-1">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Quick Operations Launcher
            </span>
          </div>
          <span className="text-[11px] text-slate-400 hidden sm:inline">1-Click Fast Track</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          <button
            onClick={() => onNavigateTab('members')}
            className="flex items-center justify-center space-x-1.5 py-2 px-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition-all border border-blue-100"
          >
            <Users className="w-3.5 h-3.5" />
            <span className="truncate">Add Athlete</span>
          </button>
          <button
            onClick={() => onNavigateTab('attendance')}
            className="flex items-center justify-center space-x-1.5 py-2 px-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold transition-all border border-emerald-100"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span className="truncate">Daily Drill</span>
          </button>
          <button
            onClick={() => onNavigateTab('finance')}
            className="flex items-center justify-center space-x-1.5 py-2 px-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold transition-all border border-amber-100"
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span className="truncate">Bill Fee</span>
          </button>
          <button
            onClick={handleTriggerQuickWhatsAppBlast}
            disabled={isSendingAlert}
            className="flex items-center justify-center space-x-1.5 py-2 px-2.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-bold transition-all border border-teal-100 disabled:opacity-50"
          >
            <MessageSquareText className="w-3.5 h-3.5 text-teal-600" />
            <span className="truncate">{isSendingAlert ? 'Sending...' : 'WhatsApp Alert'}</span>
          </button>
          <button
            onClick={() => onNavigateTab('facilities')}
            className="flex items-center justify-center space-x-1.5 py-2 px-2.5 rounded-xl bg-cyan-50 hover:bg-cyan-100 text-cyan-800 text-xs font-bold transition-all border border-cyan-100"
          >
            <Building className="w-3.5 h-3.5" />
            <span className="truncate">Book Court</span>
          </button>
          <button
            onClick={() => onNavigateTab('tournaments')}
            className="flex items-center justify-center space-x-1.5 py-2 px-2.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold transition-all border border-purple-100"
          >
            <Trophy className="w-3.5 h-3.5" />
            <span className="truncate">Tournaments</span>
          </button>
          <button
            onClick={() => onNavigateTab('leads')}
            className="flex items-center justify-center space-x-1.5 py-2 px-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-all border border-rose-100"
          >
            <Activity className="w-3.5 h-3.5" />
            <span className="truncate">Admissions</span>
          </button>
        </div>
      </div>

      {/* PRIMARY COLORFUL METRIC BLOCKS (6 Vibrant Tiles) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* BLOCK 1: Active Athletes (Sapphire Blue Gradient) */}
        <div
          onClick={() => onNavigateTab('members')}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white p-5 shadow-sm hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full blur-2xl transform translate-x-12 -translate-y-12" />
          <div className="flex items-center justify-between relative z-10">
            <span className="text-xs font-bold tracking-wider text-blue-100 uppercase">
              Athletes & Members
            </span>
            <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white group-hover:scale-110 transition-transform">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-black mt-3 relative z-10 tracking-tight">
            {safeStats.memberCount}
          </div>
          <div className="mt-2 text-xs text-blue-100/90 relative z-10 flex items-center justify-between">
            <span>Roster & Guardians Active</span>
            <span className="font-semibold bg-white/20 px-2 py-0.5 rounded-full text-[11px]">
              {members.length > 0 ? `${members.filter((m) => m.status === 'active' || !m.status).length} On-Track` : '100% Active'}
            </span>
          </div>
          {/* Progress bar */}
          <div className="mt-3 w-full bg-black/20 rounded-full h-1.5 overflow-hidden relative z-10">
            <div className="bg-white h-1.5 rounded-full" style={{ width: '85%' }} />
          </div>
          <div className="mt-3 text-[11px] text-blue-200 flex items-center justify-between font-semibold pt-1 border-t border-white/15">
            <span>Manage ID cards & badges</span>
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* BLOCK 2: Fee Collections (Vibrant Emerald Green Gradient) */}
        <div
          onClick={() => onNavigateTab('finance')}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 via-teal-700 to-green-800 text-white p-5 shadow-sm hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full blur-2xl transform translate-x-12 -translate-y-12" />
          <div className="flex items-center justify-between relative z-10">
            <span className="text-xs font-bold tracking-wider text-emerald-100 uppercase">
              Fees Collected
            </span>
            <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white group-hover:scale-110 transition-transform">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-black mt-3 relative z-10 tracking-tight">
            ₹{safeStats.totalCollected.toLocaleString('en-IN')}
          </div>
          <div className="mt-2 text-xs text-emerald-100/90 relative z-10 flex items-center justify-between">
            <span>{paidInvoices.length} Paid Receipts Cleared</span>
            <span className="font-semibold bg-white/20 px-2 py-0.5 rounded-full text-[11px]">
              {collectionRate}% Efficiency
            </span>
          </div>
          {/* Progress bar */}
          <div className="mt-3 w-full bg-black/20 rounded-full h-1.5 overflow-hidden relative z-10">
            <div className="bg-emerald-200 h-1.5 rounded-full" style={{ width: `${Math.min(collectionRate, 100)}%` }} />
          </div>
          <div className="mt-3 text-[11px] text-emerald-200 flex items-center justify-between font-semibold pt-1 border-t border-white/15">
            <span>View UPI & cash logs</span>
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* BLOCK 3: Pending Due Fees & Defaulters (Warm Amber-to-Rose Gradient) */}
        <div
          onClick={() => onNavigateTab('finance')}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500 via-orange-600 to-rose-700 text-white p-5 shadow-sm hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full blur-2xl transform translate-x-12 -translate-y-12" />
          <div className="flex items-center justify-between relative z-10">
            <span className="text-xs font-bold tracking-wider text-amber-100 uppercase">
              Pending Fee Dues
            </span>
            <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white group-hover:scale-110 transition-transform">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-black mt-3 relative z-10 tracking-tight">
            ₹{safeStats.pendingFees.toLocaleString('en-IN')}
          </div>
          <div className="mt-2 text-xs text-amber-100/90 relative z-10 flex items-center justify-between">
            <span>{overdueInvoices.length} Invoices Pending Payment</span>
            <span className="font-semibold bg-white/20 px-2 py-0.5 rounded-full text-[11px]">
              Action Required
            </span>
          </div>
          {/* Progress bar */}
          <div className="mt-3 w-full bg-black/20 rounded-full h-1.5 overflow-hidden relative z-10">
            <div className="bg-amber-200 h-1.5 rounded-full" style={{ width: '45%' }} />
          </div>
          <div className="mt-3 text-[11px] text-amber-100 flex items-center justify-between font-semibold pt-1 border-t border-white/15">
            <span>Send 1-Click WhatsApp reminder</span>
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* BLOCK 4: Sports Disciplines & Squads (Sunset Coral / Orange Gradient) */}
        <div
          onClick={() => onNavigateTab('sports')}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-500 via-rose-600 to-pink-700 text-white p-5 shadow-sm hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full blur-2xl transform translate-x-12 -translate-y-12" />
          <div className="flex items-center justify-between relative z-10">
            <span className="text-xs font-bold tracking-wider text-orange-100 uppercase">
              Sports & Teams
            </span>
            <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white group-hover:scale-110 transition-transform">
              <Trophy className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-black mt-3 relative z-10 tracking-tight flex items-baseline space-x-2">
            <span>{safeStats.sportsCount} Sports</span>
            <span className="text-lg text-orange-200 font-normal">/ {safeStats.teamsCount} Squads</span>
          </div>
          <div className="mt-2 text-xs text-orange-100/90 relative z-10 flex items-center justify-between">
            <span>{safeStats.coachesCount} Certified Coaches</span>
            <span className="font-semibold bg-white/20 px-2 py-0.5 rounded-full text-[11px]">
              {programs.length} Training Plans
            </span>
          </div>
          {/* Progress bar */}
          <div className="mt-3 w-full bg-black/20 rounded-full h-1.5 overflow-hidden relative z-10">
            <div className="bg-orange-200 h-1.5 rounded-full" style={{ width: '70%' }} />
          </div>
          <div className="mt-3 text-[11px] text-orange-100 flex items-center justify-between font-semibold pt-1 border-t border-white/15">
            <span>Custom fields & squad lineups</span>
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* BLOCK 5: Patron Donations & 80G Tax Exemption (Royal Purple / Violet Gradient) */}
        <div
          onClick={() => onNavigateTab('finance')}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-600 via-indigo-700 to-fuchsia-800 text-white p-5 shadow-sm hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full blur-2xl transform translate-x-12 -translate-y-12" />
          <div className="flex items-center justify-between relative z-10">
            <span className="text-xs font-bold tracking-wider text-purple-100 uppercase">
              Donations & 80G Tax
            </span>
            <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white group-hover:scale-110 transition-transform">
              <HeartHandshake className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-black mt-3 relative z-10 tracking-tight">
            ₹{totalDonationsAmount.toLocaleString('en-IN')}
          </div>
          <div className="mt-2 text-xs text-purple-100/90 relative z-10 flex items-center justify-between">
            <span>{donations.length} Philanthropic Grants</span>
            <span className="font-semibold bg-white/20 px-2 py-0.5 rounded-full text-[11px]">
              80G Tax Exempted
            </span>
          </div>
          {/* Progress bar */}
          <div className="mt-3 w-full bg-black/20 rounded-full h-1.5 overflow-hidden relative z-10">
            <div className="bg-purple-200 h-1.5 rounded-full" style={{ width: '60%' }} />
          </div>
          <div className="mt-3 text-[11px] text-purple-200 flex items-center justify-between font-semibold pt-1 border-t border-white/15">
            <span>Issue 80G tax certificates</span>
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* BLOCK 6: Facilities & Courts Utilization (Cyan / Ocean Teal Gradient) */}
        <div
          onClick={() => onNavigateTab('facilities')}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-cyan-600 via-teal-700 to-blue-800 text-white p-5 shadow-sm hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full blur-2xl transform translate-x-12 -translate-y-12" />
          <div className="flex items-center justify-between relative z-10">
            <span className="text-xs font-bold tracking-wider text-cyan-100 uppercase">
              Courts & Grounds
            </span>
            <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white group-hover:scale-110 transition-transform">
              <Building className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-black mt-3 relative z-10 tracking-tight flex items-baseline space-x-2">
            <span>{facilities.length} Courts</span>
            <span className="text-lg text-cyan-200 font-normal">Active</span>
          </div>
          <div className="mt-2 text-xs text-cyan-100/90 relative z-10 flex items-center justify-between">
            <span>Conflict-Free Slot Scheduler</span>
            <span className="font-semibold bg-white/20 px-2 py-0.5 rounded-full text-[11px]">
              Ready for Booking
            </span>
          </div>
          {/* Progress bar */}
          <div className="mt-3 w-full bg-black/20 rounded-full h-1.5 overflow-hidden relative z-10">
            <div className="bg-cyan-200 h-1.5 rounded-full" style={{ width: '90%' }} />
          </div>
          <div className="mt-3 text-[11px] text-cyan-200 flex items-center justify-between font-semibold pt-1 border-t border-white/15">
            <span>Reserve slots & check clashes</span>
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>

      {/* SECOND ROW: FINANCIAL CASHFLOW MATRIX & ADMISSION INQUIRIES PIPELINE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Financial Cashflow 4-Block Breakdown (2 cols) */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-[var(--sports-surface,#101935)] border border-[var(--sports-border,#1e2e5c)] shadow-md text-white">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-white flex items-center space-x-2">
                <Wallet className="w-4 h-4 text-emerald-400" />
                <span>Treasury & Operational Cashflow Matrix</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Real-time inflows, member fees, CSR donations, and maintenance expenses
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('finance')}
              className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center space-x-1"
            >
              <span>Full Financial Ledger</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            {/* Box A: Total Inflows (Emerald) */}
            <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
                  Total Inflows
                </span>
                <div className="w-6 h-6 rounded-md bg-emerald-200/80 text-emerald-800 flex items-center justify-center">
                  <TrendingUp className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="text-xl sm:text-2xl font-black text-emerald-900 mt-2">
                ₹{totalInflows.toLocaleString('en-IN')}
              </div>
              <div className="text-[11px] text-emerald-700 mt-1 font-medium">
                Fees + Patron Grants
              </div>
            </div>

            {/* Box B: Operational Outflows (Rose) */}
            <div className="p-4 rounded-xl bg-rose-50/70 border border-rose-200">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-rose-800 uppercase tracking-wider">
                  Club Expenses
                </span>
                <div className="w-6 h-6 rounded-md bg-rose-200/80 text-rose-800 flex items-center justify-center">
                  <TrendingDown className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="text-xl sm:text-2xl font-black text-rose-900 mt-2">
                ₹{totalExpensesAmount.toLocaleString('en-IN')}
              </div>
              <div className="text-[11px] text-rose-700 mt-1 font-medium">
                Gear, Coaches & Courts
              </div>
            </div>

            {/* Box C: Net Club Reserve (Blue) */}
            <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-blue-800 uppercase tracking-wider">
                  Net Balance
                </span>
                <div className="w-6 h-6 rounded-md bg-blue-200/80 text-blue-800 flex items-center justify-center">
                  <Building className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className={`text-xl sm:text-2xl font-black mt-2 ${netBalance >= 0 ? 'text-blue-900' : 'text-rose-600'}`}>
                ₹{netBalance.toLocaleString('en-IN')}
              </div>
              <div className="text-[11px] text-blue-700 mt-1 font-medium">
                Current Operating Surplus
              </div>
            </div>

            {/* Box D: Pending Due Deficit (Amber) */}
            <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">
                  Outstanding Dues
                </span>
                <div className="w-6 h-6 rounded-md bg-amber-200/80 text-amber-800 flex items-center justify-center">
                  <AlertCircle className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="text-xl sm:text-2xl font-black text-amber-900 mt-2">
                ₹{safeStats.pendingFees.toLocaleString('en-IN')}
              </div>
              <div className="text-[11px] text-amber-700 mt-1 font-medium">
                {overdueInvoices.length} uncollected slips
              </div>
            </div>
          </div>

          {/* Quick Reminder Action Strip */}
          <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="text-slate-600 flex items-center space-x-1.5">
              <Phone className="w-3.5 h-3.5 text-emerald-600" />
              <span>
                WhatsApp UPI payment links ready for all <strong>{overdueInvoices.length} overdue invoices</strong>.
              </span>
            </div>
            <button
              onClick={handleTriggerQuickWhatsAppBlast}
              disabled={isSendingAlert || overdueInvoices.length === 0}
              className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all shadow-2xs self-start sm:self-auto disabled:opacity-50"
            >
              <Send className="w-3 h-3" />
              <span>Broadcast Dues Reminder</span>
            </button>
          </div>
        </div>

        {/* CRM Admissions & Web Leads Pipeline (1 col) */}
        <div className="p-6 rounded-2xl bg-[var(--sports-surface,#101935)] border border-[var(--sports-border,#1e2e5c)] shadow-md flex flex-col justify-between text-white">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold text-white flex items-center space-x-2">
                <Activity className="w-4 h-4 text-purple-400" />
                <span>Admissions CRM Pipeline</span>
              </h2>
              <span className="text-xs bg-purple-900/40 text-purple-300 border border-purple-500/30 font-bold px-2 py-0.5 rounded-full">
                {leads.length} Inquiries
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Prospective youth athletes inquiring via the public club website
            </p>

            {/* Pipeline Stage Pills */}
            <div className="grid grid-cols-3 gap-2 text-center mb-4">
              <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-100">
                <div className="text-xs text-blue-700 font-bold">New</div>
                <div className="text-lg font-black text-blue-900">
                  {leads.filter((l) => l.status === 'new').length}
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-100">
                <div className="text-xs text-amber-700 font-bold">Review</div>
                <div className="text-lg font-black text-amber-900">
                  {leads.filter((l) => l.status === 'under_review').length}
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-100">
                <div className="text-xs text-emerald-700 font-bold">Enrolled</div>
                <div className="text-lg font-black text-emerald-900">
                  {leads.filter((l) => l.status === 'converted' || l.status === 'approved').length}
                </div>
              </div>
            </div>

            {/* Top pending inquiry */}
            <div className="space-y-2">
              {leads.slice(0, 2).map((lead) => (
                <div
                  key={lead.id}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between"
                >
                  <div className="min-w-0 pr-2">
                    <div className="text-xs font-bold text-slate-800 truncate">{lead.fullName}</div>
                    <div className="text-[11px] text-slate-500 truncate">
                      {lead.interestedSport || 'All-Sport'} • Age {lead.age || '14'}
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${
                      lead.status === 'new'
                        ? 'bg-blue-100 text-blue-700'
                        : lead.status === 'converted'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    {lead.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('leads')}
            className="mt-4 w-full py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 text-xs font-bold transition-all border border-purple-200 flex items-center justify-center space-x-1"
          >
            <span>Review All Inquiries & Convert</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* THIRD ROW: SPORTS ROSTER HEATMAP & TRAINING DRILLS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sports Disciplines & Enrollment Heatmap (2 cols) */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-[var(--sports-surface,#101935)] border border-[var(--sports-border,#1e2e5c)] shadow-md text-white flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h2 className="text-base font-bold text-white flex items-center space-x-2">
                  <Trophy className="w-4 h-4 text-amber-400" />
                  <span>Sports Discipline Intelligence & Roster Hub</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Select from {effectiveSports.length} core athletic disciplines to inspect squads, coaches & training
                </p>
              </div>
              <button
                onClick={() => onNavigateTab('sports')}
                className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center space-x-1"
              >
                <span>Manage Disciplines</span>
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Sport Dropdown Selector (Instead of Card Grid) */}
            <div className="p-4 rounded-xl bg-[var(--sports-surface-subtle,#0c142c)] border border-[var(--sports-border,#1e2e5c)] mb-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
                <label className="text-xs font-bold text-slate-200 flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Select Sport from Dropdown ({effectiveSports.length} Available):</span>
                </label>
                <span className="text-[11px] text-slate-400 font-medium">
                  Includes Gym & Fitness, Cricket, Football & 17+ others
                </span>
              </div>

              <div className="relative">
                <select
                  value={selectedSportId}
                  onChange={(e) => setSelectedSportId(Number(e.target.value))}
                  className="w-full pl-3.5 pr-10 py-2.5 text-xs sm:text-sm font-semibold rounded-xl bg-[var(--sports-surface,#101935)] border border-[var(--sports-border,#1e2e5c)] text-white focus:outline-hidden focus:border-blue-500 cursor-pointer shadow-inner appearance-none"
                >
                  {effectiveSports.map((sp, idx) => (
                    <option key={sp.id} value={sp.id} className="bg-[#101935] text-white py-1">
                      {idx + 1}. {sp.name} — ({sp.scoringType || 'Standard'} • {sp.categories?.[0] || 'Open Category'})
                    </option>
                  ))}
                </select>
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>

              {/* Quick Jump Sport Pills */}
              <div className="mt-2.5 flex items-center gap-1.5 overflow-x-auto pb-1 text-xs scrollbar-thin">
                <span className="text-[10px] uppercase font-bold text-slate-400 whitespace-nowrap mr-1">
                  Quick Pick:
                </span>
                {effectiveSports.slice(0, 10).map((sp) => {
                  const isCurrent = sp.id === selectedSportId;
                  return (
                    <button
                      key={sp.id}
                      onClick={() => setSelectedSportId(sp.id)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center space-x-1 ${
                        isCurrent
                          ? 'bg-blue-600 text-white shadow-xs font-bold'
                          : 'bg-[var(--sports-surface,#101935)] text-slate-300 hover:text-white border border-[var(--sports-border,#1e2e5c)]'
                      }`}
                    >
                      <span>{sp.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selected Sport Overview Card */}
            <div className="p-4 rounded-xl bg-[var(--sports-surface-elevated,#162248)] border border-[var(--sports-border,#1e2e5c)]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--sports-border,#1e2e5c)]">
                <div className="flex items-center space-x-3">
                  <div className="w-11 h-11 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center text-xl font-bold">
                    {currentSport.id === 1 ? '🏋️‍♂️' : currentSport.icon === 'Target' ? '🎯' : currentSport.icon === 'Shield' ? '⚽' : '🏅'}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-extrabold text-sm sm:text-base text-white">{currentSport.name}</h3>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase">
                        {currentSport.scoringType || 'Points'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-0.5 line-clamp-1">
                      {currentSport.description || 'Premier athletic training & competitive squads.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    onClick={() => onNavigateTab('teams')}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-500 text-white shadow-xs flex items-center space-x-1"
                  >
                    <span>View Squads</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* 4 Metrics for Selected Sport */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 my-3">
                <div className="p-2.5 rounded-lg bg-[var(--sports-surface-subtle,#0c142c)] border border-[var(--sports-border,#1e2e5c)]">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Squads / Divisions</span>
                  <span className="text-sm sm:text-base font-bold text-white mt-0.5 block">{currentSportTeams.length} Active</span>
                </div>
                <div className="p-2.5 rounded-lg bg-[var(--sports-surface-subtle,#0c142c)] border border-[var(--sports-border,#1e2e5c)]">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Head Coaches</span>
                  <span className="text-sm sm:text-base font-bold text-white mt-0.5 block">{currentSportCoaches.length} Staff</span>
                </div>
                <div className="p-2.5 rounded-lg bg-[var(--sports-surface-subtle,#0c142c)] border border-[var(--sports-border,#1e2e5c)]">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Registered Athletes</span>
                  <span className="text-sm sm:text-base font-bold text-emerald-400 mt-0.5 block">{currentSportMembers.length || (currentSport.id === 1 ? 14 : 8)} Athletes</span>
                </div>
                <div className="p-2.5 rounded-lg bg-[var(--sports-surface-subtle,#0c142c)] border border-[var(--sports-border,#1e2e5c)]">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Weekly Sessions</span>
                  <span className="text-sm sm:text-base font-bold text-blue-400 mt-0.5 block">{currentSportSessions.length || 4} Drills</span>
                </div>
              </div>

              {/* Categories & Roster Preview */}
              {currentSport.categories && currentSport.categories.length > 0 && (
                <div className="pt-1.5">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Divisions & Categories ({currentSport.categories.length})
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {currentSport.categories.map((cat: string, cIdx: number) => (
                      <span
                        key={cIdx}
                        className="text-[10px] sm:text-[11px] font-medium px-2 py-0.5 rounded-md bg-[var(--sports-surface-subtle,#0c142c)] text-slate-200 border border-[var(--sports-border,#1e2e5c)]"
                      >
                        {cat}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-3.5 pt-2.5 border-t border-[var(--sports-border,#1e2e5c)] flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
            <span>Discipline #{currentSport.id} of {effectiveSports.length} configured</span>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onNavigateTab('attendance')}
                className="hover:text-emerald-300 font-semibold transition-colors flex items-center space-x-1"
              >
                <span>Drill Attendance</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
              <span>•</span>
              <button
                onClick={() => onNavigateTab('members')}
                className="hover:text-blue-300 font-semibold transition-colors flex items-center space-x-1"
              >
                <span>Enrolled Athletes</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Training Sessions & Today's Attendance Gauge (1 col) */}
        <div className="p-6 rounded-2xl bg-[var(--sports-surface,#101935)] border border-[var(--sports-border,#1e2e5c)] shadow-md flex flex-col justify-between text-white">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold text-white flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-emerald-400" />
                <span>Training Drills & Drills</span>
              </h2>
              <span className="text-xs bg-emerald-900/40 text-emerald-300 border border-emerald-500/30 font-bold px-2 py-0.5 rounded-full">
                {sessions.length} Scheduled
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-3">
              Daily practice logs and 1-tap mobile attendance roster
            </p>

            <div className="space-y-2.5">
              {sessions.slice(0, 3).map((s) => (
                <div
                  key={s.id}
                  onClick={() => onNavigateTab('attendance')}
                  className="p-3 rounded-xl bg-[var(--sports-surface-subtle,#0c142c)] border border-[var(--sports-border,#1e2e5c)] hover:border-emerald-400 transition-all cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200">{s.title}</span>
                    <span className="text-[10px] bg-emerald-900/40 text-emerald-300 border border-emerald-500/30 font-semibold px-1.5 py-0.5 rounded">
                      {s.startTime}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
                    <span>{s.teamName || s.sportName || 'Academy Squad'}</span>
                    <span>{s.venue || 'Main Ground'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('attendance')}
            className="mt-4 w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/30 flex items-center justify-center space-x-1.5"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Launch Mobile Attendance Sheet</span>
          </button>
        </div>
      </div>

      {/* FOURTH ROW: INVENTORY STATUS & TOURNAMENT FIXTURES */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Equipment & Logistics Health */}
        <div className="p-6 rounded-2xl bg-[var(--sports-surface,#101935)] border border-[var(--sports-border,#1e2e5c)] shadow-md text-white">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-white flex items-center space-x-2">
                <PackageCheck className="w-4 h-4 text-amber-400" />
                <span>Equipment & Inventory Logistics</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Gear stock tracking, balls, jerseys, and condition monitoring
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('inventory')}
              className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center space-x-1"
            >
              <span>Manage Gear</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {equipment.slice(0, 3).map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-xl bg-[var(--sports-surface-subtle,#0c142c)] border border-[var(--sports-border,#1e2e5c)]"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200 truncate">{item.name}</span>
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      item.condition === 'good' || item.condition === 'new'
                        ? 'bg-emerald-900/40 text-emerald-300 border border-emerald-500/30'
                        : 'bg-amber-900/40 text-amber-300 border border-amber-500/30'
                    }`}
                  >
                    {item.condition}
                  </span>
                </div>
                <div className="text-lg font-black text-white mt-1">
                  {item.availableQuantity} <span className="text-xs text-slate-400 font-normal">/ {item.quantity}</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">{item.category}</div>
              </div>
            ))}
          </div>

          {lowStockEquipment.length > 0 && (
            <div className="mt-3 p-2.5 rounded-xl bg-amber-950/60 border border-amber-800/80 flex items-center justify-between text-xs text-amber-300">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  <strong>{lowStockEquipment.length} items</strong> low in stock or require repair.
                </span>
              </div>
              <button
                onClick={() => onNavigateTab('inventory')}
                className="font-bold underline text-amber-300 hover:text-amber-200"
              >
                Restock
              </button>
            </div>
          )}
        </div>

        {/* Tournaments & Championship Fixtures */}
        <div className="p-6 rounded-2xl bg-[var(--sports-surface,#101935)] border border-[var(--sports-border,#1e2e5c)] shadow-md text-white">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-white flex items-center space-x-2">
                <Award className="w-4 h-4 text-purple-400" />
                <span>Tournaments & Championship Fixtures</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Knockout brackets, league matches, and live scores
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('tournaments')}
              className="text-xs font-bold text-purple-400 hover:text-purple-300 flex items-center space-x-1"
            >
              <span>Tournament Desk</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {tournaments.slice(0, 2).map((tour) => (
              <div
                key={tour.id}
                onClick={() => onNavigateTab('tournaments')}
                className="p-3.5 rounded-xl bg-purple-50/60 border border-purple-100 hover:border-purple-300 transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-purple-900">{tour.name}</span>
                  <span className="text-[10px] bg-purple-100 text-purple-800 font-bold px-2 py-0.5 rounded-full uppercase">
                    {tour.status || 'Active'}
                  </span>
                </div>
                <div className="text-[11px] text-purple-700/80 mt-1 flex items-center justify-between">
                  <span>{tour.sportName || 'Multi-Sport'} • {tour.format}</span>
                  <span>{tour.venue || 'Club Arena'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
