(function() {
  const isEditMode = window.self !== window.top;
  let interactionMode = 'select'; // can be 'select' or 'navigate'
  
  let userId = null;
  const scripts = document.getElementsByTagName('script');
  for (let i = 0; i < scripts.length; i++) {
    if (scripts[i].src.includes('sdk.js')) {
      userId = scripts[i].getAttribute('data-user-id') || new URL(scripts[i].src).searchParams.get('userId');
      break;
    }
  }

  const API_BASE = "http://localhost:5000/api/public"; 

  function getCssSelector(el) {
    if (!(el instanceof Element)) return;
    const path = [];
    while (el.nodeType === Node.ELEMENT_NODE) {
      let selector = el.nodeName.toLowerCase();
      if (el.id) {
        selector += '#' + el.id;
        path.unshift(selector);
        break;
      } else {
        let sib = el, nth = 1;
        while (sib = sib.previousElementSibling) {
          if (sib.nodeName.toLowerCase() == selector)
            nth++;
        }
        if (nth != 1)
          selector += ":nth-of-type("+nth+")";
      }
      path.unshift(selector);
      el = el.parentNode;
    }
    return path.join(" > ");
  }

  function formatSectionName(str) {
    let result = str.replace(/[-_]/g, ' ');
    result = result.replace(/([A-Z])/g, ' $1');
    result = result.trim().toLowerCase();
    result = result.replace(/\b\w/g, c => c.toUpperCase());
    return result + (result.toLowerCase().includes('section') ? '' : ' Section');
  }

  function determineSectionName(el) {
    let curr = el.parentElement;
    let fallback = 'General Content';
    
    // Get page name from Title or URL as primary context
    const pageTitle = document.title ? document.title.split('|')[0].split('-')[0].trim() : '';
    const pageName = pageTitle || window.location.pathname.split('/').pop() || 'Home';
    const contextPrefix = pageName.charAt(0).toUpperCase() + pageName.slice(1);

    while (curr && curr !== document.body && curr !== document.documentElement) {
      const tagName = curr.tagName.toLowerCase();
      if (tagName === 'nav') return 'Navigation Bar';
      if (tagName === 'header') return 'Header Section';
      if (tagName === 'footer') return 'Footer Section';
      
      if (curr.id) return contextPrefix + ': ' + formatSectionName(curr.id);
      
      if (curr.className && typeof curr.className === 'string') {
        const classes = curr.className.toLowerCase();
        if (classes.includes('nav')) return 'Navigation Bar';
        if (classes.includes('hero')) return contextPrefix + ': Hero';
        if (classes.includes('about')) return 'About Section';
        if (classes.includes('contact')) return 'Contact Section';
        if (classes.includes('faq')) return 'FAQ Section';
        
        if (tagName === 'section' || curr.id || (curr.className && curr.className.length > 5)) {
           const firstClass = curr.className.split(' ')[0];
           if (firstClass && firstClass.length > 2 && !firstClass.includes('container') && !firstClass.includes('wrapper')) {
             return contextPrefix + ': ' + formatSectionName(firstClass);
           }
        }
      }
      curr = curr.parentElement;
    }
    return contextPrefix + ': ' + fallback;
  }

  // Parses the entire document to detect what can be edited
  let nodeCounter = 0;
  function scanAndReportDOM() {
    const elements = [];
    nodeCounter = 0;
    // Expanded tags to catch more interaction elements
    const textTags = "h1, h2, h3, h4, h5, h6, p, span, a, button, label, li, small";
    
    document.querySelectorAll(textTags).forEach(el => {
      // Find elements that primarily contain text directly
      let text = el.innerText || el.textContent;
      text = text.trim();
      
      // Filter out massive containers or empty stuff
      if (text && text.length > 0 && text.length < 800) {
        // If it has too many children, it's likely a container, not the content node itself
        if (el.children.length > 2 && !['a', 'button', 'li'].includes(el.tagName.toLowerCase())) return;

        const cid = `cms-node-${nodeCounter++}`;
        el.dataset.cmsScanned = 'true';
        el.dataset.cmsId = cid;
        elements.push({
          cmsId: cid,
          selector: getCssSelector(el),
          type: 'text',
          tag: el.tagName.toLowerCase(),
          value: el.innerHTML,
          section: determineSectionName(el)
        });
      }
    });

    document.querySelectorAll('img').forEach(img => {
      const cid = `cms-node-${nodeCounter++}`;
      img.dataset.cmsScanned = 'true';
      img.dataset.cmsId = cid;
      elements.push({
        cmsId: cid,
        selector: getCssSelector(img),
        type: 'image',
        tag: 'img',
        value: img.src,
        section: determineSectionName(img)
      });
    });

    // Send the map of the website to the dashboard
    window.parent.postMessage({ type: 'DOM_SCANNED', elements }, "*");
  }

  if (isEditMode) {
    console.log("[Visual CMS SDK] Edit Mode Initialized");

    document.addEventListener('click', (e) => {
      if (interactionMode === 'navigate') return; // Let native site clicking pass through
      
      e.preventDefault();
      e.stopPropagation();
      let target = e.target;
      while (target && target !== document.body) {
        if (target.dataset && target.dataset.cmsScanned === 'true') break;
        target = target.parentElement;
      }
      if (!target || target === document.body) {
        return;
      }

      const selector = getCssSelector(target);
      const cmsId = target.dataset.cmsId;
      if (selector) {
        window.parent.postMessage({ type: 'ELEMENT_CLICKED', selector, cmsId }, '*');
        const originalOutline = target.style.outline;
        target.style.outline = '3px solid #D4754C';
        target.style.outlineOffset = '2px';
        setTimeout(() => {
          target.style.outline = originalOutline;
          target.style.outlineOffset = '';
        }, 600);
      }
    }, { capture: true });

    window.addEventListener('message', (event) => {
      if (event.data?.type === 'SET_INTERACTION_MODE') {
        interactionMode = event.data.mode;
        return;
      }
      if (event.data?.type === 'LOAD_DRAFTS') {
        if (event.data.edits) {
          applyEdits(event.data.edits);
        }
        if (event.data.forceRescan) {
          scanAndReportDOM();
        }
      }
      
      // Receive live stroke-by-stroke updates from the left panel forms
      if (event.data?.type === 'LIVE_UPDATE') {
        const el = document.querySelector(event.data.selector);
        if (el) {
          if (el.tagName === 'IMG') {
            el.src = event.data.value;
          } else {
            el.innerHTML = event.data.value;
          }
          // Highlight it temporarily to show what's updating
          const originalOutline = el.style.outline;
          el.style.outline = '3px solid #D4754C';
          setTimeout(() => el.style.outline = originalOutline, 400);
        }
      }
    });

    // Observe DOM changes (React renders asynchronously)
    const debounceScan = debounce(() => {
      console.log("[Visual CMS SDK] Triggering scan due to DOM or Route change");
      scanAndReportDOM();
      // Also re-apply any saved edits from DB just in case a component re-rendered
      if (window._cmsEditsCache) applyEdits(window._cmsEditsCache);
    }, 600);

    // Initial scan loop (waits for framework to insert content)
    let attempts = 0;
    const initialScan = setInterval(() => {
      scanAndReportDOM();
      attempts++;
      if (document.querySelectorAll('h1, h2, p, img').length > 0 || attempts > 10) {
        clearInterval(initialScan);
      }
    }, 500);

    // Immediate scan on route change to clear old state fast
    const immediateScan = () => {
      console.log("[Visual CMS SDK] Immediate route change scan");
      scanAndReportDOM();
      debounceScan(); // Also queue the debounced one for later stability
    };

    // SPA Routing Detection (Monkey-patch History API)
    const originalPushState = history.pushState;
    history.pushState = function() {
      originalPushState.apply(this, arguments);
      immediateScan();
    };
    
    const originalReplaceState = history.replaceState;
    history.replaceState = function() {
      originalReplaceState.apply(this, arguments);
      immediateScan();
    };
    
    window.addEventListener('popstate', immediateScan);
    window.addEventListener('hashchange', immediateScan);

    const observer = new MutationObserver((mutations) => {
        // Only trigger if real content changed, not just our highlights
        const hasRealChange = mutations.some(m => 
            m.target.dataset?.cmsScanned !== 'true' && 
            m.target.id !== 'cms-highlighter'
        );
        if (hasRealChange) debounceScan();
    });
    observer.observe(document.body, { childList: true, subtree: true, characterData: true, attributes: false });

  } else {
    console.log("[Visual CMS SDK] View Mode Initialized");
    if (userId) {
      fetch(`${API_BASE}/edits/${userId}`)
        .then(res => res.json())
        .then(data => {
          if (data.isLive && data.edits) {
            applyEdits(data.edits);
          }
        })
        .catch(err => console.error("[Visual CMS SDK] Fetch error:", err));
    }
  }

  function applyEdits(edits) {
    window._cmsEditsCache = edits; // Cache for re-applying on route changes
    Object.keys(edits).forEach(selector => {
      const el = document.querySelector(selector);
      if (el) {
        if (el.tagName === 'IMG') {
          el.src = edits[selector];
        } else {
          el.innerHTML = edits[selector];
        }
      }
    });
  }

  function debounce(func, timeout = 300) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => { func.apply(this, args); }, timeout);
    };
  }
})();
