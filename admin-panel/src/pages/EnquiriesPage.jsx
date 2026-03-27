import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import TopNavbar from '../components/TopNavbar';
import Footer from '../components/Footer';
import { fetchMessages, deleteMessage } from '../services/api';

export default function EnquiriesPage() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState(null);

  const loadMessages = async () => {
    try { setLoading(true); const data = await fetchMessages(); setMessages(data); }
    catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadMessages(); }, []);

  const handleDelete = async (id) => {
    if (!confirm('Delete this message?')) return;
    try { await deleteMessage(id); await loadMessages(); setShowModal(false); }
    catch (err) { console.error(err); }
  };

  const openDetail = (msg) => { setSelected(msg); setShowModal(true); };

  const getInitials = (name) => name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);

  return (
    <>
      <TopNavbar pageTitle="Enquiries" />
      <div className="p-8 space-y-6 max-w-[1440px] mx-auto w-full">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="card-stat rounded-2xl p-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[11px] font-bold text-[#8B8680] uppercase tracking-widest">Total Messages</p>
              <Icon icon="lucide:mail" className="text-[#D4754C] text-lg" />
            </div>
            <h3 className="text-3xl font-bold text-[#3D3A34]">{messages.length}</h3>
          </div>
          <div className="card-stat rounded-2xl p-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[11px] font-bold text-[#8B8680] uppercase tracking-widest">This Week</p>
              <Icon icon="lucide:calendar" className="text-[#D4754C] text-lg" />
            </div>
            <h3 className="text-3xl font-bold text-[#3D3A34]">
              {messages.filter((m) => { const d = new Date(m.createdAt); const now = new Date(); const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); return d >= weekAgo; }).length}
            </h3>
          </div>
          <div className="card-stat rounded-2xl p-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[11px] font-bold text-[#8B8680] uppercase tracking-widest">Today</p>
              <Icon icon="lucide:clock" className="text-[#D4754C] text-lg" />
            </div>
            <h3 className="text-3xl font-bold text-[#3D3A34]">
              {messages.filter((m) => new Date(m.createdAt).toDateString() === new Date().toDateString()).length}
            </h3>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="bg-[#FEFBF7] border border-[#E8DDD1] rounded-2xl p-8 animate-pulse space-y-4">
            {[1, 2, 3, 4].map((i) => (<div key={i} className="h-12 bg-[#F5EDE4] rounded-lg"></div>))}
          </div>
        ) : messages.length === 0 ? (
          <div className="bg-[#FEFBF7] border border-[#E8DDD1] rounded-2xl p-16 text-center">
            <Icon icon="lucide:inbox" className="text-4xl text-[#E8DDD1] mx-auto mb-4" />
            <h4 className="text-lg font-bold text-[#3D3A34] mb-2">No Messages Yet</h4>
            <p className="text-sm text-[#8B8680]">Contact form submissions from your portfolio will appear here.</p>
          </div>
        ) : (
          <div className="bg-[#FEFBF7] border border-[#E8DDD1] rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-[#F5EDE4]/50 text-[#8B8680] text-[11px] font-bold uppercase tracking-widest">
                    <th className="px-6 py-4">Contact</th>
                    <th className="px-6 py-4">Message</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8DDD1]">
                  {messages.map((msg) => (
                    <tr key={msg._id} className="hover:bg-[#F5EDE4]/30 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-[#D4754C]/10 text-[#D4754C] flex items-center justify-center text-xs font-bold">{getInitials(msg.name)}</div>
                          <div>
                            <p className="font-bold text-[#3D3A34]">{msg.name}</p>
                            <p className="text-[10px] text-[#8B8680]">{msg.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-[#8B8680] truncate max-w-[300px]">{msg.message}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-xs text-[#3D3A34]">{new Date(msg.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                        <p className="text-[10px] text-[#8B8680]">{new Date(msg.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => openDetail(msg)} className="text-xs font-bold text-[#D4754C] hover:underline">View</button>
                          <button onClick={() => handleDelete(msg._id)} className="text-xs font-bold text-[#8B8680] hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showModal && selected && (
        <div className="fixed inset-0 modal-overlay z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="bg-[#FEFBF7] rounded-2xl border border-[#E8DDD1] shadow-2xl w-full max-w-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-[#E8DDD1] flex items-center justify-between">
              <h3 className="text-lg font-bold">Message from {selected.name}</h3>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-[#F5EDE4] rounded-lg"><Icon icon="lucide:x" /></button>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#D4754C]/10 text-[#D4754C] flex items-center justify-center font-bold">{getInitials(selected.name)}</div>
                <div>
                  <p className="font-bold text-[#3D3A34]">{selected.name}</p>
                  <p className="text-xs text-[#8B8680]">{selected.email}</p>
                </div>
              </div>
              <div className="bg-[#F5EDE4] rounded-xl p-6 border border-[#E8DDD1]">
                <p className="text-sm text-[#3D3A34] leading-relaxed whitespace-pre-wrap">{selected.message}</p>
                <p className="text-[10px] text-[#8B8680] mt-4">{new Date(selected.createdAt).toLocaleString()}</p>
              </div>
            </div>
            <div className="p-6 border-t border-[#E8DDD1] flex justify-between">
              <button onClick={() => handleDelete(selected._id)} className="px-5 py-2 border border-red-200 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50">Delete</button>
              <button onClick={() => setShowModal(false)} className="px-5 py-2 border border-[#E8DDD1] rounded-lg text-sm font-medium text-[#8B8680]">Close</button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}
