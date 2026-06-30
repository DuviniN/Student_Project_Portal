import { motion, AnimatePresence } from 'framer-motion';

/**
 * DataTable
 * ---------
 * Generic, reusable table with optional loading skeleton, empty state,
 * pagination, and framer-motion animated rows.
 *
 * Props
 *   columns      {Array}    - [{ key, label, render? }]
 *   data         {Array}    - Row data objects.
 *   loading      {boolean}  - Shows skeleton rows when true.
 *   emptyMessage {string}   - Message shown when data is empty.
 *   page         {number}   - Current page (for pagination).
 *   totalPages   {number}   - Total pages (for pagination).
 *   onPageChange {function} - Called with new page number.
 *   animated     {boolean}  - Wraps rows in AnimatePresence + motion.tr.
 *   SkeletonRow  {Component}- Custom skeleton row component (optional).
 */
export default function DataTable({
  columns = [],
  data = [],
  loading = false,
  emptyMessage = 'No data found.',
  page = 1,
  totalPages = 1,
  onPageChange,
  animated = false,
  SkeletonRow,
}) {
  /* ── Render helpers ───────────────────────────────────────────── */
  const renderSkeleton = () => {
    if (SkeletonRow) {
      return Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />);
    }
    return Array.from({ length: 5 }).map((_, i) => (
      <tr key={i} className="animate-pulse">
        {columns.map((_, cIdx) => (
          <td key={cIdx} className="px-6 py-4">
            <div className="h-4 bg-gray-200 rounded w-3/4" />
          </td>
        ))}
      </tr>
    ));
  };

  const renderRows = () => {
    if (!animated) {
      return data.map((row, rIdx) => (
        <tr key={row.id || rIdx} className="hover:bg-gray-50/50 transition-colors">
          {columns.map((col, cIdx) => (
            <td key={col.key || cIdx} className="px-6 py-4">
              {col.render ? col.render(row) : row[col.key]}
            </td>
          ))}
        </tr>
      ));
    }

    // Animated variant
    return (
      <AnimatePresence>
        {data.map((row, rIdx) => (
          <motion.tr
            key={row.id || rIdx}
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, x: -20 }}
            className="hover:bg-gray-50/50 transition-colors"
          >
            {columns.map((col, cIdx) => (
              <td key={col.key || cIdx} className="px-6 py-4">
                {col.render ? col.render(row) : row[col.key]}
              </td>
            ))}
          </motion.tr>
        ))}
      </AnimatePresence>
    );
  };

  /* ── Component ────────────────────────────────────────────────── */
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <table className="w-full text-left text-sm">
        <thead className="bg-gray-50/80 text-gray-500 text-xs uppercase tracking-wider">
          <tr>
            {columns.map((col, idx) => (
              <th key={col.key || idx} className="px-6 py-3.5 font-semibold">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50 text-sm">
          {loading ? (
            renderSkeleton()
          ) : data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-6 py-16 text-center text-gray-400 text-sm"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            renderRows()
          )}
        </tbody>
      </table>

      {onPageChange && totalPages > 1 && (
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-sm text-gray-600">
          <div>
            Page <span className="font-semibold">{page}</span> of{' '}
            <span className="font-semibold">{totalPages}</span>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={page <= 1 || loading}
              onClick={() => onPageChange(page - 1)}
              className="px-3 py-1.5 rounded-lg border bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
            >
              Prev
            </button>
            <button
              type="button"
              disabled={page >= totalPages || loading}
              onClick={() => onPageChange(page + 1)}
              className="px-3 py-1.5 rounded-lg border bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
