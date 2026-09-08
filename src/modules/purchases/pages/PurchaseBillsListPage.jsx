import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  FileText,
  Plus,
  Upload,
  Download,
  Eye,
  Printer,
  Loader2,
  ChevronRight,
} from 'lucide-react';
import { usePurchaseBillsQuery } from '../hooks/usePurchaseQueries';
import { useSuppliersQuery } from '../../suppliers/hooks/useSuppliersQueries';
import purchaseService from '../../../services/purchaseService';
import { useToast } from '../../../context/ToastContext';
import Pagination from '../../../components/common/Pagination';

// Sub-components
import PurchaseSummaryKpiCards from '../components/PurchaseSummaryKpiCards';
import PurchaseBillsFilterBar from '../components/PurchaseBillsFilterBar';
import PrintableBillModal from '../components/PrintableBillModal';
import { downloadPurchaseBillPdf, printPurchaseBillPdf } from '../utils/purchaseBillPrintUtil';

const PurchaseBillsListPage = () => {
  const navigate = useNavigate();
  const toast = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('ALL');
  const [supplierFilter, setSupplierFilter] = useState('ALL');
  const [activeTab, setActiveTab] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedPrintBill, setSelectedPrintBill] = useState(null);

  // Fetch Suppliers for dropdown
  const { data: supplierRes } = useSuppliersQuery({ limit: 100 });
  const suppliers = Array.isArray(supplierRes?.suppliers)
    ? supplierRes.suppliers
    : Array.isArray(supplierRes?.data?.suppliers)
    ? supplierRes.data.suppliers
    : Array.isArray(supplierRes?.data)
    ? supplierRes.data
    : [];

  // Fetch Purchase Bills
  const { data: responseData, isLoading, isError, refetch } = usePurchaseBillsQuery({
    search: searchQuery,
    status: statusFilter !== 'ALL' ? statusFilter : undefined,
    paymentStatus: paymentStatusFilter !== 'ALL' ? paymentStatusFilter : (activeTab !== 'ALL' ? activeTab : undefined),
    supplierId: supplierFilter !== 'ALL' ? supplierFilter : undefined,
    page: currentPage,
    limit: pageSize,
  });

  const rawBills = Array.isArray(responseData?.purchases)
    ? responseData.purchases
    : Array.isArray(responseData?.data?.purchases)
    ? responseData.data.purchases
    : Array.isArray(responseData?.bills)
    ? responseData.bills
    : Array.isArray(responseData?.data)
    ? responseData.data
    : [];

  const allBills = rawBills;

  const filteredBills = allBills.filter((bill) => {
    const billNo = (bill.purchaseNumber || bill.supplierInvoiceNumber || bill.purchaseOrderNumber || '').toLowerCase();
    const supName = (bill.supplier?.name || bill.supplierName || bill.supplier?.companyName || '').toLowerCase();
    const query = searchQuery.trim().toLowerCase();

    if (query && !billNo.includes(query) && !supName.includes(query)) return false;
    if (statusFilter !== 'ALL' && String(bill.status || bill.purchaseStatus).toUpperCase() !== statusFilter) return false;
    if (paymentStatusFilter !== 'ALL' && String(bill.paymentStatus).toUpperCase() !== paymentStatusFilter) return false;
    if (supplierFilter !== 'ALL' && bill.supplier?.id !== supplierFilter && bill.supplierId !== supplierFilter) return false;

    if (activeTab !== 'ALL') {
      const isOverdue = Boolean(
        bill.isOverdue ||
        (bill.dueDate && new Date(bill.dueDate) < new Date() && String(bill.paymentStatus).toUpperCase() !== 'PAID')
      );
      if (activeTab === 'OVERDUE' && !isOverdue) return false;
      if (activeTab === 'PARTIAL' && !['PARTIAL', 'PARTIALLY_PAID'].includes(String(bill.paymentStatus).toUpperCase())) return false;
      if (activeTab !== 'OVERDUE' && activeTab !== 'PARTIAL' && String(bill.paymentStatus).toUpperCase() !== activeTab && String(bill.status || bill.purchaseStatus).toUpperCase() !== activeTab) {
        return false;
      }
    }

    return true;
  });

  const pagination = responseData?.pagination || responseData?.data?.pagination || {
    total: filteredBills.length,
    page: currentPage,
    limit: pageSize,
    totalPages: Math.ceil(filteredBills.length / pageSize) || 1,
  };

  const summary = responseData?.summary || responseData?.data?.summary || {};

  // Metrics with safe type casting & backend property fallback options
  const totalBills = Number(summary.totalBills ?? summary.totalCount ?? summary.count ?? pagination.total ?? allBills.length) || 0;

  const totalAmount = Number(
    summary.totalAmount ??
    summary.totalPurchaseAmount ??
    summary.totalSum ??
    allBills.reduce((acc, b) => acc + (Number(b.totalAmount) || 0), 0)
  ) || 0;

  const paidAmount = Number(
    summary.totalPaid ??
    summary.totalPaidAmount ??
    summary.paidAmount ??
    allBills.reduce((acc, b) => acc + (Number(b.paidAmount) || 0), 0)
  ) || 0;

  const dueAmount = Number(
    summary.totalDue ??
    summary.totalDueAmount ??
    summary.dueAmount ??
    summary.totalOutstanding ??
    allBills.reduce((acc, b) => {
      const bTotal = Number(b.totalAmount) || 0;
      const bPaid = Number(b.paidAmount) || 0;
      const bDue = b.dueAmount !== undefined && b.dueAmount !== null ? Number(b.dueAmount) : Math.max(0, bTotal - bPaid);
      return acc + bDue;
    }, 0)
  ) || 0;

  const overdueAmount = Number(
    summary.overdueAmount ??
    summary.totalOverdue ??
    summary.overdue ??
    allBills
      .filter((b) => Boolean(b.isOverdue || (b.dueDate && new Date(b.dueDate) < new Date() && String(b.paymentStatus).toUpperCase() !== 'PAID')))
      .reduce((acc, b) => {
        const bTotal = Number(b.totalAmount) || 0;
        const bPaid = Number(b.paidAmount) || 0;
        const bDue = b.dueAmount !== undefined && b.dueAmount !== null ? Number(b.dueAmount) : Math.max(0, bTotal - bPaid);
        return acc + bDue;
      }, 0)
  ) || 0;

  const handleExport = async (format = 'csv') => {
    try {
      toast.info(`Exporting Purchase Bills (${format.toUpperCase()})...`);
      await purchaseService.exportPurchaseBills({
        search: searchQuery,
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
        paymentStatus: paymentStatusFilter !== 'ALL' ? paymentStatusFilter : undefined,
        supplierId: supplierFilter !== 'ALL' ? supplierFilter : undefined,
        format,
      });
      toast.success('Purchase bills exported successfully!');
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to export purchase bills.');
    }
  };

  const getPaymentBadge = (status = 'UNPAID') => {
    const s = String(status).toUpperCase();
    if (s === 'PAID') return <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 font-extrabold text-[11px] rounded-full border border-emerald-200">Paid</span>;
    if (s === 'PARTIAL' || s === 'PARTIALLY_PAID') return <span className="px-2.5 py-1 bg-amber-50 text-amber-700 font-extrabold text-[11px] rounded-full border border-amber-200">Partial</span>;
    return <span className="px-2.5 py-1 bg-rose-50 text-rose-700 font-extrabold text-[11px] rounded-full border border-rose-200">Unpaid</span>;
  };

  const getBillBadge = (status = 'COMPLETED') => {
    const s = String(status).toUpperCase();
    if (s === 'COMPLETED' || s === 'CONFIRMED') return <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 font-extrabold text-[11px] rounded-full border border-emerald-200">Completed</span>;
    if (s === 'DRAFT') return <span className="px-2.5 py-1 bg-slate-100 text-slate-700 font-extrabold text-[11px] rounded-full border border-slate-200">Draft</span>;
    if (s === 'CANCELLED') return <span className="px-2.5 py-1 bg-slate-100 text-slate-500 font-extrabold text-[11px] rounded-full border border-slate-200">Cancelled</span>;
    return <span className="px-2.5 py-1 bg-amber-50 text-amber-700 font-extrabold text-[11px] rounded-full border border-amber-200">Pending</span>;
  };

  return (
    <div className="w-full min-w-0 max-w-full overflow-x-hidden space-y-5 sm:space-y-6 pb-12 animate-fadeIn">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
        <Link to="/vendor/dashboard" className="hover:text-indigo-600 transition-colors">
          Dashboard
        </Link>
        <ChevronRight size={14} className="text-slate-400" />
        <span>Purchase</span>
        <ChevronRight size={14} className="text-slate-400" />
        <span className="text-slate-900 font-extrabold">Purchase Bills</span>
      </div>

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Purchase Bills</h1>
          <p className="text-xs sm:text-sm font-semibold text-slate-500 mt-0.5">
            Manage vendor purchase invoices, inventory receipts, and dues.
          </p>
        </div>

        {/* Top Header Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => navigate('/vendor/purchases/create')}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-lg shadow-indigo-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
          >
            <Plus size={18} />
            <span>Create Purchase Bill</span>
          </button>

          <button
            onClick={() => toast.info('Import functionality ready.')}
            className="flex items-center gap-2 px-3.5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-bold text-xs sm:text-sm rounded-xl transition-all cursor-pointer"
          >
            <Upload size={16} className="text-slate-500" />
            <span>Import</span>
          </button>

          <button
            onClick={() => handleExport('csv')}
            className="flex items-center gap-2 px-3.5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-bold text-xs sm:text-sm rounded-xl transition-all cursor-pointer"
          >
            <Download size={16} className="text-slate-500" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* 5 KPI Summary Cards Sub-Component */}
      <PurchaseSummaryKpiCards
        totalBills={totalBills}
        totalAmount={totalAmount}
        paidAmount={paidAmount}
        dueAmount={dueAmount}
        overdueAmount={overdueAmount}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          setCurrentPage(1);
        }}
      />

      {/* Filter & Search Bar Sub-Component */}
      <PurchaseBillsFilterBar
        searchQuery={searchQuery}
        onSearchChange={(q) => {
          setSearchQuery(q);
          setCurrentPage(1);
        }}
        statusFilter={statusFilter}
        onStatusFilterChange={(s) => {
          setStatusFilter(s);
          setCurrentPage(1);
        }}
        paymentStatusFilter={paymentStatusFilter}
        onPaymentStatusFilterChange={(ps) => {
          setPaymentStatusFilter(ps);
          setCurrentPage(1);
        }}
        supplierFilter={supplierFilter}
        onSupplierFilterChange={(sup) => {
          setSupplierFilter(sup);
          setCurrentPage(1);
        }}
        suppliers={suppliers}
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          setCurrentPage(1);
        }}
        onResetFilters={() => {
          setSearchQuery('');
          setStatusFilter('ALL');
          setPaymentStatusFilter('ALL');
          setSupplierFilter('ALL');
          setActiveTab('ALL');
          setCurrentPage(1);
          toast.info('Filters reset.');
        }}
        totalBillsCount={totalBills}
        paidCount={allBills.filter(b => String(b.paymentStatus).toUpperCase() === 'PAID').length}
        partialCount={allBills.filter(b => ['PARTIAL', 'PARTIALLY_PAID'].includes(String(b.paymentStatus).toUpperCase())).length}
        unpaidCount={allBills.filter(b => ['UNPAID', 'PENDING'].includes(String(b.paymentStatus).toUpperCase())).length}
        overdueCount={allBills.filter(b => Boolean(b.isOverdue || (b.dueDate && new Date(b.dueDate) < new Date() && String(b.paymentStatus).toUpperCase() !== 'PAID'))).length}
        cancelledCount={allBills.filter(b => ['CANCELLED', 'CANCELED'].includes(String(b.status || b.purchaseStatus).toUpperCase())).length}
      />

      {/* Main Data Table Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[950px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-black text-slate-500 uppercase tracking-wider">
                <th className="py-4 px-4 w-10 text-center">
                  <input type="checkbox" className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                </th>
                <th className="py-4 px-4">Bill No.</th>
                <th className="py-4 px-4">Supplier</th>
                <th className="py-4 px-4">Bill Date</th>
                <th className="py-4 px-4">Due Date</th>
                <th className="py-4 px-4 text-center">Items</th>
                <th className="py-4 px-4">Total Amount</th>
                <th className="py-4 px-4">Paid Amount</th>
                <th className="py-4 px-4">Due Amount</th>
                <th className="py-4 px-4">Payment Status</th>
                <th className="py-4 px-4">Bill Status</th>
                <th className="py-4 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-semibold">
              {isLoading ? (
                <tr>
                  <td colSpan={12} className="py-12 text-center text-slate-500">
                    <Loader2 size={32} className="mx-auto text-indigo-600 animate-spin" />
                    <div className="font-bold text-slate-700 mt-2">Loading purchase bills...</div>
                  </td>
                </tr>
              ) : filteredBills.length === 0 ? (
                <tr>
                  <td colSpan={12} className="py-12 text-center text-slate-500 space-y-2">
                    <FileText size={32} className="mx-auto text-slate-300" />
                    <div className="font-bold text-slate-700">No Purchase Bills Found</div>
                    <p className="text-xs text-slate-400">Try adjusting your search query, status filters, or supplier selection.</p>
                  </td>
                </tr>
              ) : (
                filteredBills.map((bill) => {
                  const billNo = bill.purchaseNumber || bill.supplierInvoiceNumber || bill.id;
                  const supplierName = bill.supplier?.name || bill.supplier?.companyName || bill.supplierName || bill.companyName || 'Supplier';
                  const supplierCity = bill.supplier?.city || bill.supplier?.state || bill.city || '-';
                  const totalAmt = bill.totalAmount || 0;
                  const paidAmt = bill.paidAmount || 0;
                  const dueAmt = bill.dueAmount || Math.max(0, totalAmt - paidAmt);
                  const itemCount = bill.itemsCount ?? bill._count?.items ?? bill.totalItems ?? (Array.isArray(bill.items) ? bill.items.length : 0);

                  return (
                    <tr key={bill.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-4 text-center">
                        <input type="checkbox" className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                      </td>
                      <td className="py-4 px-4 font-mono font-extrabold text-indigo-600 hover:underline cursor-pointer" onClick={() => navigate(`/vendor/purchases/${bill.id}`)}>
                        {billNo}
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-extrabold text-slate-900">{supplierName}</div>
                        <div className="text-[11px] text-slate-400 font-medium">{supplierCity}</div>
                      </td>
                      <td className="py-4 px-4 text-slate-600">
                        {bill.purchaseDate || bill.invoiceDate ? new Date(bill.purchaseDate || bill.invoiceDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
                      </td>
                      <td className="py-4 px-4">
                        <span className={bill.isOverdue ? 'text-rose-600 font-black' : 'text-slate-600'}>
                          {bill.dueDate ? new Date(bill.dueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center font-bold text-slate-700">{itemCount}</td>
                      <td className="py-4 px-4 font-black text-slate-900">₹{totalAmt.toLocaleString('en-IN')}.00</td>
                      <td className="py-4 px-4 font-extrabold text-emerald-600">₹{paidAmt.toLocaleString('en-IN')}.00</td>
                      <td className="py-4 px-4 font-black text-rose-600">₹{dueAmt.toLocaleString('en-IN')}.00</td>
                      <td className="py-4 px-4">{getPaymentBadge(bill.paymentStatus)}</td>
                      <td className="py-4 px-4">{getBillBadge(bill.purchaseStatus || bill.status)}</td>
                      <td className="py-4 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => navigate(`/vendor/purchases/${bill.id}`)}
                            className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors border border-indigo-200/60"
                            title="View Purchase Bill"
                          >
                            <Eye size={15} />
                          </button>
                          <button
                            onClick={async () => {
                              try {
                                toast.info('Opening Print Window...');
                                await printPurchaseBillPdf(bill);
                              } catch (err) {
                                toast.error('Failed to print bill.');
                              }
                            }}
                            className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200 cursor-pointer"
                            title="Print Tax Invoice"
                          >
                            <Printer size={15} />
                          </button>
                          <button
                            onClick={async () => {
                              try {
                                toast.info('Downloading PDF...');
                                await downloadPurchaseBillPdf(bill);
                                toast.success('PDF downloaded successfully!');
                              } catch (err) {
                                toast.error('Failed to download PDF.');
                              }
                            }}
                            className="p-1.5 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 rounded-lg transition-colors border border-emerald-200 cursor-pointer"
                            title="Instant Download PDF"
                          >
                            <Download size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <Pagination
          currentPage={currentPage}
          totalPages={pagination.totalPages || 1}
          totalItems={pagination.total || rawBills.length}
          pageSize={pageSize}
          onPageChange={(page) => setCurrentPage(page)}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setCurrentPage(1);
          }}
          itemName="bills"
        />
      </div>

      {/* Printable Professional GST Invoice Modal */}
      <PrintableBillModal
        isOpen={Boolean(selectedPrintBill)}
        onClose={() => setSelectedPrintBill(null)}
        bill={selectedPrintBill}
      />
    </div>
  );
};

export default PurchaseBillsListPage;
