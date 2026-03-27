import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import TopNavbar from '../components/TopNavbar';
import Footer from '../components/Footer';
import api from '../services/api';

export default function AnalyticsPage() {
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalMessages: 0,
    totalFeedback: 0,
    approvedFeedback: 0,
    pendingFeedback: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/admin/stats');
      setStats(response.data);
    } catch (error) {
      console.error("Failed to fetch analytics data", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <TopNavbar pageTitle="Workspace Analytics" />

      <div className="p-8 space-y-8 max-w-[1440px] mx-auto w-full min-h-[70vh]">
        {/* 1. Filter & Controls */}
        <section className="flex flex-col lg:flex-row items-center justify-between gap-6 bg-[#F5EDE4]/40 p-4 rounded-2xl border border-[#E8DDD1]">
          <div className="flex flex-wrap items-center gap-2">
            <div className="bg-[#F5EDE4] p-1 rounded-xl flex border border-[#E8DDD1]">
              <button className="px-4 py-2 text-xs font-bold filter-tab-active rounded-lg">Real-time Data</button>
            </div>
            <div className="h-8 w-[1px] bg-[#E8DDD1] mx-2 hidden sm:block"></div>
            <div className="flex items-center gap-2 bg-[#FEFBF7] border border-[#E8DDD1] rounded-xl px-4 py-2 text-xs font-medium cursor-pointer hover:bg-[#F5EDE4] transition-colors">
              <Icon icon="lucide:shield-check" className="text-sm text-[#D4754C]" />
              Secure Encrypted View
            </div>
          </div>
          <div className="flex items-center gap-6">
            <button 
              onClick={fetchStats}
              className="flex items-center gap-2 bg-[#D4754C] text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-lg shadow-[#D4754C]/20 hover:bg-[#c26742] transition-all transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <Icon icon={loading ? "lucide:loader-2" : "lucide:refresh-cw"} className={`text-sm ${loading ? 'animate-spin' : ''}`} />
              Refresh Data
            </button>
          </div>
        </section>

        {/* 2. Key Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Total Projects', value: stats.totalProjects, icon: 'lucide:folder-git-2', highlight: false },
            { label: 'Total Feedback', value: stats.totalFeedback, icon: 'lucide:message-square', highlight: false },
            { label: 'Approved Feedback', value: stats.approvedFeedback, icon: 'lucide:check-circle', highlight: true },
            { label: 'Pending Enquiries', value: stats.totalMessages, icon: 'lucide:inbox', highlight: false },
          ].map((metric) => (
            <div key={metric.label} className={`bg-[#FEFBF7] border border-[#E8DDD1] rounded-2xl p-6 card-hover ${metric.highlight ? 'shadow-md shadow-[#D4754C]/5 ring-1 ring-[#D4754C]/10' : ''}`}>
              <div className="flex justify-between items-start mb-3">
                <p className={`text-[11px] font-bold ${metric.highlight ? 'text-[#D4754C]' : 'text-[#8B8680]'} uppercase tracking-widest`}>{metric.label}</p>
                <Icon icon={metric.icon} className={`text-xl ${metric.highlight ? 'text-[#D4754C]' : 'text-[#8B8680]/50'}`} />
              </div>
              <div className="flex items-end justify-between">
                <h3 className="text-4xl font-black tracking-tight text-[#3D3A34]">{loading ? '-' : metric.value}</h3>
              </div>
            </div>
          ))}
        </div>

        {/* Info State */}
        {!loading && stats.totalProjects === 0 && stats.totalFeedback === 0 && stats.totalMessages === 0 && (
          <div className="bg-[#FEFBF7] border border-[#E8DDD1] border-dashed rounded-2xl p-12 text-center mt-8">
            <div className="w-16 h-16 bg-[#F5EDE4] rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon icon="lucide:layout-dashboard" className="text-2xl text-[#8B8680]" />
            </div>
            <h3 className="text-lg font-bold text-[#3D3A34] mb-2">Your Workspace is Empty</h3>
            <p className="text-[#8B8680] text-sm max-w-md mx-auto">
              Analytics will appear here securely isolated from other users as soon as your account accrues data.
            </p>
          </div>
        )}
      </div>

      <Footer />
    </>
  );
}
