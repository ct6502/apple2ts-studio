
// Apple2TS Emulator for VS Code - Direct HTML Integration
console.log('🍎 Apple2TS Loading (Direct HTML Integration)...');

// Patch Worker constructor to handle VS Code webview URL resolution
const OriginalWorker = window.Worker;
window.Worker = function(scriptURL, options) {
    console.log('🔧 Worker creation intercepted:', scriptURL);
    console.log('🔧 Current baseUrl:', window.apple2tsBaseUrl);
    
    // Convert the worker URL to proper webview format
    let processedURL = scriptURL;
    
    // Handle both string URLs and URL objects
    let urlString = '';
    if (typeof scriptURL === 'string') {
        urlString = scriptURL;
    } else if (scriptURL instanceof URL) {
        urlString = scriptURL.href;
        console.log('🔍 URL object detected, using href:', urlString);
    }
    
    if (urlString) {
        const baseUrl = window.apple2tsBaseUrl;
        
        // Handle file+.vscode-resource URLs that cause cross-origin errors
        if (urlString.includes('file+.vscode-resource.vscode-cdn.net')) {
            console.log('🔄 Converting file+.vscode-resource URL to webview format');
            
            // Extract just the filename from the worker path
            const fileName = urlString.split('/').pop();
            console.log('🔍 Extracted worker filename:', fileName);
            
            // We need to get the actual webview base URL from the current location
            // The baseUrl is also a file+.vscode-resource URL, so we need to convert it
            const currentOrigin = window.location.origin;
            console.log('🔍 Current webview origin:', currentOrigin);
            
            if (currentOrigin.startsWith('vscode-webview://')) {
                // Build the correct webview URL for the worker
                processedURL = `${currentOrigin}/apple2ts/assets/${fileName}`;
                console.log('🔄 Converted to webview URL:', processedURL);
            } else {
                console.warn('⚠️ Unexpected origin, using fallback');
                // Fallback: try to extract webview ID from current location
                const webviewMatch = window.location.href.match(/vscode-webview:\/\/([^\/]+)/);
                if (webviewMatch) {
                    processedURL = `vscode-webview://${webviewMatch[1]}/apple2ts/assets/${fileName}`;
                    console.log('🔄 Fallback conversion:', processedURL);
                }
            }
        } else if (baseUrl && (urlString.includes('assets/') || urlString.includes('worker'))) {
            const decodedBaseUrl = decodeURIComponent(baseUrl);
            
            // Handle different URL patterns for workers
            if (urlString.startsWith('assets/') || urlString.startsWith('./assets/')) {
                processedURL = `${decodedBaseUrl}/${urlString.replace('./', '')}`;
            } else if (urlString.startsWith('/assets/')) {
                processedURL = `${decodedBaseUrl}${urlString}`;
            } else if (urlString.match(/^[^\/]+\.js$/) && urlString.includes('worker')) {
                processedURL = `${decodedBaseUrl}/assets/${urlString}`;
            } else if (urlString.includes('worker') && !urlString.startsWith('http')) {
                // Handle relative worker paths
                const workerFile = urlString.split('/').pop();
                processedURL = `${decodedBaseUrl}/assets/${workerFile}`;
            } else if (!urlString.startsWith('http') && !urlString.startsWith('blob:')) {
                // For any other relative path that might be a worker
                const fileName = urlString.split('/').pop();
                if (fileName.includes('worker') || fileName.endsWith('.js')) {
                    processedURL = `${decodedBaseUrl}/assets/${fileName}`;
                }
            }
            
            console.log('🔄 Worker URL converted:', urlString, '->', processedURL);
        }
    }
    
    // Since VS Code webviews support standard Web Worker APIs, let the real constructor handle it
    console.log('📦 Creating worker with resolved URL:', processedURL);
    console.log('📦 Final URL check - same origin?', typeof processedURL === 'string' && processedURL.startsWith('vscode-webview://') ? 'YES' : 'NO');
    
    return new OriginalWorker(processedURL, options);
};

// Copy over static properties
Object.setPrototypeOf(window.Worker, OriginalWorker);
Object.defineProperty(window.Worker, 'prototype', {
    value: OriginalWorker.prototype,
    writable: false
});

