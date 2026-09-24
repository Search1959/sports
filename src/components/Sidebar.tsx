import React, { useState } from 'react';
import { Organization } from '../types.ts';
import {
  LayoutDashboard,
  Users,
  Trophy,
  Shield,
  CalendarCheck,
  MapPin,
  Swords,
  PackageCheck,
  Wallet,
  MessageSquareText,
  UserPlus,
  Award,
  Globe,
  Settings,
  Building2,
  ChevronDown,
  PlusCircle,
  ShieldCheck,
  Menu,
  X,
  ChevronRight,
  Layers,
  LayoutGrid,
  Laptop,
} from 'lucide-react';

interface SidebarProps {
  organizations: Organization[];
  activeOrg: Organization | null;
  onSelectOrg: (org: Organization) => void;
  activeTab: string;
  onSelectTab: (tab: string) => void;
  onOpenOnboarding: () => void;
  onOpenSecurityTest: () => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  pendingDuesCount?: number;
  membersCount?: number;
  teamsCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  organizations,
  activeOrg,
  onSelectOrg,
  activeTab,
  onSelectTab,
  onOpenOnboarding,
  onOpenSecurityTest,
  isOpenMobile,
  onCloseMobile,
  pendingDuesCount = 0,
  membersCount = 0,
  teamsCount = 0,
}) => {
  const [isOrgDropdownOpen, setIsOrgDropdownOpen] = useState(false);

  const navGroups = [
    {
      title: 'Club Management',
      items: [
        {
          id: 'dashboard',
          label: 'Executive Dashboard',
          icon: LayoutDashboard,
        },
        {
          id: 'members',
          label: 'Athletes & Members',
          icon: Users,
          badge: membersCount > 0 ? `${membersCount}` : undefined,
          badgeColor: 'bg-slate-100 text-slate-700',
        },
        {
          id: 'sports',
          label: 'Sports & Disciplines',
          icon: Trophy,
        },
        {
          id: 'teams',
          label: 'Coaches & Squads',
          icon: Shield,
          badge: teamsCount > 0 ? `${teamsCount}` : undefined,
          badgeColor: 'bg-slate-100 text-slate-700',
        },
        {
          id: 'attendance',
          label: 'Attendance & Drills',
          icon: CalendarCheck,
        },
      ],
    },
    {
      title: 'Operations & Facilities',
      items: [
        {
          id: 'facilities',
          label: 'Courts & Facilities',
          icon: MapPin,
        },
        {
          id: 'tournaments',
          label: 'Tournaments & Fixtures',
          icon: Swords,
        },
        {
          id: 'inventory',
          label: 'Equipment & Stock',
          icon: PackageCheck,
        },
      ],
    },
    {
      title: 'Fee & Engagement',
      items: [
        {
          id: 'finance',
          label: 'Fee, Invoices & Dues',
          icon: Wallet,
          badge: pendingDuesCount > 0 ? `${pendingDuesCount} Due` : undefined,
          badgeColor: 'bg-amber-100 text-amber-800 font-semibold',
        },
        {
          id: 'whatsapp',
          label: 'WhatsApp Desk',
          icon: MessageSquareText,
        },
        {
          id: 'leads',
          label: 'Inquiries & Admissions',
          icon: UserPlus,
        },
      ],
    },
    {
      title: 'Platform & Public',
      items: [
        {
          id: 'certificates',
          label: 'ID Cards & Certificates',
          icon: Award,
        },
        {
          id: 'website',
          label: 'Public Microsite',
          icon: Globe,
        },
        {
          id: 'settings',
          label: 'Settings & Branches',
          icon: Settings,
        },
      ],
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white border-r border-slate-200 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:z-auto ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top Branding */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-sm text-slate-900 leading-tight flex items-center space-x-1">
                <span>SportOrg</span>
                <span className="text-[10px] px-1.5 py-0.2 bg-blue-50 text-blue-700 rounded font-mono font-medium">
                  SaaS
                </span>
              </div>
              <div className="text-[10px] text-slate-400">Multi-Tenant Platform</div>
            </div>
          </div>
          <button
            onClick={onCloseMobile}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tenant Organization Switcher */}
        <div className="p-3 border-b border-slate-100 relative">
          <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 px-1">
            Active Tenant Organization
          </div>
          <button
            onClick={() => setIsOrgDropdownOpen(!isOrgDropdownOpen)}
            className="w-full flex items-center justify-between p-2 rounded-xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200 transition-colors text-left"
          >
            <div className="flex items-center space-x-2 min-w-0">
              {activeOrg?.logo ? (
                <img
                  src={activeOrg.logo}
                  alt={activeOrg.name}
                  className="w-7 h-7 rounded-lg object-cover border border-slate-200 shrink-0"
                />
              ) : (
                <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                  {activeOrg?.shortName?.slice(0, 2) || 'SO'}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-slate-900 truncate">
                  {activeOrg?.name || 'Select Organization'}
                </div>
                <div className="text-[10px] text-slate-500 truncate flex items-center space-x-1">
                  <span>{activeOrg?.city || 'Club'}</span>
                  <span>•</span>
                  <span className="font-mono text-blue-600 font-medium">{activeOrg?.shortName}</span>
                </div>
              </div>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 ml-1" />
          </button>

          {/* Org Dropdown Menu */}
          {isOrgDropdownOpen && (
            <div className="absolute left-3 right-3 top-18 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50">
              <div className="px-3 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Switch Organization
              </div>
              <div className="max-h-56 overflow-y-auto divide-y divide-slate-50">
                {organizations.map((org) => (
                  <button
                    key={org.id}
                    onClick={() => {
                      onSelectOrg(org);
                      setIsOrgDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 flex items-center space-x-2 transition-colors ${
                      activeOrg?.id === org.id
                        ? 'bg-blue-50 text-blue-900 font-semibold'
                        : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    {org.logo ? (
                      <img
                        src={org.logo}
                        alt={org.name}
                        className="w-6 h-6 rounded-md object-cover border border-slate-200 shrink-0"
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-md bg-slate-100 flex items-center justify-center font-bold text-[10px] text-slate-600 shrink-0">
                        {org.shortName?.slice(0, 2)}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="text-xs truncate">{org.name}</div>
                      <div className="text-[10px] text-slate-400 truncate">{org.city} • {org.type}</div>
                    </div>
                  </button>
                ))}
              </div>
              <div className="p-1.5 border-t border-slate-100 mt-1">
                <button
                  onClick={() => {
                    setIsOrgDropdownOpen(false);
                    onOpenOnboarding();
                  }}
                  className="w-full py-1.5 px-2.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Onboard New Club</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Scrollable Navigation Items */}
        <div className="flex-1 overflow-y-auto p-3 space-y-4">
          {/* Mobile Owner Cards Hub Shortcut (Highlighted for mobile club owners) */}
          <div className="p-3 rounded-2xl bg-gradient-to-br from-slate-900 to-blue-950 text-white shadow-sm border border-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-xs shrink-0">
                  <LayoutGrid className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white leading-tight">Mobile Cards Hub</div>
                  <div className="text-[10px] text-blue-200">Owner Touch View</div>
                </div>
              </div>
              <button
                onClick={() => {
                  onSelectTab('dashboard');
                  if (onCloseMobile) onCloseMobile();
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all shadow-xs ${
                  activeTab === 'dashboard'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
              >
                Cards
              </button>
            </div>
            <div className="mt-2 pt-2 border-t border-white/10 flex items-center justify-between text-[10px] text-slate-400">
              <span>Quick on-field actions</span>
              <span className="text-blue-300 font-medium">Desktop for major tasks</span>
            </div>
          </div>

          {navGroups.map((group, gIdx) => (
            <div key={gIdx} className="space-y-1">
              <div className="px-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span>{group.title}</span>
                {gIdx === 0 && (
                  <span className="text-[9px] font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.2 rounded">
                    Core
                  </span>
                )}
              </div>
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onSelectTab(item.id);
                      if (onCloseMobile) onCloseMobile();
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-blue-600 text-white font-semibold shadow-xs'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5 truncate">
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                      <span className="truncate">{item.label}</span>
                    </div>
                    {item.badge && (
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded-md shrink-0 ml-1 ${
                          isActive ? 'bg-white/20 text-white' : item.badgeColor || 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Tenant Isolation Status & Security Test Footer */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/70">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-1.5 text-[11px] text-emerald-700 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Org #{activeOrg?.id} Isolated</span>
            </div>
            <span className="text-[10px] font-mono text-slate-400">PostgreSQL</span>
          </div>

          <button
            onClick={onOpenSecurityTest}
            className="w-full flex items-center justify-center space-x-1.5 py-1.5 px-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-medium transition-colors shadow-2xs"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            <span>Audit Tenant Isolation</span>
          </button>
        </div>
      </aside>
    </>
  );
};
