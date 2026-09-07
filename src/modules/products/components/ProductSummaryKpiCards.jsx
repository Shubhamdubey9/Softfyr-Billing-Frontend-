import React from 'react';
import { Package, AlertTriangle, XCircle, DollarSign } from 'lucide-react';

const ProductSummaryKpiCards = ({
  totalProducts = 0,
  lowStockCount = 0,
  outOfStockCount = 0,
  totalStockValue = 0,
  onFilterLowStock,
  onFilterOutOfStock,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
      {/* KPI 1: Total Products */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm flex items-center justify-between hover:border-indigo-200 transition-all">
        <div className="space-y-1">
          <div className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Total Products</div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">{totalProducts}</div>
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-emerald-50 text-emerald-700 font-extrabold text-[10px] rounded-full border border-emerald-200 mt-1">
            Active
          </div>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
          <Package size={22} />
        </div>
      </div>

      {/* KPI 2: Low Stock Items */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm flex items-center justify-between hover:border-amber-200 transition-all">
        <div className="space-y-1">
          <div className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Low Stock Items</div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">{lowStockCount}</div>
          <button
            type="button"
            onClick={onFilterLowStock}
            className="text-[11px] font-extrabold text-indigo-600 hover:underline cursor-pointer block mt-1"
          >
            View Details
          </button>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
          <AlertTriangle size={22} />
        </div>
      </div>

      {/* KPI 3: Out of Stock Items */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm flex items-center justify-between hover:border-rose-200 transition-all">
        <div className="space-y-1">
          <div className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Out of Stock Items</div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">{outOfStockCount}</div>
          <button
            type="button"
            onClick={onFilterOutOfStock}
            className="text-[11px] font-extrabold text-rose-600 hover:underline cursor-pointer block mt-1"
          >
            View Details
          </button>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
          <XCircle size={22} />
        </div>
      </div>

      {/* KPI 4: Total Stock Value */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm flex items-center justify-between hover:border-emerald-200 transition-all">
        <div className="space-y-1">
          <div className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Total Stock Value</div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            ₹{Number(totalStockValue).toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] font-bold text-emerald-600 mt-1">Current Value</div>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
          <DollarSign size={22} />
        </div>
      </div>
    </div>
  );
};

export default ProductSummaryKpiCards;
