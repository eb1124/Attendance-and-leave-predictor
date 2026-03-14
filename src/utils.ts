import { Subject, LeavePrediction, AttendanceStats } from './types';

export const calculatePercentage = (attended: number, missed: number): number => {
  const total = attended + missed;
  if (total === 0) return 100;
  return Number(((attended / total) * 100).toFixed(1));
};

export const getLeavePrediction = (subject: Subject): LeavePrediction => {
  const { attended, missed, requiredPercentage } = subject;
  const total = attended + missed;
  const currentPercentage = calculatePercentage(attended, missed);
  const req = requiredPercentage / 100;

  if (currentPercentage < requiredPercentage) {
    // Below threshold: calculate how many consecutive classes to attend to reach threshold
    // (attended + y) / (total + y) >= req
    // attended + y >= req * total + req * y
    // y * (1 - req) >= req * total - attended
    // y >= (req * total - attended) / (1 - req)
    const y = Math.ceil((req * total - attended) / (1 - req));
    return {
      safeLeaves: 0,
      requiredToAttend: y,
      isBelow: true,
      message: `Attend the next ${y} class${y > 1 ? 'es' : ''} to reach ${requiredPercentage}%`,
    };
  } else {
    // Above threshold: calculate how many more classes can be missed safely
    // attended / (total + x) >= req
    // attended / req >= total + x
    // x <= (attended / req) - total
    const x = Math.floor(attended / req - total);
    return {
      safeLeaves: x,
      requiredToAttend: 0,
      isBelow: false,
      message: x > 0 
        ? `You can safely miss ${x} more class${x > 1 ? 'es' : ''}`
        : `Don't miss the next class!`,
    };
  }
};

export const getOverallStats = (subjects: Subject[]): AttendanceStats => {
  const totalAttended = subjects.reduce((sum, s) => sum + s.attended, 0);
  const totalMissed = subjects.reduce((sum, s) => sum + s.missed, 0);
  const totalClasses = totalAttended + totalMissed;
  const overallPercentage = calculatePercentage(totalAttended, totalMissed);

  let status: 'Safe' | 'Warning' | 'Critical' = 'Safe';
  let message = 'You can chill a little today ✨';

  if (overallPercentage < 75) {
    status = 'Critical';
    message = "Don't miss the next class! 🚨";
  } else if (overallPercentage < 80) {
    status = 'Warning';
    message = 'Be careful, your attendance is getting low 🌸';
  }

  return {
    totalClasses,
    totalAttended,
    totalMissed,
    overallPercentage,
    status,
    message,
  };
};
