import React, { useState } from 'react';
import { Sport, Program } from '../types.ts';
import {
  Trophy,
  Plus,
  Activity,
  Layers,
  Sparkles,
  Check,
  X,
  Clock,
  Tag,
  Eye,
  Edit2,
  Trash2,
  AlertTriangle,
} from 'lucide-react';

interface SportsProgramsViewProps {
  sports: Sport[];
  programs: Program[];
  onAddSport: (sportData: any) => Promise<void>;
  onUpdateSport?: (id: number, sportData: any) => Promise<void>;
  onDeleteSport?: (id: number) => Promise<void>;
  onAddProgram: (programData: any) => Promise<void>;
  onUpdateProgram?: (id: number, programData: any) => Promise<void>;
  onDeleteProgram?: (id: number) => Promise<void>;
  currency?: string;
}

export const SportsProgramsView: React.FC<SportsProgramsViewProps> = ({
  sports,
  programs,
  onAddSport,
  onUpdateSport,
  onDeleteSport,
  onAddProgram,
  onUpdateProgram,
  onDeleteProgram,
  currency = 'INR',
}) => {
  const [activeTab, setActiveTab] = useState<'sports' | 'programs'>('sports');
  const [isAddSportModalOpen, setIsAddSportModalOpen] = useState(false);
  const [isAddProgramModalOpen, setIsAddProgramModalOpen] = useState(false);

  // View, Edit, Delete states for Sports
  const [viewingSport, setViewingSport] = useState<Sport | null>(null);
  const [editingSport, setEditingSport] = useState<Sport | null>(null);
  const [deletingSport, setDeletingSport] = useState<Sport | null>(null);
  const [editSportForm, setEditSportForm] = useState<any>({});

  // View, Edit, Delete states for Programs
  const [viewingProgram, setViewingProgram] = useState<Program | null>(null);
  const [editingProgram, setEditingProgram] = useState<Program | null>(null);
  const [deletingProgram, setDeletingProgram] = useState<Program | null>(null);
  const [editProgForm, setEditProgForm] = useState<any>({});

  const [isProcessing, setIsProcessing] = useState(false);

  // New Sport State
  const [sportForm, setSportForm] = useState({
    name: '',
    description: '',
    icon: 'Trophy',
    scoringType: 'points',
    categories: 'Juniors, Seniors, Elite',
    customFieldName: 'Skill Level',
    customFieldType: 'text',
  });

  // New Program State
  const [progForm, setProgForm] = useState({
    name: '',
    type: 'Fitness',
    description: '',
    fee: '1500',
    scheduleNotes: 'Mon, Wed, Fri (6:30 AM - 7:30 AM)',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenEditSport = (s: Sport) => {
    setEditingSport(s);
    setEditSportForm({
      name: s.name,
      description: s.description || '',
      scoringType: s.scoringType || 'points',
      categories: Array.isArray(s.categories) ? s.categories.join(', ') : '',
    });
  };

  const handleSaveEditSport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSport) return;
    setIsProcessing(true);
    try {
      if (onUpdateSport) {
        const catArray = typeof editSportForm.categories === 'string'
          ? editSportForm.categories.split(',').map((c: string) => c.trim()).filter(Boolean)
          : editSportForm.categories;
        await onUpdateSport(editingSport.id, {
          name: editSportForm.name,
          description: editSportForm.description,
          scoringType: editSportForm.scoringType,
          categories: catArray,
        });
      }
      setEditingSport(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmDeleteSport = async () => {
    if (!deletingSport) return;
    setIsProcessing(true);
    try {
      if (onDeleteSport) {
        await onDeleteSport(deletingSport.id);
      }
      setDeletingSport(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleOpenEditProgram = (p: Program) => {
    setEditingProgram(p);
    setEditProgForm({
      name: p.name,
      type: p.type || 'Fitness',
      fee: p.fee || '1500',
      description: p.description || '',
      scheduleNotes: p.scheduleNotes || '',
    });
  };

  const handleSaveEditProgram = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProgram) return;
    setIsProcessing(true);
    try {
      if (onUpdateProgram) {
        await onUpdateProgram(editingProgram.id, editProgForm);
      }
      setEditingProgram(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmDeleteProgram = async () => {
    if (!deletingProgram) return;
    setIsProcessing(true);
    try {
      if (onDeleteProgram) {
        await onDeleteProgram(deletingProgram.id);
      }
      setDeletingProgram(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCreateSport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sportForm.name) return;
    setIsSubmitting(true);
    try {
      const categoriesArray = sportForm.categories.split(',').map((c) => c.trim()).filter(Boolean);
      await onAddSport({
        name: sportForm.name,
        description: sportForm.description,
        icon: sportForm.icon,
        scoringType: sportForm.scoringType,
        categories: categoriesArray,
        customFields: [
          {
            key: sportForm.customFieldName.toLowerCase().replace(/\s+/g, '_'),
            label: sportForm.customFieldName,
            type: sportForm.customFieldType,
            required: false,
          },
        ],
      });
      setIsAddSportModalOpen(false);
      setSportForm({
        name: '',
        description: '',
        icon: 'Trophy',
        scoringType: 'points',
        categories: 'Juniors, Seniors, Elite',
        customFieldName: 'Skill Level',
        customFieldType: 'text',
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateProgram = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!progForm.name) return;
    setIsSubmitting(true);
    try {
      await onAddProgram({
        name: progForm.name,
        type: progForm.type,
        description: progForm.description,
        fee: progForm.fee,
        scheduleNotes: progForm.scheduleNotes,
      });
      setIsAddProgramModalOpen(false);
      setProgForm({
        name: '',
        type: 'Fitness',
        description: '',
        fee: '1500',
        scheduleNotes: 'Mon, Wed, Fri (6:30 AM - 7:30 AM)',
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Sports & Community Programs Engine</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Create new sports dynamically with custom fields and configure community activities (Yoga, Fitness, Camps).
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {activeTab === 'sports' ? (
            <button
              onClick={() => setIsAddSportModalOpen(true)}
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Create Dynamic Sport</span>
            </button>
          ) : (
            <button
              onClick={() => setIsAddProgramModalOpen(true)}
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Community Program</span>
            </button>
          )}
        </div>
      </div>

      {/* Mode Subtabs */}
      <div className="flex space-x-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('sports')}
          className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all flex items-center space-x-1.5 ${
            activeTab === 'sports'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Trophy className="w-4 h-4" />
          <span>Configured Sports ({sports.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('programs')}
          className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all flex items-center space-x-1.5 ${
            activeTab === 'programs'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Programs & Wellness ({programs.length})</span>
        </button>
      </div>

      {/* Sports Grid */}
      {activeTab === 'sports' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sports.map((sport) => (
            <div
              key={sport.id}
              className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                      <Trophy className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">{sport.name}</h3>
                      <span className="text-[10px] font-medium text-slate-400 font-mono">
                        Scoring: {sport.scoringType || 'points'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1 shrink-0">
                    <button
                      onClick={() => setViewingSport(sport)}
                      className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
                      title="View Sport Details"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleOpenEditSport(sport)}
                      className="p-1.5 rounded-lg border border-slate-200 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 text-slate-500 transition-colors"
                      title="Edit Sport"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeletingSport(sport)}
                      className="p-1.5 rounded-lg border border-slate-200 hover:bg-rose-50 hover:border-rose-200 hover:text-rose-600 text-slate-400 transition-colors"
                      title="Delete Sport"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-600 mt-3 leading-relaxed">
                  {sport.description || 'Full team coaching, competitive training, and tournament leagues.'}
                </p>

                {sport.categories && (
                  <div className="mt-3">
                    <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                      Age & Skill Categories
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {sport.categories.map((cat, idx) => (
                        <span key={idx} className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                          {cat}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Custom Fields: {sport.customFields?.length || 0}</span>
                <span className="text-emerald-600 font-medium">Active in Roster</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Programs Grid */}
      {activeTab === 'programs' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {programs.map((prog) => (
            <div
              key={prog.id}
              className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <Activity className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">{prog.name}</h3>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-medium px-1.5 py-0.2 rounded">
                        {prog.type}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="text-sm font-bold text-slate-900">
                      ₹{prog.fee} <span className="text-[10px] text-slate-400 font-normal">/mo</span>
                    </div>
                    <div className="flex items-center space-x-1 shrink-0">
                      <button
                        onClick={() => setViewingProgram(prog)}
                        className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
                        title="View Program Details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleOpenEditProgram(prog)}
                        className="p-1.5 rounded-lg border border-slate-200 hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-600 text-slate-500 transition-colors"
                        title="Edit Program"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeletingProgram(prog)}
                        className="p-1.5 rounded-lg border border-slate-200 hover:bg-rose-50 hover:border-rose-200 hover:text-rose-600 text-slate-400 transition-colors"
                        title="Delete Program"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-600 mt-3 leading-relaxed">
                  {prog.description || 'Community health, physical conditioning, and structured batches.'}
                </p>

                {prog.scheduleNotes && (
                  <div className="mt-3 p-2 bg-slate-50 rounded-lg text-xs text-slate-600 flex items-center space-x-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{prog.scheduleNotes}</span>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Public Registration Open</span>
                <span className="text-emerald-600 font-semibold">Active</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Dynamic Sport Creation Modal */}
      {isAddSportModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-xl border border-slate-200">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Add Dynamic Sport</h3>
                <p className="text-xs text-slate-500">Configure new sport with custom metadata without code changes.</p>
              </div>
              <button
                onClick={() => setIsAddSportModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSport} className="p-5 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Sport Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Badminton, Karate, Boxing, Chess"
                  value={sportForm.name}
                  onChange={(e) => setSportForm({ ...sportForm, name: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Training syllabus, court dimensions, etc."
                  value={sportForm.description}
                  onChange={(e) => setSportForm({ ...sportForm, description: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Scoring Type</label>
                  <select
                    value={sportForm.scoringType}
                    onChange={(e) => setSportForm({ ...sportForm, scoringType: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                  >
                    <option value="points">Points (Basketball, TT, Badminton)</option>
                    <option value="goals">Goals (Football, Hockey)</option>
                    <option value="runs_wickets">Runs & Wickets (Cricket)</option>
                    <option value="time">Time / Lap (Swimming, Athletics)</option>
                    <option value="rounds">Rounds / Decision (Boxing, Martial Arts)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Categories (comma-sep)</label>
                  <input
                    type="text"
                    value={sportForm.categories}
                    onChange={(e) => setSportForm({ ...sportForm, categories: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200"
                  />
                </div>
              </div>

              {/* Dynamic custom field definition */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="text-xs font-bold text-slate-800">Dynamic Sport Custom Field</div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Field Label (e.g. Weight Class)"
                    value={sportForm.customFieldName}
                    onChange={(e) => setSportForm({ ...sportForm, customFieldName: e.target.value })}
                    className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                  />
                  <select
                    value={sportForm.customFieldType}
                    onChange={(e) => setSportForm({ ...sportForm, customFieldType: e.target.value })}
                    className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                  >
                    <option value="text">Text (e.g. Flyweight)</option>
                    <option value="number">Number (e.g. Handicap)</option>
                    <option value="dropdown">Dropdown Selection</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddSportModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-xs disabled:opacity-50"
                >
                  {isSubmitting ? 'Creating...' : 'Save & Publish Sport'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Program Creation Modal */}
      {isAddProgramModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-xl border border-slate-200">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Add Community Program</h3>
                <p className="text-xs text-slate-500">Configure wellness, yoga, or seasonal coaching camp.</p>
              </div>
              <button
                onClick={() => setIsAddProgramModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProgram} className="p-5 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Program Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Morning Yoga & Pranayam"
                  value={progForm.name}
                  onChange={(e) => setProgForm({ ...progForm, name: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category Type</label>
                  <select
                    value={progForm.type}
                    onChange={(e) => setProgForm({ ...progForm, type: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                  >
                    <option value="Fitness">Fitness & Conditioning</option>
                    <option value="Yoga">Yoga & Mindfulness</option>
                    <option value="Camp">Seasonal Summer/Winter Camp</option>
                    <option value="Youth Development">Youth Development</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Monthly Fee (₹)</label>
                  <input
                    type="number"
                    value={progForm.fee}
                    onChange={(e) => setProgForm({ ...progForm, fee: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Schedule Details</label>
                <input
                  type="text"
                  placeholder="e.g. Mon, Wed, Fri (6:30 AM - 7:30 AM)"
                  value={progForm.scheduleNotes}
                  onChange={(e) => setProgForm({ ...progForm, scheduleNotes: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={progForm.description}
                  onChange={(e) => setProgForm({ ...progForm, description: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddProgramModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-xs disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Add Program'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 1. View Sport Modal */}
      {viewingSport && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-6 bg-gradient-to-r from-blue-700 to-indigo-700 text-white flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-white">
                  <Trophy className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-white">{viewingSport.name}</h3>
                  <p className="text-xs text-blue-100 font-mono">
                    Scoring Model: {viewingSport.scoringType || 'Points'} • {viewingSport.isGlobal ? 'Standard Sport' : 'Tenant Custom'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setViewingSport(null)}
                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div>
                <span className="text-slate-400 font-bold uppercase tracking-wider block text-[10px] mb-1">
                  Description
                </span>
                <p className="text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200">
                  {viewingSport.description || 'Full competitive coaching, dynamic skill grading, and tournament participation.'}
                </p>
              </div>

              <div>
                <span className="text-slate-400 font-bold uppercase tracking-wider block text-[10px] mb-1.5">
                  Age & Skill Brackets
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {Array.isArray(viewingSport.categories) && viewingSport.categories.length > 0 ? (
                    viewingSport.categories.map((cat, idx) => (
                      <span key={idx} className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-100 font-medium">
                        {cat}
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-400 italic">All skill categories eligible</span>
                  )}
                </div>
              </div>

              {viewingSport.customFields && viewingSport.customFields.length > 0 && (
                <div>
                  <span className="text-slate-400 font-bold uppercase tracking-wider block text-[10px] mb-1.5">
                    Configured Custom Fields
                  </span>
                  <div className="space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-200">
                    {viewingSport.customFields.map((cf, idx) => (
                      <div key={idx} className="flex justify-between items-center text-slate-700">
                        <span className="font-semibold">{cf.label}</span>
                        <span className="font-mono text-slate-400 text-[10px] uppercase">Type: {cf.type}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
              <button
                type="button"
                onClick={() => {
                  const s = viewingSport;
                  setViewingSport(null);
                  handleOpenEditSport(s);
                }}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold flex items-center space-x-1.5 hover:bg-blue-700"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit Sport</span>
              </button>
              <button
                type="button"
                onClick={() => setViewingSport(null)}
                className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Edit Sport Modal */}
      {editingSport && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                  <Edit2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Edit Sport Configuration</h3>
                  <p className="text-[11px] text-slate-500">Updating settings for {editingSport.name}</p>
                </div>
              </div>
              <button
                onClick={() => setEditingSport(null)}
                className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditSport} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Sport Name *</label>
                <input
                  type="text"
                  required
                  value={editSportForm.name || ''}
                  onChange={(e) => setEditSportForm({ ...editSportForm, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Scoring System</label>
                <select
                  value={editSportForm.scoringType || 'points'}
                  onChange={(e) => setEditSportForm({ ...editSportForm, scoringType: e.target.value })}
                  className="w-full px-2.5 py-2 rounded-xl border border-slate-200 bg-white"
                >
                  <option value="points">Points (Basketball, Tennis, etc.)</option>
                  <option value="goals">Goals (Football, Hockey, etc.)</option>
                  <option value="runs">Runs / Wickets (Cricket)</option>
                  <option value="sets">Sets & Games (Badminton, Table Tennis)</option>
                  <option value="time">Time / Lap based (Athletics, Swimming)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Skill & Age Categories</label>
                <input
                  type="text"
                  placeholder="e.g. Under-14, Under-18, Seniors, Pro"
                  value={editSportForm.categories || ''}
                  onChange={(e) => setEditSportForm({ ...editSportForm, categories: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">Comma-separated category names</span>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={editSportForm.description || ''}
                  onChange={(e) => setEditSportForm({ ...editSportForm, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setEditingSport(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold disabled:opacity-50"
                >
                  {isProcessing ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Delete Sport Confirmation Modal */}
      {deletingSport && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3.5">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-center font-bold text-slate-900 text-base">Delete Sport</h3>
            <p className="text-center text-xs text-slate-500 mt-1">
              Are you sure you want to delete <strong className="text-slate-800 font-bold">{deletingSport.name}</strong>?
            </p>
            <div className="bg-amber-50 border border-amber-200/70 p-3 rounded-2xl text-[11px] text-amber-800 mt-4 leading-relaxed">
              ⚠️ Note: Existing athlete certificates and past match records associated with this sport will remain in archives.
            </div>
            <div className="mt-5 flex items-center justify-end space-x-2.5">
              <button
                type="button"
                onClick={() => setDeletingSport(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isProcessing}
                onClick={handleConfirmDeleteSport}
                className="px-5 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow-xs transition-colors disabled:opacity-50"
              >
                {isProcessing ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. View Program Modal */}
      {viewingProgram && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-6 bg-gradient-to-r from-emerald-600 to-teal-700 text-white flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-white">
                  <Activity className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-white">{viewingProgram.name}</h3>
                  <span className="text-xs font-medium bg-white/20 px-2 py-0.5 rounded text-emerald-100">
                    {viewingProgram.type}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setViewingProgram(null)}
                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                <div>
                  <span className="text-slate-400 block text-[10px]">Monthly Subscription Fee</span>
                  <span className="font-bold text-base text-slate-800">
                    ₹{viewingProgram.fee} <span className="text-xs font-normal text-slate-500">/ month</span>
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Batch Schedule</span>
                  <span className="font-medium text-slate-700 block mt-0.5">
                    {viewingProgram.scheduleNotes || 'Regular weekday sessions'}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-slate-400 font-bold uppercase tracking-wider block text-[10px] mb-1">
                  Program Details & Objectives
                </span>
                <p className="text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200">
                  {viewingProgram.description || 'Structured drills, cardiovascular fitness, and technical proficiency sessions.'}
                </p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
              <button
                type="button"
                onClick={() => {
                  const p = viewingProgram;
                  setViewingProgram(null);
                  handleOpenEditProgram(p);
                }}
                className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-semibold flex items-center space-x-1.5 hover:bg-emerald-700"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit Program</span>
              </button>
              <button
                type="button"
                onClick={() => setViewingProgram(null)}
                className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Edit Program Modal */}
      {editingProgram && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <Edit2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Edit Program</h3>
                  <p className="text-[11px] text-slate-500">Updating {editingProgram.name}</p>
                </div>
              </div>
              <button
                onClick={() => setEditingProgram(null)}
                className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditProgram} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Program Name *</label>
                <input
                  type="text"
                  required
                  value={editProgForm.name || ''}
                  onChange={(e) => setEditProgForm({ ...editProgForm, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Type</label>
                  <select
                    value={editProgForm.type || 'Fitness'}
                    onChange={(e) => setEditProgForm({ ...editProgForm, type: e.target.value })}
                    className="w-full px-2.5 py-2 rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="Fitness">Fitness & Conditioning</option>
                    <option value="Yoga">Yoga & Mindfulness</option>
                    <option value="Camp">Seasonal Camp</option>
                    <option value="Youth Development">Youth Development</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Monthly Fee (₹)</label>
                  <input
                    type="number"
                    value={editProgForm.fee || ''}
                    onChange={(e) => setEditProgForm({ ...editProgForm, fee: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Schedule Details</label>
                <input
                  type="text"
                  value={editProgForm.scheduleNotes || ''}
                  onChange={(e) => setEditProgForm({ ...editProgForm, scheduleNotes: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={editProgForm.description || ''}
                  onChange={(e) => setEditProgForm({ ...editProgForm, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setEditingProgram(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold disabled:opacity-50"
                >
                  {isProcessing ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Delete Program Confirmation Modal */}
      {deletingProgram && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3.5">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-center font-bold text-slate-900 text-base">Delete Program</h3>
            <p className="text-center text-xs text-slate-500 mt-1">
              Are you sure you want to delete <strong className="text-slate-800 font-bold">{deletingProgram.name}</strong>?
            </p>
            <div className="mt-5 flex items-center justify-end space-x-2.5">
              <button
                type="button"
                onClick={() => setDeletingProgram(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isProcessing}
                onClick={handleConfirmDeleteProgram}
                className="px-5 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow-xs transition-colors disabled:opacity-50"
              >
                {isProcessing ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
