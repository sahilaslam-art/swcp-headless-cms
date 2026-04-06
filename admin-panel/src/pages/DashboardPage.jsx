import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { Link } from 'react-router-dom';
import TopNavbar from '../components/TopNavbar';
import Footer from '../components/Footer';
import { fetchStats, fetchMessages, fetchFeedback, fetchAnalyticsStats } from '../services/api';

export default function DashboardPage() {
  const [stats, setStats] = useState({ totalProjects: 0, totalMessages: 0, totalFeedback: 0, approvedFeedback: 0, pendingFeedback: 0 });
  const [recentMessages, setRecentMessages] = useState([]);
  const [recentFeedback, setRecentFeedback] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [s, m, f, a] = await Promise.all([
          fetchStats(), 
          fetchMessages(), 
          fetchFeedback(),
          fetchAnalyticsStats()
        ]);
        setStats(s);
        setRecentMessages(m.slice(0, 4));
        setRecentFeedback(f.filter((fb) => !fb.approved).slice(0, 3));
        setAnalytics(a);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const getInitials = (name) => name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);

  return (
    <>
      <TopNavbar pageTitle="Dashboard" />
      <div className="p-8 space-y-8 max-w-[1440px] mx-auto w-full">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Total Projects', value: stats.totalProjects, icon: 'lucide:folder', link: '/cms' },
            { label: 'Total Enquiries', value: stats.totalMessages, icon: 'lucide:mail', link: '/enquiries' },
            { label: 'Total Feedback', value: stats.totalFeedback, icon: 'lucide:message-square', link: '/feedback' },
            { label: 'Approved Testimonials', value: stats.approvedFeedback, icon: 'lucide:check-circle', link: '/feedback' },
          ].map((card) => (
            <Link key={card.label} to={card.link} className="bg-[#FEFBF7] border border-[#E8DDD1] rounded-2xl p-6 card-hover block">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[11px] font-bold text-[#8B8680] uppercase tracking-widest">{card.label}</p>
                <Icon icon={card.icon} className="text-[#D4754C] text-lg" />
              </div>
              <h3 className="text-3xl font-bold text-[#3D3A34]">{loading ? '—' : card.value}</h3>
            </Link>
          ))}
        </div>

        {/* Analytics & SDK Status */}
        <div className="bg-[#FEFBF7] border border-[#E8DDD1] rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h4 className="text-lg font-bold flex items-center gap-2">
                <Icon icon="lucide:bar-chart-3" className="text-[#D4754C]" />
                Website Performance
              </h4>
              <p className="text-xs text-[#8B8680] mt-1">Real-time stats from your connected website</p>
            </div>
            {analytics?.sdkActive && (
              <span className="flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-600 rounded-full text-[10px] font-bold uppercase tracking-wider border border-green-100">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                SDK Active: {analytics.domain}
              </span>
            )}
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="p-4 bg-[#F5EDE4]/40 rounded-xl border border-[#E8DDD1]">
              <p className="text-[10px] font-bold text-[#8B8680] uppercase mb-1">Total Page Views</p>
              <h5 className="text-2xl font-bold text-[#3D3A34]">{loading ? '...' : (analytics?.pageViews || 0)}</h5>
            </div>
            <div className="p-4 bg-[#F5EDE4]/40 rounded-xl border border-[#E8DDD1]">
              <p className="text-[10px] font-bold text-[#8B8680] uppercase mb-1">Live Edits</p>
              <h5 className="text-2xl font-bold text-[#3D3A34]">{loading ? '...' : (analytics?.editCount || 0)}</h5>
            </div>
            <div className="p-4 bg-[#F5EDE4]/40 rounded-xl border border-[#E8DDD1]">
              <p className="text-[10px] font-bold text-[#8B8680] uppercase mb-1">Pending Drafts</p>
              <h5 className="text-2xl font-bold text-[#3D3A34]">{loading ? '...' : (analytics?.draftCount || 0)}</h5>
            </div>
            <div className="p-4 bg-[#F5EDE4]/40 rounded-xl border border-[#E8DDD1]">
              <p className="text-[10px] font-bold text-[#8B8680] uppercase mb-1">Last SDK Check</p>
              <h5 className="text-sm font-bold text-[#3D3A34] mt-2">
                {loading || !analytics?.lastVisit ? 'Never' : new Date(analytics.lastVisit).toLocaleDateString()}
              </h5>
            </div>
          </div>
        </div>

        {/* Recent Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Recent Messages */}
          <div className="lg:col-span-7 bg-[#FEFBF7] border border-[#E8DDD1] rounded-2xl overflow-hidden shadow-sm">
            <div className="p-6 border-b border-[#E8DDD1] flex items-center justify-between">
              <h4 className="text-lg font-bold">Recent Enquiries</h4>
              <Link to="/enquiries" className="text-xs text-[#D4754C] font-medium hover:underline">View all</Link>
            </div>
            {loading ? (
              <div className="p-6 space-y-4">{[1, 2, 3].map((i) => (<div key={i} className="h-12 bg-[#F5EDE4] rounded-lg animate-pulse"></div>))}</div>
            ) : recentMessages.length === 0 ? (
              <div className="p-12 text-center text-[#8B8680] text-sm">No messages yet</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="text-[#8B8680] border-b border-[#E8DDD1] bg-[#F5EDE4]/50">
                      <th className="px-6 py-4 font-semibold text-[11px] uppercase tracking-wider">Name</th>
                      <th className="px-6 py-4 font-semibold text-[11px] uppercase tracking-wider">Message</th>
                      <th className="px-6 py-4 font-semibold text-[11px] uppercase tracking-wider text-right">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E8DDD1]">
                    {recentMessages.map((msg) => (
                      <tr key={msg._id} className="hover:bg-[#F5EDE4]/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-[#D4754C]/10 flex items-center justify-center text-[#D4754C] text-xs font-bold">{getInitials(msg.name)}</div>
                            <div>
                              <p className="font-medium">{msg.name}</p>
                              <p className="text-[10px] text-[#8B8680]">{msg.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4"><p className="text-[#8B8680] truncate max-w-[200px]">{msg.message}</p></td>
                        <td className="px-6 py-4 text-right text-xs text-[#8B8680]">{new Date(msg.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Pending Feedback */}
          <div className="lg:col-span-5 bg-[#FEFBF7] border border-[#E8DDD1] rounded-2xl flex flex-col shadow-sm">
            <div className="p-6 border-b border-[#E8DDD1] flex items-center justify-between">
              <h4 className="text-lg font-bold">Pending Feedback</h4>
              <Link to="/feedback" className="text-xs text-[#D4754C] font-medium hover:underline">View all</Link>
            </div>
            {loading ? (
              <div className="p-6 space-y-4">{[1, 2].map((i) => (<div key={i} className="h-24 bg-[#F5EDE4] rounded-xl animate-pulse"></div>))}</div>
            ) : recentFeedback.length === 0 ? (
              <div className="p-12 text-center text-[#8B8680] text-sm flex-1 flex items-center justify-center">No pending feedback</div>
            ) : (
              <div className="p-6 space-y-4 flex-1 overflow-y-auto custom-scrollbar">
                {recentFeedback.map((fb) => (
                  <div key={fb._id} className="p-4 bg-[#F5EDE4]/40 rounded-xl border border-[#E8DDD1]">
                    <div className="flex justify-between items-start mb-2">
                      <h5 className="text-sm font-bold">{fb.name}</h5>
                      <div className="flex gap-0.5">{[1, 2, 3, 4, 5].map((r) => (<Icon key={r} icon="lucide:star" className={`text-xs ${r <= fb.rating ? 'text-amber-500' : 'text-[#E8DDD1]'}`} />))}</div>
                    </div>
                    <p className="text-xs text-[#8B8680] leading-relaxed line-clamp-2">"{fb.message}"</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-[#FEFBF7] border border-[#E8DDD1] rounded-2xl p-8 shadow-sm">
          <h4 className="text-lg font-bold mb-6">Quick Actions</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link to="/cms" className="p-6 bg-[#F5EDE4]/40 border border-[#E8DDD1] rounded-xl hover:border-[#D4754C] transition-colors group text-center">
              <Icon icon="lucide:plus-circle" className="text-3xl text-[#D4754C] mx-auto mb-3" />
              <h5 className="font-bold text-sm mb-1">Add New Project</h5>
              <p className="text-xs text-[#8B8680]">Upload a project to your portfolio</p>
            </Link>
            <Link to="/feedback" className="p-6 bg-[#F5EDE4]/40 border border-[#E8DDD1] rounded-xl hover:border-[#D4754C] transition-colors group text-center">
              <Icon icon="lucide:star" className="text-3xl text-[#D4754C] mx-auto mb-3" />
              <h5 className="font-bold text-sm mb-1">Manage Feedback</h5>
              <p className="text-xs text-[#8B8680]">Approve testimonials for your site</p>
            </Link>
            <Link to="/enquiries" className="p-6 bg-[#F5EDE4]/40 border border-[#E8DDD1] rounded-xl hover:border-[#D4754C] transition-colors group text-center">
              <Icon icon="lucide:mail" className="text-3xl text-[#D4754C] mx-auto mb-3" />
              <h5 className="font-bold text-sm mb-1">Check Enquiries</h5>
              <p className="text-xs text-[#8B8680]">Read messages from your contact form</p>
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
