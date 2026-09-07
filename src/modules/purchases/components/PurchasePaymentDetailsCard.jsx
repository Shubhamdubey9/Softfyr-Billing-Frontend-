import React from 'react';

const PurchasePaymentDetailsCard = ({
  paymentStatus,
  onPaymentStatusChange,
  paymentMethod,
  onPaymentMethodChange,
  paymentDate,
  onPaymentDateChange,
  paidAmount,
  onPaidAmountChange,
  outstandingAmount,
  bankAccount,
  onBankAccountChange,
  paymentRefNo,
  onPaymentRefNoChange,
}) => {
  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-sm space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-7 h-7 rounded-full bg-indigo-600 text-white text-xs font-black flex items-center justify-center">
          3
        </div>
        <h2 className="text-base sm:text-lg font-black text-slate-900">Payment Details</h2>
      </div>

      {/* Payment Status Segmented Controls */}
      <div>
        <label className="block mb-1.5 uppercase text-[11px] font-extrabold text-slate-700">
          Payment Status <span className="text-rose-500">*</span>
        </label>
        <div className="grid grid-cols-3 gap-2 bg-slate-100 p-1 rounded-xl">
          {['Paid', 'Partial', 'Unpaid'].map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => onPaymentStatusChange(status)}
              className={`py-2 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                paymentStatus === status
                  ? 'bg-white text-indigo-700 shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* If Paid or Partial */}
      {paymentStatus !== 'Unpaid' && (
        <div className="space-y-3.5 text-xs font-bold text-slate-700 pt-2 border-t border-slate-100">
          <div>
            <label className="block mb-1 uppercase text-[11px] font-extrabold text-slate-700">Payment Method *</label>
            <select
              value={paymentMethod}
              onChange={(e) => onPaymentMethodChange(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="Bank Transfer">Bank Transfer (NEFT/RTGS/IMPS)</option>
              <option value="Cash">Cash Payment</option>
              <option value="UPI">UPI / QR Code</option>
            </select>
          </div>

          <div>
            <label className="block mb-1 uppercase text-[11px] font-extrabold text-slate-700">Payment Date *</label>
            <input
              type="date"
              value={paymentDate}
              onChange={(e) => onPaymentDateChange(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block mb-1 uppercase text-[11px] font-extrabold text-slate-700">
                Paid Amount (₹) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                value={paidAmount}
                onChange={(e) => onPaidAmountChange(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-extrabold text-slate-900 focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block mb-1 uppercase text-[11px] font-extrabold text-slate-400">Outstanding Amount</label>
              <div className="px-3.5 py-2.5 bg-slate-100/80 rounded-xl font-black text-rose-600 text-xs">
                ₹{outstandingAmount.toLocaleString('en-IN')}.00
              </div>
            </div>
          </div>

          <div>
            <label className="block mb-1 uppercase text-[11px] font-extrabold text-slate-700">Bank Account</label>
            <select
              value={bankAccount}
              onChange={(e) => onBankAccountChange(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none cursor-pointer"
            >
              <option value="HDFC Bank - 502000xxxx1234">HDFC Bank - 502000xxxx1234</option>
              <option value="ICICI Bank - 001105xxxx5678">ICICI Bank - 001105xxxx5678</option>
              <option value="SBI Current - 334455xxxx9900">SBI Current - 334455xxxx9900</option>
            </select>
          </div>

          <div>
            <label className="block mb-1 uppercase text-[11px] font-extrabold text-slate-700">Reference No.</label>
            <input
              type="text"
              value={paymentRefNo}
              onChange={(e) => onPaymentRefNoChange(e.target.value)}
              placeholder="e.g. NEFT25698541"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-900 focus:bg-white focus:outline-none"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchasePaymentDetailsCard;
