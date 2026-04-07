import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import TopNavbar from '../components/TopNavbar';
import api from '../services/api';
import * as toast from '../utils/toast';

export default function IntegrationSetup() {
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState(null);
  const [domain, setDomain] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const { data } = await api.get('/admin/visual-editor/config');
      setConfig(data);
      if (data.domain) setDomain(data.domain);
    } catch (err) {
      toast.showError("Failed to fetch integration settings");
    } finally {
      setLoading(false);
    }
  };

  const saveDomain = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.put('/admin/visual-editor/domain', { domain });
      setConfig(data);
      toast.showSuccess("Domain linked successfully");
    } catch (err) {
      toast.showError("Failed to save domain");
    } finally {
      setSaving(false);
    }
  };

  const getBackendBase = () => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    return apiUrl.replace('/api', '');
  };

  const copyScript = () => {
    if (!config?.user) return;
    const scriptTag = `<script src="${getBackendBase()}/sdk.js" data-user-id="${config.user}"></script>`;
    navigator.clipboard.writeText(scriptTag);
    toast.showSuccess("Code copied to clipboard!");
  };

  if (loading) return null;

  return (
    <>
      <TopNavbar pageTitle="Website Integration" />
      <div className="p-8 max-w-4xl mx-auto w-full">
        <div className="bg-[#FEFBF7] border border-[#E8DDD1] rounded-2xl p-8 mb-8">
          <h2 className="text-2xl font-bold mb-2">Connect Your Website</h2>
          <p className="text-[#8B8680] text-sm mb-8">
            Link your external website to our Visual Edit SDK. Enter the base URL of the site you want to edit.
          </p>

          <form onSubmit={saveDomain} className="flex gap-4">
            <input 
              type="url" 
              required
              placeholder="https://mywebsite.com"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              className="flex-1 bg-white border border-[#E8DDD1] rounded-xl px-4 py-3 placeholder:text-[#8B8680]/50 outline-none focus:border-[#D4754C]"
            />
            <button 
              type="submit" 
              disabled={saving}
              className="bg-[#D4754C] text-white px-8 py-3 rounded-xl font-bold uppercase tracking-wider text-xs shadow-lg hover:bg-[#c26742] transition-colors"
            >
              {saving ? 'Saving...' : 'Link Domain'}
            </button>
          </form>
        </div>

        {config?.domain && (
          <div className="bg-[#FEFBF7] border border-[#E8DDD1] rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                <Icon icon="lucide:check" className="text-emerald-600 text-xl" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Domain Registered</h3>
                <p className="text-sm font-medium text-emerald-600">{config.domain}</p>
              </div>
            </div>

            <h4 className="font-bold text-sm mb-4 uppercase tracking-widest text-[#8B8680]">Installation Script</h4>
            <div className="bg-[#2D2A26] p-6 rounded-xl relative group">
              <code className="text-[#E8DDD1] text-sm font-mono break-all">
                &lt;script src="{getBackendBase()}/sdk.js" data-user-id="{config.user}"&gt;&lt;/script&gt;
              </code>
              <button 
                onClick={copyScript}
                className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white p-2 rounded-lg transition-colors"
              >
                <Icon icon="lucide:copy" className="text-lg" />
              </button>
            </div>
            <p className="text-[#8B8680] text-xs mt-4">
              Paste this snippet inside the <code>&lt;head&gt;</code> or right before the closing <code>&lt;/body&gt;</code> tag of your website. Once installed, you can go to the Visual Editor to start making live changes.
            </p>
          </div>
        )}
      </div>
    </>
  );
}
