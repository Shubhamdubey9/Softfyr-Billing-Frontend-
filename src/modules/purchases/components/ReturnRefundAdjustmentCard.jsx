import React from 'react';

const ReturnRefundAdjustmentCard = ({
  refundType,
  onRefundTypeChange,
  refundAmount,
  onRefundAmountChange,
  paymentMethod,
  onPaymentMethodChange,
  bankAccount,
  onBankAccountChange,
}) => {
  return (
    <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-7 h-7 rounded-full bg-indigo-600 text-white text-xs font-black flex items-center justify-center">
          4
        </div>
        <h2 className="text-base font-black text-slate-900">Refund / Adjustment</h2>
      </div>

      <div className="space-y-3 text-xs font-bold text-slate-700">
        <div>
          <label className="block mb-1 uppercase text-[11px] font-extrabold">
            Refund Type <span className="text-rose-500">*</span>
          </label>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="radio"
                name="refType"
                checked={refundType === 'Cash Refund'}
                onChange={() => onRefundTypeChange('Cash Refund')}
              />
              <span>Cash Refund</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="radio"
                name="refType"
                checked={refundType === 'Adjust in Next Purchase'}
                onChange={() => onRefundTypeChange('Adjust in Next Purchase')}
              />
              <span>Adjust in Next Purchase</span>
            </label>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block mb-1 uppercase text-[11px]">
              Refund Amount (₹) <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              value={refundAmount}
              onChange={(e) => onRefundAmountChange(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-extrabold"
            />
          </div>
          <div>
            <label className="block mb-1 uppercase text-[11px]">Payment Method</label>
            <select
              value={paymentMethod}
              onChange={(e) => onPaymentMethodChange(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold cursor-pointer"
            >
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Cash">Cash</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block mb-1 uppercase text-[11px]">Bank Account</label>
          <select
            value={bankAccount}
            onChange={(e) => onBankAccountChange(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold cursor-pointer"
          >
            <option value="HDFC Bank - 502000xxxx1234">HDFC Bank - 502000xxxx1234</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default ReturnRefundAdjustmentCard;
