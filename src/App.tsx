/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, 
  Trash2, 
  Edit2, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle2, 
  Info, 
  Calendar,
  BookOpen,
  User,
  Heart,
  Sparkles,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip,
  Legend
} from 'recharts';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Types
interface Subject {
  id: string;
  name: string;
  attended: number;
  missed: number;
  requiredPercentage: number;
}

// Utility for Tailwind classes
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Default Data
const DEFAULT_SUBJECTS: Subject[] = [
  { id: '1', name: 'Maths', attended: 15, missed: 2, requiredPercentage: 75 },
  { id: '2', name: 'EEE', attended: 10, missed: 5, requiredPercentage: 75 },
  { id: '3', name: 'English', attended: 18, missed: 0, requiredPercentage: 75 },
  { id: '4', name: 'Semis', attended: 12, missed: 4, requiredPercentage: 75 },
  { id: '5', name: 'EGD', attended: 8, missed: 3, requiredPercentage: 75 },
];

// Calculation Helpers
const calculatePercentage = (attended: number, missed: number): number => {
  const total = attended + missed;
  if (total === 0) return 100;
  return Number(((attended / total) * 100).toFixed(1));
};

const getPrediction = (subject: Subject) => {
  const { attended, missed, requiredPercentage } = subject;
  const total = attended + missed;
  const currentPercentage = calculatePercentage(attended, missed);
  const req = requiredPercentage / 100;

  if (currentPercentage < requiredPercentage) {
    const y = Math.ceil((req * total - attended) / (1 - req));
    return {
      safeLeaves: 0,
      requiredToAttend: y,
      isBelow: true,
      message: `Attend next ${y} class${y > 1 ? 'es' : ''} to reach ${requiredPercentage}%`,
      status: 'Critical'
    };
  } else {
    const x = Math.floor(attended / req - total);
    return {
      safeLeaves: x,
      requiredToAttend: 0,
      isBelow: false,
      message: x > 0 
        ? `You can safely miss ${x} more class${x > 1 ? 'es' : ''}`
        : `Don't miss the next class!`,
      status: x > 2 ? 'Safe' : 'Warning'
    };
  }
};

