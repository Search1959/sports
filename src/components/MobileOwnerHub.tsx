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
  Wallet,
  Users,
  CalendarCheck,
  Trophy,
  MessageSquareText,
  MessageCircle,
  Shield,
  UserPlus,
  Globe,
  Plus,
  Send,
  ChevronRight,
  ExternalLink,
  Laptop,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Phone,
  Sparkles,
  MapPin,
  PackageCheck,
  Award,
  Settings,
  ArrowRight,
  Clock,
} from 'lucide-react';
import { MembershipFeeReminderModal } from './MembershipFeeReminderModal.tsx';

interface MobileOwnerHubProps {
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
  onSwitchToDesktopView?: () => void;
}

export const MobileOwnerHub: React.FC<MobileOwnerHubProps> = ({
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
  equipment = [],
  leads = [],
  onNavigateTab,
  onSendWhatsAppReminder,
  onSwitchToDesktopView,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [isSendingReminder, setIsSendingReminder] = useState(false);
  const [reminderSuccess, setReminderSuccess] = useState(false);
  const [showSecondaryTools, setShowSecondaryTools] = useState(false);
  const [isFeeReminderModalOpen, setIsFeeReminderModalOpen] = useState(false);

  const currency = activeOrg?.currency === 'INR' ? '₹' : activeOrg?.currency || '$';

  // Calculations for vital metrics
  const pendingInvoices = invoices.filter((i) => i.status === 'due' || i.status === 'overdue');
  const pendingAmount = pendingInvoices.reduce((sum, i) => sum + parseFloat(i.amount || '0'), 0);
  const totalCollectedAmount = payments.reduce((sum, p) => sum + parseFloat(p.amount || '0'), 0);

  // Next upcoming session
  const nextSession = sessions[0] || null;

  // Active tournament
  const activeTournament = tournaments[0] || null;

  // Handle rapid WhatsApp fee reminder blast
  const handleQuickBlast = async () => {
    if (!onSendWhatsAppReminder) return;
    try {
      setIsSendingReminder(true);
      await onSendWhatsAppReminder();
      setReminderSuccess(true);
      setTimeout(() => setReminderSuccess(false), 3000);
    } catch (e) {
      console.warn('Reminder error:', e);
    } finally {
      setIsSendingReminder(false);
    }
  };

  const handleCopyWebsiteLink = () => {
    const url = `${window.location.origin}/#${activeOrg?.slug || 'club'}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="space-y-4 pb-20 max-w-lg mx-auto">
      {/* Club Owner Profile & Greeting Bar */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-blue-950 text-white rounded-3xl p-5 shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-36 h-36 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center space-x-3 min-w-0">
            {activeOrg?.logo ? (
              <img
                src={activeOrg.logo}
                alt={activeOrg.name}
                className="w-12 h-12 rounded-2xl object-cover border-2 border-white/20 shadow-md shrink-0"
              />
            ) : (
              <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white font-bold flex items-center justify-center text-base border-2 border-white/20 shadow-md shrink-0">
                {activeOrg?.shortName?.slice(0, 2) || 'SO'}
              </div>
            )}
            <div className="min-w-0">
              <div className="flex items-center space-x-1.5">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30">
                  Club Owner
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {new Date().toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                </span>
              </div>
              <h1 className="text-lg font-bold text-white truncate mt-0.5">
                {activeOrg?.name || 'My Sports Academy'}
              </h1>
              <p className="text-xs text-slate-300 truncate">
                {activeOrg?.city || 'Club Operations'} • {sports.length} Sports
              </p>
            </div>
          </div>

          {onSwitchToDesktopView && (
            <button
              onClick={onSwitchToDesktopView}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 text-[11px] font-medium transition-colors shrink-0 flex items-center space-x-1 border border-white/10"
              title="Switch to full desktop analytical view"
            >
              <Laptop className="w-3.5 h-3.5 text-blue-300" />
              <span className="hidden sm:inline">Desktop</span>
            </button>
          )}
        </div>

        {/* Quick Club Pulse (4 compact chips) */}
        <div className="grid grid-cols-4 gap-2 mt-4 pt-4 border-t border-white/10 text-center">
          <div className="bg-white/5 rounded-xl p-2 border border-white/5">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Athletes</div>
            <div className="text-base font-bold text-white mt-0.5">{members.length}</div>
          </div>
          <div className="bg-white/5 rounded-xl p-2 border border-white/5">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Squads</div>
            <div className="text-base font-bold text-white mt-0.5">{teams.length}</div>
          </div>
          <div className="bg-white/5 rounded-xl p-2 border border-white/5">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Today</div>
            <div className="text-base font-bold text-white mt-0.5">{sessions.length}</div>
          </div>
          <div className="bg-white/5 rounded-xl p-2 border border-white/5">
            <div className="text-[10px] text-amber-300 uppercase font-semibold">Due Fees</div>
            <div className="text-base font-bold text-amber-400 mt-0.5">
              {pendingInvoices.length}
            </div>
          </div>
        </div>
      </div>

      {/* Mode Header Banner */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-1.5">
            <span>Important Menus</span>
            <span className="text-[10px] font-normal px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-semibold">
              Owner Cards
            </span>
          </h2>
          <p className="text-[11px] text-slate-500">Tap cards to manage on the go</p>
        </div>
        <span className="text-[11px] text-slate-400 font-medium">
          Desktop for major tasks
        </span>
      </div>

      {/* ========================================================================= */}
      {/* 1. FEE COLLECTION & INVOICES CARD */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-3xl p-5 border border-amber-200/80 shadow-xs hover:shadow-md transition-all">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100 shrink-0">
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-slate-900 text-sm">Fee Collection & Dues</span>
                {pendingInvoices.length > 0 && (
                  <span className="px-2 py-0.5 bg-amber-500 text-white font-bold text-[10px] rounded-full animate-pulse">
                    {pendingInvoices.length} Due
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">Collect membership & batch fees</p>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('finance')}
            className="text-slate-400 hover:text-slate-600 p-1"
            aria-label="Open Finance"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Amount highlights */}
        <div className="mt-4 p-3 rounded-2xl bg-amber-50/50 border border-amber-100 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block">
              Pending Amount
            </span>
            <span className="text-lg font-black text-amber-700 font-mono">
              {currency} {pendingAmount.toLocaleString()}
            </span>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block">
              Collected Total
            </span>
            <span className="text-sm font-bold text-emerald-600 font-mono">
              {currency} {totalCollectedAmount.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="space-y-2 mt-3">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onNavigateTab('finance')}
              className="py-2.5 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors shadow-xs"
            >
              <Wallet className="w-3.5 h-3.5" />
              <span>Manage Fees</span>
            </button>
            <button
              onClick={handleQuickBlast}
              disabled={isSendingReminder || pendingInvoices.length === 0}
              className={`py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors border ${
                reminderSuccess
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-600'
              } disabled:opacity-50`}
            >
              {reminderSuccess ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Sent!</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSendingReminder ? 'Sending...' : 'Remind All Due'}</span>
                </>
              )}
            </button>
          </div>

          <button
            onClick={() => setIsFeeReminderModalOpen(true)}
            className="w-full py-2 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-bold flex items-center justify-center space-x-2 transition-colors"
          >
            <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
            <span>Launch WhatsApp Fee Reminder Model (Custom & UPI)</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. ATHLETES & MEMBERS CARD */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs hover:shadow-md transition-all">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-slate-900 text-sm">Athletes & Members</span>
                <span className="px-2 py-0.5 bg-blue-50 text-blue-700 font-bold text-[10px] rounded-full border border-blue-200">
                  {members.length} Enrolled
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">Player cards, contact info & status</p>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('members')}
            className="text-slate-400 hover:text-slate-600 p-1"
            aria-label="Open Members"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Recent Athletes Preview */}
        <div className="mt-3.5 flex items-center space-x-2 overflow-x-auto pb-1 no-scrollbar">
          {members.slice(0, 5).map((m) => {
            const name = m.fullName || `${m.firstName || ''} ${m.lastName || ''}`.trim() || 'Athlete';
            const initial = (name[0] || 'A').toUpperCase();
            return (
              <div
                key={m.id}
                onClick={() => onNavigateTab('members')}
                className="px-2.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs shrink-0 flex items-center space-x-1.5 cursor-pointer hover:bg-slate-100"
              >
                <div className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-[9px] flex items-center justify-center shrink-0">
                  {initial}
                </div>
                <span className="font-medium text-slate-900 truncate max-w-[100px]">
                  {name}
                </span>
              </div>
            );
          })}
          {members.length > 5 && (
            <div
              onClick={() => onNavigateTab('members')}
              className="px-2.5 py-1.5 rounded-xl bg-slate-100 text-slate-600 text-xs shrink-0 font-medium cursor-pointer"
            >
              +{members.length - 5} more
            </div>
          )}
        </div>

        {/* Quick Action Buttons */}
        <div className="grid grid-cols-2 gap-2 mt-3.5">
          <button
            onClick={() => onNavigateTab('members')}
            className="py-2.5 px-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors shadow-xs"
          >
            <Users className="w-3.5 h-3.5" />
            <span>Search & View</span>
          </button>
          <button
            onClick={() => onNavigateTab('members')}
            className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-blue-600" />
            <span>+ Add Athlete</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. TODAY'S ATTENDANCE & DRILLS CARD */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs hover:shadow-md transition-all">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shrink-0">
              <CalendarCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-slate-900 text-sm">Attendance & Drills</span>
                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 font-bold text-[10px] rounded-full border border-emerald-200">
                  {sessions.length} Batches
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">Mark attendance & training logs</p>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('attendance')}
            className="text-slate-400 hover:text-slate-600 p-1"
            aria-label="Open Attendance"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Next Session Highlight */}
        <div className="mt-3.5 p-3 rounded-2xl bg-emerald-50/40 border border-emerald-100">
          {nextSession ? (
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider block">
                  Upcoming Drill Session
                </span>
                <span className="text-xs font-bold text-slate-900 block mt-0.5 truncate max-w-[200px]">
                  {nextSession.title}
                </span>
                <span className="text-[11px] text-slate-500 flex items-center space-x-1 mt-0.5">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span>
                    {nextSession.startTime || '07:00'} - {nextSession.endTime || '08:30'}
                  </span>
                </span>
              </div>
              <span className="px-2 py-1 bg-white rounded-lg border border-emerald-200 text-emerald-700 font-semibold text-xs">
                {nextSession.sportName || 'Active'}
              </span>
            </div>
          ) : (
            <div className="text-xs text-slate-500 py-1">
              No sessions scheduled today. Tap below to create one.
            </div>
          )}
        </div>

        <button
          onClick={() => onNavigateTab('attendance')}
          className="w-full mt-3 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors shadow-xs"
        >
          <CalendarCheck className="w-3.5 h-3.5" />
          <span>Mark Player Attendance</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 4. TOURNAMENTS & MATCH SCORING CARD */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs hover:shadow-md transition-all">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 shrink-0">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-slate-900 text-sm">Tournaments & Matches</span>
                {tournaments.length > 0 && (
                  <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 font-bold text-[10px] rounded-full border border-indigo-200">
                    {tournaments.length} Active
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">Live scores, fixtures & standings</p>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('tournaments')}
            className="text-slate-400 hover:text-slate-600 p-1"
            aria-label="Open Tournaments"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {activeTournament ? (
          <div className="mt-3.5 p-3 rounded-2xl bg-indigo-50/40 border border-indigo-100 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-indigo-700 font-bold uppercase tracking-wider block">
                Current Tournament
              </span>
              <span className="text-xs font-bold text-slate-900 block mt-0.5 truncate max-w-[200px]">
                {activeTournament.name}
              </span>
              <span className="text-[11px] text-slate-500">
                {activeTournament.sportName || 'Championship'} • {activeTournament.matches?.length || 0} Matches
              </span>
            </div>
            <button
              onClick={() => onNavigateTab('tournaments')}
              className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold shrink-0"
            >
              Live Score
            </button>
          </div>
        ) : (
          <div className="mt-3 text-xs text-slate-500">
            Organize leagues, knockout brackets, and record scores on the field.
          </div>
        )}

        <div className="grid grid-cols-2 gap-2 mt-3">
          <button
            onClick={() => onNavigateTab('tournaments')}
            className="py-2.5 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors shadow-xs"
          >
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>View Matches</span>
          </button>
          <button
            onClick={() => onNavigateTab('tournaments')}
            className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-indigo-600" />
            <span>+ New Fixture</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. WHATSAPP PARENT & SQUAD DESK CARD */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs hover:shadow-md transition-all">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shrink-0">
              <MessageSquareText className="w-6 h-6" />
            </div>
            <div>
              <span className="font-bold text-slate-900 text-sm">WhatsApp Communication</span>
              <p className="text-xs text-slate-500 mt-0.5">Broadcast reminders & alerts to parents</p>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('whatsapp')}
            className="text-slate-400 hover:text-slate-600 p-1"
            aria-label="Open WhatsApp"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-600 mt-3 leading-relaxed">
          Send 1-touch schedule updates, tournament call-ups, or fee reminder messages directly to athlete contacts.
        </p>

        <button
          onClick={() => onNavigateTab('whatsapp')}
          className="w-full mt-3 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors shadow-xs"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Open WhatsApp Broadcast Desk</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 6. COACHES & SQUADS + LEADS (2-Column Grid) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 gap-3">
        {/* Coaches & Squads Card */}
        <div
          onClick={() => onNavigateTab('teams')}
          className="bg-white rounded-3xl p-4 border border-slate-200/90 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100 mb-2">
              <Shield className="w-5 h-5" />
            </div>
            <div className="font-bold text-slate-900 text-xs">Squads & Coaches</div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              {teams.length} Squads • {coaches.length} Coaches
            </div>
          </div>
          <div className="mt-3 flex items-center text-purple-600 text-xs font-bold">
            <span>Rosters</span>
            <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
          </div>
        </div>

        {/* Admissions & Leads Card */}
        <div
          onClick={() => onNavigateTab('leads')}
          className="bg-white rounded-3xl p-4 border border-slate-200/90 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100 mb-2">
              <UserPlus className="w-5 h-5" />
            </div>
            <div className="font-bold text-slate-900 text-xs">New Inquiries</div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              {leads.length} Prospective Players
            </div>
          </div>
          <div className="mt-3 flex items-center text-amber-600 text-xs font-bold">
            <span>Follow Up</span>
            <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 7. CLUB MICROSITE & REGISTRATION LINK CARD */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shrink-0">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-slate-900 text-xs block">Public Club Microsite</span>
              <span className="text-[11px] text-slate-500">Share with parents for admissions</span>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('website')}
            className="text-xs text-blue-600 font-semibold hover:underline"
          >
            Preview
          </button>
        </div>

        <div className="mt-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
          <span className="text-[11px] font-mono text-slate-600 truncate max-w-[210px]">
            {window.location.origin}/#{activeOrg?.slug || 'club'}
          </span>
          <button
            onClick={handleCopyWebsiteLink}
            className="px-2 py-1 bg-white hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-medium border border-slate-200 flex items-center space-x-1 shrink-0"
          >
            {copiedLink ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
            <span>{copiedLink ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 8. DESKTOP AVAILABILITY NOTICE (EXPLICIT USER INTENT) */}
      {/* ========================================================================= */}
      <div className="bg-slate-900 text-white rounded-3xl p-5 border border-slate-800 shadow-sm relative overflow-hidden">
        <div className="flex items-start space-x-3.5">
          <div className="w-10 h-10 rounded-2xl bg-blue-500/20 border border-blue-500/30 text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
            <Laptop className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <div className="text-xs font-bold text-white flex items-center space-x-1.5">
              <span>Major Tasks Available on Desktop</span>
              <span className="text-[9px] px-1.5 py-0.2 bg-blue-500/20 text-blue-300 rounded font-mono">
                Pro
              </span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Mobile is streamlined for quick club owner operations (attendance, fee receipts, fixtures, WhatsApp alerts).
              For detailed fiscal audits, custom QR certificate design, and multi-branch management, open this app on your desktop computer.
            </p>
          </div>
        </div>

        {onSwitchToDesktopView && (
          <button
            onClick={onSwitchToDesktopView}
            className="mt-3.5 w-full py-2.5 px-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center space-x-2 transition-colors"
          >
            <span>Preview Full Desktop Dashboard on this Screen</span>
            <ArrowRight className="w-3.5 h-3.5 text-blue-400" />
          </button>
        )}
      </div>

      {/* ========================================================================= */}
      {/* SECONDARY TOOLS ACCORDION */}
      {/* ========================================================================= */}
      <div className="pt-1">
        <button
          onClick={() => setShowSecondaryTools(!showSecondaryTools)}
          className="w-full py-2.5 px-4 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-xs font-semibold flex items-center justify-between transition-colors shadow-2xs"
        >
          <span>More Operations & Facility Tools</span>
          <ChevronRight
            className={`w-4 h-4 text-slate-400 transition-transform ${showSecondaryTools ? 'rotate-90' : ''}`}
          />
        </button>

        {showSecondaryTools && (
          <div className="grid grid-cols-2 gap-2 mt-2 animate-in fade-in duration-200">
            <button
              onClick={() => onNavigateTab('facilities')}
              className="p-3 bg-white border border-slate-200 rounded-2xl text-left hover:border-blue-400 transition-all shadow-2xs"
            >
              <MapPin className="w-4 h-4 text-blue-600 mb-1" />
              <div className="text-xs font-bold text-slate-900">Courts & Facilities</div>
              <div className="text-[10px] text-slate-500">{facilities.length} Venues</div>
            </button>
            <button
              onClick={() => onNavigateTab('inventory')}
              className="p-3 bg-white border border-slate-200 rounded-2xl text-left hover:border-blue-400 transition-all shadow-2xs"
            >
              <PackageCheck className="w-4 h-4 text-emerald-600 mb-1" />
              <div className="text-xs font-bold text-slate-900">Equipment Stock</div>
              <div className="text-[10px] text-slate-500">{equipment.length} Items</div>
            </button>
            <button
              onClick={() => onNavigateTab('certificates')}
              className="p-3 bg-white border border-slate-200 rounded-2xl text-left hover:border-blue-400 transition-all shadow-2xs"
            >
              <Award className="w-4 h-4 text-amber-600 mb-1" />
              <div className="text-xs font-bold text-slate-900">ID Cards & Certificates</div>
              <div className="text-[10px] text-slate-500">CR80 Passes & 8 Sports Certs</div>
            </button>
            <button
              onClick={() => onNavigateTab('settings')}
              className="p-3 bg-white border border-slate-200 rounded-2xl text-left hover:border-blue-400 transition-all shadow-2xs"
            >
              <Settings className="w-4 h-4 text-slate-600 mb-1" />
              <div className="text-xs font-bold text-slate-900">Club Settings</div>
              <div className="text-[10px] text-slate-500">Branches & Branding</div>
            </button>
          </div>
        )}
      </div>

      {/* Membership Fee Reminder WhatsApp Modal */}
      {isFeeReminderModalOpen && (
        <MembershipFeeReminderModal
          isOpen={isFeeReminderModalOpen}
          onClose={() => setIsFeeReminderModalOpen(false)}
          members={members}
          invoices={invoices}
          activeOrgName={activeOrg?.name}
          onSendApiReminder={onSendWhatsAppReminder ? async (params) => {
            return await onSendWhatsAppReminder();
          } : undefined}
        />
      )}
    </div>
  );
};
