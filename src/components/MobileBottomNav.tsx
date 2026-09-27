import React, { useState } from 'react';
import {
  LayoutGrid,
  Users,
  Wallet,
  Trophy,
  MoreHorizontal,
  CalendarCheck,
  MessageSquareText,
  UserPlus,
  Shield,
  MapPin,
  PackageCheck,
  Award,
  Globe,
  Settings,
  X,
  Laptop,
} from 'lucide-react';

interface MobileBottomNavProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  pendingDuesCount?: number;
  membersCount?: number;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onSelectTab,
  pendingDuesCount = 0,
  membersCount = 0,
}) => {
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  const mainTabs = [
    {
      id: 'dashboard',
      label: 'Hub',
      icon: LayoutGrid,
    },
    {
      id: 'members',
      label: 'Athletes',
      icon: Users,
      badge: membersCount > 0 ? `${membersCount}` : undefined,
    },
    {
      id: 'finance',
      label: 'Fees',
      icon: Wallet,
      badge: pendingDuesCount > 0 ? `${pendingDuesCount}` : undefined,
      badgeAlert: true,
    },
    {
      id: 'tournaments',
      label: 'Matches',
      icon: Trophy,
    },
  ];

  const secondaryTabs = [
    { id: 'attendance', label: 'Drills & Attendance', icon: CalendarCheck, desc: 'Mark today’s player attendance' },
    { id: 'whatsapp', label: 'WhatsApp Desk', icon: MessageSquareText, desc: 'Quick broadcast to parents/teams' },
    { id: 'teams', label: 'Coaches & Squads', icon: Shield, desc: 'Roster and coach assignments' },
    { id: 'leads', label: 'New Inquiries', icon: UserPlus, desc: 'Admissions & interested athletes' },
    { id: 'facilities', label: 'Courts & Facilities', icon: MapPin, desc: 'Turf and court bookings' },
    { id: 'inventory', label: 'Equipment Stock', icon: PackageCheck, desc: 'Balls, cones & gear' },
    { id: 'certificates', label: 'Certificates & QR ID', icon: Award, desc: 'Player ID cards & awards' },
    { id: 'website', label: 'Public Club Website', icon: Globe, desc: 'Share registration link' },
    { id: 'settings', label: 'Settings & Branches', icon: Settings, desc: 'Organization profile' },
  ];

  return (
    <>
      {/* Bottom Sheet for "More" */}
      {isMoreOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMoreOpen(false)}
          />

          {/* Sheet Modal */}
          <div className="relative bg-[var(--sports-surface,#101935)] rounded-t-3xl max-h-[85vh] flex flex-col shadow-2xl border-t border-[var(--sports-border,#1e2e5c)] z-10 animate-in slide-in-from-bottom duration-250 text-white">
            <div className="p-4 border-b border-[var(--sports-border,#1e2e5c)] flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  SO
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">All Club Menus</h3>
                  <p className="text-[11px] text-slate-400">Tap to jump directly to any section</p>
                </div>
              </div>
              <button
                onClick={() => setIsMoreOpen(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content List */}
            <div className="p-4 overflow-y-auto space-y-2">
              <div className="p-2.5 bg-blue-900/30 border border-blue-500/30 rounded-xl flex items-center space-x-2.5 text-xs text-blue-300 mb-2">
                <Laptop className="w-4 h-4 text-blue-400 shrink-0" />
                <span className="text-[11px] leading-tight">
                  <strong>Tip for Club Owners:</strong> Use mobile for rapid daily check-ins. Full reporting and data export are ready on desktop.
                </span>
              </div>

              <div className="grid grid-cols-1 gap-2">
                {secondaryTabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        onSelectTab(tab.id);
                        setIsMoreOpen(false);
                      }}
                      className={`w-full flex items-center justify-between p-3 rounded-2xl border text-left transition-all ${
                        isActive
                          ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-500/30'
                          : 'bg-[var(--sports-surface-subtle,#0c142c)] hover:bg-[var(--sports-surface-elevated,#162248)] border-[var(--sports-border,#1e2e5c)] text-slate-200'
                      }`}
                    >
                      <div className="flex items-center space-x-3 min-w-0">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                            isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-300 shadow-2xs border border-[var(--sports-border,#1e2e5c)]'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className={`text-xs font-bold truncate ${isActive ? 'text-white' : 'text-slate-100'}`}>
                            {tab.label}
                          </div>
                          <div className={`text-[10px] truncate ${isActive ? 'text-blue-100' : 'text-slate-400'}`}>
                            {tab.desc}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="p-3 border-t border-[var(--sports-border,#1e2e5c)] bg-[var(--sports-surface-subtle,#0c142c)] text-center">
              <button
                onClick={() => {
                  onSelectTab('dashboard');
                  setIsMoreOpen(false);
                }}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-md transition-colors"
              >
                Return to Cards Hub
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Persistent Bottom Bar */}
      <nav
        aria-label="Mobile Bottom Navigation"
        className="fixed bottom-0 left-0 right-0 z-40 bg-[var(--sports-surface,#101935)]/95 backdrop-blur-md border-t border-[var(--sports-border,#1e2e5c)] px-2 py-1.5 lg:hidden shadow-2xl safe-area-pb"
      >
        <div className="grid grid-cols-5 gap-1 max-w-md mx-auto">
          {mainTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className={`relative flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all ${
                  isActive
                    ? 'text-blue-400 font-bold'
                    : 'text-slate-400 hover:text-white font-medium'
                }`}
              >
                <div className="relative">
                  <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110 stroke-[2.5]' : 'stroke-2'}`} />
                  {tab.badge && (
                    <span
                      className={`absolute -top-1.5 -right-2.5 px-1 py-0.2 text-[9px] font-bold rounded-full border ${
                        tab.badgeAlert
                          ? 'bg-amber-500 text-white border-amber-400 animate-pulse'
                          : 'bg-blue-600 text-white border-blue-400'
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </div>
                <span className="text-[10px] mt-1 tracking-tight truncate max-w-full">
                  {tab.label}
                </span>
                {isActive && (
                  <span className="w-1 h-1 rounded-full bg-blue-400 mt-0.5" />
                )}
              </button>
            );
          })}

          {/* "More" Trigger */}
          <button
            onClick={() => setIsMoreOpen(true)}
            className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all ${
              !mainTabs.some((t) => t.id === activeTab)
                ? 'text-blue-400 font-bold'
                : 'text-slate-400 hover:text-white font-medium'
            }`}
          >
            <MoreHorizontal className="w-5 h-5 stroke-2" />
            <span className="text-[10px] mt-1 tracking-tight">More</span>
            {!mainTabs.some((t) => t.id === activeTab) && (
              <span className="w-1 h-1 rounded-full bg-blue-400 mt-0.5" />
            )}
          </button>
        </div>
      </nav>
    </>
  );
};
