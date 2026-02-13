import RUBA001 from './RUBA-001.json';
import RCNA001 from './RCNA-001.json';
import EETD034 from './EETD-034.json';


import AACS173 from './AACS-173.json';
import EEWA029 from './EEWA-029.json';
import RCNA011 from './RCNA-011.json';
import RCNA0351 from './RCNA-035.1.json';
import RCNA104 from './RCNA-104.json';
import RSFA061 from './RSFA-061.json';


export const inspectionFormRegistry = {

  'RUBA-001': RUBA001,


  'RCNA-001': RCNA001,
  'RCNA-011': RCNA011,


  'RCNA-034': RCNA0351,


  'RCNA-035.1': RCNA0351,


  'RCNA-104': RCNA104,


  'RSFA-061': RSFA061,


  'EETD-034': EETD034,


  'EEWA-029': EEWA029,


  'AACS-173': AACS173,
};


export const getInspectionForm = (partCode) => {
  return inspectionFormRegistry[partCode] || null;
};


export const getAvailablePartCodes = () => {
  return Object.keys(inspectionFormRegistry);
};


export const getFormSummaries = () => {
  return Object.entries(inspectionFormRegistry).map(([code, form]) => ({
    partCode: form.partCode,
    partName: form.partName,
    checkType: form.checkType,
    checkpointCount: form.checkpoints.length,
    samplingPlanNo: form.samplingPlanNo,
    category: form.metadata?.category || 'Unknown',
  }));
};

export default inspectionFormRegistry;