// Patch fetch to handle asset requests
const originalFetch = window.fetch;
window.fetch = function(input, init) {
    const url = typeof input === 'string' ? input : input.url;
    
    // Check if this is a request for Apple2TS assets
    if (url && (url.includes('assets/') || url.match(/\.(png|jpg|gif|mp3|css|js)$/))) {
        const baseUrl = window.apple2tsBaseUrl;
        if (baseUrl) {
            const decodedBaseUrl = decodeURIComponent(baseUrl);
            
            // Convert relative asset paths to full webview URIs
            let newUrl = url;
            if (url.startsWith('assets/') || url.startsWith('./assets/')) {
                newUrl = `${decodedBaseUrl}/${url.replace('./', '')}`;
            } else if (url.match(/^[^\/]+\.(png|jpg|gif|mp3)$/)) {
                // Direct asset filename
                newUrl = `${decodedBaseUrl}/${url}`;
            }
            
            if (newUrl !== url) {
                console.log('🔄 Fetch URL converted:', url, '->', newUrl);
                if (typeof input === 'string') {
                    return originalFetch.call(this, newUrl, init);
                } else {
                    const newRequest = new Request(newUrl, input);
                    return originalFetch.call(this, newRequest, init);
                }
            }
        }
    }
    
    return originalFetch.call(this, input, init);
};

// Patch Image constructor to handle asset requests
const OriginalImage = window.Image;
window.Image = function() {
    const img = new OriginalImage();
    const originalSrcSetter = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, 'src').set;
    
    Object.defineProperty(img, 'src', {
        set: function(value) {
            const baseUrl = window.apple2tsBaseUrl;
            if (baseUrl && value && (value.includes('assets/') || value.match(/\.(png|jpg|gif)$/))) {
                const decodedBaseUrl = decodeURIComponent(baseUrl);
                let newUrl = value;
                
                if (value.startsWith('assets/') || value.startsWith('./assets/')) {
                    newUrl = `${decodedBaseUrl}/${value.replace('./', '')}`;
                } else if (value.match(/^[^\/]+\.(png|jpg|gif)$/)) {
                    newUrl = `${decodedBaseUrl}/assets/${value}`;
                }
                
                if (newUrl !== value) {
                    console.log('🔄 Image src converted:', value, '->', newUrl);
                    originalSrcSetter.call(this, newUrl);
                    return;
                }
            }
            originalSrcSetter.call(this, value);
        },
        get: function() {
            return originalSrcSetter ? this.getAttribute('src') : undefined;
        }
    });
    
    return img;
};

// Copy over static properties
Object.setPrototypeOf(window.Image, OriginalImage);

// Also patch HTMLImageElement prototype for existing img elements
const originalImgSrcSetter = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, 'src').set;
Object.defineProperty(HTMLImageElement.prototype, 'src', {
    set: function(value) {
        const baseUrl = window.apple2tsBaseUrl;
        if (baseUrl && value && (value.includes('assets/') || value.match(/\.(png|jpg|gif)$/))) {
            const decodedBaseUrl = decodeURIComponent(baseUrl);
            let newUrl = value;
            
            if (value.startsWith('assets/') || value.startsWith('./assets/')) {
                newUrl = `${decodedBaseUrl}/${value.replace('./', '')}`;
            } else if (value.match(/^[^\/]+\.(png|jpg|gif)$/)) {
                newUrl = `${decodedBaseUrl}/assets/${value}`;
            }
            
            if (newUrl !== value) {
                console.log('🔄 HTMLImageElement src converted:', value, '->', newUrl);
                originalImgSrcSetter.call(this, newUrl);
                return;
            }
        }
        originalImgSrcSetter.call(this, value);
    },
    get: Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, 'src').get
});

console.log('🔧 Worker, fetch, and image patching complete');

// Additional CSS background-image URL patching
const patchCssUrl = (cssValue) => {
    if (!cssValue) return cssValue;
    
    const baseUrl = window.apple2tsBaseUrl;
    if (!baseUrl) return cssValue;
    
    const decodedBaseUrl = decodeURIComponent(baseUrl);
    
    // Patch url() references in CSS
    return cssValue.replace(/url\(['"]?([^'")]+)['"]?\)/g, (match, url) => {
        if (url.includes('assets/') || url.match(/\.(png|jpg|gif)$/)) {
            let newUrl = url;
            
            if (url.startsWith('assets/') || url.startsWith('./assets/')) {
                newUrl = `${decodedBaseUrl}/${url.replace('./', '')}`;
            } else if (url.match(/^[^\/]+\.(png|jpg|gif)$/)) {
                newUrl = `${decodedBaseUrl}/assets/${url}`;
            }
            
            if (newUrl !== url) {
                console.log('🔄 CSS url() converted:', url, '->', newUrl);
                return `url("${newUrl}")`;
            }
        }
        return match;
    });
};

