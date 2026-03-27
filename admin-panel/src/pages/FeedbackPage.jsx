import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import TopNavbar from '../components/TopNavbar';
import Footer from '../components/Footer';
import { fetchFeedback, createFeedback, updateFeedback, deleteFeedback } from '../services/api';

export default function FeedbackPage() {
  const [feedbackList, setFeedbackList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('pending');
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', rating: 5, message: '', designation: '', company: '', image: '' });
  const [saving, setSaving] = useState(false);

  const loadFeedback = async () => {
    try {
      setLoading(true);
      const data = await fetchFeedback();
      setFeedbackList(data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadFeedback(); }, []);

  const filtered = feedbackList.filter((f) => tab === 'pending' ? !f.approved : f.approved);

  const handleApprove = async (id) => {
    try { await updateFeedback(id, { approved: true }); await loadFeedback(); } catch (err) { console.error(err); }
  };

  const handleReject = async (id) => {
    try { await updateFeedback(id, { approved: false }); await loadFeedback(); } catch (err) { console.error(err); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this feedback?')) return;
    try { await deleteFeedback(id); await loadFeedback(); } catch (err) { console.error(err); }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try { await createFeedback(form); setShowAddForm(false); setForm({ name: '', email: '', rating: 5, message: '', designation: '', company: '', image: '' }); await loadFeedback(); }
    catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  const pendingCount = feedbackList.filter((f) => !f.approved).length;
  const approvedCount = feedbackList.filter((f) => f.approved).length;

  return (
    <>
      <TopNavbar pageTitle="Feedback Management" />

      <div className="p-8 space-y-6 max-w-[1440px] mx-auto w-full">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-[#3D3A34]">Client Feedback & Testimonials</h3>
            <p className="text-sm text-[#8B8680]">Manage testimonials for your portfolio. Approved feedback shows on your site.</p>
          </div>
          <button onClick={() => setShowAddForm(true)} className="flex items-center gap-2 px-5 py-2.5 bg-[#D4754C] text-white rounded-xl text-xs font-bold shadow-lg shadow-[#D4754C]/20 hover:bg-[#c26742] transition-all">
            <Icon icon="lucide:plus" /> Add Feedback
          </button>
        </div>

        {/* Add Form */}
        {showAddForm && (
          <div className="bg-[#FEFBF7] border border-[#E8DDD1] rounded-2xl p-8 shadow-sm">
            <h4 className="text-md font-bold mb-6 flex items-center gap-2"><Icon icon="lucide:message-square" className="text-[#D4754C]" /> Add Feedback Manually</h4>
            <form onSubmit={handleAddSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div><label className="text-xs font-bold text-[#8B8680] uppercase tracking-wider mb-1.5 block">Name *</label><input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="input-field" placeholder="Client name" /></div>
                <div><label className="text-xs font-bold text-[#8B8680] uppercase tracking-wider mb-1.5 block">Email</label><input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input-field" placeholder="client@email.com" /></div>
                <div><label className="text-xs font-bold text-[#8B8680] uppercase tracking-wider mb-1.5 block">Rating *</label>
                  <div className="flex gap-1 mt-2">{[1, 2, 3, 4, 5].map((r) => (<button type="button" key={r} onClick={() => setForm({ ...form, rating: r })} className="p-1"><Icon icon="lucide:star" className={`text-xl ${r <= form.rating ? 'text-amber-500' : 'text-[#E8DDD1]'}`} /></button>))}</div>
                </div>
              </div>
              <div><label className="text-xs font-bold text-[#8B8680] uppercase tracking-wider mb-1.5 block">Message *</label><textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required rows="3" className="input-field" placeholder="What did the client say?" /></div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div><label className="text-xs font-bold text-[#8B8680] uppercase tracking-wider mb-1.5 block">Designation</label><input type="text" value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })} className="input-field" placeholder="e.g. CEO, CTO" /></div>
                <div><label className="text-xs font-bold text-[#8B8680] uppercase tracking-wider mb-1.5 block">Company</label><input type="text" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} className="input-field" placeholder="e.g. Acme Co" /></div>
                <div><label className="text-xs font-bold text-[#8B8680] uppercase tracking-wider mb-1.5 block">Photo URL</label><input type="text" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} className="input-field" placeholder="https://..." /></div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-[#E8DDD1]">
                <button type="button" onClick={() => setShowAddForm(false)} className="px-5 py-2 border border-[#E8DDD1] rounded-lg text-sm font-medium text-[#8B8680]">Cancel</button>
                <button type="submit" disabled={saving} className="px-6 py-2 bg-[#D4754C] rounded-lg text-sm font-bold text-white hover:bg-[#c26742] disabled:opacity-50">{saving ? 'Adding...' : 'Add Feedback'}</button>
              </div>
            </form>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-8 border-b border-[#E8DDD1]">
          <button onClick={() => setTab('pending')} className={`pb-4 px-1 text-sm font-medium flex items-center gap-2 ${tab === 'pending' ? 'tab-active font-bold' : 'text-[#8B8680] hover:text-[#3D3A34]'}`}>
            Pending Approval <span className="bg-[#D4754C]/10 text-[#D4754C] text-[10px] px-1.5 py-0.5 rounded-full">{pendingCount}</span>
          </button>
          <button onClick={() => setTab('approved')} className={`pb-4 px-1 text-sm font-medium flex items-center gap-2 ${tab === 'approved' ? 'tab-active font-bold' : 'text-[#8B8680] hover:text-[#3D3A34]'}`}>
            Approved <span className="bg-emerald-500/10 text-emerald-600 text-[10px] px-1.5 py-0.5 rounded-full">{approvedCount}</span>
          </button>
        </div>

        {/* Cards */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (<div key={i} className="bg-[#FEFBF7] border border-[#E8DDD1] rounded-2xl p-6 animate-pulse"><div className="h-4 bg-[#F5EDE4] rounded w-1/2 mb-3"></div><div className="h-3 bg-[#F5EDE4] rounded w-full mb-2"></div><div className="h-3 bg-[#F5EDE4] rounded w-3/4"></div></div>))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-[#FEFBF7] border border-[#E8DDD1] rounded-2xl p-16 text-center">
            <Icon icon="lucide:message-square" className="text-4xl text-[#E8DDD1] mx-auto mb-4" />
            <h4 className="text-lg font-bold text-[#3D3A34] mb-2">No {tab === 'pending' ? 'Pending' : 'Approved'} Feedback</h4>
            <p className="text-sm text-[#8B8680]">{tab === 'pending' ? 'All caught up!' : 'Approve some feedback to show on your portfolio.'}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filtered.map((fb) => (
              <div key={fb._id} className="bg-[#FEFBF7] border border-[#E8DDD1] rounded-2xl p-6 card-hover group">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#D4754C]/10 flex items-center justify-center text-[#D4754C] text-sm font-bold">
                      {fb.name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)}
                    </div>
                    <div>
                      <h5 className="text-sm font-bold text-[#3D3A34]">{fb.name}</h5>
                      {(fb.designation || fb.company) && <p className="text-[11px] text-[#8B8680]">{fb.designation}{fb.designation && fb.company ? ' at ' : ''}{fb.company}</p>}
                    </div>
                  </div>
                  <span className="text-[10px] text-[#8B8680]">{new Date(fb.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex gap-0.5 mb-3">
                  {[1, 2, 3, 4, 5].map((r) => (<Icon key={r} icon="lucide:star" className={`text-sm ${r <= fb.rating ? 'text-amber-500' : 'text-[#E8DDD1]'}`} />))}
                </div>
                <p className="text-xs text-[#8B8680] leading-relaxed mb-6 line-clamp-3">"{fb.message}"</p>
                <div className="flex items-center justify-between pt-4 border-t border-[#E8DDD1]">
                  {!fb.approved ? (
                    <button onClick={() => handleApprove(fb._id)} className="text-[11px] font-bold text-[#D4754C] uppercase tracking-wider hover:underline">Approve</button>
                  ) : (
                    <button onClick={() => handleReject(fb._id)} className="text-[11px] font-bold text-amber-600 uppercase tracking-wider hover:underline">Unapprove</button>
                  )}
                  <button onClick={() => handleDelete(fb._id)} className="text-[11px] font-bold text-[#8B8680] uppercase tracking-wider hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </>
  );
}
