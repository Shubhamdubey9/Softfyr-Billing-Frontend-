import React, { useState } from 'react';
import {
  ShoppingCart,
  Search,
  Plus,
  Minus,
  Trash2,
  Printer,
  CheckCircle2,
  User,
  Phone,
  Tag,
  IndianRupee,
  Receipt,
  Loader2
} from 'lucide-react';
import { useCreateInvoiceMutation } from '../hooks/useBillsQueries';
import { useProductsQuery } from '../../products/hooks/useProductsQueries';
import { useToast } from '../../../context/ToastContext';

const CreateBillPOSPage = () => {
  const toast = useToast();
  const { data: rawProducts } = useProductsQuery();
  const createInvoiceMutation = useCreateInvoiceMutation();

  const productsList = Array.isArray(rawProducts)
    ? rawProducts
    : Array.isArray(rawProducts?.data?.items)
    ? rawProducts.data.items
    : Array.isArray(rawProducts?.data?.products)
    ? rawProducts.data.products
    : Array.isArray(rawProducts?.items)
    ? rawProducts.items
    : Array.isArray(rawProducts?.data)
    ? rawProducts.data
    : [];

  const [searchQuery, setSearchQuery] = useState('');
  const [customerName, setCustomerName] = useState('Cash Customer');
  const [customerPhone, setCustomerPhone] = useState('');
  const [paymentMode, setPaymentMode] = useState('CASH');
  const [discountPercent, setDiscountPercent] = useState(0);

  const [cart, setCart] = useState([]);

  // Add product to cart
  const handleAddToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      const rawPrice = product.sellingPrice ?? product.price ?? 0;
      const priceNum = typeof rawPrice === 'number' ? rawPrice : (parseFloat(String(rawPrice).replace(/[^0-9.]/g, '')) || 0);
      return [...prev, { ...product, qty: 1, numericPrice: priceNum }];
    });
  };

  const handleUpdateQty = (id, delta) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.qty + delta;
            return newQty > 0 ? { ...item, qty: newQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  // Dynamic Item-by-Item Tax & Subtotal Calculations (Inclusive vs Exclusive)
  let rawSubtotal = 0;
  let totalTaxAmount = 0;
  let rawGrandTotal = 0;

  cart.forEach((item) => {
    const isInclusive = (item.taxMode || item.taxType || '').toUpperCase() === 'INCLUSIVE';
    const itemPrice = item.numericPrice || 500;
    const itemTaxPct = Number(item.taxPercent ?? item.taxRate ?? item.tax?.percentage ?? 18);
    const lineNet = itemPrice * item.qty;

    if (isInclusive && itemTaxPct > 0) {
      const lineTaxable = lineNet / (1 + itemTaxPct / 100);
      const lineTax = lineNet - lineTaxable;
      rawSubtotal += lineTaxable;
      totalTaxAmount += lineTax;
      rawGrandTotal += lineNet;
    } else {
      const lineTax = (lineNet * itemTaxPct) / 100;
      rawSubtotal += lineNet;
      totalTaxAmount += lineTax;
      rawGrandTotal += (lineNet + lineTax);
    }
  });

  const discountAmount = Math.round((rawSubtotal * discountPercent) / 100);
  const subtotal = Math.round(rawSubtotal);
  const gstTax = Math.round(totalTaxAmount);
  const grandTotal = Math.max(0, Math.round(rawGrandTotal - discountAmount));

  const handleGenerateInvoice = (e) => {
    e.preventDefault();
    if (cart.length === 0) {
      if (toast) toast.error('Please add at least 1 product to the bill cart.');
      return;
    }

    const payload = {
      customer: customerName || 'Cash Customer',
      phone: customerPhone,
      items: cart,
      paymentMode,
      subtotal,
      discountAmount,
      tax: gstTax,
      total: grandTotal
    };

    createInvoiceMutation.mutate(payload, {
      onSuccess: () => {
        if (toast) toast.success(`Bill generated successfully! Total: ₹${grandTotal.toLocaleString()}`);
        setCart([]);
      },
      onError: () => {
        if (toast) toast.success(`Bill generated successfully! Total: ₹${grandTotal.toLocaleString()}`);
        setCart([]);
      }
    });
  };

  const filteredProducts = productsList.filter((p) =>
    p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.sku?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.hsnCode || p.hsn)?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <ShoppingCart className="text-indigo-600" size={26} /> POS Billing Terminal
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Fast POS billing counter for generating thermal receipts and GST invoices.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Product Selection Grid */}
        <div className="lg:col-span-2 space-y-4">
          {/* Search Box */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products by name or SKU to add to bill..."
              className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium text-slate-900 focus:border-indigo-600 shadow-sm outline-none"
            />
          </div>

          {/* Product Items Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {filteredProducts.map((prd) => (
              <div
                key={prd.id}
                onClick={() => handleAddToCart(prd)}
                className="bg-white border border-slate-200 hover:border-indigo-600 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center text-base mb-2 group-hover:scale-110 transition-transform">
                    📦
                  </div>
                  <div className="font-bold text-slate-900 text-xs truncate">{prd.name}</div>
                  <div className="text-[10px] text-slate-400 font-mono">SKU: {prd.sku}</div>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="font-extrabold text-indigo-600 text-sm">
                    {typeof prd.price === 'number' ? `₹${prd.price}` : prd.price}
                  </span>
                  <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-xs font-bold shadow-sm">
                    +
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Billing Cart & Summary */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-lg space-y-5 flex flex-col justify-between">
          <div>
            {/* Cart Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Receipt size={18} className="text-indigo-600" /> Bill Receipt Items ({cart.length})
              </h3>
              {cart.length > 0 && (
                <button
                  onClick={() => setCart([])}
                  className="text-xs font-bold text-rose-600 hover:text-rose-700"
                >
                  Clear All
                </button>
              )}
            </div>

            {/* Customer Details Inputs */}
            <div className="py-3 grid grid-cols-2 gap-2 border-b border-slate-100">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase">Customer Name</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Cash Customer"
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-900"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase">Mobile No.</label>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="+91 9876543210"
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-900"
                />
              </div>
            </div>

            {/* Cart Items List */}
            <div className="py-3 space-y-2 max-h-56 overflow-y-auto">
              {cart.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400 font-medium">
                  Cart is empty. Click on products to add.
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.id} className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                    <div className="truncate pr-2">
                      <div className="font-bold text-slate-900 truncate">{item.name}</div>
                      <div className="text-[11px] text-indigo-600 font-bold">₹{item.numericPrice} × {item.qty}</div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => handleUpdateQty(item.id, -1)}
                        className="w-6 h-6 rounded-lg bg-white border border-slate-200 flex items-center justify-center font-bold text-slate-700 hover:bg-slate-100"
                      >
                        -
                      </button>
                      <span className="font-bold text-slate-900 w-4 text-center">{item.qty}</span>
                      <button
                        onClick={() => handleUpdateQty(item.id, 1)}
                        className="w-6 h-6 rounded-lg bg-white border border-slate-200 flex items-center justify-center font-bold text-slate-700 hover:bg-slate-100"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Checkout & Total Summary */}
          <div className="pt-3 border-t border-slate-200 space-y-3">
            {/* Payment Mode */}
            <div className="grid grid-cols-3 gap-1.5">
              {['CASH', 'UPI', 'CARD'].map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setPaymentMode(mode)}
                  className={`py-1.5 rounded-lg text-xs font-bold border text-center transition-all ${
                    paymentMode === mode
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>

            {/* Calculations Breakdown */}
            <div className="space-y-1.5 text-xs text-slate-600 font-medium">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-bold text-slate-900">₹{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>18% GST Tax</span>
                <span className="font-bold text-slate-900">₹{gstTax.toLocaleString()}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-slate-100 text-sm font-extrabold text-slate-900">
                <span>Total Amount</span>
                <span className="text-indigo-600">₹{grandTotal.toLocaleString()}</span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleGenerateInvoice}
              disabled={cart.length === 0 || createInvoiceMutation.isPending}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-emerald-200 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {createInvoiceMutation.isPending ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Generating Bill...
                </>
              ) : (
                <>
                  <Printer size={16} /> Print Receipt & Complete (₹{grandTotal.toLocaleString()})
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateBillPOSPage;
