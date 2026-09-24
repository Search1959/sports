import React, { useState } from 'react';
import { Facility, FacilityBooking } from '../types.ts';
import {
  Building2,
  Calendar,
  Clock,
  Plus,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  X,
  Users,
  Eye,
  Edit2,
  Trash2,
} from 'lucide-react';

interface FacilitiesViewProps {
  facilities: Facility[];
  onAddFacility: (facilityData: any) => Promise<void>;
  onBookFacility: (facilityId: number, bookingData: any) => Promise<void>;
  onUpdateFacility?: (id: number, data: any) => Promise<void>;
  onDeleteFacility?: (id: number) => Promise<void>;
  onUpdateBooking?: (facilityId: number, bookingId: number, data: any) => Promise<void>;
  onDeleteBooking?: (facilityId: number, bookingId: number) => Promise<void>;
}

export const FacilitiesView: React.FC<FacilitiesViewProps> = ({
  facilities = [],
  onAddFacility,
  onBookFacility,
  onUpdateFacility,
  onDeleteFacility,
  onUpdateBooking,
  onDeleteBooking,
}) => {
  const safeFacilities = Array.isArray(facilities) ? facilities : [];
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(safeFacilities[0] || null);
  const [isAddFacilityOpen, setIsAddFacilityOpen] = useState(false);
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [bookingConflictError, setBookingConflictError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isProcessingCrud, setIsProcessingCrud] = useState(false);

  // Facility CRUD state
  const [viewingFacility, setViewingFacility] = useState<Facility | null>(null);
  const [editingFacility, setEditingFacility] = useState<Facility | null>(null);
  const [deletingFacility, setDeletingFacility] = useState<Facility | null>(null);
  const [editFacilityForm, setEditFacilityForm] = useState<Partial<Facility>>({});

  // Booking CRUD state
  const [viewingBooking, setViewingBooking] = useState<FacilityBooking | null>(null);
  const [editingBooking, setEditingBooking] = useState<FacilityBooking | null>(null);
  const [deletingBooking, setDeletingBooking] = useState<FacilityBooking | null>(null);
  const [editBookingForm, setEditBookingForm] = useState<Partial<FacilityBooking>>({});

  // New facility form
  const [facilityForm, setFacilityForm] = useState({
    name: '',
    type: 'Court',
    capacity: 30,
    description: '',
  });

  // Booking form
  const [bookingForm, setBookingForm] = useState({
    title: 'Senior Squad Match',
    bookedBy: 'Coach Vikram',
    bookingDate: new Date().toISOString().split('T')[0],
    startTime: '17:00',
    endTime: '19:00',
    notes: 'Official practice session',
  });

  const handleCreateFacility = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!facilityForm.name) return;
    setIsSubmitting(true);
    try {
      await onAddFacility(facilityForm);
      setIsAddFacilityOpen(false);
      setFacilityForm({ name: '', type: 'Court', capacity: 30, description: '' });
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFacility) return;
    setIsSubmitting(true);
    setBookingConflictError(null);
    try {
      await onBookFacility(selectedFacility.id, bookingForm);
      setIsBookModalOpen(false);
    } catch (err: any) {
      setBookingConflictError(err.message || 'Booking conflict encountered.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Facility Edit & Delete Handlers
  const handleOpenEditFacility = (fac: Facility) => {
    setEditingFacility(fac);
    setEditFacilityForm({
      name: fac.name,
      type: fac.type,
      capacity: fac.capacity,
      description: fac.description,
    });
  };

  const handleSaveEditFacility = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFacility) return;
    setIsProcessingCrud(true);
    try {
      if (onUpdateFacility) {
        await onUpdateFacility(editingFacility.id, editFacilityForm);
      }
      setEditingFacility(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessingCrud(false);
    }
  };

  const handleConfirmDeleteFacility = async () => {
    if (!deletingFacility) return;
    setIsProcessingCrud(true);
    try {
      if (onDeleteFacility) {
        await onDeleteFacility(deletingFacility.id);
      }
      if (selectedFacility?.id === deletingFacility.id) {
        setSelectedFacility(safeFacilities.find(f => f.id !== deletingFacility.id) || null);
      }
      setDeletingFacility(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessingCrud(false);
    }
  };

  // Booking Edit & Delete Handlers
  const handleOpenEditBooking = (b: FacilityBooking) => {
    setEditingBooking(b);
    setEditBookingForm({
      title: b.title,
      bookedBy: b.bookedBy,
      bookingDate: b.bookingDate,
      startTime: b.startTime,
      endTime: b.endTime,
      notes: b.notes,
    });
  };

  const handleSaveEditBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBooking || !selectedFacility) return;
    setIsProcessingCrud(true);
    try {
      if (onUpdateBooking) {
        await onUpdateBooking(selectedFacility.id, editingBooking.id, editBookingForm);
      }
      setEditingBooking(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessingCrud(false);
    }
  };

  const handleConfirmDeleteBooking = async () => {
    if (!deletingBooking || !selectedFacility) return;
    setIsProcessingCrud(true);
    try {
      if (onDeleteBooking) {
        await onDeleteBooking(selectedFacility.id, deletingBooking.id);
      }
      setDeletingBooking(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessingCrud(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Facilities & Court Booking Scheduler</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage grounds, indoor arenas, and training facilities with automated conflict prevention against double bookings.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsAddFacilityOpen(true)}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add Facility</span>
          </button>

          {selectedFacility && (
            <button
              onClick={() => {
                setBookingConflictError(null);
                setIsBookModalOpen(true);
              }}
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-xs"
            >
              <Calendar className="w-4 h-4" />
              <span>Book This Facility</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 1 Col: Facilities List */}
        <div className="space-y-3">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Available Venues ({safeFacilities.length})
          </div>
          {safeFacilities.map((fac) => {
            const isSelected = selectedFacility?.id === fac.id;
            return (
              <div
                key={fac.id}
                onClick={() => setSelectedFacility(fac)}
                className={`p-4 rounded-xl border transition-all cursor-pointer group ${
                  isSelected
                    ? 'bg-blue-50/70 border-blue-500 shadow-xs'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{fac.name}</h3>
                    <div className="text-xs text-slate-500 mt-0.5">{fac.type}</div>
                  </div>
                  <span className="text-[11px] font-mono font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                    Cap: {fac.capacity}
                  </span>
                </div>
                <div className="mt-2 text-xs text-slate-600 line-clamp-2">{fac.description}</div>
                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span>{fac.bookings?.length || 0} Bookings</span>
                  <div className="flex items-center space-x-1" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => setViewingFacility(fac)}
                      title="View Facility Details"
                      className="p-1 rounded-md text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleOpenEditFacility(fac)}
                      title="Edit Facility"
                      className="p-1 rounded-md text-slate-400 hover:text-amber-600 hover:bg-amber-50"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeletingFacility(fac)}
                      title="Delete Facility"
                      className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right 2 Cols: Schedule for selected facility */}
        <div className="lg:col-span-2 space-y-4">
          {selectedFacility ? (
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
                <div>
                  <span className="text-[10px] uppercase font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                    {selectedFacility.type}
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 mt-1">{selectedFacility.name}</h3>
                  <p className="text-xs text-slate-500">{selectedFacility.description}</p>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleOpenEditFacility(selectedFacility)}
                    title="Edit Facility"
                    className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setBookingConflictError(null);
                      setIsBookModalOpen(true);
                    }}
                    className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-xs"
                  >
                    Book Slot
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Upcoming Bookings & Schedule
                </div>

                {selectedFacility.bookings && selectedFacility.bookings.length > 0 ? (
                  <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden">
                    {selectedFacility.bookings.map((b) => (
                      <div key={b.id} className="p-3.5 flex items-center justify-between hover:bg-slate-50 text-xs">
                        <div className="space-y-0.5">
                          <div className="font-bold text-slate-900">{b.title}</div>
                          <div className="text-slate-500 flex items-center space-x-2">
                            <span>Booked by: {b.bookedBy}</span>
                            {b.notes && <span>• {b.notes}</span>}
                          </div>
                        </div>

                        <div className="flex items-center space-x-3">
                          <div className="text-right">
                            <div className="font-mono font-semibold text-slate-800 flex items-center space-x-1 justify-end">
                              <Clock className="w-3.5 h-3.5 text-blue-500" />
                              <span>{b.startTime} - {b.endTime}</span>
                            </div>
                            <div className="text-[11px] text-slate-400 mt-0.5">{b.bookingDate}</div>
                          </div>

                          <div className="flex items-center space-x-1">
                            <button
                              onClick={() => setViewingBooking(b)}
                              title="View Booking"
                              className="p-1 rounded-md text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleOpenEditBooking(b)}
                              title="Edit Booking"
                              className="p-1 rounded-md text-slate-400 hover:text-amber-600 hover:bg-amber-50"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setDeletingBooking(b)}
                              title="Cancel / Delete Booking"
                              className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-400">
                    No bookings scheduled for this facility. Click "Book Slot" to reserve a time.
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-xs text-slate-400 bg-white rounded-xl border border-slate-200">
              Select a facility on the left to inspect its schedule.
            </div>
          )}
        </div>
      </div>

      {/* Book Facility Modal */}
      {isBookModalOpen && selectedFacility && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-xl border border-slate-200">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Book {selectedFacility.name}</h3>
                <p className="text-xs text-slate-500">{selectedFacility.type} • Capacity: {selectedFacility.capacity}</p>
              </div>
              <button
                onClick={() => setIsBookModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {bookingConflictError && (
              <div className="mx-5 mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <div>
                  <div className="font-bold">Booking Conflict!</div>
                  <div>{bookingConflictError}</div>
                </div>
              </div>
            )}

            <form onSubmit={handleCreateBooking} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Session / Match Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Under-16 State Tournament Match"
                  value={bookingForm.title}
                  onChange={(e) => setBookingForm({ ...bookingForm, title: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={bookingForm.bookingDate}
                    onChange={(e) => setBookingForm({ ...bookingForm, bookingDate: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Booked By</label>
                  <input
                    type="text"
                    value={bookingForm.bookedBy}
                    onChange={(e) => setBookingForm({ ...bookingForm, bookedBy: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Start Time</label>
                  <input
                    type="time"
                    value={bookingForm.startTime}
                    onChange={(e) => setBookingForm({ ...bookingForm, startTime: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">End Time</label>
                  <input
                    type="time"
                    value={bookingForm.endTime}
                    onChange={(e) => setBookingForm({ ...bookingForm, endTime: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Notes / Equipment Needed</label>
                <textarea
                  rows={2}
                  value={bookingForm.notes}
                  onChange={(e) => setBookingForm({ ...bookingForm, notes: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200"
                  placeholder="Need 4 spare balls and corner flags..."
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsBookModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-xs"
                >
                  {isSubmitting ? 'Confirming...' : 'Confirm Slot'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Facility Modal */}
      {isAddFacilityOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-xl border border-slate-200">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm">Register New Facility / Arena</h3>
              <button
                onClick={() => setIsAddFacilityOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateFacility} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Facility Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Indoor Badminton Hall A"
                  value={facilityForm.name}
                  onChange={(e) => setFacilityForm({ ...facilityForm, name: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Facility Type</label>
                  <select
                    value={facilityForm.type}
                    onChange={(e) => setFacilityForm({ ...facilityForm, type: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                  >
                    <option value="Court">Court (Basketball, TT, Tennis)</option>
                    <option value="Ground">Field / Ground (Football, Cricket)</option>
                    <option value="Pool">Swimming Pool</option>
                    <option value="Gym">Fitness & Weight Room</option>
                    <option value="Studio">Yoga / Aerobics Studio</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Capacity (Persons)</label>
                  <input
                    type="number"
                    value={facilityForm.capacity}
                    onChange={(e) => setFacilityForm({ ...facilityForm, capacity: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description & Features</label>
                <textarea
                  rows={2}
                  value={facilityForm.description}
                  onChange={(e) => setFacilityForm({ ...facilityForm, description: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddFacilityOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-xs"
                >
                  {isSubmitting ? 'Saving...' : 'Save Facility'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Facility Modal */}
      {viewingFacility && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <Building2 className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900">{viewingFacility.name}</h3>
              </div>
              <button onClick={() => setViewingFacility(null)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-500">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Type:</span>
                <span className="font-semibold text-slate-900">{viewingFacility.type}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Capacity:</span>
                <span className="font-bold text-slate-900">{viewingFacility.capacity} Persons</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Total Bookings:</span>
                <span className="font-bold text-blue-600">{viewingFacility.bookings?.length || 0} Scheduled</span>
              </div>
              <div className="py-1">
                <span className="text-slate-500 block mb-1">Description:</span>
                <p className="bg-slate-50 p-2.5 rounded-lg text-slate-700">{viewingFacility.description || 'No description entered.'}</p>
              </div>
            </div>
            <div className="pt-3 border-t border-slate-100 flex justify-end space-x-2">
              <button
                onClick={() => {
                  const fac = viewingFacility;
                  setViewingFacility(null);
                  handleOpenEditFacility(fac);
                }}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50"
              >
                Edit Facility
              </button>
              <button
                onClick={() => setViewingFacility(null)}
                className="px-4 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Facility Modal */}
      {editingFacility && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900">Edit Facility</h3>
              <button onClick={() => setEditingFacility(null)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-500">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSaveEditFacility} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Facility Name</label>
                <input
                  type="text"
                  value={editFacilityForm.name || ''}
                  onChange={(e) => setEditFacilityForm({ ...editFacilityForm, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Type</label>
                  <select
                    value={editFacilityForm.type || 'Court'}
                    onChange={(e) => setEditFacilityForm({ ...editFacilityForm, type: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Court">Court</option>
                    <option value="Ground">Field / Ground</option>
                    <option value="Pool">Pool</option>
                    <option value="Gym">Gym</option>
                    <option value="Studio">Studio</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Capacity</label>
                  <input
                    type="number"
                    value={editFacilityForm.capacity || ''}
                    onChange={(e) => setEditFacilityForm({ ...editFacilityForm, capacity: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={editFacilityForm.description || ''}
                  onChange={(e) => setEditFacilityForm({ ...editFacilityForm, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="pt-4 flex justify-end space-x-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingFacility(null)}
                  className="px-3 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessingCrud}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold"
                >
                  {isProcessingCrud ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Facility Modal */}
      {deletingFacility && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center space-x-3 text-rose-600">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="font-bold text-slate-900 text-sm">Delete Facility?</h3>
            </div>
            <p className="text-xs text-slate-600">
              Are you sure you want to delete <strong>{deletingFacility.name}</strong>? All associated bookings will also be removed.
            </p>
            <div className="pt-2 flex justify-end space-x-2">
              <button
                onClick={() => setDeletingFacility(null)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDeleteFacility}
                disabled={isProcessingCrud}
                className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold"
              >
                {isProcessingCrud ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Booking Modal */}
      {viewingBooking && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900">Booking Details</h3>
              </div>
              <button onClick={() => setViewingBooking(null)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-500">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Title:</span>
                <span className="font-bold text-slate-900">{viewingBooking.title}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Booked By:</span>
                <span className="font-semibold text-slate-800">{viewingBooking.bookedBy}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Date:</span>
                <span className="text-slate-800 font-medium">{viewingBooking.bookingDate}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Time Window:</span>
                <span className="font-mono font-bold text-blue-600">{viewingBooking.startTime} - {viewingBooking.endTime}</span>
              </div>
              <div className="py-1">
                <span className="text-slate-500 block mb-1">Notes:</span>
                <p className="bg-slate-50 p-2 rounded text-slate-700">{viewingBooking.notes || 'No special requirements.'}</p>
              </div>
            </div>
            <div className="pt-3 border-t border-slate-100 flex justify-end space-x-2">
              <button
                onClick={() => {
                  const b = viewingBooking;
                  setViewingBooking(null);
                  handleOpenEditBooking(b);
                }}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50"
              >
                Edit Booking
              </button>
              <button
                onClick={() => setViewingBooking(null)}
                className="px-4 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Booking Modal */}
      {editingBooking && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900">Edit Booking</h3>
              <button onClick={() => setEditingBooking(null)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-500">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSaveEditBooking} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Title</label>
                <input
                  type="text"
                  value={editBookingForm.title || ''}
                  onChange={(e) => setEditBookingForm({ ...editBookingForm, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Booked By</label>
                  <input
                    type="text"
                    value={editBookingForm.bookedBy || ''}
                    onChange={(e) => setEditBookingForm({ ...editBookingForm, bookedBy: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={editBookingForm.bookingDate || ''}
                    onChange={(e) => setEditBookingForm({ ...editBookingForm, bookingDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Start Time</label>
                  <input
                    type="time"
                    value={editBookingForm.startTime || ''}
                    onChange={(e) => setEditBookingForm({ ...editBookingForm, startTime: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">End Time</label>
                  <input
                    type="time"
                    value={editBookingForm.endTime || ''}
                    onChange={(e) => setEditBookingForm({ ...editBookingForm, endTime: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Notes</label>
                <textarea
                  rows={2}
                  value={editBookingForm.notes || ''}
                  onChange={(e) => setEditBookingForm({ ...editBookingForm, notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="pt-4 flex justify-end space-x-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingBooking(null)}
                  className="px-3 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessingCrud}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold"
                >
                  {isProcessingCrud ? 'Saving...' : 'Save Booking'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Booking Modal */}
      {deletingBooking && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center space-x-3 text-rose-600">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="font-bold text-slate-900 text-sm">Cancel Booking?</h3>
            </div>
            <p className="text-xs text-slate-600">
              Are you sure you want to cancel booking <strong>{deletingBooking.title}</strong> scheduled for {deletingBooking.bookingDate} ({deletingBooking.startTime} - {deletingBooking.endTime})?
            </p>
            <div className="pt-2 flex justify-end space-x-2">
              <button
                onClick={() => setDeletingBooking(null)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50"
              >
                No, Keep
              </button>
              <button
                onClick={handleConfirmDeleteBooking}
                disabled={isProcessingCrud}
                className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold"
              >
                {isProcessingCrud ? 'Canceling...' : 'Yes, Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
