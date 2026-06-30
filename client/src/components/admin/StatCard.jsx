import { motion } from 'framer-motion';

const gradients = {
  green:  'from-green-500 to-emerald-400',
  blue:   'from-blue-500 to-indigo-400',
  purple: 'from-purple-500 to-fuchsia-400',
  red:    'from-red-500 to-rose-400',
  default:'from-gray-500 to-gray-400',
};

const iconBg = {
  green:  'bg-green-50 text-green-600',
  blue:   'bg-blue-50 text-blue-600',
  purple: 'bg-purple-50 text-purple-600',
  red:    'bg-red-50 text-red-600',
  default:'bg-gray-100 text-gray-500',
};

export default function StatCard({
  icon,
  label,
  value = 0,
  subtext,
  accentColor = 'default',
  index = 0,
}) {
  const gradient = gradients[accentColor] || gradients.default;
  const iconClass = iconBg[accentColor] || iconBg.default;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.06 }}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col"
    >
      {/* Thin gradient accent bar */}
      <div className={`h-1 bg-gradient-to-r ${gradient}`} />

      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-center justify-between mb-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconClass}`}>
            {icon}
          </div>
        </div>

        <div className="text-2xl font-bold text-gray-900 tracking-tight">{value}</div>
        <div className="text-sm font-medium text-gray-500 mt-0.5">{label}</div>
        {subtext && (
          <div className="text-xs text-gray-400 mt-1">{subtext}</div>
        )}
      </div>
    </motion.div>
  );
}
