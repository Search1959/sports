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
          <div className="relative bg-white rounded-t-3xl max-h-[85vh] flex flex-col shadow-2xl border-t border-slate-200 z-10 animate-in slide-in-from-bottom duration-250">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">
                  SO
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">All Club Menus</h3>
                  <p className="text-[11px] text-slate-500">Tap to jump directly to any section</p>
                </div>
              </div>
              <button
                onClick={() => setIsMoreOpen(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content List */}
            <div className="p-4 overflow-y-auto space-y-2">
              <div className="p-2.5 bg-blue-50/70 border border-blue-100 rounded-xl flex items-center space-x-2.5 text-xs text-blue-800 mb-2">
                <Laptop className="w-4 h-4 text-blue-600 shrink-0" />
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
                          ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20'
                          : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800'
                      }`}
                    >
                      <div className="flex items-center space-x-3 min-w-0">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                            isActive ? 'bg-white/20 text-white' : 'bg-white text-slate-700 shadow-2xs border border-slate-200/60'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className={`text-xs font-bold truncate ${isActive ? 'text-white' : 'text-slate-900'}`}>
                            {tab.label}
                          </div>
                          <div className={`text-[10px] truncate ${isActive ? 'text-blue-100' : 'text-slate-500'}`}>
                            {tab.desc}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="p-3 border-t border-slate-100 bg-slate-50 text-center">
              <button
                onClick={() => {
                  onSelectTab('dashboard');
                  setIsMoreOpen(false);
                }}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold"
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
        className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-2 py-1.5 lg:hidden shadow-lg safe-area-pb"
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
                    ? 'text-blue-600 font-bold'
                    : 'text-slate-500 hover:text-slate-900 font-medium'
                }`}
              >
                <div className="relative">
                  <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110 stroke-[2.5]' : 'stroke-2'}`} />
                  {tab.badge && (
                    <span
                      className={`absolute -top-1.5 -right-2.5 px-1 py-0.2 text-[9px] font-bold rounded-full border ${
                        tab.badgeAlert
                          ? 'bg-amber-500 text-white border-white animate-pulse'
                          : 'bg-blue-600 text-white border-white'
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
                  <span className="w-1 h-1 rounded-full bg-blue-600 mt-0.5" />
                )}
              </button>
            );
          })}

          {/* "More" Trigger */}
          <button
            onClick={() => setIsMoreOpen(true)}
            className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all ${
              !mainTabs.some((t) => t.id === activeTab)
                ? 'text-blue-600 font-bold'
                : 'text-slate-500 hover:text-slate-900 font-medium'
            }`}
          >
            <MoreHorizontal className="w-5 h-5 stroke-2" />
            <span className="text-[10px] mt-1 tracking-tight">More</span>
            {!mainTabs.some((t) => t.id === activeTab) && (
              <span className="w-1 h-1 rounded-full bg-blue-600 mt-0.5" />
            )}
          </button>
        </div>
      </nav>
    </>
  );
};
