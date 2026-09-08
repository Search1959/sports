import React, { useState, useEffect } from 'react';
import { TrainingSession, SessionParticipant, Sport, Team, Coach } from '../types.ts';
import {
  CheckCircle,
  XCircle,
  Clock,
  HelpCircle,
  CheckCheck,
  Calendar,
  Save,
  Plus,
  X,
  UserCheck,
  Users,
} from 'lucide-react';

interface AttendanceViewProps {
  sessions: TrainingSession[];
  sports: Sport[];
  teams: Team[];
  coaches: Coach[];
  fetchSessionAttendance: (sessionId: number) => Promise<{ session: TrainingSession; participants: SessionParticipant[] }>;
  saveSessionAttendance: (sessionId: number, attendanceList: { memberId: number; status: string }[]) => Promise<void>;
  createTrainingSession: (sessionData: any) => Promise<void>;
}

export const AttendanceView: React.FC<AttendanceViewProps> = ({
  sessions,
  sports,
  teams,
  coaches,
  fetchSessionAttendance,
  saveSessionAttendance,
  createTrainingSession,
}) => {
  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(
    sessions[0]?.id || null
  );
  const [currentSession, setCurrentSession] = useState<TrainingSession | null>(null);
  const [participants, setParticipants] = useState<SessionParticipant[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isAddSessionOpen, setIsAddSessionOpen] = useState(false);

  // New session state
  const [newSessionForm, setNewSessionForm] = useState({
    title: 'Evening Tactical Practice',
    sessionType: 'Training',
    sessionDate: new Date().toISOString().split('T')[0],
    startTime: '16:30',
    endTime: '18:00',
    venue: 'Main Sports Complex',
    sportId: sports[0]?.id || undefined,
    teamId: teams[0]?.id || undefined,
    coachId: coaches[0]?.id || undefined,
    notes: 'Drills, endurance conditioning, match practice',
  });

  useEffect(() => {
    if (selectedSessionId) {
      loadAttendance(selectedSessionId);
    }
  }, [selectedSessionId]);

  const loadAttendance = async (sessionId: number) => {
    setLoading(true);
    setSaveSuccess(false);
    try {
      const data = await fetchSessionAttendance(sessionId);
      setCurrentSession(data.session);
      setParticipants(data.participants);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (memberId: number, status: 'present' | 'absent' | 'late' | 'excused') => {
    setParticipants((prev) =>
      prev.map((p) => (p.memberId === memberId ? { ...p, status } : p))
    );
  };

  const handleMarkAllPresent = () => {
    setParticipants((prev) =>
      prev.map((p) => ({ ...p, status: 'present' }))
    );
  };

  const handleSaveAttendance = async () => {
    if (!selectedSessionId) return;
    setSaving(true);
    try {
      const payload = participants.map((p) => ({
        memberId: p.memberId,
        status: p.status === 'unmarked' ? 'present' : p.status,
      }));
      await saveSessionAttendance(selectedSessionId, payload);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleCreateSessionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createTrainingSession(newSessionForm);
      setIsAddSessionOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  // Stats
  const totalCount = participants.length;
  const presentCount = participants.filter((p) => p.status === 'present').length;
  const absentCount = participants.filter((p) => p.status === 'absent').length;
  const lateCount = participants.filter((p) => p.status === 'late').length;
  const attendanceRate = totalCount > 0 ? Math.round(((presentCount + lateCount) / totalCount) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header and session selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Mobile-First Coach Attendance</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Designed for high-speed touch marking directly on coaches' phones during court/field sessions.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsAddSessionOpen(true)}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule Session</span>
          </button>
        </div>
      </div>

      {/* Session selector card */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex-1 w-full">
          <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
            Active Training Session
          </label>
          <select
            value={selectedSessionId || ''}
            onChange={(e) => setSelectedSessionId(Number(e.target.value))}
            className="w-full text-xs font-medium px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-hidden"
          >
            {sessions.map((s) => (
              <option key={s.id} value={s.id}>
                {s.sessionDate} • {s.title} ({s.sportName || 'All'} - {s.teamName || 'Open Squad'})
              </option>
            ))}
          </select>
        </div>

        {currentSession && (
          <div className="flex items-center gap-4 text-xs text-slate-600">
            <div className="flex items-center space-x-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>{currentSession.startTime} - {currentSession.endTime}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{currentSession.venue || 'Sports Complex'}</span>
            </div>
          </div>
        )}
      </div>

      {/* Real-time stats bar & Fast Bulk Actions */}
      <div className="bg-slate-900 text-white rounded-xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-6">
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400">Total Players</div>
            <div className="text-xl font-bold font-mono">{totalCount}</div>
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-emerald-400">Present</div>
            <div className="text-xl font-bold font-mono text-emerald-400">{presentCount}</div>
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-rose-400">Absent</div>
            <div className="text-xl font-bold font-mono text-rose-400">{absentCount}</div>
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-amber-400">Late</div>
            <div className="text-xl font-bold font-mono text-amber-400">{lateCount}</div>
          </div>
          <div className="border-l border-slate-700 pl-4 hidden sm:block">
            <div className="text-[10px] uppercase font-bold text-blue-400">Rate</div>
            <div className="text-xl font-bold font-mono text-blue-400">{attendanceRate}%</div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleMarkAllPresent}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors"
          >
            <CheckCheck className="w-4 h-4 text-emerald-400" />
            <span>Mark All Present</span>
          </button>

          <button
            onClick={handleSaveAttendance}
            disabled={saving}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 shadow-xs transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : saveSuccess ? 'Saved ✓' : 'Save Attendance'}</span>
          </button>
        </div>
      </div>

      {/* Mobile-optimized Attendance Touch List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs divide-y divide-slate-100">
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-500">Loading roster...</div>
        ) : participants.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400 italic">
            No participants found for this session.
          </div>
        ) : (
          participants.map((player) => {
            const isPresent = player.status === 'present';
            const isAbsent = player.status === 'absent';
            const isLate = player.status === 'late';
            const isExcused = player.status === 'excused';

            return (
              <div
                key={player.memberId}
                className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/60 transition-colors"
              >
                {/* Player identity */}
                <div className="flex items-center space-x-3">
                  <img
                    src={player.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                    alt={player.fullName}
                    className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0"
                  />
                  <div>
                    <div className="text-sm font-bold text-slate-900 leading-tight flex items-center space-x-2">
                      <span>{player.fullName}</span>
                      {player.jerseyNumber && (
                        <span className="text-[10px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded font-mono font-bold">
                          #{player.jerseyNumber}
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5 flex items-center space-x-2">
                      <span>{player.memberCode}</span>
                      {player.position && <span>• {player.position}</span>}
                    </div>
                  </div>
                </div>

                {/* Big Tactile Status Selector for Mobile Finger Taps */}
                <div className="grid grid-cols-4 gap-1.5 sm:flex sm:items-center sm:space-x-1.5">
                  <button
                    type="button"
                    onClick={() => handleStatusChange(player.memberId, 'present')}
                    className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center space-x-1 ${
                      isPresent
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                    }`}
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Present</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleStatusChange(player.memberId, 'absent')}
                    className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center space-x-1 ${
                      isAbsent
                        ? 'bg-rose-600 text-white shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                    }`}
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Absent</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleStatusChange(player.memberId, 'late')}
                    className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center space-x-1 ${
                      isLate
                        ? 'bg-amber-500 text-white shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>Late</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleStatusChange(player.memberId, 'excused')}
                    className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center space-x-1 ${
                      isExcused
                        ? 'bg-slate-700 text-white shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                    }`}
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>Excused</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Schedule New Session Modal */}
      {isAddSessionOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-xl border border-slate-200">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Schedule Practice Session</h3>
                <p className="text-xs text-slate-500">Configure squad, coach, and drills schedule</p>
              </div>
              <button
                onClick={() => setIsAddSessionOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSessionSubmit} className="p-5 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Session Title *</label>
                <input
                  type="text"
                  required
                  value={newSessionForm.title}
                  onChange={(e) => setNewSessionForm({ ...newSessionForm, title: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Sport</label>
                  <select
                    value={newSessionForm.sportId}
                    onChange={(e) => setNewSessionForm({ ...newSessionForm, sportId: Number(e.target.value) })}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                  >
                    {sports.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Team Squad</label>
                  <select
                    value={newSessionForm.teamId}
                    onChange={(e) => setNewSessionForm({ ...newSessionForm, teamId: Number(e.target.value) })}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                  >
                    <option value="">All Open Participants</option>
                    {teams.map((t) => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={newSessionForm.sessionDate}
                    onChange={(e) => setNewSessionForm({ ...newSessionForm, sessionDate: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Start</label>
                  <input
                    type="time"
                    value={newSessionForm.startTime}
                    onChange={(e) => setNewSessionForm({ ...newSessionForm, startTime: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">End</label>
                  <input
                    type="time"
                    value={newSessionForm.endTime}
                    onChange={(e) => setNewSessionForm({ ...newSessionForm, endTime: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Venue / Ground</label>
                <input
                  type="text"
                  value={newSessionForm.venue}
                  onChange={(e) => setNewSessionForm({ ...newSessionForm, venue: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddSessionOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-xs"
                >
                  Save & Launch Session
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