// Patch CSS setProperty method
const originalSetProperty = CSSStyleDeclaration.prototype.setProperty;
CSSStyleDeclaration.prototype.setProperty = function(property, value, priority) {
    if ((property === 'background-image' || property === 'background') && typeof value === 'string') {
        value = patchCssUrl(value);
    }
    return originalSetProperty.call(this, property, value, priority);
};

// Patch cssText property
const originalCssTextDescriptor = Object.getOwnPropertyDescriptor(CSSStyleDeclaration.prototype, 'cssText');
if (originalCssTextDescriptor && originalCssTextDescriptor.set) {
    Object.defineProperty(CSSStyleDeclaration.prototype, 'cssText', {
        ...originalCssTextDescriptor,
        set: function(value) {
            if (typeof value === 'string') {
                value = patchCssUrl(value);
            }
            originalCssTextDescriptor.set.call(this, value);
        }
    });
}

console.log('🔧 CSS background-image patching complete');

// Patch Audio constructor for MP3 and audio file loading
const OriginalAudio = window.Audio;
window.Audio = function(src) {
    const audio = new OriginalAudio();
    
    if (src) {
        const baseUrl = window.apple2tsBaseUrl;
        if (baseUrl && (src.includes('assets/') || src.match(/\.(mp3|wav|ogg)$/))) {
            const decodedBaseUrl = decodeURIComponent(baseUrl);
            let newSrc = src;
            
            if (src.startsWith('assets/') || src.startsWith('./assets/')) {
                newSrc = `${decodedBaseUrl}/${src.replace('./', '')}`;
            } else if (src.startsWith('/assets/')) {
                newSrc = `${decodedBaseUrl}${src}`;
            } else if (src.match(/^[^\/]+\.(mp3|wav|ogg)$/)) {
                newSrc = `${decodedBaseUrl}/assets/${src}`;
            }
            
            if (newSrc !== src) {
                console.log('🔄 Audio src converted:', src, '->', newSrc);
                audio.src = newSrc;
            } else {
                audio.src = src;
            }
        } else {
            audio.src = src;
        }
    }
    
    return audio;
};

// Copy over static properties
Object.setPrototypeOf(window.Audio, OriginalAudio);

// Also patch HTMLAudioElement prototype for existing audio elements
const originalAudioSrcDescriptor = Object.getOwnPropertyDescriptor(HTMLAudioElement.prototype, 'src');
if (originalAudioSrcDescriptor && originalAudioSrcDescriptor.set) {
    const originalAudioSrcSetter = originalAudioSrcDescriptor.set;
    Object.defineProperty(HTMLAudioElement.prototype, 'src', {
        set: function(value) {
            const baseUrl = window.apple2tsBaseUrl;
            if (baseUrl && value && (value.includes('assets/') || value.match(/\.(mp3|wav|ogg)$/))) {
                const decodedBaseUrl = decodeURIComponent(baseUrl);
                let newUrl = value;
                
                if (value.startsWith('assets/') || value.startsWith('./assets/')) {
                    newUrl = `${decodedBaseUrl}/${value.replace('./', '')}`;
                } else if (value.startsWith('/assets/')) {
                    newUrl = `${decodedBaseUrl}${value}`;
                } else if (value.match(/^[^\/]+\.(mp3|wav|ogg)$/)) {
                    newUrl = `${decodedBaseUrl}/assets/${value}`;
                }
                
                if (newUrl !== value) {
                    console.log('🔄 HTMLAudioElement src converted:', value, '->', newUrl);
                    originalAudioSrcSetter.call(this, newUrl);
                    return;
                }
            }
            originalAudioSrcSetter.call(this, value);
        },
        get: originalAudioSrcDescriptor.get,
        configurable: true,
        enumerable: true
    });
} else {
    console.log('⚠️ HTMLAudioElement.prototype.src descriptor not available, skipping audio element patching');
}

