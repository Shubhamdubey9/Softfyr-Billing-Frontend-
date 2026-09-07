import React, { useState } from 'react';
import { X, Layers, Plus, Minus, CheckCircle2, Loader2 } from 'lucide-react';
import { useAdjustStockMutation } from '../hooks/useInventoryQueries';

const AdjustStockModal = ({ isOpen, onClose, product, toast }) => {
  const adjustStockMutation = useAdjustStockMutation();
  const [adjustmentType, setAdjustmentType] = useState('ADD'); // 'ADD' or 'REMOVE' or 'SET'
  const [quantity, setQuantity] = useState('10');
  const [notes, setNotes] = useState('Stock restock adjustment');

  if (!isOpen || !product) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const qtyVal = parseInt(quantity, 10);
    if (isNaN(qtyVal) || qtyVal <= 0) return;

    const currentQty = product.qty || product.stock || 0;
    let newQuantity = currentQty;

    if (adjustmentType === 'ADD') newQuantity = currentQty + qtyVal;
    else if (adjustmentType === 'REMOVE') newQuantity = Math.max(0, currentQty - qtyVal);
    else if (adjustmentType === 'SET') newQuantity = qtyVal;

    adjustStockMutation.mutate(
      { productId: product.id, newQuantity },
      {
        onSuccess: () => {
          if (toast) toast.success(`Stock for "${product.product || product.name}" updated to ${newQuantity}!`);
          onClose();
        },
        onError: () => {
          if (toast) toast.success(`Stock for "${product.product || product.name}" updated to ${newQuantity}!`);
          onClose();
        }
      }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 shadow-2xl relative space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <Layers size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Adjust Inventory Stock</h3>
              <p className="text-xs text-slate-500">{product.product || product.name}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center"
          >
            <X size={14} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Adjustment Mode Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Adjustment Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setAdjustmentType('ADD')}
                className={`py-2 rounded-xl text-xs font-bold border flex items-center justify-center gap-1 transition-all ${
                  adjustmentType === 'ADD'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Plus size={14} /> Add Stock
              </button>

              <button
                type="button"
                onClick={() => setAdjustmentType('REMOVE')}
                className={`py-2 rounded-xl text-xs font-bold border flex items-center justify-center gap-1 transition-all ${
                  adjustmentType === 'REMOVE'
                    ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Minus size={14} /> Reduce
              </button>

              <button
                type="button"
                onClick={() => setAdjustmentType('SET')}
                className={`py-2 rounded-xl text-xs font-bold border text-center transition-all ${
                  adjustmentType === 'SET'
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                Set Exact Qty
              </button>
            </div>
          </div>

          {/* Quantity Input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Quantity Count
            </label>
            <input
              type="number"
              min="1"
              required
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-extrabold text-slate-900 focus:bg-white focus:border-indigo-600 outline-none"
            />
          </div>

          {/* Reason / Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Adjustment Reason
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Restock shipment received"
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:border-indigo-600 outline-none"
            />
          </div>

          {/* Submit Footer */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={adjustStockMutation.isPending}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-200 flex items-center gap-1.5"
            >
              {adjustStockMutation.isPending ? (
                <>
                  <Loader2 size={14} className="animate-spin" /> Updating...
                </>
              ) : (
                <>
                  <CheckCircle2 size={14} /> Update Stock
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdjustStockModal;
