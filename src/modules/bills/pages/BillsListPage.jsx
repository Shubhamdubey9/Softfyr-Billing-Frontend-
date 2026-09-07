import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  FileText,
  Plus,
  Search,
  IndianRupee,
  Eye,
  Printer,
  Download,
  Loader2
} from 'lucide-react';
import { useInvoicesQuery } from '../hooks/useBillsQueries';
import StatusBadge from '../../../components/common/StatusBadge';
import IconButton from '../../../components/common/IconButton';

const BillsListPage = () => {
  const { data: rawBills, isLoading } = useInvoicesQuery();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const billsList = Array.isArray(rawBills)
    ? rawBills
    : Array.isArray(rawBills?.bills)
    ? rawBills.bills
    : Array.isArray(rawBills?.items)
    ? rawBills.items
    : [];

  const filteredBills = billsList.filter((bill) => {
    const matchesSearch =
      (bill.id || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (bill.customer || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'ALL' || (bill.status || '').toUpperCase() === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <FileText className="text-indigo-600" size={26} /> Invoices & Bills
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Track generated customer invoices, payment statuses, and print receipts.
          </p>
        </div>

        <NavLink
          to="/vendor/pos"
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-bold text-xs shadow-md shadow-indigo-200 flex items-center gap-2 transition-all shrink-0"
        >
          <Plus size={16} /> Create New Bill (POS)
        </NavLink>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by invoice number or customer..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:border-indigo-600 outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          {['ALL', 'PAID', 'UNPAID', 'PARTIALLY PAID'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                statusFilter === st
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Bills Table */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <th className="px-4 py-3">Invoice No.</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-xs">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                    <Loader2 size={24} className="animate-spin text-indigo-600 mx-auto mb-2" />
                    Loading invoices...
                  </td>
                </tr>
              ) : filteredBills.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-400 font-medium">
                    No invoices match your search.
                  </td>
                </tr>
              ) : (
                filteredBills.map((bill) => (
                  <tr key={bill.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-4 py-3 font-bold text-slate-900">{bill.id}</td>
                    <td className="px-4 py-3 font-medium text-slate-800">{bill.customer}</td>
                    <td className="px-4 py-3 text-slate-500">{bill.date || '25 May 2025'}</td>
                    <td className="px-4 py-3 font-extrabold text-slate-900">
                      {bill.total || bill.amount}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={bill.status || 'Paid'} />
                    </td>
                    <td className="px-4 py-3 text-right flex items-center justify-end gap-1">
                      <IconButton icon={Eye} title="View Invoice" />
                      <IconButton icon={Printer} title="Print Invoice" />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BillsListPage;
