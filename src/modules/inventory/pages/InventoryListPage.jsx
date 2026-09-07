import React, { useState } from 'react';
import {
  Layers,
  Search,
  AlertTriangle,
  CheckCircle2,
  SlidersHorizontal,
  RefreshCw,
  PlusCircle,
  Loader2
} from 'lucide-react';
import { useInventoryQuery } from '../hooks/useInventoryQueries';
import AdjustStockModal from '../components/AdjustStockModal';
import StatusBadge from '../../../components/common/StatusBadge';
import { useToast } from '../../../context/ToastContext';

const InventoryListPage = () => {
  const toast = useToast();
  const { data: rawInventory, isLoading, refetch } = useInventoryQuery();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('ALL'); // 'ALL' or 'LOW_STOCK'
  const [selectedProductForAdjust, setSelectedProductForAdjust] = useState(null);

  const inventoryItems = Array.isArray(rawInventory)
    ? rawInventory
    : Array.isArray(rawInventory?.items)
    ? rawInventory.items
    : [];

  const filteredItems = inventoryItems.filter((item) => {
    const name = item.product || item.name || '';
    const sku = item.sku || '';
    const matchesSearch =
      name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sku.toLowerCase().includes(searchQuery.toLowerCase());

    const qty = item.qty !== undefined ? item.qty : (item.stock !== undefined ? item.stock : 0);
    const minStock = item.minStock || 10;
    const isLowStock = qty <= minStock || item.status === 'Low Stock';

    const matchesFilter = filterType === 'ALL' || (filterType === 'LOW_STOCK' && isLowStock);

    return matchesSearch && matchesFilter;
  });

  const lowStockCount = inventoryItems.filter((item) => {
    const qty = item.qty !== undefined ? item.qty : (item.stock !== undefined ? item.stock : 0);
    const minStock = item.minStock || 10;
    return qty <= minStock || item.status === 'Low Stock';
  }).length;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <Layers className="text-indigo-600" size={26} /> Inventory & Stock Levels
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Monitor real-time product quantities, minimum stock alerts, and perform manual stock adjustments.
          </p>
        </div>

        <button
          onClick={() => refetch()}
          className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-sm flex items-center gap-2 transition-all shrink-0"
        >
          <RefreshCw size={15} /> Refresh Stock
        </button>
      </div>

      {/* KPI Banners */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-extrabold">
            📊
          </div>
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total SKU Items</div>
            <div className="text-xl font-extrabold text-slate-900">{isLoading ? '...' : inventoryItems.length}</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 font-extrabold">
            🚨
          </div>
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Restock Alerts</div>
            <div className="text-xl font-extrabold text-rose-600">{isLoading ? '...' : lowStockCount}</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 font-extrabold">
            ✅
          </div>
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Healthy Stock</div>
            <div className="text-xl font-extrabold text-emerald-600">
              {isLoading ? '...' : inventoryItems.length - lowStockCount}
            </div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search inventory by product or SKU..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:border-indigo-600 outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterType('ALL')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterType === 'ALL'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            All Stock Items
          </button>

          <button
            onClick={() => setFilterType('LOW_STOCK')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              filterType === 'LOW_STOCK'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'bg-slate-50 border border-slate-200 text-rose-600 hover:bg-rose-50'
            }`}
          >
            <AlertTriangle size={14} /> Low Stock Alerts ({lowStockCount})
          </button>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">SKU</th>
                <th className="px-4 py-3">Current Qty</th>
                <th className="px-4 py-3">Min Alert Limit</th>
                <th className="px-4 py-3">Stock Bar</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-xs">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                    <Loader2 size={24} className="animate-spin text-indigo-600 mx-auto mb-2" />
                    Loading inventory stock levels...
                  </td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-400 font-medium">
                    No inventory records match your criteria.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const qty = item.qty !== undefined ? item.qty : (item.stock !== undefined ? item.stock : 0);
                  const minStock = item.minStock || 10;
                  const isLow = qty <= minStock || item.status === 'Low Stock';
                  const percent = Math.min(100, Math.round((qty / (minStock * 3)) * 100));

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-4 py-3 font-bold text-slate-900">
                        {item.product || item.name}
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-600 font-semibold">{item.sku}</td>
                      <td className="px-4 py-3 font-extrabold text-sm text-slate-900">{qty} Pcs</td>
                      <td className="px-4 py-3 text-slate-500 font-medium">{minStock} Pcs</td>
                      <td className="px-4 py-3 w-36">
                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              isLow ? 'bg-rose-500' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${Math.max(10, percent)}%` }}
                          />
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={isLow ? 'Low Stock' : 'In Stock'} />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => setSelectedProductForAdjust(item)}
                          className="px-3 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-[11px] border border-indigo-200 transition-all inline-flex items-center gap-1"
                        >
                          <SlidersHorizontal size={13} /> Adjust Qty
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Adjust Stock Modal */}
      <AdjustStockModal
        isOpen={!!selectedProductForAdjust}
        onClose={() => setSelectedProductForAdjust(null)}
        product={selectedProductForAdjust}
        toast={toast}
      />
    </div>
  );
};

export default InventoryListPage;
