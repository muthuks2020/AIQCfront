/**
 * =============================================================================
 * useChecker Hook
 * =============================================================================
 * Custom React hook that encapsulates all Checker data-fetching, state
 * management, and action logic — keeping component files clean.
 *
 * Mirrors the architecture of useInspection.js for consistency.
 *
 * Usage:
 *   const {
 *     inspections, loading, error, counts,
 *     fetchInspections, handleApprove, handleReject, ...
 *   } = useChecker();
 * =============================================================================
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  getCheckerDashboardStats,
  getCheckerInspections,
  getInspectionDetail,
  approveInspection,
  rejectInspection,
  getCheckerHistory,
  getInspectionAuditTrail,
  getInspectionReport,
} from '../api/checkerService';

const useChecker = (options = {}) => {
  const { autoFetch = true } = options;

  // ---------------------------------------------------------------------------
  // State
  // ---------------------------------------------------------------------------
  const [inspections, setInspections] = useState([]);
  const [selectedInspection, setSelectedInspection] = useState(null);
  const [dashboardStats, setDashboardStats] = useState(null);

  const [loading, setLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);

  const [filters, setFilters] = useState({
    status: 'all',
    search: '',
    priority: null,
    dateFrom: null,
    dateTo: null,
    page: 1,
    pageSize: 20,
  });

  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    pageSize: 20,
    totalPages: 0,
  });

  // ---------------------------------------------------------------------------
  // Derived counts (computed from current inspection list)
  // ---------------------------------------------------------------------------
  const counts = useMemo(() => ({
    pending:  inspections.filter((i) => i.status === 'pending_review').length,
    approved: inspections.filter((i) => i.status === 'approved').length,
    rejected: inspections.filter((i) => i.status === 'rejected').length,
    total:    inspections.length,
  }), [inspections]);

  // ---------------------------------------------------------------------------
  // Fetch — Dashboard Stats
  // ---------------------------------------------------------------------------
  const fetchDashboardStats = useCallback(async () => {
    try {
      const result = await getCheckerDashboardStats();
      if (result.success) {
        setDashboardStats(result.data);
      }
      return result;
    } catch (err) {
      console.error('[useChecker] Failed to fetch dashboard stats:', err);
      return { success: false, error: err.message };
    }
  }, []);

  // ---------------------------------------------------------------------------
  // Fetch — Inspections List
  // ---------------------------------------------------------------------------
  const fetchInspections = useCallback(async (overrideFilters = null) => {
    setLoading(true);
    setError(null);
    try {
      const activeFilters = overrideFilters || filters;
      const result = await getCheckerInspections(activeFilters);
      if (result.success) {
        setInspections(result.data);
        if (result.pagination) {
          setPagination(result.pagination);
        }
      }
      return result;
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // ---------------------------------------------------------------------------
  // Fetch — Single Inspection Detail
  // ---------------------------------------------------------------------------
  const fetchInspectionDetail = useCallback(async (inspectionId) => {
    setDetailLoading(true);
    try {
      const result = await getInspectionDetail(inspectionId);
      if (result.success) {
        setSelectedInspection(result.data);
      }
      return result;
    } catch (err) {
      console.error('[useChecker] Failed to fetch detail:', err);
      return { success: false, error: err.message };
    } finally {
      setDetailLoading(false);
    }
  }, []);

  // ---------------------------------------------------------------------------
  // Action — Approve Inspection
  // ---------------------------------------------------------------------------
  const handleApprove = useCallback(async (inspectionId, payload) => {
    setActionLoading(true);
    try {
      const result = await approveInspection(inspectionId, payload);

      if (result.success) {
        // Optimistically update local state
        setInspections((prev) =>
          prev.map((ins) =>
            ins.id === inspectionId
              ? {
                  ...ins,
                  status: 'approved',
                  checkerRemarks: payload.checkerRemarks || payload.remarks || '',
                  checkerDate: new Date().toISOString(),
                  checkerName: payload.checkerName,
                }
              : ins
          )
        );

        // Update selected if viewing this inspection
        if (selectedInspection?.id === inspectionId) {
          setSelectedInspection((prev) => ({
            ...prev,
            status: 'approved',
            checkerRemarks: payload.checkerRemarks || payload.remarks || '',
            checkerDate: new Date().toISOString(),
            checkerName: payload.checkerName,
          }));
        }
      }

      return result;
    } catch (err) {
      console.error('[useChecker] Approve failed:', err);
      return { success: false, error: err.message };
    } finally {
      setActionLoading(false);
    }
  }, [selectedInspection]);

  // ---------------------------------------------------------------------------
  // Action — Reject Inspection
  // ---------------------------------------------------------------------------
  const handleReject = useCallback(async (inspectionId, payload) => {
    setActionLoading(true);
    try {
      const result = await rejectInspection(inspectionId, payload);

      if (result.success) {
        // Optimistically update local state
        setInspections((prev) =>
          prev.map((ins) =>
            ins.id === inspectionId
              ? {
                  ...ins,
                  status: 'rejected',
                  checkerRemarks: payload.checkerRemarks || payload.remarks || '',
                  checkerDate: new Date().toISOString(),
                  checkerName: payload.checkerName,
                  rejectionCategory: payload.rejectionCategory || '',
                  rejectionReason: payload.rejectionReason || '',
                  rejectionCount: (ins.rejectionCount || 0) + 1,
                  returnedToMaker: true,
                }
              : ins
          )
        );

        // Update selected if viewing this inspection
        if (selectedInspection?.id === inspectionId) {
          setSelectedInspection((prev) => ({
            ...prev,
            status: 'rejected',
            checkerRemarks: payload.checkerRemarks || payload.remarks || '',
            checkerDate: new Date().toISOString(),
            checkerName: payload.checkerName,
            rejectionCategory: payload.rejectionCategory || '',
            rejectionReason: payload.rejectionReason || '',
            rejectionCount: (prev.rejectionCount || 0) + 1,
            returnedToMaker: true,
          }));
        }
      }

      return result;
    } catch (err) {
      console.error('[useChecker] Reject failed:', err);
      return { success: false, error: err.message };
    } finally {
      setActionLoading(false);
    }
  }, [selectedInspection]);

  // ---------------------------------------------------------------------------
  // History & Audit Trail
  // ---------------------------------------------------------------------------
  const fetchHistory = useCallback(async (historyFilters = {}) => {
    setLoading(true);
    try {
      const result = await getCheckerHistory(historyFilters);
      return result;
    } catch (err) {
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAuditTrail = useCallback(async (inspectionId) => {
    try {
      return await getInspectionAuditTrail(inspectionId);
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, []);

  // ---------------------------------------------------------------------------
  // Reports
  // ---------------------------------------------------------------------------
  const fetchReport = useCallback(async (inspectionId) => {
    try {
      return await getInspectionReport(inspectionId);
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, []);

  // ---------------------------------------------------------------------------
  // Filter Helpers
  // ---------------------------------------------------------------------------
  const updateFilters = useCallback((newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters, page: 1 }));
  }, []);

  const setPage = useCallback((page) => {
    setFilters((prev) => ({ ...prev, page }));
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedInspection(null);
  }, []);

  // ---------------------------------------------------------------------------
  // Auto-fetch on mount and filter change
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (autoFetch) {
      fetchInspections();
      fetchDashboardStats();
    }
  }, [autoFetch, fetchInspections, fetchDashboardStats]);

  // ---------------------------------------------------------------------------
  // Public Interface
  // ---------------------------------------------------------------------------
  return {
    // Data
    inspections,
    selectedInspection,
    dashboardStats,
    counts,
    pagination,
    filters,

    // Loading states
    loading,
    detailLoading,
    actionLoading,
    error,

    // Fetch methods
    fetchInspections,
    fetchInspectionDetail,
    fetchDashboardStats,
    fetchHistory,
    fetchAuditTrail,
    fetchReport,

    // Actions
    handleApprove,
    handleReject,

    // State management
    setSelectedInspection,
    clearSelection,
    updateFilters,
    setPage,
    setInspections,
  };
};

export default useChecker;
