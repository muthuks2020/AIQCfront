import { useState, useCallback, useEffect, useMemo } from 'react';
import {
  getInspectionById,
  saveDraftReadings,
  submitInspection,
  validateReading,
  calculateCheckpointResult,
} from '../api/inspectionService';
import { debounce, deepClone, checkReadingsComplete } from '../utils/helpers';


const initializeReadings = (checkpoints, sampleSize) => {
  const readings = {};

  checkpoints.forEach((checkpoint) => {
    readings[checkpoint.id] = {
      checkpointId: checkpoint.id,
      readings: {},
      result: 'Pending',
    };


    for (let i = 1; i <= sampleSize; i++) {
      readings[checkpoint.id].readings[i] = {
        sampleNumber: i,
        value: null,
        status: null,
        timestamp: null,
      };
    }
  });

  return readings;
};


export const useInspection = (inspectionId) => {

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [batchInfo, setBatchInfo] = useState(null);
  const [inspectionForm, setInspectionForm] = useState(null);
  const [readings, setReadings] = useState({});
  const [remarks, setRemarks] = useState('');
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);


  useEffect(() => {
    const loadInspection = async () => {
      if (!inspectionId) return;

      setLoading(true);
      setError(null);

      try {
        const data = await getInspectionById(inspectionId);

        setBatchInfo({
          id: data.id,
          irNumber: data.irNumber,
          irDate: data.irDate,
          poNumber: data.poNumber,
          poDate: data.poDate,
          grnNumber: data.grnNumber,
          grnDate: data.grnDate,
          vendorDcNo: data.vendorDcNo,
          vendorDcDate: data.vendorDcDate,
          partCode: data.partCode,
          partName: data.partName,
          vendor: data.vendor,
          prProcessCode: data.prProcessCode,
          lotSize: data.lotSize,
          sampleSize: data.sampleSize,
          samplingPlanNo: data.samplingPlanNo,
          qualityPlanNo: data.qualityPlanNo,
          batchNo: data.batchNo,
          documentRef: data.documentRef,
          inspectionType: data.inspectionType,
          status: data.status,
        });

        setInspectionForm(data.inspectionForm);


        if (data.savedReadings?.checkpoints) {

          const formCheckpoints = data.inspectionForm?.checkpoints || [];
          const initialReadings = initializeReadings(formCheckpoints, data.sampleSize);


          Object.entries(data.savedReadings.checkpoints).forEach(([checkpointId, savedData]) => {
            if (initialReadings[checkpointId]) {
              initialReadings[checkpointId] = {
                ...initialReadings[checkpointId],
                ...savedData,
              };
            }
          });

          setReadings(initialReadings);
          setRemarks(data.savedReadings.remarks || '');
          setLastSaved(data.savedReadings.lastSaved);
        } else if (data.inspectionForm?.checkpoints) {

          setReadings(initializeReadings(data.inspectionForm.checkpoints, data.sampleSize));
        }
      } catch (err) {
        console.error('Error loading inspection:', err);
        setError(err.message || 'Failed to load inspection data');
      } finally {
        setLoading(false);
      }
    };

    loadInspection();
  }, [inspectionId]);


  const updateReading = useCallback((checkpointId, sampleNumber, value) => {
    setReadings((prev) => {
      const newReadings = deepClone(prev);
      const checkpoint = inspectionForm?.checkpoints.find(c => c.id === checkpointId);

      if (!checkpoint || !newReadings[checkpointId]) return prev;


      const validation = validateReading(value, checkpoint);


      newReadings[checkpointId].readings[sampleNumber] = {
        sampleNumber,
        value,
        status: validation.status,
        timestamp: new Date().toISOString(),
      };


      newReadings[checkpointId].result = calculateCheckpointResult(
        newReadings[checkpointId].readings,
        checkpoint
      );

      return newReadings;
    });

    setIsDirty(true);
  }, [inspectionForm]);


  const updateVisualCheck = useCallback((checkpointId, sampleNumber, value) => {
    setReadings((prev) => {
      const newReadings = deepClone(prev);

      if (!newReadings[checkpointId]) return prev;

      newReadings[checkpointId].readings[sampleNumber] = {
        sampleNumber,
        value,
        status: value === 'OK' ? 'pass' : 'fail',
        timestamp: new Date().toISOString(),
      };


      const allReadings = Object.values(newReadings[checkpointId].readings);
      const hasNG = allReadings.some(r => r.value === 'NG');
      newReadings[checkpointId].result = hasNG ? 'Rejected' : 'Accepted';

      return newReadings;
    });

    setIsDirty(true);
  }, []);


  const updateRemarks = useCallback((value) => {
    setRemarks(value);
    setIsDirty(true);
  }, []);


  const autoSave = useMemo(
    () => debounce(async (readingsData, remarksData) => {
      if (!inspectionId) return;

      setIsSaving(true);
      try {
        await saveDraftReadings(inspectionId, {
          checkpoints: readingsData,
          remarks: remarksData,
        });
        setLastSaved(new Date().toISOString());
        setIsDirty(false);
      } catch (err) {
        console.error('Auto-save failed:', err);
      } finally {
        setIsSaving(false);
      }
    }, 2000),
    [inspectionId]
  );


  useEffect(() => {
    if (isDirty && Object.keys(readings).length > 0) {
      autoSave(readings, remarks);
    }
  }, [readings, remarks, isDirty, autoSave]);


  const saveProgress = useCallback(async () => {
    if (!inspectionId) return;

    setIsSaving(true);
    try {
      await saveDraftReadings(inspectionId, {
        checkpoints: readings,
        remarks,
      });
      setLastSaved(new Date().toISOString());
      setIsDirty(false);
      return { success: true };
    } catch (err) {
      console.error('Save failed:', err);
      return { success: false, error: err.message };
    } finally {
      setIsSaving(false);
    }
  }, [inspectionId, readings, remarks]);


  const submitInspectionData = useCallback(async () => {
    if (!inspectionId || !batchInfo) return;

    setIsSubmitting(true);
    try {
      const result = await submitInspection(inspectionId, {
        checkpoints: readings,
        remarks,
        totalSamples: batchInfo.sampleSize,
        lotSize: batchInfo.lotSize,
        submittedAt: new Date().toISOString(),
      });

      return { success: true, data: result };
    } catch (err) {
      console.error('Submit failed:', err);
      return { success: false, error: err.message };
    } finally {
      setIsSubmitting(false);
    }
  }, [inspectionId, batchInfo, readings, remarks]);


  const stats = useMemo(() => {
    if (!inspectionForm?.checkpoints || !readings) {
      return {
        totalCheckpoints: 0,
        completedCheckpoints: 0,
        passedCheckpoints: 0,
        failedCheckpoints: 0,
        passRate: 0,
        isComplete: false,
      };
    }

    const checkpoints = Object.values(readings);
    const totalCheckpoints = checkpoints.length;
    let completedCheckpoints = 0;
    let passedCheckpoints = 0;
    let failedCheckpoints = 0;

    checkpoints.forEach((cp) => {
      if (cp.result === 'Accepted') {
        completedCheckpoints++;
        passedCheckpoints++;
      } else if (cp.result === 'Rejected') {
        completedCheckpoints++;
        failedCheckpoints++;
      }
    });

    const completionCheck = checkReadingsComplete(
      readings,
      inspectionForm.checkpoints,
      batchInfo?.sampleSize || 0
    );

    return {
      totalCheckpoints,
      completedCheckpoints,
      passedCheckpoints,
      failedCheckpoints,
      passRate: completedCheckpoints > 0
        ? ((passedCheckpoints / completedCheckpoints) * 100).toFixed(1)
        : 0,
      isComplete: completionCheck.isComplete,
      missingReadings: completionCheck.missingCount,
    };
  }, [readings, inspectionForm, batchInfo]);

  return {

    loading,
    error,
    batchInfo,
    inspectionForm,
    readings,
    remarks,
    isDirty,
    isSaving,
    isSubmitting,
    lastSaved,
    stats,


    updateReading,
    updateVisualCheck,
    updateRemarks,
    saveProgress,
    submitInspectionData,


    checkpoints: inspectionForm?.checkpoints || [],
    sampleSize: batchInfo?.sampleSize || 0,
  };
};

export default useInspection;
