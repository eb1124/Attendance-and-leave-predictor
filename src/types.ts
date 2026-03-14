export interface Subject {
  id: string;
  name: string;
  attended: number;
  missed: number;
  requiredPercentage: number;
}

export interface AttendanceStats {
  totalClasses: number;
  totalAttended: number;
  totalMissed: number;
  overallPercentage: number;
  status: 'Safe' | 'Warning' | 'Critical';
  message: string;
}

export interface LeavePrediction {
  safeLeaves: number;
  requiredToAttend: number;
  isBelow: boolean;
  message: string;
}
