import React, { useState } from 'react';
import { Lead } from '../types.ts';
import {
  UserCheck,
  Phone,
  Mail,
  Clock,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Filter,
} from 'lucide-react';

interface LeadsViewProps {
  leads: Lead[];
  onConvertLead: (leadId: number) => Promise<void>;
}

export const LeadsView: React.FC<LeadsViewProps> = ({ leads, onConvertLead }) => {
  const [convertingId, setConvertingId] = useState<number | null>(null);

  const handleConvert = async (leadId: number) => {
    setConvertingId(leadId);
    try {
      await onConvertLead(leadId);
    } catch (err) {
      console.error(err);
    } finally {
      setConvertingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">CRM Membership & Sports Applications</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Incoming inquiries from the public website. One-click conversion to active registered member.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-xs divide-y divide-slate-100">
        {leads.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            No public inquiries yet. Submit an application via the Public Website tab to see it appear here!
          </div>
        ) : (
          leads.map((lead) => {
            const isConverted = lead.status === 'converted';
            return (
              <div
                key={lead.id}
                className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors"
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-bold text-slate-900 text-sm">{lead.fullName}</h3>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded capitalize ${
                        isConverted
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}
                    >
                      {lead.status.replace('_', ' ')}
                    </span>
                    {lead.age && (
                      <span className="text-[10px] text-slate-500 font-mono">Age: {lead.age}</span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 mt-1.5">
                    <span className="flex items-center space-x-1">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{lead.phone}</span>
                    </span>
                    {lead.email && (
                      <span className="flex items-center space-x-1">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <span>{lead.email}</span>
                      </span>
                    )}
                    <span className="text-slate-400">• Source: {lead.source}</span>
                  </div>

                  <div className="mt-2.5 flex items-center space-x-2 text-xs">
                    <span className="font-semibold text-slate-700">Interested In:</span>
                    <span className="bg-slate-100 text-slate-800 font-medium px-2.5 py-0.5 rounded-md">
                      {lead.interestedSport || lead.interestedProgram || 'General Membership'}
                    </span>
                    {lead.notes && <span className="text-slate-400 italic">"{lead.notes}"</span>}
                  </div>
                </div>

                <div className="flex items-center space-x-2 self-start md:self-auto">
                  {isConverted ? (
                    <div className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg flex items-center space-x-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Converted to Active Member</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleConvert(lead.id)}
                      disabled={convertingId === lead.id}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center space-x-1.5 transition-colors disabled:opacity-50"
                    >
                      <UserCheck className="w-4 h-4" />
                      <span>{convertingId === lead.id ? 'Converting...' : 'Approve & Create Member'}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
