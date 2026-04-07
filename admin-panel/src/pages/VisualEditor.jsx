import { useState, useEffect, useRef } from 'react';
import { Icon } from '@iconify/react';
import { HexColorPicker } from "react-colorful";
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
  const [expandedSections, setExpandedSections] = useState({});
  const [interactionMode, setInteractionMode] = useState('select'); // 'navigate' or 'select'
  const [activePicker, setActivePicker] = useState(null); // Track open color picker
  const iframeRef = useRef(null);
  const isScanLocked = useRef(false); // FIX 4: Block scan updates while user typing
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
        console.log("[Admin Panel] Received fresh DOM scan:", data.elements.length, "elements");
        // FIX 4: Smart merge — don't replace if scan locked (user is typing)
        // or if incoming list is suspiciously small (likely a mid-React-render scan)
        if (isScanLocked.current) {
          console.warn('[Admin Panel] Scan locked (user is typing), ignoring scan result.');
          return;
        }
        setScannedElements(prev => {
          if (prev.length > 5 && data.elements.length < prev.length * 0.5) {
            console.warn('[Admin Panel] Ignoring suspicious scan (too few elements, likely mid-render).');
            return prev;
          }
          return data.elements;
        });
      }

      if (data.type === 'ELEMENT_CLICKED') {
        console.log("[Admin Panel] Element clicked in preview:", data.cmsId, data.selector);
        setScannedElements(prevElements => {
          // Try to find by cmsId first (precise), then by selector (fallback)
          const clickedEl = prevElements.find(el => (data.cmsId && el.cmsId === data.cmsId) || el.selector === data.selector);
          
          if (clickedEl) {
            const section = clickedEl.section || 'General Content';
            console.log("[Admin Panel] Opening section:", section);
            setExpandedSections(prev => ({ ...prev, [section]: true }));
            
            // FIX 5: Increased timeout for stable render before scrolling
            setTimeout(() => {
              const elementIdIdentifier = clickedEl.cmsId || btoa(clickedEl.selector).replace(/=/g, '');
              const id = `input-${elementIdIdentifier}`;
              const inputNode = document.getElementById(id);
              if (inputNode) {
                inputNode.scrollIntoView({ behavior: 'smooth', block: 'center' });
                inputNode.focus();
                inputNode.parentElement.style.boxShadow = '0 0 0 2px #C5916E';
                setTimeout(() => { if(inputNode.parentElement) inputNode.parentElement.style.boxShadow = ''; }, 1500);
              } else {
                console.warn("[Admin Panel] Could not find input field with ID:", id);
              }
            }, 300); // FIX 5: was 150ms, now 300ms for stable render
          } else {
            console.warn("[Admin Panel] Clicked element not found in current scanned list. Try 'Force Rescan'.");
          }
          return prevElements;
        });
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleIframeLoad = () => {
    if (iframeRef.current) {
      // Always trigger initial scan + load drafts on iframe load
      iframeRef.current.contentWindow.postMessage({
        type: 'LOAD_DRAFTS',
        edits: config?.contentEdits || {},
        forceRescan: true
      }, "*");
      iframeRef.current.contentWindow.postMessage({
        type: 'SET_INTERACTION_MODE',
        mode: interactionMode
      }, "*");
    }
  };

  useEffect(() => {
    if (iframeRef.current) {
      iframeRef.current.contentWindow.postMessage({
        type: 'SET_INTERACTION_MODE',
        mode: interactionMode
      }, "*");
    }
  }, [interactionMode]);

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

    // 3. Debounce Auto-save to Drafts
    triggerAutoSave(selector, newValue);
  };

  const autoSaveTimer = useRef(null);
  const triggerAutoSave = (selector, value) => {
    setSaveStatus('saving');
    // FIX 4: Lock scan while user is actively typing
    isScanLocked.current = true;
    clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(async () => {
      try {
        await api.post('/admin/visual-editor/drafts', {
          edits: { [selector]: value }
        });
        setSaveStatus('saved');
      } catch (err) {
        setSaveStatus('error');
      } finally {
        // FIX 4: Unlock scan after save completes
        isScanLocked.current = false;
      }
    }, 1000); // 1-second debounce before hitting DB
  };

  const handlePublish = async () => {
    try {
      setSaveStatus('saving');
      await api.post('/admin/visual-editor/publish', {});
      setSaveStatus('saved');
      toast.showSuccess('Changes are now live!');
      fetchConfig(); // Reload to get fresh history
    } catch (err) {
      setSaveStatus('error');
      toast.showError('Failed to publish');
    }
  };

  const [showHistory, setShowHistory] = useState(false);
  const handleRestore = async (index) => {
    try {
      await api.post(`/admin/visual-editor/restore/${index}`, {});
      toast.showSuccess('Version restored! Refreshing...');
      setShowHistory(false);
      fetchConfig(); // Reload config with restored edits
      // Force iframe to reload with new edits
      if (iframeRef.current) {
        iframeRef.current.contentWindow.postMessage({ type: 'LOAD_DRAFTS', forceRescan: true }, "*");
      }
    } catch (err) {
      toast.showError('Failed to restore version');
    }
  };

  const toggleSection = (sectionName) => {
    setExpandedSections(prev => ({ ...prev, [sectionName]: !prev[sectionName] }));
  };

  const groupedElements = scannedElements.reduce((acc, el) => {
    const sec = el.section || 'General Content';
    if (!acc[sec]) acc[sec] = [];
    acc[sec].push(el);
    return acc;
  }, {});

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
          <button 
            onClick={() => {
              if (iframeRef.current) {
                iframeRef.current.contentWindow.postMessage({ type: 'LOAD_DRAFTS', forceRescan: true }, "*");
                toast.showInfo("Scanning for new elements...");
              }
            }}
            className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-[#8B8680] hover:text-[#D4754C] transition-colors ml-4"
          >
            <Icon icon="lucide:refresh-cw" className="text-sm" />
            Force Rescan
          </button>

          <button 
            onClick={() => setShowHistory(true)}
            className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-[#8B8680] hover:text-[#D4754C] transition-colors ml-4"
          >
            <Icon icon="lucide:history" className="text-sm" />
            History
          </button>
        </div>

        <div className="flex items-center gap-4">
          {saveStatus === 'saving' && <span className="text-xs text-[#8B8680] flex items-center gap-2"><Icon icon="lucide:loader-2" className="animate-spin" /> Saving draft...</span>}
          {saveStatus === 'saved' && <span className="text-xs text-emerald-600 flex items-center gap-1"><Icon icon="lucide:check" /> Draft saved</span>}
          {saveStatus === 'error' && <span className="text-xs text-red-600">Failed to save</span>}
          
          <button 
            onClick={handlePublish}
            className="bg-[#3D3A34] text-white px-6 py-2 rounded-lg text-xs font-bold shadow-lg hover:bg-black transition-colors"
          >
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
              Object.keys(groupedElements).map((sectionName) => (
                <div key={sectionName} className="mb-6 animate-fade-in">
                  {/* Accordion Header */}
                  <div 
                    onClick={() => toggleSection(sectionName)}
                    className="flex justify-between items-center bg-[#F5EDE4] border border-[#E8DDD1] p-3 rounded-lg cursor-pointer hover:bg-[#E8DDD1]/80 transition-colors mb-4"
                  >
                    <h3 className="text-xs font-bold text-[#3D3A34] uppercase tracking-wider flex items-center gap-2">
                       <Icon icon="lucide:layout" className="text-[#D4754C] text-sm" />
                       {sectionName}
                    </h3>
                    <Icon 
                      icon={expandedSections[sectionName] ? "lucide:chevron-up" : "lucide:chevron-down"} 
                      className="text-[#8B8680]" 
                    />
                  </div>

                  {/* Accordion Content */}
                  {expandedSections[sectionName] && (
                    <div className="space-y-4 pl-1 border-l-2 border-[#E8DDD1]/50 ml-3">
                      {groupedElements[sectionName].map((el) => {
                        const isHeading = ['h1', 'h2', 'h3'].includes(el.tag);
                        const isImg = el.tag === 'img';
                        const isLink = el.tag === 'a';
                        
                        const currentVal = editedValues[el.selector] !== undefined ? editedValues[el.selector] : el.value;
                        const currentHref = editedValues[el.selector + '##href'] !== undefined ? editedValues[el.selector + '##href'] : el.href;

                        return (
                          <div key={el.selector} className="bg-[#FEFBF7] border border-[#E8DDD1] p-4 rounded-xl shadow-sm transition-all focus-within:border-[#D4754C] focus-within:ring-1 focus-within:ring-[#D4754C]">
                            <div className="flex justify-between items-center mb-3">
                              <label className="text-[10px] font-bold text-[#3D3A34] uppercase tracking-widest flex items-center gap-2">
                                <Icon icon={isImg ? "lucide:image" : (isLink ? "lucide:link-2" : (isHeading ? "lucide:heading" : "lucide:type"))} className="text-[#D4754C]" />
                                {isLink ? 'Link / Button' : (el.tag + ' Block')}
                              </label>
                              <span className="text-[9px] text-[#8B8680] font-mono truncate max-w-[120px]" title={el.selector}>
                                {el.selector.split('>').pop().trim()}
                              </span>
                            </div>
                            
                            {isImg ? (
                              <div className="space-y-3">
                                <img src={currentVal} alt="Preview" className="w-full h-24 object-cover rounded-lg border border-[#E8DDD1]" />
                                <input 
                                  id={`input-${el.cmsId || btoa(el.selector).replace(/=/g, '')}`}
                                  type="url"
                                  value={currentVal}
                                  onChange={(e) => handleInputChange(el.selector, e.target.value)}
                                  className="w-full bg-white border border-[#E8DDD1] rounded-lg px-3 py-2 text-xs text-[#3D3A34] outline-none transition-all duration-300"
                                  placeholder="Paste image URL here"
                                />
                              </div>
                            ) : isLink ? (
                              <div className="space-y-4">
                                <div className="space-y-1">
                                  <label className="text-[9px] text-[#8B8680] font-bold uppercase tracking-tighter">Button Text</label>
                                  <textarea
                                    id={`input-${el.cmsId || btoa(el.selector).replace(/=/g, '')}`}
                                    value={currentVal}
                                    onChange={(e) => handleInputChange(el.selector, e.target.value)}
                                    className="w-full bg-transparent resize-none outline-none text-[#3D3A34] text-sm font-medium leading-relaxed min-h-[40px] transition-all duration-300"
                                    placeholder="Enter button text..."
                                  />
                                </div>
                                <div className="pt-3 border-t border-[#E8DDD1]/50 space-y-1">
                                  <div className="flex justify-between items-center">
                                    <label className="text-[9px] text-[#8B8680] font-bold uppercase tracking-tighter">Redirect URL</label>
                                    <Icon icon="lucide:external-link" className="text-[10px] text-[#8B8680]" />
                                  </div>
                                  <input 
                                    type="text"
                                    value={currentHref}
                                    onChange={(e) => handleInputChange(el.selector + '##href', e.target.value)}
                                    className="w-full bg-white border border-[#E8DDD1] rounded-lg px-3 py-2 text-[11px] text-[#3D3A34] outline-none transition-all duration-300 focus:border-[#D4754C] focus:ring-1 focus:ring-[#D4754C]/20"
                                    placeholder="/about or https://..."
                                  />
                                </div>
                              </div>
                            ) : (
                              <textarea
                                id={`input-${el.cmsId || btoa(el.selector).replace(/=/g, '')}`}
                                value={currentVal}
                                onChange={(e) => handleInputChange(el.selector, e.target.value)}
                                className={`w-full bg-transparent resize-none outline-none text-[#3D3A34] ${isHeading ? 'text-lg font-bold' : 'text-sm'} leading-relaxed min-h-[60px] transition-all duration-300`}
                                placeholder="Enter text..."
                              />
                            )}

                            {/* Style Options: shown only for non-image elements */}
                            {!isImg && (
                              <details className="mt-3 pt-3 border-t border-[#E8DDD1]/50">
                                <summary className="text-[9px] text-[#8B8680] font-bold uppercase tracking-tighter cursor-pointer flex items-center gap-1 list-none">
                                  <Icon icon="lucide:palette" className="text-[10px]" /> Style Options
                                </summary>
                                <div className="mt-3 grid grid-cols-2 gap-3">
                                  <div>
                                    <label className="text-[9px] text-[#8B8680] block mb-1 uppercase tracking-tighter">Text Color</label>
                                    <div className="flex items-center gap-2 relative">
                                      <div 
                                        className="w-8 h-8 rounded-lg cursor-pointer border-2 border-[#E8DDD1] shadow-sm transition-transform active:scale-95"
                                        style={{ backgroundColor: editedValues[el.selector + '##style:color'] || '#3D3A34' }}
                                        onClick={() => setActivePicker(activePicker === el.selector + '##style:color' ? null : el.selector + '##style:color')}
                                      />
                                      {activePicker === el.selector + '##style:color' && (
                                        <div className="absolute top-10 left-0 z-50 animate-in fade-in zoom-in duration-200">
                                          <div className="fixed inset-0" onClick={() => setActivePicker(null)} />
                                          <div className="relative p-3 bg-white rounded-2xl shadow-2xl border border-[#E8DDD1]">
                                            <HexColorPicker 
                                              color={editedValues[el.selector + '##style:color'] || '#3D3A34'} 
                                              onChange={(val) => handleInputChange(el.selector + '##style:color', val)} 
                                            />
                                          </div>
                                        </div>
                                      )}
                                      <input 
                                        type="text"
                                        value={editedValues[el.selector + '##style:color'] || ''}
                                        onChange={(e) => handleInputChange(el.selector + '##style:color', e.target.value)}
                                        placeholder="#3D3A34"
                                        className="flex-1 text-[10px] border border-[#E8DDD1] rounded-lg px-3 py-2 outline-none bg-white focus:border-[#D4754C]"
                                      />
                                    </div>
                                  </div>
                                  <div>
                                    <label className="text-[9px] text-[#8B8680] block mb-1 uppercase tracking-tighter">Background</label>
                                    <div className="flex items-center gap-2 relative">
                                      <div 
                                        className="w-8 h-8 rounded-lg cursor-pointer border-2 border-[#E8DDD1] shadow-sm transition-transform active:scale-95"
                                        style={{ backgroundColor: editedValues[el.selector + '##style:backgroundColor'] || '#ffffff' }}
                                        onClick={() => setActivePicker(activePicker === el.selector + '##style:backgroundColor' ? null : el.selector + '##style:backgroundColor')}
                                      />
                                      {activePicker === el.selector + '##style:backgroundColor' && (
                                        <div className="absolute top-10 right-0 z-50 animate-in fade-in zoom-in duration-200">
                                          <div className="fixed inset-0" onClick={() => setActivePicker(null)} />
                                          <div className="relative p-3 bg-white rounded-2xl shadow-2xl border border-[#E8DDD1]">
                                            <HexColorPicker 
                                              color={editedValues[el.selector + '##style:backgroundColor'] || '#ffffff'} 
                                              onChange={(val) => handleInputChange(el.selector + '##style:backgroundColor', val)} 
                                            />
                                          </div>
                                        </div>
                                      )}
                                      <input 
                                        type="text"
                                        value={editedValues[el.selector + '##style:backgroundColor'] || ''}
                                        onChange={(e) => handleInputChange(el.selector + '##style:backgroundColor', e.target.value)}
                                        placeholder="#ffffff"
                                        className="flex-1 text-[10px] border border-[#E8DDD1] rounded-lg px-3 py-2 outline-none bg-white focus:border-[#D4754C]"
                                      />
                                    </div>
                                  </div>
                                </div>
                              </details>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Panel: Live Iframe Preview */}
        <div className="flex-1 bg-[#F5EDE4]/50 p-6 flex flex-col relative overflow-hidden hidden-scrollbar">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-[#3D3A34]">Live Preview</h3>
            
            <div className="flex items-center gap-4">
              <div className="flex bg-[#E8DDD1]/50 p-1 rounded-lg">
                 <button 
                  onClick={() => setInteractionMode('navigate')}
                  className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors ${interactionMode === 'navigate' ? 'bg-white shadow-sm text-[#D4754C]' : 'text-[#8B8680] hover:text-[#3D3A34]'}`}
                 >
                   <Icon icon="lucide:pointer" className="inline mr-1" /> Browse
                 </button>
                 <button 
                  onClick={() => setInteractionMode('select')}
                  className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors ${interactionMode === 'select' ? 'bg-white shadow-sm text-[#D4754C]' : 'text-[#8B8680] hover:text-[#3D3A34]'}`}
                 >
                   <Icon icon="lucide:mouse-pointer-click" className="inline mr-1" /> Edit
                 </button>
              </div>

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

      {/* Version History Modal */}
      {showHistory && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col">
            <div className="p-6 border-b border-[#E8DDD1] flex justify-between items-center">
              <h3 className="text-lg font-bold text-[#3D3A34]">Version History</h3>
              <button 
                onClick={() => setShowHistory(false)}
                className="p-2 hover:bg-[#F5EDE4] rounded-full transition-colors"
              >
                <Icon icon="lucide:x" className="text-[#8B8680]" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-3 hidden-scrollbar">
              {(!config || !config.history || config.history.length === 0) ? (
                <div className="text-center py-10">
                  <Icon icon="lucide:history" className="text-4xl text-[#E8DDD1] mx-auto mb-3" />
                  <p className="text-sm text-[#8B8680]">No history yet. Publish your first version to start tracking changes.</p>
                </div>
              ) : (
                config.history.map((v, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-[#F5EDE4]/40 rounded-xl border border-[#E8DDD1] hover:border-[#D4754C] transition-all">
                    <div>
                      <p className="text-sm font-bold text-[#3D3A34]">Version {config.history.length - i}</p>
                      <p className="text-[10px] text-[#8B8680] font-medium uppercase tracking-wider">{new Date(v.savedAt).toLocaleString()}</p>
                      <p className="text-[10px] text-[#D4754C] font-bold mt-1">
                        {v.snapshot ? (v.snapshot instanceof Map ? v.snapshot.size : Object.keys(v.snapshot).length) : 0} Edits
                      </p>
                    </div>
                    <button
                      onClick={() => handleRestore(i)}
                      className="text-[10px] uppercase tracking-widest bg-[#3D3A34] text-white px-4 py-2 rounded-lg font-bold hover:bg-black transition-all shadow-md active:scale-95"
                    >
                      Restore
                    </button>
                  </div>
                ))
              )}
            </div>
            <div className="p-4 border-t border-[#E8DDD1] bg-[#FEFBF7] rounded-b-2xl">
              <p className="text-[10px] text-[#8B8680] text-center font-medium">Restoring a version will overwrite current live content.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
