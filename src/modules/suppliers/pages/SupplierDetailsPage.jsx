import React, { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  ChevronRight,
  Edit,
  CreditCard,
  MoreVertical,
  Wallet,
  ShoppingCart,
  FileText,
  Clock,
  Phone,
  Mail,
  ExternalLink,
  Loader2,
  AlertCircle,
  Plus,
  Trash2,
  ArrowLeft,
} from 'lucide-react';

import {
  useSupplierQuery,
  useSuppliersQuery,
  useUpdateSupplierMutation,
  useDeleteSupplierMutation,
} from '../hooks/useSuppliersQueries';
import { usePurchaseBillsQuery } from '../../purchases/hooks/usePurchaseQueries';
import { useToast } from '../../../context/ToastContext';
import StatusBadge from '../../../components/common/StatusBadge';
import SupplierModal from '../components/SupplierModal';
import RecordPaymentModal from '../components/RecordPaymentModal';
import BaseModal from '../../../components/common/BaseModal';

const SupplierDetailsPage = () => {
  const navigate = useNavigate();
  const { supplierId, id } = useParams();
  const toast = useToast();

  const currentSupplierId = supplierId || id;

  // Active Tab state
  const [activeTab, setActiveTab] = useState('Overview');

  // Modals state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  // Queries & Mutations
  const {
    data: responseData,
    isLoading,
    isError,
    refetch,
  } = useSupplierQuery(currentSupplierId);

  const { data: suppliersListRes } = useSuppliersQuery({ limit: 100 });

  const { data: purchaseBillsRes } = usePurchaseBillsQuery({
    supplierId: currentSupplierId,
    limit: 50,
  });

  const updateSupplierMutation = useUpdateSupplierMutation();
  const deleteSupplierMutation = useDeleteSupplierMutation();

  // 1. Live Purchases and Payments from Backend
  const livePurchases = Array.isArray(purchaseBillsRes?.purchases)
    ? purchaseBillsRes.purchases
    : Array.isArray(purchaseBillsRes?.data?.purchases)
      ? purchaseBillsRes.data.purchases
      : Array.isArray(purchaseBillsRes?.data)
        ? purchaseBillsRes.data
        : [];

  const purchaseHistory = livePurchases;

  // 2. All Suppliers list fallback lookup
  const allSuppliers = Array.isArray(suppliersListRes?.suppliers)
    ? suppliersListRes.suppliers
    : Array.isArray(suppliersListRes?.data?.suppliers)
      ? suppliersListRes.data.suppliers
      : Array.isArray(suppliersListRes?.data)
        ? suppliersListRes.data
        : [];

  const supplierFromList = allSuppliers.find((s) => String(s.id) === String(currentSupplierId)) || {};
  const supplierFromBill = (
    livePurchases.find((b) => b.supplier && (String(b.supplier.id) === String(currentSupplierId) || String(b.supplierId) === String(currentSupplierId)))?.supplier || {}
  );

  // 3. Robust Supplier Extraction across all possible Backend Response Formats
  let rawSupplier = {};
  if (responseData) {
    if (responseData.supplier && typeof responseData.supplier === 'object') {
      rawSupplier = responseData.supplier;
    } else if (responseData.data?.supplier && typeof responseData.data?.supplier === 'object') {
      rawSupplier = responseData.data.supplier;
    } else if (responseData.data && typeof responseData.data === 'object' && (responseData.data.name || responseData.data.id || responseData.data.companyName)) {
      rawSupplier = responseData.data;
    } else if (responseData.name || responseData.id || responseData.companyName) {
      rawSupplier = responseData;
    } else if (responseData.data && typeof responseData.data === 'object') {
      rawSupplier = responseData.data;
    } else {
      rawSupplier = responseData;
    }
  }

  // Waterfall merge: rawSupplier > supplierFromList > supplierFromBill
  const targetSupplier = {
    ...supplierFromBill,
    ...supplierFromList,
    ...rawSupplier,
  };

  const sName = targetSupplier.name || targetSupplier.companyName || supplierFromList.name || supplierFromList.companyName || supplierFromBill.name || supplierFromBill.companyName || 'Supplier';

  const sMobile = targetSupplier.mobileNumber || targetSupplier.mobile || targetSupplier.phone || targetSupplier.contactNumber || supplierFromList.mobileNumber || supplierFromList.mobile || supplierFromList.phone || supplierFromBill.mobileNumber || supplierFromBill.mobile || supplierFromBill.phone || '-';

  const sEmail = targetSupplier.email || supplierFromList.email || supplierFromBill.email || '-';

  const sGstin = targetSupplier.gstin || targetSupplier.gstNumber || targetSupplier.gst || supplierFromList.gstin || supplierFromList.gstNumber || supplierFromBill.gstin || supplierFromBill.gstNumber || '-';

  const sPan = targetSupplier.pan || supplierFromList.pan || supplierFromBill.pan || '-';

  const rawAddress = targetSupplier.address || targetSupplier.street || supplierFromList.address || supplierFromBill.address || '';
  const city = targetSupplier.city || supplierFromList.city || supplierFromBill.city || '';
  const state = targetSupplier.state || supplierFromList.state || supplierFromBill.state || '';
  const pincode = targetSupplier.pincode || supplierFromList.pincode || supplierFromBill.pincode || '';

  let fullAddress = rawAddress;
  if (fullAddress) {
    if (city && !fullAddress.toLowerCase().includes(city.toLowerCase())) fullAddress += `, ${city}`;
    if (state && !fullAddress.toLowerCase().includes(state.toLowerCase())) fullAddress += `, ${state}`;
    if (pincode && !fullAddress.includes(pincode)) fullAddress += ` - ${pincode}`;
  } else {
    fullAddress = [city, state, pincode].filter(Boolean).join(', ');
  }

  const supplier = {
    id: targetSupplier.id || currentSupplierId,
    name: sName,
    companyName: targetSupplier.companyName || sName,
    mobile: sMobile,
    mobileNumber: sMobile,
    email: sEmail,
    gstin: sGstin,
    pan: sPan,
    address: fullAddress || '-',
    city: city || '-',
    state: state || '-',
    joiningDate: (targetSupplier.createdAt || supplierFromList.createdAt) ? new Date(targetSupplier.createdAt || supplierFromList.createdAt).toLocaleDateString('en-IN') : '-',
    supplierType: targetSupplier.supplierType || targetSupplier.type || supplierFromList.supplierType || 'Regular',
    creditLimit: Number(targetSupplier.creditLimit || supplierFromList.creditLimit || 0),
    paymentTerms: targetSupplier.paymentTerms || targetSupplier.terms || supplierFromList.paymentTerms || '-',
    status: targetSupplier.status || supplierFromList.status || 'ACTIVE',
  };

  const livePayments = Array.isArray(targetSupplier?.supplierPayments)
    ? targetSupplier.supplierPayments
    : Array.isArray(targetSupplier?.payments)
      ? targetSupplier.payments
      : Array.isArray(rawSupplier?.supplierPayments)
        ? rawSupplier.supplierPayments
        : Array.isArray(rawSupplier?.payments)
          ? rawSupplier.payments
          : [];

  const paymentHistory = livePayments;

  // Formatters
  const formatCurrency = (amount = 0) => {
    return `₹${Number(amount || 0).toLocaleString('en-IN')}.00`;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const getInitials = (name = '') => {
    if (!name || name === 'Supplier') return 'SUP';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  const handleDeleteSupplier = async () => {
    try {
      await deleteSupplierMutation.mutateAsync(currentSupplierId);
      toast.success('Supplier deleted successfully');
      navigate('/vendor/suppliers');
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to delete supplier');
    }
  };

  // Real Dynamic Metrics calculated from DB Response & Purchase History
  const realTotalPurchases = purchaseHistory.reduce((acc, p) => acc + (Number(p.totalAmount || p.grandTotal || p.amount) || 0), 0);
  const realTotalPaid = purchaseHistory.reduce((acc, p) => acc + (Number(p.paidAmount) || 0), 0) + paymentHistory.reduce((acc, pay) => acc + (Number(pay.amount) || 0), 0);

  const totalPurchasesAmount = Number(rawSupplier?.totalPurchases ?? rawSupplier?.totalPurchaseAmount ?? realTotalPurchases);
  const totalPaidAmount = Number(rawSupplier?.paidAmount ?? rawSupplier?.totalPaidAmount ?? realTotalPaid);
  const totalPayableAmount = Number(rawSupplier?.outstandingBalance ?? rawSupplier?.dueAmount ?? rawSupplier?.balance ?? (totalPurchasesAmount - totalPaidAmount));

  const totalBillsCount = purchaseHistory.length;
  const totalItemsCount = purchaseHistory.reduce((acc, p) => acc + (Array.isArray(p.items) ? p.items.length : (p.itemsCount || 1)), 0);
  const avgBillValue = totalBillsCount > 0 ? totalPurchasesAmount / totalBillsCount : 0;
  const totalPaymentsCount = paymentHistory.length;

  const lastPurchaseBill = purchaseHistory.length > 0 ? purchaseHistory[0] : null;
  const lastPurchaseDate = lastPurchaseBill
    ? formatDate(lastPurchaseBill.purchaseDate || lastPurchaseBill.createdAt)
    : '-';

  const lastPayment = paymentHistory.length > 0 ? paymentHistory[0] : null;
  const lastPaymentDate = lastPayment
    ? formatDate(lastPayment.paymentDate || lastPayment.createdAt)
    : '-';

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        <p className="text-xs font-bold text-slate-500">Loading supplier details...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3 text-center">
        <AlertCircle className="w-10 h-10 text-rose-500" />
        <h3 className="text-base font-extrabold text-slate-900">Failed to load supplier details</h3>
        <button
          type="button"
          onClick={() => refetch()}
          className="px-4 py-2 bg-indigo-600 text-white font-extrabold text-xs rounded-xl"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="w-full min-w-0 max-w-full overflow-x-hidden space-y-5 pb-16 animate-fadeIn">
      {/* 1. TOP BREADCRUMB HEADER */}
      <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
        <Link to="/vendor/dashboard" className="hover:text-indigo-600 transition-colors">
          Dashboard
        </Link>
        <ChevronRight size={14} className="text-slate-400" />
        <Link to="/vendor/suppliers" className="hover:text-indigo-600 transition-colors">
          Suppliers
        </Link>
        <ChevronRight size={14} className="text-slate-400" />
        <span className="text-slate-900 font-extrabold">{supplier.name}</span>
      </div>

      {/* 2. MAIN SUPPLIER CARD */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-sm space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Left: Avatar & Supplier Info */}
          <div className="flex items-start sm:items-center gap-4 min-w-0">
            <div className="w-16 h-16 rounded-full bg-indigo-100 text-indigo-700 font-black text-xl flex items-center justify-center shrink-0 shadow-inner">
              {getInitials(supplier.name)}
            </div>

            <div className="space-y-1.5 min-w-0">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  {supplier.name}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-50 text-emerald-600 border border-emerald-200 uppercase">
                  {supplier.status}
                </span>
              </div>

              <p className="text-xs font-semibold text-slate-500">
                {[supplier.city, supplier.state].filter((c) => c && c !== '-').join(', ') || supplier.address}
              </p>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-bold text-slate-600 pt-0.5">
                <span className="flex items-center gap-1.5">
                  <Phone size={13} className="text-slate-400" />
                  <span>{supplier.mobile}</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <Mail size={13} className="text-slate-400" />
                  <span>{supplier.email}</span>
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="px-2.5 py-1 rounded-lg text-[11px] font-mono font-extrabold bg-indigo-50/80 text-indigo-700">
                  GSTIN: {supplier.gstin}
                </span>
                <span className="px-2.5 py-1 rounded-lg text-[11px] font-mono font-extrabold bg-slate-100 text-slate-700">
                  PAN: {supplier.pan}
                </span>
              </div>
            </div>
          </div>

          {/* Right: Actions & Metadata Info Grid */}
          <div className="flex flex-col items-start lg:items-end gap-5 shrink-0">
            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => setEditModalOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-extrabold text-xs rounded-xl transition-all cursor-pointer shadow-xs"
              >
                <Edit size={15} />
                <span>Edit</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentModalOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
              >
                <CreditCard size={15} />
                <span>Record Payment</span>
              </button>

              <button
                type="button"
                onClick={() => setDeleteModalOpen(true)}
                className="p-2 bg-white hover:bg-rose-50 text-slate-500 hover:text-rose-600 border border-slate-300 rounded-xl transition-all cursor-pointer"
                title="Delete Supplier"
              >
                <MoreVertical size={16} />
              </button>
            </div>

            {/* Metadata Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-semibold text-slate-500 bg-slate-50/80 p-3 rounded-2xl border border-slate-100">
              <div>
                <div className="text-[10px] uppercase font-black tracking-wider text-slate-400">Supplier Type</div>
                <div className="text-slate-900 font-extrabold mt-0.5">{supplier.supplierType}</div>
              </div>
              <div>
                <div className="text-[10px] uppercase font-black tracking-wider text-slate-400">Joining Date</div>
                <div className="text-slate-900 font-extrabold mt-0.5">{supplier.joiningDate}</div>
              </div>
              <div>
                <div className="text-[10px] uppercase font-black tracking-wider text-slate-400">Credit Limit</div>
                <div className="text-slate-900 font-black mt-0.5">{supplier.creditLimit > 0 ? formatCurrency(supplier.creditLimit) : '-'}</div>
              </div>
              <div>
                <div className="text-[10px] uppercase font-black tracking-wider text-slate-400">Payment Terms</div>
                <div className="text-slate-900 font-extrabold mt-0.5">{supplier.paymentTerms}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. 4 TOP KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Purchases */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Wallet size={22} />
          </div>
          <div>
            <div className="text-xs font-extrabold text-slate-500">Total Purchases</div>
            <div className="text-xl font-black text-slate-900 mt-0.5">{formatCurrency(totalPurchasesAmount)}</div>
            <div className="text-[11px] font-bold text-slate-400">Lifetime</div>
          </div>
        </div>

        {/* Total Paid */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <ShoppingCart size={22} />
          </div>
          <div>
            <div className="text-xs font-extrabold text-slate-500">Total Paid</div>
            <div className="text-xl font-black text-emerald-600 mt-0.5">{formatCurrency(totalPaidAmount)}</div>
            <div className="text-[11px] font-bold text-emerald-600">Lifetime</div>
          </div>
        </div>

        {/* Total Payable */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <FileText size={22} />
          </div>
          <div>
            <div className="text-xs font-extrabold text-slate-500">Total Payable</div>
            <div className="text-xl font-black text-rose-600 mt-0.5">{formatCurrency(totalPayableAmount)}</div>
            <div className="text-[11px] font-bold text-rose-500">Outstanding Amount</div>
          </div>
        </div>

        {/* Last Purchase */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
            <ShoppingCart size={22} />
          </div>
          <div>
            <div className="text-xs font-extrabold text-slate-500">Last Purchase</div>
            <div className="text-lg font-black text-slate-900 mt-0.5">{lastPurchaseDate}</div>
            <div className="text-[11px] font-bold text-sky-600">{lastPurchaseBill ? (lastPurchaseBill.purchaseNumber || 'Recent') : 'No purchases'}</div>
          </div>
        </div>
      </div>

      {/* 4. TABS NAVIGATION */}
      <div className="border-b border-slate-200 flex items-center gap-6 text-xs font-extrabold">
        {['Overview', 'Purchase History', 'Payment History', 'Ledger', 'Documents'].map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`py-3 relative cursor-pointer transition-colors ${activeTab === tab ? 'text-indigo-600 font-black' : 'text-slate-500 hover:text-slate-900'
              }`}
          >
            <div className="flex items-center gap-1.5">
              {tab === 'Overview' && <FileText size={14} />}
              {tab === 'Purchase History' && <ShoppingCart size={14} />}
              {tab === 'Payment History' && <CreditCard size={14} />}
              {tab === 'Ledger' && <Wallet size={14} />}
              {tab === 'Documents' && <FileText size={14} />}
              <span>{tab}</span>
            </div>
            {activeTab === tab && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* 5. TAB CONTENT: OVERVIEW GRID (2 COLUMNS) */}
      {activeTab === 'Overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* LEFT COLUMN: PURCHASE SUMMARY & RECENT PURCHASES */}
          <div className="space-y-6">
            {/* Purchase Summary Box */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm space-y-4">
              <div className="flex items-center gap-2 font-black text-slate-900 text-sm">
                <ShoppingCart size={17} className="text-indigo-600" />
                <span>Purchase Summary</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50/70 rounded-2xl border border-slate-100 text-xs">
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400">Total Bills</div>
                  <div className="text-lg font-black text-slate-900 mt-0.5">{totalBillsCount}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400">Total Items</div>
                  <div className="text-lg font-black text-indigo-600 mt-0.5">{totalItemsCount}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400">Avg. Bill Value</div>
                  <div className="text-lg font-black text-amber-600 mt-0.5">{formatCurrency(avgBillValue)}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400">Last Purchase</div>
                  <div className="text-sm font-black text-sky-600 mt-1">{lastPurchaseDate}</div>
                </div>
              </div>
            </div>

            {/* Recent Purchase History Table */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-black text-slate-900 text-sm">Recent Purchase History</h3>
                <button
                  type="button"
                  onClick={() => navigate(`/vendor/purchases?supplierId=${currentSupplierId}`)}
                  className="px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg text-xs font-extrabold transition-all cursor-pointer"
                >
                  View All
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 font-black text-slate-400 uppercase text-[10px]">
                      <th className="py-2.5 px-2 w-8 text-center">#</th>
                      <th className="py-2.5 px-2">Bill No.</th>
                      <th className="py-2.5 px-2">Bill Date</th>
                      <th className="py-2.5 px-2 text-center">Items</th>
                      <th className="py-2.5 px-2 text-right">Total Amount</th>
                      <th className="py-2.5 px-2 text-right">Paid</th>
                      <th className="py-2.5 px-2 text-right">Due</th>
                      <th className="py-2.5 px-2 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-semibold">
                    {purchaseHistory.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-6 text-center text-slate-400 font-bold">
                          No purchase bills recorded for this supplier yet.
                        </td>
                      </tr>
                    ) : (
                      purchaseHistory.slice(0, 5).map((row, idx) => (
                        <tr key={row.id || idx} className="hover:bg-slate-50/70">
                          <td className="py-3 px-2 text-center font-bold text-slate-400">{idx + 1}</td>
                          <td className="py-3 px-2 font-mono font-extrabold text-indigo-600">
                            <Link to={`/vendor/purchases/${row.id}`} className="hover:underline">
                              {row.purchaseNumber || row.billNo || (row.id ? `PUR-${row.id}` : '-')}
                            </Link>
                          </td>
                          <td className="py-3 px-2 text-slate-600">{formatDate(row.purchaseDate || row.createdAt)}</td>
                          <td className="py-3 px-2 text-center text-slate-700">{Array.isArray(row.items) ? row.items.length : (row.itemsCount || 1)}</td>
                          <td className="py-3 px-2 text-right font-black text-slate-900">₹{(row.totalAmount || row.grandTotal || 0).toLocaleString('en-IN')}.00</td>
                          <td className="py-3 px-2 text-right font-bold text-emerald-600">₹{(row.paidAmount || 0).toLocaleString('en-IN')}.00</td>
                          <td className="py-3 px-2 text-right font-bold text-rose-600">₹{(row.dueAmount || 0).toLocaleString('en-IN')}.00</td>
                          <td className="py-3 px-2 text-center">
                            <StatusBadge status={row.paymentStatus || 'PAID'} />
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => navigate(`/vendor/purchases?supplierId=${currentSupplierId}`)}
                  className="px-5 py-2 border border-indigo-200 hover:bg-indigo-50 text-indigo-600 font-extrabold text-xs rounded-xl transition-all cursor-pointer"
                >
                  View All Purchases
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: PAYMENT SUMMARY & RECENT PAYMENTS */}
          <div className="space-y-6">
            {/* Payment Summary Box */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm space-y-4">
              <div className="flex items-center gap-2 font-black text-slate-900 text-sm">
                <CreditCard size={17} className="text-indigo-600" />
                <span>Payment Summary</span>
              </div>

              <div className="grid grid-cols-3 gap-4 p-4 bg-slate-50/70 rounded-2xl border border-slate-100 text-xs">
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400">Total Paid</div>
                  <div className="text-lg font-black text-emerald-600 mt-0.5">{formatCurrency(totalPaidAmount)}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400">Total Payments</div>
                  <div className="text-lg font-black text-sky-600 mt-0.5">{totalPaymentsCount}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400">Last Payment</div>
                  <div className="text-sm font-black text-sky-600 mt-1">{lastPaymentDate}</div>
                </div>
              </div>

              {/* Current Balance Pink Highlight Banner */}
              <div className="p-3.5 bg-rose-50/70 border border-rose-100 rounded-2xl flex items-center justify-between">
                <span className="text-xs font-bold text-rose-900">Current Balance (Payable)</span>
                <span className="text-lg font-black text-rose-600">{formatCurrency(totalPayableAmount)}</span>
              </div>
            </div>

            {/* Recent Payment History Table */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-black text-slate-900 text-sm">Recent Payment History</h3>
                <button
                  type="button"
                  onClick={() => navigate('/vendor/purchases')}
                  className="px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg text-xs font-extrabold transition-all cursor-pointer"
                >
                  View All
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 font-black text-slate-400 uppercase text-[10px]">
                      <th className="py-2.5 px-2 w-8 text-center">#</th>
                      <th className="py-2.5 px-2">Payment No.</th>
                      <th className="py-2.5 px-2">Payment Date</th>
                      <th className="py-2.5 px-2 text-right">Amount</th>
                      <th className="py-2.5 px-2">Payment Method</th>
                      <th className="py-2.5 px-2">Reference</th>
                      <th className="py-2.5 px-2">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-semibold">
                    {paymentHistory.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-6 text-center text-slate-400 font-bold">
                          No payments recorded for this supplier yet.
                        </td>
                      </tr>
                    ) : (
                      paymentHistory.slice(0, 5).map((row, idx) => (
                        <tr key={row.id || idx} className="hover:bg-slate-50/70">
                          <td className="py-3 px-2 text-center font-bold text-slate-400">{idx + 1}</td>
                          <td className="py-3 px-2 font-mono font-extrabold text-indigo-600">
                            {row.referenceNumber || row.refNo || (row.id ? `PAY-${row.id}` : '-')}
                          </td>
                          <td className="py-3 px-2 text-slate-600">{formatDate(row.paymentDate || row.createdAt)}</td>
                          <td className="py-3 px-2 text-right font-black text-emerald-600">₹{(row.amount || 0).toLocaleString('en-IN')}.00</td>
                          <td className="py-3 px-2 text-slate-700">{row.paymentMethod || 'Bank Transfer'}</td>
                          <td className="py-3 px-2 font-mono text-slate-600">{row.reference || '-'}</td>
                          <td className="py-3 px-2 text-slate-400">{row.notes || '-'}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => navigate('/vendor/purchases')}
                  className="px-5 py-2 border border-indigo-200 hover:bg-indigo-50 text-indigo-600 font-extrabold text-xs rounded-xl transition-all cursor-pointer"
                >
                  View All Payments
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. MODALS */}
      <SupplierModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        supplierToEdit={supplier}
        onSaveSupplier={async (payload, id) => {
          try {
            const targetId = id || currentSupplierId;
            await updateSupplierMutation.mutateAsync({ id: targetId, data: payload });
            toast.success(`Supplier "${payload.name}" updated successfully!`);
            refetch();
            setEditModalOpen(false);
          } catch (err) {
            toast.error(err?.response?.data?.message || err?.message || 'Failed to update supplier.');
          }
        }}
      />

      <RecordPaymentModal
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        supplier={supplier}
        onSuccess={() => refetch()}
      />

      <BaseModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Supplier"
      >
        <div className="space-y-4">
          <p className="text-xs font-bold text-slate-600">
            Are you sure you want to delete supplier <strong className="text-slate-900">{supplier?.name}</strong>?
            This action cannot be undone.
          </p>

          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={() => setDeleteModalOpen(false)}
              className="px-4 py-2 border border-slate-200 text-slate-700 font-extrabold text-xs rounded-xl"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDeleteSupplier}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs rounded-xl shadow-md"
            >
              Delete
            </button>
          </div>
        </div>
      </BaseModal>
    </div>
  );
};

export default SupplierDetailsPage;