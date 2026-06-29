import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiBarChart2, FiUsers, FiFolder, FiHeart,
  FiAward, FiBriefcase, FiUserPlus, FiTrendingUp,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../services/api';
import useAuthStore from '../store/authStore';
import StatCard from '../components/admin/StatCard';
import UsersTable from '../components/admin/UsersTable';
import ProjectsTable from '../components/admin/ProjectsTable';

/* ── Tab definitions ─────────────────────────────────────────── */
const TABS = [
  { key: 'overview',  label: 'Overview',  icon: FiBarChart2 },
  { key: 'users',     label: 'Users',     icon: FiUsers },
  { key: 'projects',  label: 'Projects',  icon: FiFolder },
];

/* ── Overview skeleton ───────────────────────────────────────── */
function OverviewSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 animate-pulse">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="bg-white rounded-2xl border border-gray-100 h-32" />
      ))}
    </div>
  );
}

/* ── Overview panel ──────────────────────────────────────────── */
function OverviewPanel({ stats, loading }) {
  if (loading) return <OverviewSkeleton />;

  const s = stats || {};

  const cards = [
    { icon: <FiUsers size={20} />,      label: 'Total Users',       value: s.totalUsers ?? 0,              accent: 'green',  },
    { icon: <FiAward size={20} />,      label: 'Students',          value: s.totalStudents ?? 0,           accent: 'blue',   },
    { icon: <FiBriefcase size={20} />,  label: 'Recruiters',        value: s.totalRecruiters ?? 0,         accent: 'purple', },
    { icon: <FiFolder size={20} />,     label: 'Total Projects',    value: s.totalProjects ?? 0,           accent: 'green',  },
    { icon: <FiTrendingUp size={20} />, label: 'Published',         value: s.totalPublishedProjects ?? 0,  accent: 'blue',   },
    { icon: <FiFolder size={20} />,     label: 'Drafts',            value: s.totalDraftProjects ?? 0,      accent: 'default',},
    { icon: <FiHeart size={20} />,      label: 'Total Likes',       value: s.totalLikes ?? 0,              accent: 'red',    },
    { icon: <FiUserPlus size={20} />,   label: 'New This Week',     value: s.newUsersThisWeek ?? 0,        accent: 'green',
      subtext: `+${s.newUsersToday ?? 0} today` },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
    >
      {cards.map((c, i) => (
        <StatCard
          key={c.label}
          icon={c.icon}
          label={c.label}
          value={c.value}
          subtext={c.subtext}
          accentColor={c.accent}
          index={i}
        />
      ))}
    </motion.div>
  );
}

/* ── Main page component ─────────────────────────────────────── */
export default function AdminDashboardPage() {
  const { user } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  const searchParams = new URLSearchParams(location.search);
  const tabParam = searchParams.get('tab');
  const currentTab = tabParam || (location.pathname.includes('/users')
    ? 'users'
    : location.pathname.includes('/projects')
    ? 'projects'
    : 'overview');

  const [activeTab, setActiveTab] = useState(currentTab);
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    setActiveTab(currentTab);
  }, [currentTab]);

  const handleTabChange = (key) => {
    setActiveTab(key);
    navigate(`/admin/dashboard?tab=${key}`);
  };

  // Fetch stats on mount
  useEffect(() => {
    api.get('/admin/stats')
      .then((res) => setStats(res.data.stats || res.data))
      .catch(() => toast.error('Could not load stats.'))
      .finally(() => setStatsLoading(false));
  }, []);

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Welcome back, {user?.name}</p>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 bg-gray-100/80 p-1 rounded-xl w-fit">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => handleTabChange(tab.key)}
                className={`relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'text-gray-900'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="admin-tab-bg"
                    className="absolute inset-0 bg-white rounded-lg shadow-sm"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  <Icon size={16} />
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Tab content */}
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <OverviewPanel stats={stats} loading={statsLoading} />
            </motion.div>
          )}
          {activeTab === 'users' && (
            <motion.div key="users" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <UsersTable />
            </motion.div>
          )}
          {activeTab === 'projects' && (
            <motion.div key="projects" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <ProjectsTable />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
