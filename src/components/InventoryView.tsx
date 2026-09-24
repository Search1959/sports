import React, { useState } from 'react';
import { EquipmentItem } from '../types.ts';
import {
  Package,
  Plus,
  CheckCircle,
  AlertTriangle,
  X,
  MapPin,
  Layers,
  Eye,
  Edit2,
  Trash2,
} from 'lucide-react';

interface InventoryViewProps {
  equipment: EquipmentItem[];
  onAddEquipment: (data: any) => Promise<void>;
  onUpdateEquipment?: (id: number, data: any) => Promise<void>;
  onDeleteEquipment?: (id: number) => Promise<void>;
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  equipment = [],
  onAddEquipment,
  onUpdateEquipment,
  onDeleteEquipment,
}) => {
  const safeEquipment = Array.isArray(equipment) ? equipment : [];
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [form, setForm] = useState({
    name: '',
    category: 'Balls & Gear',
    quantity: 10,
    condition: 'Good',
    location: 'Main Sports Storage',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isProcessingCrud, setIsProcessingCrud] = useState(false);

  // CRUD state
  const [viewingItem, setViewingItem] = useState<EquipmentItem | null>(null);
  const [editingItem, setEditingItem] = useState<EquipmentItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<EquipmentItem | null>(null);
  const [editForm, setEditForm] = useState<Partial<EquipmentItem>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) return;
    setIsSubmitting(true);
    try {
      await onAddEquipment({
        ...form,
        availableQuantity: form.quantity,
      });
      setIsAddOpen(false);
      setForm({
        name: '',
        category: 'Balls & Gear',
        quantity: 10,
        condition: 'Good',
        location: 'Main Sports Storage',
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenEdit = (item: EquipmentItem) => {
    setEditingItem(item);
    setEditForm({
      name: item.name,
      category: item.category,
      quantity: item.quantity,
      availableQuantity: item.availableQuantity,
      condition: item.condition,
      location: item.location,
    });
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    setIsProcessingCrud(true);
    try {
      if (onUpdateEquipment) {
        await onUpdateEquipment(editingItem.id, editForm);
      }
      setEditingItem(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessingCrud(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingItem) return;
    setIsProcessingCrud(true);
    try {
      if (onDeleteEquipment) {
        await onDeleteEquipment(deletingItem.id);
      }
      setDeletingItem(null);
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
          <h2 className="text-xl font-bold text-slate-900">Equipment & Asset Inventory</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Track sports gear, court hardware, conditions, and stock availability across club branches.
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Add Equipment</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {safeEquipment.length > 0 ? (
          safeEquipment.map((item) => (
            <div
              key={item.id}
              className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
                      <Package className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm leading-tight">{item.name}</h3>
                      <span className="text-[10px] text-slate-400">{item.category}</span>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded capitalize ${
                      item.condition === 'Good'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {item.condition}
                  </span>
                </div>

                <div className="mt-4 flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
                  <div>
                    <div className="text-[10px] uppercase font-bold text-slate-400">In Stock</div>
                    <div className="text-lg font-bold font-mono text-slate-800">{item.quantity} units</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] uppercase font-bold text-emerald-600">Available</div>
                    <div className="text-lg font-bold font-mono text-emerald-600">
                      {item.availableQuantity} units
                    </div>
                  </div>
                </div>

                {item.location && (
                  <div className="mt-3 text-xs text-slate-500 flex items-center space-x-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{item.location}</span>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Branch Equipment</span>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => setViewingItem(item)}
                    title="View Equipment Details"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleOpenEdit(item)}
                    title="Edit Equipment"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDeletingItem(item)}
                    title="Delete Equipment"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-12 text-center text-xs text-slate-400 bg-white rounded-xl border border-slate-200">
            No equipment items recorded yet. Click "Add Equipment" to register sports gear.
          </div>
        )}
      </div>

      {/* Add Equipment Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-xl border border-slate-200">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Add Equipment</h3>
                <p className="text-xs text-slate-500">Add balls, gear, nets, or fitness hardware</p>
              </div>
              <button
                onClick={() => setIsAddOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Item Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Molten FIBA Size 7 Basketballs"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                  >
                    <option value="Balls & Gear">Balls & Gear</option>
                    <option value="Rackets & Bats">Rackets & Bats</option>
                    <option value="Court Hardware">Court Hardware & Nets</option>
                    <option value="Fitness & Weights">Fitness & Conditioning</option>
                    <option value="Medical & First Aid">First Aid & Medical</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Quantity</label>
                  <input
                    type="number"
                    value={form.quantity}
                    onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Condition</label>
                  <select
                    value={form.condition}
                    onChange={(e) => setForm({ ...form, condition: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                  >
                    <option value="Good">Good (New / Ready)</option>
                    <option value="Fair">Fair (Slight wear)</option>
                    <option value="Needs Repair">Needs Repair</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Storage Location</label>
                  <input
                    type="text"
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-xs"
                >
                  {isSubmitting ? 'Adding...' : 'Save Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Equipment Details Modal */}
      {viewingItem && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <Package className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900">{viewingItem.name}</h3>
              </div>
              <button onClick={() => setViewingItem(null)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-500">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Category:</span>
                <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-700">{viewingItem.category}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Total Quantity:</span>
                <span className="font-mono font-bold text-slate-900">{viewingItem.quantity} units</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Available Quantity:</span>
                <span className="font-mono font-bold text-emerald-600">{viewingItem.availableQuantity} units</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Condition:</span>
                <span className={`font-semibold px-2 py-0.5 rounded ${
                  viewingItem.condition === 'Good' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                }`}>
                  {viewingItem.condition}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Location:</span>
                <span className="text-slate-800">{viewingItem.location || 'Not Specified'}</span>
              </div>
            </div>
            <div className="pt-3 border-t border-slate-100 flex justify-end space-x-2">
              <button
                onClick={() => {
                  const it = viewingItem;
                  setViewingItem(null);
                  handleOpenEdit(it);
                }}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50"
              >
                Edit Item
              </button>
              <button
                onClick={() => setViewingItem(null)}
                className="px-4 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Equipment Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900">Edit Equipment</h3>
              <button onClick={() => setEditingItem(null)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-500">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSaveEdit} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Item Name</label>
                <input
                  type="text"
                  value={editForm.name || ''}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Category</label>
                  <select
                    value={editForm.category || 'Balls & Gear'}
                    onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Balls & Gear">Balls & Gear</option>
                    <option value="Rackets & Bats">Rackets & Bats</option>
                    <option value="Court Hardware">Court Hardware & Nets</option>
                    <option value="Fitness & Weights">Fitness & Conditioning</option>
                    <option value="Medical & First Aid">First Aid & Medical</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Condition</label>
                  <select
                    value={editForm.condition || 'Good'}
                    onChange={(e) => setEditForm({ ...editForm, condition: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Good">Good</option>
                    <option value="Fair">Fair</option>
                    <option value="Needs Repair">Needs Repair</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Total Quantity</label>
                  <input
                    type="number"
                    value={editForm.quantity || ''}
                    onChange={(e) => setEditForm({ ...editForm, quantity: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Available Quantity</label>
                  <input
                    type="number"
                    value={editForm.availableQuantity || ''}
                    onChange={(e) => setEditForm({ ...editForm, availableQuantity: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-mono"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Storage Location</label>
                <input
                  type="text"
                  value={editForm.location || ''}
                  onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="pt-4 flex justify-end space-x-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
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

      {/* Delete Equipment Modal */}
      {deletingItem && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center space-x-3 text-rose-600">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="font-bold text-slate-900 text-sm">Delete Equipment?</h3>
            </div>
            <p className="text-xs text-slate-600">
              Are you sure you want to remove <strong>{deletingItem.name}</strong> from inventory records?
            </p>
            <div className="pt-2 flex justify-end space-x-2">
              <button
                onClick={() => setDeletingItem(null)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={isProcessingCrud}
                className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold"
              >
                {isProcessingCrud ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
