import { useState } from 'react';
import { Icon } from '@iconify/react';
import TopNavbar from '../components/TopNavbar';
import Footer from '../components/Footer';

const tabs = ['General', 'Security', 'Notifications', 'Billing', 'Integrations'];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('General');

  return (
    <>
      <TopNavbar pageTitle="Settings" />

      <div className="p-8 space-y-8 max-w-[1440px] mx-auto w-full">
        {/* Tabs */}
        <div className="flex gap-6 border-b border-[#E8DDD1]">
          {tabs.map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`pb-4 px-1 text-sm font-medium transition-colors ${activeTab === tab ? 'tab-active' : 'text-[#8B8680] hover:text-[#3D3A34]'}`}>{tab}</button>
          ))}
        </div>

        {activeTab === 'General' && <GeneralTab />}
        {activeTab === 'Security' && <SecurityTab />}
        {activeTab === 'Notifications' && <NotificationsTab />}
        {activeTab === 'Billing' && <BillingTab />}
        {activeTab === 'Integrations' && <IntegrationsTab />}
      </div>

      <Footer />
    </>
  );
}

function GeneralTab() {
  return (
    <div className="space-y-8">
      {/* Profile Section */}
      <div className="bg-[#FEFBF7] border border-[#E8DDD1] rounded-2xl p-8 shadow-sm">
        <h3 className="text-md font-bold mb-6 flex items-center gap-2"><Icon icon="lucide:user" className="text-[#D4754C]" /> Profile Information</h3>
        <div className="flex items-center gap-6 mb-8">
          <div className="w-20 h-20 rounded-full border-2 border-[#E8DDD1] overflow-hidden"><img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Julian&backgroundColor=f5ede4" alt="Profile" className="w-full h-full object-cover bg-[#F5EDE4]" /></div>
          <div><button className="px-4 py-2 bg-[#D4754C] text-white text-xs font-bold rounded-lg hover:bg-[#c26742] transition-colors">Change Photo</button><p className="text-[10px] text-[#8B8680] mt-2">JPG, PNG. Max 2MB</p></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div><label className="text-xs font-bold text-[#8B8680] uppercase tracking-wider mb-1.5 block">Full Name</label><input type="text" defaultValue="Julian Vesta" className="input-field" /></div>
          <div><label className="text-xs font-bold text-[#8B8680] uppercase tracking-wider mb-1.5 block">Email Address</label><input type="email" defaultValue="julian@swcp.io" className="input-field" /></div>
          <div><label className="text-xs font-bold text-[#8B8680] uppercase tracking-wider mb-1.5 block">Role</label><input type="text" defaultValue="Account Admin" className="input-field" readOnly /></div>
          <div><label className="text-xs font-bold text-[#8B8680] uppercase tracking-wider mb-1.5 block">Phone</label><input type="text" defaultValue="+1 (555) 123-4567" className="input-field" /></div>
        </div>
      </div>

      {/* Site Configuration */}
      <div className="bg-[#FEFBF7] border border-[#E8DDD1] rounded-2xl p-8 shadow-sm">
        <h3 className="text-md font-bold mb-6 flex items-center gap-2"><Icon icon="lucide:globe" className="text-[#D4754C]" /> Site Configuration</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div><label className="text-xs font-bold text-[#8B8680] uppercase tracking-wider mb-1.5 block">Site Name</label><input type="text" defaultValue="My SWCP Portal" className="input-field" /></div>
          <div><label className="text-xs font-bold text-[#8B8680] uppercase tracking-wider mb-1.5 block">Domain</label><input type="text" defaultValue="swcp.io" className="input-field" /></div>
          <div><label className="text-xs font-bold text-[#8B8680] uppercase tracking-wider mb-1.5 block">Timezone</label>
            <select className="input-field"><option>UTC (Coordinated Universal Time)</option><option>EST (Eastern Standard Time)</option><option>PST (Pacific Standard Time)</option></select>
          </div>
          <div><label className="text-xs font-bold text-[#8B8680] uppercase tracking-wider mb-1.5 block">Language</label>
            <select className="input-field"><option>English (US)</option><option>Spanish</option><option>French</option></select>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <button className="px-6 py-2.5 border border-[#E8DDD1] rounded-lg text-sm font-medium text-[#8B8680] hover:text-[#3D3A34] transition-colors">Cancel</button>
        <button className="px-6 py-2.5 bg-[#D4754C] rounded-lg text-sm font-bold text-white hover:bg-[#c26742] transition-all shadow-lg shadow-[#D4754C]/10">Save Changes</button>
      </div>
    </div>
  );
}

function SecurityTab() {
  return (
    <div className="space-y-8">
      <div className="bg-[#FEFBF7] border border-[#E8DDD1] rounded-2xl p-8 shadow-sm">
        <h3 className="text-md font-bold mb-6 flex items-center gap-2"><Icon icon="lucide:lock" className="text-[#D4754C]" /> Password & Security</h3>
        <div className="space-y-6">
          <div><label className="text-xs font-bold text-[#8B8680] uppercase tracking-wider mb-1.5 block">Current Password</label><input type="password" className="input-field" placeholder="Enter current password" /></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div><label className="text-xs font-bold text-[#8B8680] uppercase tracking-wider mb-1.5 block">New Password</label><input type="password" className="input-field" placeholder="Enter new password" /></div>
            <div><label className="text-xs font-bold text-[#8B8680] uppercase tracking-wider mb-1.5 block">Confirm Password</label><input type="password" className="input-field" placeholder="Confirm new password" /></div>
          </div>
        </div>
      </div>
      <div className="bg-[#FEFBF7] border border-[#E8DDD1] rounded-2xl p-8 shadow-sm">
        <h3 className="text-md font-bold mb-6 flex items-center gap-2"><Icon icon="lucide:shield" className="text-[#D4754C]" /> Two-Factor Authentication</h3>
        <div className="flex items-center justify-between p-4 bg-[#F5EDE4] rounded-xl border border-[#E8DDD1]">
          <div><p className="text-sm font-bold text-[#3D3A34]">Enable 2FA</p><p className="text-xs text-[#8B8680]">Add an extra layer of security to your account</p></div>
          <button className="w-10 h-5 bg-[#E8DDD1] rounded-full relative transition-colors"><div className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full shadow-sm"></div></button>
        </div>
      </div>
      <div className="flex justify-end gap-3">
        <button className="px-6 py-2.5 border border-[#E8DDD1] rounded-lg text-sm font-medium text-[#8B8680]">Cancel</button>
        <button className="px-6 py-2.5 bg-[#D4754C] rounded-lg text-sm font-bold text-white hover:bg-[#c26742] transition-all">Update Security</button>
      </div>
    </div>
  );
}

function NotificationsTab() {
  const items = [
    { label: 'New Enquiry Alerts', desc: 'Get notified when a new enquiry is received', active: true },
    { label: 'Feedback Notifications', desc: 'Receive alerts for new feedback submissions', active: true },
    { label: 'Weekly Analytics Report', desc: 'Receive a summary of your weekly performance', active: false },
    { label: 'Security Alerts', desc: 'Get notified about suspicious login attempts', active: true },
    { label: 'System Updates', desc: 'Notifications about platform updates and maintenance', active: false },
  ];
  return (
    <div className="bg-[#FEFBF7] border border-[#E8DDD1] rounded-2xl p-8 shadow-sm">
      <h3 className="text-md font-bold mb-6 flex items-center gap-2"><Icon icon="lucide:bell" className="text-[#D4754C]" /> Notification Preferences</h3>
      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.label} className="flex items-center justify-between p-4 bg-[#F5EDE4]/50 rounded-xl border border-[#E8DDD1]">
            <div><p className="text-sm font-bold text-[#3D3A34]">{item.label}</p><p className="text-xs text-[#8B8680]">{item.desc}</p></div>
            <button className={`w-10 h-5 ${item.active ? 'bg-[#D4754C]' : 'bg-[#E8DDD1]'} rounded-full relative transition-colors`}>
              <div className={`absolute ${item.active ? 'right-1' : 'left-1'} top-1 w-3 h-3 bg-white rounded-full shadow-sm`}></div>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function BillingTab() {
  return (
    <div className="space-y-8">
      <div className="bg-[#FEFBF7] border border-[#E8DDD1] rounded-2xl p-8 shadow-sm">
        <h3 className="text-md font-bold mb-6 flex items-center gap-2"><Icon icon="lucide:credit-card" className="text-[#D4754C]" /> Current Plan</h3>
        <div className="flex items-center justify-between p-6 bg-[#F5EDE4] rounded-xl border border-[#E8DDD1]">
          <div>
            <p className="text-xs text-[#8B8680] uppercase tracking-widest font-bold mb-1">Active Plan</p>
            <p className="text-2xl font-bold text-[#3D3A34]">Enterprise</p>
            <p className="text-sm text-[#8B8680]">$299/month • Renews Oct 30, 2024</p>
          </div>
          <button className="px-5 py-2.5 bg-[#D4754C] text-white text-xs font-bold rounded-lg hover:bg-[#c26742] transition-colors">Upgrade Plan</button>
        </div>
      </div>
      <div className="bg-[#FEFBF7] border border-[#E8DDD1] rounded-2xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-[#E8DDD1]"><h3 className="text-md font-bold flex items-center gap-2"><Icon icon="lucide:receipt" className="text-[#D4754C]" /> Billing History</h3></div>
        <table className="w-full text-left text-sm">
          <thead><tr className="bg-[#F5EDE4]/50 text-[#8B8680] text-[11px] font-bold uppercase tracking-widest"><th className="px-6 py-4">Date</th><th className="px-6 py-4">Description</th><th className="px-6 py-4">Amount</th><th className="px-6 py-4 text-right">Status</th></tr></thead>
          <tbody className="divide-y divide-[#E8DDD1]">
            {[
              { date: 'Sep 30, 2024', desc: 'Enterprise Plan - Monthly', amount: '$299.00', status: 'Paid' },
              { date: 'Aug 30, 2024', desc: 'Enterprise Plan - Monthly', amount: '$299.00', status: 'Paid' },
              { date: 'Jul 30, 2024', desc: 'Enterprise Plan - Monthly', amount: '$299.00', status: 'Paid' },
            ].map((b, i) => (
              <tr key={i} className="hover:bg-[#F5EDE4]/30">
                <td className="px-6 py-4 text-[#3D3A34]">{b.date}</td>
                <td className="px-6 py-4">{b.desc}</td>
                <td className="px-6 py-4 font-bold">{b.amount}</td>
                <td className="px-6 py-4 text-right"><span className="bg-emerald-50 text-emerald-600 text-[10px] font-bold px-2 py-1 rounded">{b.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function IntegrationsTab() {
  const integrations = [
    { name: 'Google Analytics', desc: 'Track website traffic and user behavior', icon: 'lucide:bar-chart-3', connected: true },
    { name: 'Slack', desc: 'Get notifications in your Slack workspace', icon: 'lucide:message-circle', connected: true },
    { name: 'Mailchimp', desc: 'Sync email subscribers and campaigns', icon: 'lucide:mail', connected: false },
    { name: 'Zapier', desc: 'Connect with 5,000+ apps', icon: 'lucide:zap', connected: false },
  ];
  return (
    <div className="bg-[#FEFBF7] border border-[#E8DDD1] rounded-2xl p-8 shadow-sm">
      <h3 className="text-md font-bold mb-6 flex items-center gap-2"><Icon icon="lucide:puzzle" className="text-[#D4754C]" /> Connected Services</h3>
      <div className="space-y-4">
        {integrations.map((item) => (
          <div key={item.name} className="flex items-center justify-between p-4 bg-[#F5EDE4]/50 rounded-xl border border-[#E8DDD1]">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-white border border-[#E8DDD1] flex items-center justify-center text-[#D4754C]"><Icon icon={item.icon} className="text-xl" /></div>
              <div><p className="text-sm font-bold text-[#3D3A34]">{item.name}</p><p className="text-xs text-[#8B8680]">{item.desc}</p></div>
            </div>
            <button className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors ${item.connected ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-[#D4754C] text-white hover:bg-[#c26742]'}`}>
              {item.connected ? 'Connected' : 'Connect'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
