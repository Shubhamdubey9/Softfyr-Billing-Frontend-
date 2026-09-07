import React from 'react';
import { FileText, Wallet, CheckCircle, Clock, AlertTriangle } from 'lucide-react';

const PurchaseSummaryKpiCards = ({
  totalBills = 0,
  totalAmount = 0,
  paidAmount = 0,
  dueAmount = 0,
  overdueAmount = 0,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
      {/* KPI 1: Total Bills */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-sm flex items-center gap-3.5 hover:shadow-md transition-all">
        <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl shrink-0">
          <FileText size={22} />
        </div>
        <div className="min-w-0">
          <div className="text-[10px] sm:text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Total Bills</div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-0.5">{totalBills}</div>
          <div className="text-[11px] text-purple-600 font-extrabold cursor-pointer hover:underline mt-0.5">View all</div>
        </div>
      </div>

      {/* KPI 2: Total Amount */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-sm flex items-center gap-3.5 hover:shadow-md transition-all">
        <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl shrink-0">
          <Wallet size={22} />
        </div>
        <div className="min-w-0">
          <div className="text-[10px] sm:text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Total Amount</div>
          <div className="text-lg sm:text-xl font-black text-slate-900 tracking-tight mt-0.5 truncate">
            ₹{totalAmount.toLocaleString('en-IN')}.00
          </div>
          <div className="text-[11px] text-blue-600 font-extrabold cursor-pointer hover:underline mt-0.5">View all</div>
        </div>
      </div>

      {/* KPI 3: Paid Amount */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-sm flex items-center gap-3.5 hover:shadow-md transition-all">
        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl shrink-0">
          <CheckCircle size={22} />
        </div>
        <div className="min-w-0">
          <div className="text-[10px] sm:text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Paid Amount</div>
          <div className="text-lg sm:text-xl font-black text-emerald-600 tracking-tight mt-0.5 truncate">
            ₹{paidAmount.toLocaleString('en-IN')}.00
          </div>
          <div className="text-[11px] text-emerald-600 font-extrabold cursor-pointer hover:underline mt-0.5">View all</div>
        </div>
      </div>

      {/* KPI 4: Due Amount */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-sm flex items-center gap-3.5 hover:shadow-md transition-all">
        <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl shrink-0">
          <Clock size={22} />
        </div>
        <div className="min-w-0">
          <div className="text-[10px] sm:text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Due Amount</div>
          <div className="text-lg sm:text-xl font-black text-slate-900 tracking-tight mt-0.5 truncate">
            ₹{dueAmount.toLocaleString('en-IN')}.00
          </div>
          <div className="text-[11px] text-amber-600 font-extrabold cursor-pointer hover:underline mt-0.5">View all</div>
        </div>
      </div>

      {/* KPI 5: Overdue Amount */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-sm flex items-center gap-3.5 hover:shadow-md transition-all">
        <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl shrink-0">
          <AlertTriangle size={22} />
        </div>
        <div className="min-w-0">
          <div className="text-[10px] sm:text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Overdue Amount</div>
          <div className="text-lg sm:text-xl font-black text-rose-600 tracking-tight mt-0.5 truncate">
            ₹{overdueAmount.toLocaleString('en-IN')}.00
          </div>
          <div className="text-[11px] text-rose-600 font-extrabold cursor-pointer hover:underline mt-0.5">View all</div>
        </div>
      </div>
    </div>
  );
};

export default PurchaseSummaryKpiCards;
