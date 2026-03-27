(function() {
  const isEditMode = window.self !== window.top;
  
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

  // Parses the entire document to detect what can be edited
  function scanAndReportDOM() {
    const elements = [];
    const textTags = "h1, h2, h3, h4, h5, h6, p, span, a, button, label";
    
    document.querySelectorAll(textTags).forEach(el => {
      // Find elements that primarily contain text directly
      let text = el.innerText || el.textContent;
      text = text.trim();
      
      // Filter out empty elements or massive containers like entire body
      if (text && text.length > 0 && text.length < 500 && el.children.length < 3) {
        elements.push({
          selector: getCssSelector(el),
          type: 'text',
          tag: el.tagName.toLowerCase(),
          value: el.innerHTML
        });
      }
    });

    document.querySelectorAll('img').forEach(img => {
      elements.push({
        selector: getCssSelector(img),
        type: 'image',
        tag: 'img',
        value: img.src
      });
    });

    // Send the map of the website to the dashboard
    window.parent.postMessage({ type: 'DOM_SCANNED', elements }, "*");
  }

  if (isEditMode) {
    console.log("[Visual CMS SDK] Edit Mode Initialized");

    window.addEventListener('message', (event) => {
      if (event.data?.type === 'LOAD_DRAFTS' && event.data.edits) {
        applyEdits(event.data.edits);
        // Rescan after applying initial drafts because values changed
        setTimeout(scanAndReportDOM, 500);
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

    const observer = new MutationObserver(debounce(() => {
        // scanAndReportDOM(); // Re-scan on major DOM changes if needed
    }, 2000));
    observer.observe(document.body, { childList: true, subtree: true });

    // Initial scan
    setTimeout(scanAndReportDOM, 1000);

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
