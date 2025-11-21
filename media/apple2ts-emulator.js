
// Apple2TS Emulator for VS Code - Direct HTML Integration
console.log('🍎 Apple2TS Loading (Direct HTML Integration)...');

// Patch Worker constructor to handle VS Code webview restrictions
const OriginalWorker = window.Worker;
window.Worker = function(scriptURL, options) {
    console.log('🔧 Worker creation intercepted:', scriptURL);
    
    // Try to create the worker normally first
    try {
        return new OriginalWorker(scriptURL, options);
    } catch (error) {
        console.warn('⚠️ Worker creation failed, providing fallback:', error.message);
        
        // Provide a minimal fallback that prevents Apple2TS from crashing
        return {
            postMessage: function(message) {
                console.log('📤 Worker message (fallback):', message);
            },
            terminate: function() {
                console.log('🛑 Worker terminated (fallback)');
            },
            onmessage: null,
            onerror: null,
            addEventListener: function(type, listener) {
                console.log('👂 Worker event listener added (fallback):', type);
            },
            removeEventListener: function(type, listener) {
                console.log('👂 Worker event listener removed (fallback):', type);
            }
        };
    }
};

// Copy over static properties
Object.setPrototypeOf(window.Worker, OriginalWorker);
Object.defineProperty(window.Worker, 'prototype', {
    value: OriginalWorker.prototype,
    writable: false
});

console.log('🔧 Worker patching complete');

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
                <div id="apple2ts-content" style="flex: 1; width: 100%; height: 100%; background: #000;">
                    <div style="display: flex; align-items: center; justify-content: center; height: 100%; color: #fff; font-family: monospace;">
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
            
            // Extract and process the HTML
            const parser = new DOMParser();
            const doc = parser.parseFromString(htmlContent, 'text/html');
            
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
                                // Fallback: use the original relative path conversion
                                srcUrl = `${decodedBaseUrl}/${srcUrl.split('/').pop()}`;
                            }
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
                            // Fallback: use the original relative path conversion
                            hrefUrl = `${decodedBaseUrl}/${hrefUrl.split('/').pop()}`;
                        }
                    } else {
                        // Relative URL, convert to webview URI
                        const hrefPath = hrefUrl.replace('./', '');
                        hrefUrl = `${decodedBaseUrl}/${hrefPath}`;
                    }
                    
                    link.href = hrefUrl;
                    if (element.crossOrigin) link.crossOrigin = element.crossOrigin;
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
            }
            
            updateStatus('Apple2TS loaded successfully');
            
            // Hide debug status after successful load
            setTimeout(() => {
                if (debugStatus) debugStatus.style.display = 'none';
            }, 5000);
            
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
