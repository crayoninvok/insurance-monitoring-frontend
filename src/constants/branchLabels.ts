import type { Branch } from '../types/types';

export const BRANCH_LABEL: Record<Branch, string> = {
  HEAD_OFFICE: 'Head Office',
  SENYIUR: 'Senyiur',
  MUARA_PAHU: 'Muara Pahu',
};

export function formatBranchLabel(branch: string): string {
  return BRANCH_LABEL[branch as Branch] ?? branch;
}
