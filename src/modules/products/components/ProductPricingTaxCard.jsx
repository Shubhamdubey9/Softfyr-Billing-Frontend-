import React from 'react';
import { Tag, Info, Calculator, Percent, Sparkles } from 'lucide-react';

const ProductPricingTaxCard = ({ formData, onInputChange }) => {
  const purchasePrice = Number(formData.purchasePrice) || 0;
  const sellingPrice = Number(formData.sellingPrice) || 0;
  const mrp = Number(formData.mrp) || 0;
  const taxType = formData.taxType || 'GST';
  const taxMode = formData.taxMode || 'INCLUSIVE'; // 'INCLUSIVE' or 'EXCLUSIVE'
  const taxPercent = taxType === 'GST' ? (Number(formData.taxPercent) || 0) : 0;
  const discountPercent = Number(formData.discountPercent) || 0;

  // Discount Calculation
  const calculatedDiscountAmount = discountPercent > 0 ? (sellingPrice * discountPercent) / 100 : 0;
  const effectiveSellingPrice = Math.max(0, sellingPrice - calculatedDiscountAmount);

  // Tax Calculations based on Inclusive vs Exclusive Mode
  const isInclusive = taxMode === 'INCLUSIVE';
  let taxableValue = 0;
  let totalTaxAmount = 0;
  let finalPriceWithTax = 0;

  if (effectiveSellingPrice > 0) {
    if (isInclusive) {
      // Selling price includes GST
      taxableValue = taxPercent > 0 ? effectiveSellingPrice / (1 + taxPercent / 100) : effectiveSellingPrice;
      totalTaxAmount = effectiveSellingPrice - taxableValue;
      finalPriceWithTax = effectiveSellingPrice;
    } else {
      // GST is added on top of selling price
      taxableValue = effectiveSellingPrice;
      totalTaxAmount = taxPercent > 0 ? (effectiveSellingPrice * taxPercent) / 100 : 0;
      finalPriceWithTax = effectiveSellingPrice + totalTaxAmount;
    }
  }

  const cgstAmount = totalTaxAmount / 2;
  const sgstAmount = totalTaxAmount / 2;

  // Profit Calculation
  const profitAmount = finalPriceWithTax - purchasePrice;
  const profitMarginPercent = purchasePrice > 0 ? ((profitAmount / purchasePrice) * 100).toFixed(2) : 0;
  const mrpDiscountAmount = mrp > finalPriceWithTax ? mrp - finalPriceWithTax : 0;

  // Quick Margin Preset Helper
  const handleApplyMargin = (marginPct) => {
    if (!purchasePrice) return;
    const calculatedSelling = (purchasePrice * (1 + marginPct / 100)).toFixed(2);
    onInputChange({
      target: {
        name: 'sellingPrice',
        value: calculatedSelling,
        type: 'number',
      },
    });
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <Tag size={18} />
          </div>
          <h2 className="text-base font-extrabold text-slate-900">Pricing & Tax</h2>
        </div>
        <span className="text-[11px] font-extrabold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-full border border-slate-200">
          Real-Time Calculator Active
        </span>
      </div>

      {/* Form Fields Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-bold text-slate-700">
        {/* Tax Calculation Mode Radio Switch (Placed at top for best UX) */}
        <div className="sm:col-span-2 space-y-2 pb-1">
          <label className="block uppercase text-[11px] font-extrabold text-slate-700 tracking-wider">
            Tax Calculation Mode
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Option 1: Tax Inclusive */}
            <label
              onClick={() => {
                if (taxType === 'GST') {
                  onInputChange({ target: { name: 'taxMode', value: 'INCLUSIVE' } });
                }
              }}
              className={`flex items-start gap-3 p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${taxMode === 'INCLUSIVE'
                  ? 'bg-indigo-50/70 border-indigo-600 text-indigo-950 shadow-xs'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                } ${taxType !== 'GST' ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <input
                type="radio"
                name="taxMode"
                value="INCLUSIVE"
                checked={taxMode === 'INCLUSIVE'}
                onChange={onInputChange}
                disabled={taxType !== 'GST'}
                className="mt-0.5 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
              />
              <div className="min-w-0">
                <div className="font-extrabold text-xs flex items-center gap-2">
                  <span className="text-slate-900">Tax Inclusive</span>
                  {taxMode === 'INCLUSIVE' && (
                    <span className="text-[9px] bg-indigo-600 text-white font-extrabold px-1.5 py-0.5 rounded-md">ACTIVE</span>
                  )}
                </div>
                <div className="text-[11px] font-medium text-slate-500 mt-0.5 leading-snug">
                  GST is already included inside the Selling Price.
                </div>
              </div>
            </label>

            {/* Option 2: Tax Exclusive */}
            <label
              onClick={() => {
                if (taxType === 'GST') {
                  onInputChange({ target: { name: 'taxMode', value: 'EXCLUSIVE' } });
                }
              }}
              className={`flex items-start gap-3 p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${taxMode === 'EXCLUSIVE'
                  ? 'bg-indigo-50/70 border-indigo-600 text-indigo-950 shadow-xs'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                } ${taxType !== 'GST' ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <input
                type="radio"
                name="taxMode"
                value="EXCLUSIVE"
                checked={taxMode === 'EXCLUSIVE'}
                onChange={onInputChange}
                disabled={taxType !== 'GST'}
                className="mt-0.5 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
              />
              <div className="min-w-0">
                <div className="font-extrabold text-xs flex items-center gap-2">
                  <span className="text-slate-900">Tax Exclusive</span>
                  {taxMode === 'EXCLUSIVE' && (
                    <span className="text-[9px] bg-indigo-600 text-white font-extrabold px-1.5 py-0.5 rounded-md">ACTIVE</span>
                  )}
                </div>
                <div className="text-[11px] font-medium text-slate-500 mt-0.5 leading-snug">
                  GST will be added extra on top of Selling Price.
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* Purchase Price */}
        <div>
          <label className="block mb-1 uppercase text-[11px] font-extrabold text-slate-700 flex items-center justify-between">
            <span>Purchase Price (₹)</span>
            <span className="text-[10px] text-indigo-600 font-extrabold">
              Per {formData.unit || 'Pcs'}
            </span>
          </label>
          <input
            type="number"
            name="purchasePrice"
            step="0.01"
            min="0"
            value={formData.purchasePrice ?? ''}
            onChange={(e) => {
              onInputChange(e);
              if (formData.hasSecondaryUnit && (Number(formData.conversionFactor) || 1) > 0) {
                const baseVal = Number(e.target.value) || 0;
                const factor = Number(formData.conversionFactor) || 1;
                onInputChange({
                  target: {
                    name: 'secondaryPurchasePrice',
                    value: (baseVal * factor).toFixed(2),
                  },
                });
              }
            }}
            placeholder={`Price per ${formData.unit || 'Pcs'}`}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-extrabold focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        {/* Secondary Unit Bulk Purchase Price (if enabled) */}
        {formData.hasSecondaryUnit && (
          <div>
            <label className="block mb-1 uppercase text-[11px] font-extrabold text-indigo-900 flex items-center justify-between">
              <span>Bulk Purchase Price (₹)</span>
              <span className="text-[10px] bg-indigo-100 text-indigo-700 font-black px-1.5 py-0.5 rounded">
                Per {formData.secondaryUnit || 'Box'}
              </span>
            </label>
            <input
              type="number"
              name="secondaryPurchasePrice"
              step="0.01"
              min="0"
              value={formData.secondaryPurchasePrice ?? ''}
              onChange={(e) => {
                onInputChange(e);
                const bulkVal = Number(e.target.value) || 0;
                const factor = Number(formData.conversionFactor) || 1;
                if (factor > 0) {
                  onInputChange({
                    target: {
                      name: 'purchasePrice',
                      value: (bulkVal / factor).toFixed(2),
                    },
                  });
                }
              }}
              placeholder={`e.g. 500 per ${formData.secondaryUnit || 'Box'}`}
              className="w-full px-3.5 py-2.5 bg-indigo-50/60 border border-indigo-200 rounded-xl text-indigo-950 font-black focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
        )}

        {/* Selling Price */}
        <div>
          <label className="block mb-1 uppercase text-[11px] font-extrabold text-slate-700 flex items-center justify-between">
            <span>Selling Price (₹) <span className="text-rose-500">*</span></span>
            <span className="text-[10px] text-indigo-600 font-extrabold">
              Per {formData.unit || 'Pcs'}
            </span>
          </label>
          <input
            type="number"
            name="sellingPrice"
            step="0.01"
            min="0"
            value={formData.sellingPrice ?? ''}
            onChange={onInputChange}
            placeholder={`Selling price per ${formData.unit || 'Pcs'}`}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-extrabold focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            required
          />
        </div>

        {/* MRP */}
        <div>
          <label className="block mb-1 uppercase text-[11px] font-extrabold text-slate-700">
            MRP (₹) <span className="text-slate-400 font-normal text-[10px] normal-case ml-1">(Maximum Retail Price)</span>
          </label>
          <input
            type="number"
            name="mrp"
            step="0.01"
            min="0"
            value={formData.mrp ?? ''}
            onChange={onInputChange}
            placeholder="Enter MRP"
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:bg-white focus:outline-none"
          />
        </div>

        {/* Tax Type */}
        <div>
          <label className="block mb-1 uppercase text-[11px] font-extrabold text-slate-700">
            Tax Type
          </label>
          <select
            name="taxType"
            value={taxType}
            onChange={onInputChange}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-extrabold focus:bg-white focus:outline-none cursor-pointer"
          >
            <option value="GST">GST Applicable</option>
            <option value="Non-GST">Non-GST</option>
            <option value="Exempted">Exempted / Zero Tax</option>
          </select>
        </div>

        {/* GST Rate (Manual Number Input + Quick Preset Buttons) */}
        <div>
          <label className="block mb-1 uppercase text-[11px] font-extrabold text-slate-700">
            GST Rate (%) <span className="text-slate-400 font-normal text-[10px] normal-case ml-1">(Type custom or select)</span>
          </label>
          <div className="relative">
            <input
              type="number"
              name="taxPercent"
              step="0.01"
              min="0"
              max="100"
              disabled={taxType !== 'GST'}
              value={taxType === 'GST' ? (formData.taxPercent ?? '') : 0}
              onChange={onInputChange}
              placeholder="e.g. 18 or 3 or 0.25"
              className={`w-full pl-3.5 pr-8 py-2.5 border rounded-xl font-extrabold focus:bg-white focus:outline-none transition-colors ${taxType === 'GST'
                  ? 'bg-slate-50 border-slate-200 text-slate-900 focus:ring-2 focus:ring-indigo-500/20'
                  : 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                }`}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">%</span>
          </div>

          {/* Quick Preset Buttons */}
          {taxType === 'GST' && (
            <div className="flex items-center gap-1.5 mt-2 flex-wrap">
              <span className="text-[10px] text-slate-400 font-bold">Quick:</span>
              {[0, 3, 5, 12, 18, 28].map((rate) => {
                const isSelected = Number(formData.taxPercent) === rate;
                return (
                  <button
                    key={rate}
                    type="button"
                    onClick={() => {
                      onInputChange({
                        target: { name: 'taxPercent', value: rate, type: 'number' }
                      });
                    }}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-extrabold border transition-all cursor-pointer ${isSelected
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                      }`}
                  >
                    {rate}%
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Discount Percent */}
        <div className="sm:col-span-2">
          <label className="block mb-1 uppercase text-[11px] font-extrabold text-slate-700">
            Discount (%) <span className="text-slate-400 font-normal text-[10px] normal-case ml-1">(Optional Customer Discount)</span>
          </label>
          <div className="relative">
            <input
              type="number"
              name="discountPercent"
              step="0.1"
              min="0"
              max="100"
              value={formData.discountPercent ?? ''}
              onChange={onInputChange}
              placeholder="Enter discount percentage (e.g. 5)"
              className="w-full pl-3.5 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:bg-white focus:outline-none"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">%</span>
          </div>
        </div>
      </div>

      {/* Quick Margin Presets Helper when Purchase Price is set */}
      {purchasePrice > 0 && (
        <div className="p-3 bg-indigo-50/60 border border-indigo-100/80 rounded-2xl flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5 font-extrabold text-indigo-900">
            <Sparkles size={15} className="text-indigo-600" />
            <span>Quick Margin Preset:</span>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {[10, 20, 25, 30, 50].map((margin) => (
              <button
                key={margin}
                type="button"
                onClick={() => handleApplyMargin(margin)}
                className="px-2.5 py-1 bg-white hover:bg-indigo-600 hover:text-white text-indigo-700 font-bold border border-indigo-200 rounded-lg text-[11px] transition-all cursor-pointer shadow-2xs"
              >
                +{margin}%
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Real-Time Tax & Profit Calculation Breakdown Box */}
      {(effectiveSellingPrice > 0 || purchasePrice > 0) && (
        <div className="p-4 bg-slate-50 border border-slate-200/90 rounded-2xl space-y-3 font-semibold text-xs animate-fadeIn">
          <div className="flex items-center justify-between text-slate-800 font-extrabold pb-2 border-b border-slate-200/70">
            <span className="flex items-center gap-1.5 text-indigo-600">
              <Calculator size={16} /> Real-Time Tax & Profit Breakdown
            </span>
            <span className="text-[11px] bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full border border-indigo-100 font-extrabold">
              {taxType === 'GST' ? `${taxPercent}% GST (${isInclusive ? 'Inclusive' : 'Exclusive'})` : taxType}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-[11px]">
            <div className="bg-white p-2.5 rounded-xl border border-slate-200/60">
              <span className="text-slate-500 font-bold uppercase text-[10px] block">Taxable Base</span>
              <span className="text-slate-900 font-black text-xs">₹{taxableValue.toFixed(2)}</span>
            </div>

            <div className="bg-white p-2.5 rounded-xl border border-slate-200/60">
              <span className="text-slate-500 font-bold uppercase text-[10px] block">Total Tax ({taxPercent}%)</span>
              <span className="text-indigo-600 font-black text-xs">₹{totalTaxAmount.toFixed(2)}</span>
            </div>

            <div className="bg-white p-2.5 rounded-xl border border-slate-200/60">
              <span className="text-slate-400 font-bold uppercase text-[9px] block">CGST ({(taxPercent / 2).toFixed(1)}%)</span>
              <span className="text-slate-700 font-extrabold">₹{cgstAmount.toFixed(2)}</span>
            </div>

            <div className="bg-white p-2.5 rounded-xl border border-slate-200/60">
              <span className="text-slate-400 font-bold uppercase text-[9px] block">SGST ({(taxPercent / 2).toFixed(1)}%)</span>
              <span className="text-slate-700 font-extrabold">₹{sgstAmount.toFixed(2)}</span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-slate-500 font-bold text-[11px]">Final Billing Price:</span>
              <span className="text-slate-900 font-black text-sm">₹{finalPriceWithTax.toFixed(2)}</span>
            </div>

            {purchasePrice > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-slate-500 font-bold text-[11px]">Est. Profit:</span>
                <span className={`font-black text-xs ${profitAmount >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  ₹{profitAmount.toFixed(2)}
                </span>
                <span className={`px-2 py-0.5 rounded-full font-extrabold text-[10px] ${profitAmount >= 0 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
                  {profitAmount >= 0 ? '+' : ''}{profitMarginPercent}%
                </span>
              </div>
            )}
          </div>

          {mrpDiscountAmount > 0 && (
            <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium pt-1">
              <span>Customer MRP Discount:</span>
              <span className="font-extrabold text-indigo-600">₹{mrpDiscountAmount.toFixed(2)} OFF</span>
            </div>
          )}

          {formData.hasSecondaryUnit && Number(formData.conversionFactor) > 1 && (
            <div className="p-3 bg-indigo-50/90 border border-indigo-200/90 rounded-2xl space-y-2.5 mt-2">
              <div className="flex items-center justify-between text-indigo-950 font-black text-xs">
                <span className="uppercase text-[10px] text-indigo-700 font-extrabold tracking-wider">
                  Multi-Unit Dual Breakdown ({formData.secondaryUnit || 'Box'} vs {formData.unit || 'Pcs'})
                </span>
                <span className="bg-indigo-600 text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full">
                  1 {formData.secondaryUnit || 'Box'} = {formData.conversionFactor} {formData.unit || 'Pcs'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                {/* Box Level Column */}
                <div className="bg-white p-3 rounded-xl border border-indigo-100/90 space-y-1.5 shadow-2xs">
                  <span className="text-[10px] font-black text-indigo-700 uppercase block">
                    PER BULK UNIT ({formData.secondaryUnit || 'Box'})
                  </span>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-500 font-medium">Bulk Cost:</span>
                    <strong className="text-slate-900 font-mono font-bold">₹{(purchasePrice * Number(formData.conversionFactor)).toFixed(2)}</strong>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-500 font-medium">Bulk Selling:</span>
                    <strong className="text-indigo-600 font-mono font-black">₹{(sellingPrice * Number(formData.conversionFactor)).toFixed(2)}</strong>
                  </div>
                  <div className="flex justify-between text-[11px] border-t border-slate-100 pt-1">
                    <span className="text-slate-500 font-medium">Bulk Est. Profit:</span>
                    <strong className="text-emerald-600 font-mono font-black">₹{(profitAmount * Number(formData.conversionFactor)).toFixed(2)}</strong>
                  </div>
                </div>

                {/* Piece Level Column */}
                <div className="bg-white p-3 rounded-xl border border-indigo-100/90 space-y-1.5 shadow-2xs">
                  <span className="text-[10px] font-black text-indigo-700 uppercase block">
                    PER BASE UNIT ({formData.unit || 'Pcs'})
                  </span>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-500 font-medium">Piece Cost:</span>
                    <strong className="text-slate-900 font-mono font-bold">₹{purchasePrice.toFixed(2)}</strong>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-500 font-medium">Piece Selling:</span>
                    <strong className="text-indigo-600 font-mono font-black">₹{sellingPrice.toFixed(2)}</strong>
                  </div>
                  <div className="flex justify-between text-[11px] border-t border-slate-100 pt-1">
                    <span className="text-slate-500 font-medium">Piece Est. Profit:</span>
                    <strong className="text-emerald-600 font-mono font-black">₹{profitAmount.toFixed(2)}</strong>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Informational Callout */}
      <div className="p-3.5 bg-indigo-50/70 border border-indigo-100 rounded-2xl flex items-center gap-2.5 text-xs text-indigo-900 font-semibold">
        <Info size={16} className="text-indigo-600 shrink-0" />
        <span>Calculated GST and profit margin automatically adjust based on selected Tax Type, GST Rate, and Tax Mode.</span>
      </div>
    </div>
  );
};

export default ProductPricingTaxCard;