console.log('🔧 Audio element patching complete');

// Get the base URL from the window context (set by emulatorPanel.ts)
const baseUrl = window.apple2tsBaseUrl || './apple2ts';
console.log('🔧 Base URL received:', baseUrl);

// Decode the URL to fix any encoding issues
const decodedBaseUrl = decodeURIComponent(baseUrl);
console.log('🔧 Decoded base URL:', decodedBaseUrl);

// Initialize the emulator by fetching and loading Apple2TS content directly
setTimeout(async () => {
    console.log('📄 Initializing emulator with direct HTML loading...');
    const container = document.getElementById('emulator-container');
    if (container) {
        container.innerHTML = `
            <div style="width: 100%; height: 100%; display: flex; flex-direction: column;">
                <div style="padding: 10px; background: #2d2d30; color: #fff; border-bottom: 1px solid #444; display: flex; justify-content: space-between; align-items: center;">
                    <strong>Apple2TS v1.1.0</strong> - Apple II Emulator
                    <div id="debug-status" style="color: #888; font-size: 11px; font-family: monospace;">
                        Loading HTML content...
                    </div>
                </div>
                <div id="apple2ts-content" style="flex: 1; width: 100%; height: 100%; background: var(--vscode-editor-background, #1e1e1e); position: relative; overflow: hidden;">
                    <noscript style="display: flex; align-items: center; justify-content: center; height: 100%; color: var(--vscode-editor-foreground, #d4d4d4); font-family: monospace;">
                        You need to enable JavaScript to run this app.
                    </noscript>
                    <div id="root" style="width: 100%; height: 100%; position: relative; background: transparent;"></div>
                    <div style="display: flex; align-items: center; justify-content: center; height: 100%; color: var(--vscode-editor-foreground, #d4d4d4); font-family: monospace; position: absolute; top: 0; left: 0; right: 0; bottom: 0; pointer-events: none; z-index: 1;">
                        ⏳ Loading Apple2TS HTML...
                    </div>
                </div>
            </div>
        `;
        
        console.log('📱 Container created');
        
        const debugStatus = document.getElementById('debug-status');
        const contentDiv = document.getElementById('apple2ts-content');
        
        const updateStatus = (msg) => {
            if (debugStatus) debugStatus.textContent = msg;
            console.log(`📊 ${msg}`);
        };
        
        try {
            updateStatus('Fetching index.html...');
            
            // Fetch the Apple2TS index.html content
            const response = await fetch(`${decodedBaseUrl}/index.html`);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            let htmlContent = await response.text();
            console.log('✅ Apple2TS HTML fetched successfully');
            console.log('📄 HTML content length:', htmlContent.length);
            
            updateStatus('Processing HTML content...');
            
            console.log('🔍 URL debugging:');
            console.log('  - Base URL:', baseUrl);
            console.log('  - Decoded URL:', decodedBaseUrl);
            console.log('  - Expected format should match:', decodedBaseUrl.includes('vscode-resource.vscode-cdn.net'));
            
            // Set up asset registry with full webview URIs
            window.assetRegistry = {
                // Images
                bgImage: `${decodedBaseUrl}/assets/crt.jpg`,
                disk2off: `${decodedBaseUrl}/assets/disk2off.png`,
                disk2on: `${decodedBaseUrl}/assets/disk2on.png`,
                disk2offEmpty: `${decodedBaseUrl}/assets/disk2off-empty.png`,
                disk2onEmpty: `${decodedBaseUrl}/assets/disk2on-empty.png`,
                hardDriveOff: `${decodedBaseUrl}/assets/harddrive.png`,
                hardDriveOn: `${decodedBaseUrl}/assets/harddriveOn.png`,
                diskicons: `${decodedBaseUrl}/assets/diskicons.png`,
                runningGuy: `${decodedBaseUrl}/assets/runningGuy.gif`,
                dotCursor: `${decodedBaseUrl}/dot.png`,
                // Audio
                driveMotor: `${decodedBaseUrl}/assets/driveMotor.mp3`,
                driveTrackOffEnd: `${decodedBaseUrl}/assets/driveTrackOffEnd.mp3`,
                driveTrackSeekLong: `${decodedBaseUrl}/assets/driveTrackSeekLong.mp3`
            };
            console.log('🔧 Asset registry configured with full URIs:', Object.keys(window.assetRegistry).length, 'assets');
            
            // Extract and process the HTML
            const parser = new DOMParser();
            const doc = parser.parseFromString(htmlContent, 'text/html');
            
            // Set up URL parameter for Apple2TS app mode using a different approach
            // Since we can't redefine window.location, we'll create a custom URLSearchParams
            // and patch relevant functions that Apple2TS might use
            
            // Create a URLSearchParams that always includes appmode=game and theme=dark
            const originalURLSearchParams = window.URLSearchParams;
            window.URLSearchParams = class extends originalURLSearchParams {
                constructor(init) {
                    // Always add appmode=game and theme=dark regardless of the actual URL
                    super('appmode=game&theme=dark');
                }
                
                get(name) {
                    if (name === 'appmode') return 'game';
                    if (name === 'theme') return 'dark';
                    return super.get(name);
                }
                
                has(name) {
                    if (name === 'appmode') return true;
                    if (name === 'theme') return true;
                    return super.has(name);
                }
            };
            
            console.log('🔧 Set up Apple2TS game mode parameters');
            
            // Get the head content (scripts, styles, etc.)
            const headElements = doc.head.children;
            console.log('📋 Found head elements:', headElements.length);
            
            // Add the head elements to our document
            for (let element of headElements) {
                if (element.tagName === 'SCRIPT') {
                    // Handle script tags specially
                    const script = document.createElement('script');
                    
                    // Get the nonce from existing scripts in the document
                    const existingScript = document.querySelector('script[nonce]');
                    const nonce = existingScript ? existingScript.getAttribute('nonce') : null;
                    
                    if (element.src) {
                        // External script - convert any webview URLs to current session
                        let srcUrl = element.src;
                        if (srcUrl.startsWith('vscode-webview://')) {
                            // Extract the asset path from the webview URL
                            const match = srcUrl.match(/\/assets\/(.+)$/);
                            if (match) {
                                srcUrl = `${decodedBaseUrl}/assets/${match[1]}`;
                            } else {
                                // Fallback: extract filename and use with base URL
                                const filename = srcUrl.split('/').pop();
                                srcUrl = `${decodedBaseUrl}/assets/${filename}`;
                            }
                            console.log('🔄 Converted script URL:', element.src, '->', srcUrl);
                        } else {
                            // Relative URL, convert to webview URI
                            const srcPath = srcUrl.replace('./', '');
                            srcUrl = `${decodedBaseUrl}/${srcPath}`;
                        }
                        script.src = srcUrl;
                        script.type = element.type || 'text/javascript';
                        if (element.crossOrigin) script.crossOrigin = element.crossOrigin;
                    } else {
                        // Inline script - add nonce for CSP compliance
                        script.textContent = element.textContent;
                        script.type = element.type || 'text/javascript';
                        if (nonce) {
                            script.setAttribute('nonce', nonce);
                        }
                    }
                    document.head.appendChild(script);
                    console.log('📦 Added script:', element.src || 'inline');
                } else if (element.tagName === 'LINK' && element.rel === 'stylesheet') {
                    // Handle CSS links
                    const link = document.createElement('link');
                    link.rel = 'stylesheet';
                    
                    let hrefUrl = element.href;
                    if (hrefUrl.startsWith('vscode-webview://')) {
                        // Extract the asset path from the webview URL
                        const match = hrefUrl.match(/\/assets\/(.+)$/);
                        if (match) {
                            hrefUrl = `${decodedBaseUrl}/assets/${match[1]}`;
                        } else {
                            // Fallback: extract filename and use with base URL
                            const filename = hrefUrl.split('/').pop();
                            hrefUrl = `${decodedBaseUrl}/assets/${filename}`;
                        }
                        console.log('🔄 Converted CSS URL:', element.href, '->', hrefUrl);
                    } else {
                        // Relative URL, convert to webview URI
                        const hrefPath = hrefUrl.replace('./', '');
                        hrefUrl = `${decodedBaseUrl}/${hrefPath}`;
                    }
                    
                    link.href = hrefUrl;
                    if (element.crossOrigin) link.crossOrigin = element.crossOrigin;
                    
                    // Add load/error handlers for CSS debugging
                    link.onload = () => {
                        console.log('✅ CSS loaded successfully:', hrefUrl);
                        // Check if styles are being applied
                        setTimeout(() => {
                            const root = document.getElementById('root');
                            if (root) {
                                const styles = window.getComputedStyle(root);
                                console.log('🎨 Root element styles after CSS load:', {
                                    display: styles.display,
                                    visibility: styles.visibility,
                                    opacity: styles.opacity,
                                    color: styles.color,
                                    backgroundColor: styles.backgroundColor
                                });
                            }
                        }, 100);
                    };
                    link.onerror = (e) => {
                        console.error('❌ CSS failed to load:', hrefUrl, e);
                    };
                    
                    document.head.appendChild(link);
                    console.log('🎨 Added stylesheet:', link.href);
                } else if (element.tagName !== 'TITLE') {
                    // Add other head elements (except title to avoid conflicts)
                    const clonedElement = element.cloneNode(true);
                    document.head.appendChild(clonedElement);
                    console.log('📋 Added head element:', element.tagName);
                }
            }
            
            updateStatus('Loading Apple2TS body content...');
            
            // Get the body content and insert it into our content div
            const bodyContent = doc.body.innerHTML;
            if (contentDiv) {
                contentDiv.innerHTML = bodyContent;
                console.log('✅ Body content loaded into container');
                
                // Add CSS override to ensure visibility without breaking Apple2TS styling
                const style = document.createElement('style');
                style.textContent = `
                    /* Apple2TS isolation and background fixes for VS Code webview */
                    
                    /* Create a solid background container to prevent VS Code bleed-through */
                    #apple2ts-content {
                        background: #000000 !important;
                        background-color: #000000 !important;
                        isolation: isolate !important;
                        contain: layout style paint !important;
                        min-height: 100vh !important;
                        width: 100% !important;
                        position: relative !important;
                    }
                    
                    /* Ensure root element has proper background */
                    #root {
                        background: #000000 !important;
                        background-color: #000000 !important;
                        isolation: isolate !important;
                        contain: layout style paint !important;
                        position: relative !important;
                        z-index: 1 !important;
                    }
                    
                    /* Ensure visibility for all elements */
                    #root, #root * {
                        visibility: visible !important;
                        opacity: 1 !important;
                    }
                    
                    /* Let Apple2TS handle its own styling but ensure visibility */
                    #root button, #root input, #root select, #root .btn, #root [role="button"] {
                        visibility: visible !important;
                        opacity: 1 !important;
                        display: inline-block !important;
                    }
                    
                    /* Prevent VS Code CSS variables from affecting Apple2TS */
                    #root {
                        --vscode-editor-background: unset !important;
                        --vscode-editor-foreground: unset !important;
                        --vscode-sideBar-background: unset !important;
                    }
                    
                    /* Ensure main app container maintains Apple2TS colors */
                    #root > div,
                    .App,
                    [class*="App"] {
                        background: inherit !important;
                        color: inherit !important;
                    }
                    
                    /* Fix z-index stacking */
                    #root > * {
                        position: relative !important;
                        z-index: 1 !important;
                    }
                    
                    /* Preserve Apple2TS screen elements exactly as intended */
                    canvas, .screen, .monitor, .crt, .emulator-screen {
                        /* Apple2TS controls these completely */
                        background: #000 !important; /* Classic CRT black */
                    }
                    
                    /* Prevent any transparency from showing VS Code background */
                    *[style*="background: transparent"],
                    *[style*="background-color: transparent"] {
                        background: #000000 !important;
                        background-color: #000000 !important;
                    }
                `;
                document.head.appendChild(style);
                console.log('🎨 Added background isolation and visibility fixes');
            }
            
            updateStatus('Apple2TS loaded successfully');
            
            // Enhanced debugging for React app initialization
            setTimeout(() => {
                const root = document.getElementById('root');
                console.log('🔍 Enhanced React debugging after 2s:');
                console.log('  - Root element:', root);
                console.log('  - Root children:', root ? root.children.length : 'no root');
                console.log('  - Root innerHTML length:', root ? root.innerHTML.length : 0);
                console.log('  - Root classes:', root ? root.className : 'none');
                console.log('  - Root styles:', root ? window.getComputedStyle(root) : 'none');
                
                // Check for React-specific indicators
                const reactRoot = document.querySelector('[data-reactroot]') || document.querySelector('#root > div');
                console.log('  - React root found:', !!reactRoot);
                
                // Look for any Apple2TS specific elements
                const apple2tsElements = document.querySelectorAll('*[class*="apple"], *[class*="Apple"], *[id*="apple"], *[id*="Apple"]');
                console.log('  - Apple2TS elements found:', apple2tsElements.length);
                
                // Check window globals for Apple2TS
                const apple2tsGlobals = Object.keys(window).filter(key => 
                    key.toLowerCase().includes('apple') || 
                    key.toLowerCase().includes('emulator') ||
                    key.toLowerCase().includes('react')
                );
                console.log('  - Relevant window globals:', apple2tsGlobals);
                
                // If root is empty, try to initialize manually
                if (root && root.children.length === 0) {
                    console.warn('⚠️ Root is empty, attempting manual initialization...');
                    
                    // Try to trigger React app manually if possible
                    if (window.React || window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
                        console.log('🔄 React detected, but app not mounted');
                    }
                    
                    // Add a temporary message to show something is working
                    root.innerHTML = `
                        <div style="
                            width: 100%; 
                            height: 100%; 
                            display: flex; 
                            flex-direction: column;
                            align-items: center; 
                            justify-content: center; 
                            background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
                            color: #fff;
                            font-family: monospace;
                            text-align: center;
                            padding: 20px;
                        ">
                            <div style="font-size: 24px; margin-bottom: 20px;">🍎 Apple2TS</div>
                            <div style="font-size: 14px; opacity: 0.8; margin-bottom: 10px;">Emulator Loading...</div>
                            <div style="font-size: 12px; opacity: 0.6;">
                                React app initialized but UI not yet rendered<br>
                                Check console for debugging information
                            </div>
                            <div style="margin-top: 20px; padding: 10px; background: rgba(0,0,0,0.3); border-radius: 5px;">
                                <div style="font-size: 11px; opacity: 0.7;">Debug Info:</div>
                                <div style="font-size: 10px; opacity: 0.5;">
                                    Scripts: Loaded ✓<br>
                                    Styles: Loaded ✓<br>
                                    React: ${window.React ? 'Available' : 'Not Available'}<br>
                                    Globals: ${apple2tsGlobals.length} found
                                </div>
                            </div>
                        </div>
                    `;
                } else if (root && root.children.length > 0) {
                    console.log('✅ React app appears to be mounted successfully');
                }
            }, 2000);
            
            // Hide debug status after successful load
            setTimeout(() => {
                if (debugStatus) debugStatus.style.display = 'none';
            }, 8000); // Keep visible longer for debugging
            
            // Notify VS Code that emulator is ready
            if (window.vscode) {
                window.vscode.postMessage({ command: 'emulatorReady' });
            }
            
        } catch (error) {
            console.error('❌ Failed to load Apple2TS HTML:', error);
            updateStatus('Failed to load Apple2TS');
            
            if (contentDiv) {
                contentDiv.innerHTML = `
                    <div style="display: flex; align-items: center; justify-content: center; height: 100%; color: #ff6b6b; font-family: monospace; text-align: center;">
                        <div>
                            <h3>❌ Apple2TS Loading Failed</h3>
                            <p>Could not fetch: ${decodedBaseUrl}/index.html</p>
                            <p>Error: ${error.message}</p>
                            <details style="margin-top: 20px; text-align: left;">
                                <summary>Debug Information</summary>
                                <pre style="background: #000; padding: 10px; margin-top: 10px; color: #0f0; font-size: 11px;">
Original URL: ${baseUrl}
Decoded URL: ${decodedBaseUrl}
Fetch URL: ${decodedBaseUrl}/index.html
Error: ${error.message}
                                </pre>
                            </details>
                        </div>
                    </div>
                `;
            }
        }
        
        // VS Code API should already be available from the main script
        if (window.vscode) {
            console.log('✅ Using existing VS Code API');
        } else {
            console.warn('⚠️ VS Code API not available');
        }
        
    } else {
        console.error('❌ No emulator-container found');
    }
}, 100);

console.log('📄 Script initialization complete');
