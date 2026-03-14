import { Subject } from './types';

export const DEFAULT_SUBJECTS: Subject[] = [
  { id: '1', name: 'Maths', attended: 15, missed: 2, requiredPercentage: 75 },
  { id: '2', name: 'EEE', attended: 10, missed: 5, requiredPercentage: 75 },
  { id: '3', name: 'English', attended: 18, missed: 0, requiredPercentage: 75 },
  { id: '4', name: 'Semis', attended: 12, missed: 4, requiredPercentage: 75 },
  { id: '5', name: 'EGD', attended: 8, missed: 3, requiredPercentage: 75 },
];

export const COLORS = {
  blush: '#F8C8DC',
  rose: '#F4A6C1',
  lavender: '#DCC6F0',
  cream: '#FFF8F2',
  peach: '#FFD9C7',
  mauve: '#CFA7C9',
  plum: '#5B3A4B',
};
