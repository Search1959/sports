import React from 'react';
import { Organization } from '../types.ts';
import {
  Building2,
  ChevronDown,
  Globe,
  ShieldCheck,
  Award,
  PlusCircle,
  LayoutDashboard,
  Layers,
} from 'lucide-react';

interface HeaderProps {
  organizations: Organization[];
  activeOrg: Organization | null;
  onSelectOrg: (org: Organization) => void;
  activeTab: string;
  onSelectTab: (tab: string) => void;
  onOpenOnboarding: () => void;
  onOpenSecurityTest: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  organizations,
  activeOrg,
  onSelectOrg,
  activeTab,
  onSelectTab,
  onOpenOnboarding,
  onOpenSecurityTest,
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      {/* Top tier: Platform identity, tenant selector, global actions */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Platform Logo & Tenant Selector */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-xs">
                <Layers className="w-5 h-5" />
              </div>
              <div className="hidden sm:block">
                <div className="font-bold text-base text-slate-900 leading-tight">SportOrg</div>
                <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Multi-Org SaaS</div>
              </div>
            </div>

            <div className="h-6 w-px bg-slate-200" />

            {/* Active Organization Switcher Dropdown */}
            <div className="relative group">
              <div className="flex items-center space-x-2.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-slate-100/80 transition-colors cursor-pointer">
                {activeOrg?.logo ? (
                  <img
                    src={activeOrg.logo}
                    alt={activeOrg.name}
                    className="w-6 h-6 rounded-md object-cover border border-slate-200"
                  />
                ) : (
                  <Building2 className="w-5 h-5 text-blue-600" />
                )}
                <div className="text-left">
                  <div className="text-sm font-semibold text-slate-800 flex items-center space-x-1.5">
                    <span className="truncate max-w-[140px] sm:max-w-[220px]">{activeOrg?.name || 'Select Tenant'}</span>
                    <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-mono font-medium">
                      {activeOrg?.shortName || 'ORG'}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 flex items-center space-x-1">
                    <span>{activeOrg?.type}</span>
                    <span>•</span>
                    <span>{activeOrg?.city}</span>
                  </div>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </div>

              {/* Dropdown Menu */}
              <div className="absolute left-0 mt-1 w-72 bg-white rounded-xl shadow-lg border border-slate-200 py-2 hidden group-hover:block z-50">
                <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Switch Active Organization
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {organizations.map((org) => (
                    <button
                      key={org.id}
                      onClick={() => onSelectOrg(org)}
                      className={`w-full text-left px-3 py-2 flex items-center space-x-2.5 transition-colors ${
                        activeOrg?.id === org.id ? 'bg-blue-50/80 text-blue-900 font-medium' : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      {org.logo ? (
                        <img src={org.logo} alt={org.name} className="w-7 h-7 rounded-md object-cover border border-slate-200" />
                      ) : (
                        <div className="w-7 h-7 rounded-md bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-xs">
                          {org.shortName.slice(0, 2)}
                        </div>
                      )}
                      <div className="truncate flex-1">
                        <div className="text-sm truncate">{org.name}</div>
                        <div className="text-xs text-slate-400">{org.type} • {org.city}</div>
                      </div>
                      {activeOrg?.id === org.id && (
                        <span className="w-2 h-2 rounded-full bg-blue-600" />
                      )}
                    </button>
                  ))}
                </div>
                <div className="border-t border-slate-100 mt-1 pt-1.5 px-2">
                  <button
                    onClick={onOpenOnboarding}
                    className="w-full py-1.5 px-2 rounded-md text-xs font-semibold text-blue-600 hover:bg-blue-50 flex items-center justify-center space-x-1.5"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Onboard New Organization</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Quick actions & Mode triggers */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <button
              onClick={onOpenSecurityTest}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold transition-colors"
              title="Test tenant isolation & multi-org data barrier"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">Tenant Isolation Audit</span>
            </button>

            <button
              onClick={() => onSelectTab('website')}
              className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === 'website'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'border border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Public Website</span>
            </button>

            <button
              onClick={onOpenOnboarding}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Add Org</span>
            </button>
          </div>
        </div>

        {/* Bottom tier: Functional module tabs */}
        <div className="flex space-x-1 overflow-x-auto scrollbar-none py-2 border-t border-slate-100 text-xs font-medium">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { id: 'members', label: 'Members & Players' },
            { id: 'sports', label: 'Sports & Programs' },
            { id: 'teams', label: 'Coaches & Teams' },
            { id: 'attendance', label: 'Coach Attendance' },
            { id: 'facilities', label: 'Facilities & Bookings' },
            { id: 'tournaments', label: 'Tournaments & Matches' },
            { id: 'finance', label: 'Finance & Invoices' },
            { id: 'inventory', label: 'Equipment Inventory' },
            { id: 'leads', label: 'CRM Leads' },
            { id: 'whatsapp', label: 'WhatsApp Broadcast' },
            { id: 'certificates', label: 'Certificates & IDs' },
            { id: 'settings', label: 'Org Settings' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`px-3 py-1.5 rounded-md whitespace-nowrap transition-colors ${
                activeTab === item.id
                  ? 'bg-slate-900 text-white font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
};
