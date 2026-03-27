import { useState, useEffect, useRef } from 'react';
import { Icon } from '@iconify/react';
import TopNavbar from '../components/TopNavbar';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import * as toast from '../utils/toast';

export default function VisualEditor() {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState('saved'); 
  const [scannedElements, setScannedElements] = useState([]);
  const [editedValues, setEditedValues] = useState({});
  const [previewMode, setPreviewMode] = useState('desktop'); // 'desktop' or 'mobile'
  const iframeRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const { data } = await api.get('/admin/visual-editor/config');
      if (!data.domain) {
        navigate('/integration'); 
        return;
      }
      setConfig(data);
      if (data.contentEdits) {
        setEditedValues(data.contentEdits);
      }
    } catch (err) {
      toast.showError("Failed to fetch config");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleMessage = (event) => {
      const data = event.data;
      
      if (data.type === 'DOM_SCANNED') {
        // Group and format elements identified in the external site
        setScannedElements(data.elements);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleIframeLoad = () => {
    if (iframeRef.current && config?.contentEdits) {
      iframeRef.current.contentWindow.postMessage({
        type: 'LOAD_DRAFTS',
        edits: config.contentEdits
      }, "*");
    }
  };

  // When a user types into the left sidebar form
  const handleInputChange = (selector, newValue) => {
    // 1. Update React Local State
    setEditedValues(prev => ({ ...prev, [selector]: newValue }));
    
    // 2. Transmit instantly to iframe for live preview
    if (iframeRef.current) {
      iframeRef.current.contentWindow.postMessage({
        type: 'LIVE_UPDATE',
        selector,
        value: newValue
      }, "*");
    }

    // 3. Debounce Auto-save to Database
    triggerAutoSave(selector, newValue);
  };

  const autoSaveTimer = useRef(null);
  const triggerAutoSave = (selector, value) => {
    setSaveStatus('saving');
    clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(async () => {
      try {
        await api.post('/admin/visual-editor/edits', {
          edits: { [selector]: value }
        });
        setSaveStatus('saved');
      } catch (err) {
        setSaveStatus('error');
      }
    }, 1000); // 1-second debounce before hitting DB
  };

  if (loading) return null;

  return (
    <div className="h-screen flex flex-col hidden-scrollbar overflow-hidden">
      <TopNavbar pageTitle="Control Center" />
      
      {/* Editor Toolbar */}
      <div className="bg-[#FEFBF7] border-b border-[#E8DDD1] px-6 py-3 flex items-center justify-between z-10 shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#F5EDE4] rounded-lg">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#8B8680]">Live Connection</span>
          </div>
          <span className="text-sm font-medium text-[#3D3A34]">{config.domain}</span>
        </div>

        <div className="flex items-center gap-4">
          {saveStatus === 'saving' && <span className="text-xs text-[#8B8680] flex items-center gap-2"><Icon icon="lucide:loader-2" className="animate-spin" /> Auto-saving...</span>}
          {saveStatus === 'saved' && <span className="text-xs text-emerald-600 flex items-center gap-1"><Icon icon="lucide:check" /> Saved internally</span>}
          {saveStatus === 'error' && <span className="text-xs text-red-600">Failed to save</span>}
          
          <button className="bg-[#3D3A34] text-white px-6 py-2 rounded-lg text-xs font-bold shadow-lg hover:bg-black transition-colors">
            Publish Changes
          </button>
        </div>
      </div>

      {/* Main Workspace (Split Pane) */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Panel: Auto-Generated Content Forms */}
        <div className="w-96 bg-white border-r border-[#E8DDD1] flex flex-col h-full shrink-0">
          <div className="p-6 border-b border-[#E8DDD1] bg-[#FEFBF7]">
            <h2 className="text-lg font-bold text-[#3D3A34]">Site Content</h2>
            <p className="text-[#8B8680] text-xs mt-1">Found {scannedElements.length} editable blocks</p>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 space-y-8 hidden-scrollbar">
            {scannedElements.length === 0 ? (
              <div className="text-center text-[#8B8680] mt-10">
                <Icon icon="lucide:scan" className="text-3xl mx-auto mb-3 opacity-50" />
                <p className="text-sm">Scanning your website layout...</p>
              </div>
            ) : (
              scannedElements.map((el, index) => {
                const isHeading = ['h1', 'h2', 'h3'].includes(el.tag);
                const isImg = el.tag === 'img';
                const currentVal = editedValues[el.selector] !== undefined ? editedValues[el.selector] : el.value;

                return (
                  <div key={index} className="bg-[#FEFBF7] border border-[#E8DDD1] p-4 rounded-xl shadow-sm transition-all focus-within:border-[#D4754C] focus-within:ring-1 focus-within:ring-[#D4754C]">
                    <div className="flex justify-between items-center mb-3">
                      <label className="text-[10px] font-bold text-[#3D3A34] uppercase tracking-widest flex items-center gap-2">
                        <Icon icon={isImg ? "lucide:image" : (isHeading ? "lucide:heading" : "lucide:type")} className="text-[#D4754C]" />
                        {el.tag} Block
                      </label>
                      <span className="text-[9px] text-[#8B8680] font-mono truncate max-w-[120px]" title={el.selector}>
                        {el.selector.split('>').pop().trim()}
                      </span>
                    </div>
                    
                    {isImg ? (
                      <div className="space-y-3">
                        <img src={currentVal} alt="Preview" className="w-full h-24 object-cover rounded-lg border border-[#E8DDD1]" />
                        <input 
                          type="url"
                          value={currentVal}
                          onChange={(e) => handleInputChange(el.selector, e.target.value)}
                          className="w-full bg-white border border-[#E8DDD1] rounded-lg px-3 py-2 text-xs text-[#3D3A34] outline-none"
                          placeholder="Paste image URL here"
                        />
                      </div>
                    ) : (
                      <textarea
                        value={currentVal}
                        onChange={(e) => handleInputChange(el.selector, e.target.value)}
                        className={`w-full bg-transparent resize-none outline-none text-[#3D3A34] ${isHeading ? 'text-lg font-bold' : 'text-sm'} leading-relaxed min-h-[60px]`}
                        placeholder="Enter text..."
                      />
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Panel: Live Iframe Preview */}
        <div className="flex-1 bg-[#F5EDE4]/50 p-6 flex flex-col relative overflow-hidden hidden-scrollbar">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-[#3D3A34]">Live Preview</h3>
            <div className="flex gap-2 bg-[#E8DDD1]/50 p-1 rounded-lg">
              <button 
                onClick={() => setPreviewMode('desktop')}
                className={`w-8 h-8 rounded-md flex items-center justify-center transition-colors ${previewMode === 'desktop' ? 'bg-white shadow-sm text-[#D4754C]' : 'text-[#8B8680] hover:text-[#3D3A34]'}`}
              >
                <Icon icon="lucide:monitor" className="text-sm" />
              </button>
              <button 
                onClick={() => setPreviewMode('mobile')}
                className={`w-8 h-8 rounded-md flex items-center justify-center transition-colors ${previewMode === 'mobile' ? 'bg-white shadow-sm text-[#D4754C]' : 'text-[#8B8680] hover:text-[#3D3A34]'}`}
              >
                <Icon icon="lucide:smartphone" className="text-sm" />
              </button>
            </div>
          </div>
          
          <div className="flex-1 flex justify-center items-center overflow-auto hidden-scrollbar pb-8">
            <div 
              style={{
                width: previewMode === 'desktop' ? '100%' : '375px',
                height: previewMode === 'desktop' ? '100%' : '812px',
                maxHeight: previewMode === 'desktop' ? '100%' : '90%'
              }}
              className={`bg-white rounded-2xl shadow-2xl overflow-hidden border-4 border-[#E8DDD1] transition-all duration-300 ease-in-out ${previewMode === 'mobile' ? 'rounded-[2rem] border-8 border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.1)]' : ''}`}
            >
              <iframe 
                ref={iframeRef}
                src={config.domain} 
                title="Visual Editor Preview"
                className="w-full h-full border-none"
                onLoad={handleIframeLoad}
                sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