export default function App() {
  const [subjects, setSubjects] = useState<Subject[]>(() => {
    const saved = localStorage.getItem('attendance_data');
    return saved ? JSON.parse(saved) : DEFAULT_SUBJECTS;
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    attended: 0,
    missed: 0,
    requiredPercentage: 75
  });

  useEffect(() => {
    localStorage.setItem('attendance_data', JSON.stringify(subjects));
  }, [subjects]);

  // Overall Stats
  const stats = useMemo(() => {
    const totalAttended = subjects.reduce((sum, s) => sum + s.attended, 0);
    const totalMissed = subjects.reduce((sum, s) => sum + s.missed, 0);
    const totalClasses = totalAttended + totalMissed;
    const overallPercentage = calculatePercentage(totalAttended, totalMissed);
    
    let status: 'Safe' | 'Warning' | 'Critical' = 'Safe';
    let message = 'You can chill a little today ✨';
    let color = 'text-emerald-600';

    if (overallPercentage < 75) {
      status = 'Critical';
      message = "Don't miss the next class! 🚨";
      color = 'text-rose-500';
    } else if (overallPercentage < 80) {
      status = 'Warning';
      message = 'Be careful, your attendance is getting low 🌸';
      color = 'text-amber-500';
    }

    return { totalClasses, totalAttended, totalMissed, overallPercentage, status, message, color };
  }, [subjects]);

  // Insights
  const insights = useMemo(() => {
    if (subjects.length === 0) return null;
    const sorted = [...subjects].sort((a, b) => 
      calculatePercentage(a.attended, a.missed) - calculatePercentage(b.attended, b.missed)
    );
    const lowest = sorted[0];
    const highest = sorted[sorted.length - 1];
    const inDanger = subjects.filter(s => calculatePercentage(s.attended, s.missed) < s.requiredPercentage).length;

    return { lowest, highest, inDanger };
  }, [subjects]);

  const handleAddOrEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingSubject) {
      setSubjects(subjects.map(s => s.id === editingSubject.id ? { ...editingSubject, ...formData } : s));
    } else {
      const newSubject: Subject = {
        id: Math.random().toString(36).substr(2, 9),
        ...formData
      };
      setSubjects([...subjects, newSubject]);
    }
    closeModal();
  };

  const openModal = (subject?: Subject) => {
    if (subject) {
      setEditingSubject(subject);
      setFormData({
        name: subject.name,
        attended: subject.attended,
        missed: subject.missed,
        requiredPercentage: subject.requiredPercentage
      });
    } else {
      setEditingSubject(null);
      setFormData({ name: '', attended: 0, missed: 0, requiredPercentage: 75 });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingSubject(null);
  };

  const deleteSubject = (id: string) => {
    if (window.confirm('Are you sure you want to delete this subject? 🌸')) {
      setSubjects(subjects.filter(s => s.id !== id));
    }
  };

  const chartData = subjects.map(s => ({
    name: s.name,
    percentage: calculatePercentage(s.attended, s.missed),
    required: s.requiredPercentage
  }));

  const pieData = [
    { name: 'Attended', value: stats.totalAttended, color: '#F4A6C1' },
    { name: 'Missed', value: stats.totalMissed, color: '#DCC6F0' },
  ];

  return (
    <div className="min-h-screen bg-cream pb-20">
      {/* Navbar */}
      <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-30 border-b border-blush/30 px-4 py-3">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-xl font-display font-bold text-plum flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-rose" />
              Attendance & Leave Predictor
            </h1>
            <p className="text-xs text-plum/60 italic">Track smart. Skip smarter.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-lavender flex items-center justify-center text-plum border border-blush">
              <User className="w-4 h-4" />
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 mt-8 space-y-8">
        {/* Summary Section */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:col-span-2 bg-white rounded-3xl p-6 shadow-sm border border-blush/50 flex flex-col md:flex-row justify-between relative overflow-hidden gap-6"
          >
            <div className="relative z-10 flex-1">
              <h2 className="text-plum/60 text-sm font-medium uppercase tracking-wider mb-1">Overall Attendance</h2>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-display font-bold text-plum">{stats.overallPercentage}%</span>
                <span className={cn("text-sm font-bold px-2 py-0.5 rounded-full bg-cream", stats.color)}>
                  {stats.status}
                </span>
              </div>
              <p className="mt-4 text-plum font-medium flex items-center gap-2">
                <Heart className="w-4 h-4 text-rose fill-rose" />
                {stats.message}
              </p>
            </div>
            
            <div className="w-32 h-32 shrink-0 relative z-10">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={30}
                    outerRadius={45}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <Sparkles className="w-4 h-4 text-rose/40" />
              </div>
            </div>

            <div className="absolute -right-4 -bottom-4 opacity-5">
              <TrendingUp className="w-32 h-32 text-plum" />
            </div>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-1 gap-4 md:col-span-1">
            <SummarySmallCard label="Total Attended" value={stats.totalAttended} icon={<CheckCircle2 className="w-4 h-4" />} color="bg-blush" />
            <SummarySmallCard label="Total Missed" value={stats.totalMissed} icon={<AlertCircle className="w-4 h-4" />} color="bg-lavender" />
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-peach rounded-3xl p-6 shadow-sm border border-orange-200/30 flex flex-col items-center justify-center text-center"
          >
            <Calendar className="w-8 h-8 text-plum/40 mb-2" />
            <span className="text-3xl font-display font-bold text-plum">
              {subjects.reduce((sum, s) => sum + getPrediction(s).safeLeaves, 0)}
            </span>
            <span className="text-xs text-plum/60 uppercase font-bold tracking-tighter">Safe Leaves Left</span>
          </motion.div>
        </section>

        {/* Charts & Insights */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-sm border border-blush/50">
            <h3 className="text-plum font-display font-bold mb-6 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-mauve" />
              Attendance Overview
            </h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#5B3A4B', fontSize: 12 }} />
                  <YAxis hide domain={[0, 100]} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#FFF8F2', borderRadius: '16px', border: '1px solid #F8C8DC' }}
                    cursor={{ fill: '#F8C8DC', opacity: 0.2 }}
                  />
                  <Bar dataKey="percentage" fill="#F4A6C1" radius={[8, 8, 0, 0]} barSize={40} />
                  <Bar dataKey="required" fill="#DCC6F0" radius={[8, 8, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-6 mt-4 text-xs font-bold text-plum/60">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose" /> Current %
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-lavender" /> Required %
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-sm border border-blush/50 space-y-6">
            <h3 className="text-plum font-display font-bold flex items-center gap-2">
              <Info className="w-5 h-5 text-mauve" />
              Quick Insights
            </h3>
            {insights ? (
              <div className="space-y-4">
                <InsightItem 
                  label="Highest Attendance" 
                  value={`${calculatePercentage(insights.highest.attended, insights.highest.missed)}%`} 
                  sub={insights.highest.name}
                  color="bg-emerald-50 text-emerald-600"
                />
                <InsightItem 
                  label="Lowest Attendance" 
                  value={`${calculatePercentage(insights.lowest.attended, insights.lowest.missed)}%`} 
                  sub={insights.lowest.name}
                  color="bg-rose-50 text-rose-500"
                />
                <InsightItem 
                  label="Danger Zone" 
                  value={insights.inDanger} 
                  sub="Subjects below threshold"
                  color="bg-amber-50 text-amber-600"
                />
              </div>
            ) : (
              <p className="text-plum/40 text-sm italic">Add subjects to see insights! ✨</p>
            )}
          </div>
        </section>

        {/* Subjects List */}
        <section className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-display font-bold text-plum">Your Subjects</h3>
            <button 
              onClick={() => openModal()}
              className="bg-rose hover:bg-rose/90 text-white px-4 py-2 rounded-2xl font-bold flex items-center gap-2 transition-all shadow-md active:scale-95"
            >
              <Plus className="w-5 h-5" />
              Add Subject
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {subjects.map((subject) => (
                <SubjectCard 
                  key={subject.id} 
                  subject={subject} 
                  onEdit={() => openModal(subject)}
                  onDelete={() => deleteSubject(subject.id)}
                  onUpdate={(updated) => setSubjects(subjects.map(s => s.id === updated.id ? updated : s))}
                />
              ))}
            </AnimatePresence>
          </div>
        </section>
      </main>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
              className="absolute inset-0 bg-plum/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-[2rem] p-8 w-full max-w-md relative z-10 shadow-2xl border border-blush"
            >
              <button onClick={closeModal} className="absolute right-6 top-6 text-plum/40 hover:text-plum transition-colors">
                <X className="w-6 h-6" />
              </button>
              <h2 className="text-2xl font-display font-bold text-plum mb-6">
                {editingSubject ? 'Edit Subject' : 'New Subject'} 🎀
              </h2>
              <form onSubmit={handleAddOrEdit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-plum/60 uppercase mb-1 ml-1">Subject Name</label>
                  <input 
                    required
                    type="text"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-cream border border-blush rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-rose/30 transition-all"
                    placeholder="e.g. Psychology"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-plum/60 uppercase mb-1 ml-1">Attended</label>
                    <input 
                      required
                      type="number"
                      min="0"
                      value={formData.attended}
                      onChange={e => setFormData({ ...formData, attended: parseInt(e.target.value) || 0 })}
                      className="w-full bg-cream border border-blush rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-rose/30 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-plum/60 uppercase mb-1 ml-1">Missed</label>
                    <input 
                      required
                      type="number"
                      min="0"
                      value={formData.missed}
                      onChange={e => setFormData({ ...formData, missed: parseInt(e.target.value) || 0 })}
                      className="w-full bg-cream border border-blush rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-rose/30 transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-plum/60 uppercase mb-1 ml-1">Required %</label>
                  <input 
                    required
                    type="number"
                    min="0"
                    max="100"
                    value={formData.requiredPercentage}
                    onChange={e => setFormData({ ...formData, requiredPercentage: parseInt(e.target.value) || 0 })}
                    className="w-full bg-cream border border-blush rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-rose/30 transition-all"
                  />
                </div>
                <button 
                  type="submit"
                  className="w-full bg-mauve hover:bg-mauve/90 text-white py-4 rounded-2xl font-bold shadow-lg transition-all active:scale-95 mt-4"
                >
                  {editingSubject ? 'Save Changes' : 'Add Subject'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="mt-20 text-center pb-10">
        <p className="text-plum/40 text-sm flex items-center justify-center gap-2">
          Made with <Heart className="w-4 h-4 text-rose fill-rose" /> for smart students
        </p>
      </footer>
    </div>
  );
}

// Sub-components
function SummarySmallCard({ label, value, icon, color }: { label: string, value: number, icon: React.ReactNode, color: string }) {
  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={cn("rounded-3xl p-4 flex items-center gap-4 border border-white/20 shadow-sm", color)}
    >
      <div className="bg-white/40 p-2 rounded-xl text-plum">
        {icon}
      </div>
      <div>
        <p className="text-[10px] uppercase font-bold text-plum/60 tracking-wider">{label}</p>
        <p className="text-xl font-display font-bold text-plum leading-none">{value}</p>
      </div>
    </motion.div>
  );
}

function InsightItem({ label, value, sub, color }: { label: string, value: string | number, sub: string, color: string }) {
  return (
    <div className="flex items-center justify-between p-3 rounded-2xl bg-cream/50 border border-blush/20">
      <div>
        <p className="text-xs font-bold text-plum/60">{label}</p>
        <p className="text-xs text-plum/40">{sub}</p>
      </div>
      <span className={cn("px-3 py-1 rounded-full text-sm font-bold", color)}>
        {value}
      </span>
    </div>
  );
}

interface SubjectCardProps {
  subject: Subject;
  onEdit: () => void;
  onDelete: () => void;
  onUpdate: (s: Subject) => void;
  key?: React.Key;
}

function SubjectCard({ subject, onEdit, onDelete, onUpdate }: SubjectCardProps) {
  const percentage = calculatePercentage(subject.attended, subject.missed);
  const prediction = getPrediction(subject);
  
  const statusColors = {
    Safe: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    Warning: 'bg-amber-50 text-amber-600 border-amber-100',
    Critical: 'bg-rose-50 text-rose-500 border-rose-100'
  };

  const simulateAttend = () => {
    onUpdate({ ...subject, attended: subject.attended + 1 });
  };

  const simulateSkip = () => {
    onUpdate({ ...subject, missed: subject.missed + 1 });
  };

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="bg-white rounded-[2rem] p-6 shadow-sm border border-blush/50 flex flex-col h-full group hover:shadow-md transition-all"
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h4 className="text-xl font-display font-bold text-plum">{subject.name}</h4>
          <p className="text-xs text-plum/40 font-medium">Req: {subject.requiredPercentage}%</p>
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={onEdit} className="p-2 hover:bg-lavender rounded-xl text-plum/60 hover:text-plum transition-colors">
            <Edit2 className="w-4 h-4" />
          </button>
          <button onClick={onDelete} className="p-2 hover:bg-rose/20 rounded-xl text-rose/60 hover:text-rose transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div className="relative w-16 h-16 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="32"
              cy="32"
              r="28"
              fill="transparent"
              stroke="#FFF8F2"
              strokeWidth="6"
            />
            <motion.circle
              cx="32"
              cy="32"
              r="28"
              fill="transparent"
              stroke={percentage >= subject.requiredPercentage ? '#F4A6C1' : '#CFA7C9'}
              strokeWidth="6"
              strokeDasharray={2 * Math.PI * 28}
              initial={{ strokeDashoffset: 2 * Math.PI * 28 }}
              animate={{ strokeDashoffset: 2 * Math.PI * 28 * (1 - percentage / 100) }}
              transition={{ duration: 1, ease: "easeOut" }}
              strokeLinecap="round"
            />
          </svg>
          <span className="absolute text-[11px] font-bold text-plum">{Math.round(percentage)}%</span>
        </div>
        <div className="flex-1 space-y-1">
          <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-plum/40">
            <span>Attended: {subject.attended}</span>
            <span>Total: {subject.attended + subject.missed}</span>
          </div>
          <div className="w-full h-2 bg-cream rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              className={cn("h-full rounded-full", percentage >= subject.requiredPercentage ? "bg-rose" : "bg-mauve")}
            />
          </div>
        </div>
      </div>

      <div className={cn("mt-auto p-3 rounded-2xl border text-xs font-medium flex items-start gap-2", statusColors[prediction.status as keyof typeof statusColors])}>
        <Info className="w-4 h-4 shrink-0 mt-0.5" />
        <p>{prediction.message}</p>
      </div>
      
      <div className="mt-4 grid grid-cols-2 gap-2">
        <button 
          onClick={simulateAttend}
          className="text-[10px] font-bold py-2 rounded-xl bg-cream text-plum/60 hover:bg-emerald-50 hover:text-emerald-600 transition-all border border-transparent hover:border-emerald-100"
        >
          Attend Next
        </button>
        <button 
          onClick={simulateSkip}
          className="text-[10px] font-bold py-2 rounded-xl bg-cream text-plum/60 hover:bg-rose-50 hover:text-rose-500 transition-all border border-transparent hover:border-rose-100"
        >
          Skip Next
        </button>
      </div>
    </motion.div>
  );
}
