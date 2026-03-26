import type { Position } from '../types/types';

/** Display labels for API enum `Position` (ordered: Direktur → … → Worker). */
export const POSITION_LABEL: Record<Position, string> = {
  DIRECTOR: 'Direktur',
  MANAGER: 'Manager',
  SUPERINTENDENT: 'Superintendent',
  SUPERVISOR: 'Supervisor',
  JUNIOR_SUPERVISOR: 'Junior Supervisor',
  WORKER: 'Worker',
};

export function formatPositionLabel(position: string): string {
  return POSITION_LABEL[position as Position] ?? position;
}
