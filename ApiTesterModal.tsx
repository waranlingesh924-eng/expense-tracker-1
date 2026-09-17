import React, { useState, useEffect } from 'react';
import { 
  Terminal, 
  Send, 
  Copy, 
  Check, 
  X, 
  Play, 
  Clock, 
  Code, 
  Layers, 
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { api } from '../services/api';

interface ApiTesterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApiTesterModal: React.FC<ApiTesterModalProps> = ({ isOpen, onClose }) => {
  const [endpoints, setEndpoints] = useState<any[]>([]);
  const [selectedEndpoint, setSelectedEndpoint] = useState<any>(null);
  const [method, setMethod] = useState<'GET' | 'POST' | 'PUT' | 'DELETE'>('GET');
  const [url, setUrl] = useState('/api/dashboard/stats');
  const [headersText, setHeadersText] = useState('{\n  "x-user-id": "usr-demo-1",\n  "Content-Type": "application/json"\n}');
  const [bodyText, setBodyText] = useState('{}');
  
  const [responseStatus, setResponseStatus] = useState<number | null>(null);
  const [responseTime, setResponseTime] = useState<number | null>(null);
  const [responseBody, setResponseBody] = useState<string>('');
  const [isSending, setIsSending] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'body' | 'headers'>('body');

  useEffect(() => {
    if (isOpen) {
      loadEndpoints();
    }
  }, [isOpen]);

  const loadEndpoints = async () => {
    try {
      const data = await api.getApiEndpoints();
      setEndpoints(data || []);
      if (data && data.length > 0) {
        selectPreset(data[0]);
      }
    } catch (err) {
      console.error("Failed to load endpoint list:", err);
    }
  };

  const selectPreset = (ep: any) => {
    setSelectedEndpoint(ep);
    setMethod(ep.method);
    setUrl(ep.endpoint);
    const h = ep.defaultHeaders ? { ...ep.defaultHeaders, "Content-Type": "application/json" } : { "x-user-id": "usr-demo-1", "Content-Type": "application/json" };
    setHeadersText(JSON.stringify(h, null, 2));
    setBodyText(ep.defaultBody ? JSON.stringify(ep.defaultBody, null, 2) : '{}');
    setResponseStatus(null);
    setResponseBody('');
    setResponseTime(null);
  };

  const executeRequest = async () => {
    setIsSending(true);
    setResponseStatus(null);
    setResponseBody('Sending HTTP request to server...');
    const startTime = performance.now();

    try {
      let parsedHeaders = {};
      try {
        parsedHeaders = JSON.parse(headersText);
      } catch (err) {
        throw new Error("Invalid JSON in headers field.");
      }

      const options: RequestInit = {
        method,
        headers: parsedHeaders
      };

      if (method !== 'GET' && method !== 'HEAD' && bodyText.trim()) {
        try {
          JSON.parse(bodyText);
          options.body = bodyText;
        } catch {
          throw new Error("Invalid JSON in request body field.");
        }
      }

      const res = await fetch(url, options);
      const endTime = performance.now();
      setResponseTime(Math.round(endTime - startTime));
      setResponseStatus(res.status);

      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const json = await res.json();
        setResponseBody(JSON.stringify(json, null, 2));
      } else {
        const text = await res.text();
        setResponseBody(text);
      }
    } catch (err: any) {
      const endTime = performance.now();
      setResponseTime(Math.round(endTime - startTime));
      setResponseStatus(500);
      setResponseBody(JSON.stringify({ error: err.message || "Network Error" }, null, 2));
    } finally {
      setIsSending(false);
    }
  };

  const copyCurl = () => {
    let curl = `curl -X ${method} "http://localhost:3000${url}"`;
    try {
      const h = JSON.parse(headersText);
      Object.entries(h).forEach(([k, v]) => {
        curl += ` \\\n  -H "${k}: ${v}"`;
      });
    } catch {}
    if (method !== 'GET' && bodyText && bodyText !== '{}') {
      curl += ` \\\n  -d '${bodyText.replace(/\n/g, '')}'`;
    }
    navigator.clipboard.writeText(curl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-6 animate-in fade-in duration-150">
      <div className="bg-slate-900 text-slate-100 rounded-2xl w-full max-w-5xl h-[90vh] shadow-2xl border border-slate-800 flex flex-col overflow-hidden">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Terminal className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-white">Postman API Testing Studio</h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  LIVE REST ENGINE
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Execute live HTTP calls against all 10 FinTrack backend REST endpoints
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="copy-curl-btn"
              onClick={copyCurl}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 transition-colors"
              title="Copy as cURL"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied cURL!' : 'Copy cURL'}</span>
            </button>
            <button
              id="close-api-tester-btn"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Workbench Body: Sidebar Presets + Request/Response Runner */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 overflow-hidden">
          
          {/* Sidebar: Endpoint Collection */}
          <div className="hidden md:flex flex-col border-r border-slate-800 bg-slate-950/50 overflow-y-auto">
            <div className="p-3 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>Endpoints Collection</span>
              <span className="text-[10px] text-slate-500">{endpoints.length} Routes</span>
            </div>

            <div className="divide-y divide-slate-800/60 p-1">
              {endpoints.map(ep => {
                const isSelected = selectedEndpoint?.endpoint === ep.endpoint && selectedEndpoint?.method === ep.method;
                const methodColor = 
                  ep.method === 'GET' ? 'text-emerald-400 bg-emerald-500/10' :
                  ep.method === 'POST' ? 'text-amber-400 bg-amber-500/10' :
                  ep.method === 'PUT' ? 'text-blue-400 bg-blue-500/10' : 'text-rose-400 bg-rose-500/10';

                return (
                  <button
                    key={`${ep.method}-${ep.endpoint}`}
                    onClick={() => selectPreset(ep)}
                    className={`w-full text-left p-2.5 rounded-lg transition-all flex items-start gap-2 ${
                      isSelected ? 'bg-slate-800/90 text-white ring-1 ring-amber-500/30' : 'hover:bg-slate-800/40 text-slate-300'
                    }`}
                  >
                    <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded shrink-0 ${methodColor}`}>
                      {ep.method}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold truncate">{ep.description}</p>
                      <p className="text-[10px] font-mono text-slate-400 truncate">{ep.endpoint}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Main Request & Response Section */}
          <div className="md:col-span-2 flex flex-col overflow-hidden bg-slate-900">
            
            {/* Request Bar */}
            <div className="p-3 border-b border-slate-800 bg-slate-900/90 flex items-center gap-2">
              <select
                id="request-method-select"
                value={method}
                onChange={e => setMethod(e.target.value as any)}
                className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs font-mono font-bold text-amber-400 focus:outline-none"
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="DELETE">DELETE</option>
              </select>

              <div className="relative flex-1">
                <input
                  id="request-url-input"
                  type="text"
                  value={url}
                  onChange={e => setUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-emerald-400 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <button
                id="execute-api-request-btn"
                onClick={executeRequest}
                disabled={isSending}
                className="flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs rounded-lg shadow-sm transition-all active:scale-95 disabled:opacity-50 shrink-0"
              >
                {isSending ? (
                  <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
                <span>Send</span>
              </button>
            </div>

            {/* Split Panels: Top = Request payload & headers, Bottom = Response viewer */}
            <div className="flex-1 grid grid-rows-2 overflow-hidden">
              
              {/* Top Request Spec Panel */}
              <div className="flex flex-col border-b border-slate-800 overflow-hidden bg-slate-950/30">
                <div className="flex items-center justify-between px-3 py-1.5 border-b border-slate-800/80 bg-slate-950/60 text-xs">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setActiveTab('body')}
                      className={`px-2.5 py-1 rounded font-semibold text-[11px] ${
                        activeTab === 'body' ? 'bg-slate-800 text-amber-400' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Body (JSON)
                    </button>
                    <button
                      onClick={() => setActiveTab('headers')}
                      className={`px-2.5 py-1 rounded font-semibold text-[11px] ${
                        activeTab === 'headers' ? 'bg-slate-800 text-amber-400' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Headers
                    </button>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">Request Payload</span>
                </div>

                <div className="flex-1 p-2 overflow-auto">
                  {activeTab === 'body' ? (
                    <textarea
                      id="api-request-body-input"
                      value={bodyText}
                      onChange={e => setBodyText(e.target.value)}
                      disabled={method === 'GET'}
                      placeholder={method === 'GET' ? 'GET requests do not contain a request body' : '{\n  "key": "value"\n}'}
                      className="w-full h-full p-2 bg-slate-950/70 text-slate-300 font-mono text-xs rounded border border-slate-800 focus:outline-none focus:border-amber-500 resize-none"
                    />
                  ) : (
                    <textarea
                      id="api-request-headers-input"
                      value={headersText}
                      onChange={e => setHeadersText(e.target.value)}
                      className="w-full h-full p-2 bg-slate-950/70 text-slate-300 font-mono text-xs rounded border border-slate-800 focus:outline-none focus:border-amber-500 resize-none"
                    />
                  )}
                </div>
              </div>

              {/* Bottom Response Panel */}
              <div className="flex flex-col overflow-hidden bg-slate-950/80">
                <div className="flex items-center justify-between px-3 py-1.5 border-b border-slate-800 text-xs bg-slate-950">
                  <span className="font-semibold text-slate-300">Response</span>

                  <div className="flex items-center gap-3">
                    {responseStatus !== null && (
                      <div className="flex items-center gap-1.5 text-xs font-mono">
                        <span className="text-slate-400">Status:</span>
                        <span className={`font-bold px-1.5 py-0.2 rounded ${
                          responseStatus >= 200 && responseStatus < 300 
                            ? 'bg-emerald-500/20 text-emerald-400' 
                            : 'bg-rose-500/20 text-rose-400'
                        }`}>
                          {responseStatus} {responseStatus === 200 ? 'OK' : responseStatus === 201 ? 'Created' : ''}
                        </span>
                      </div>
                    )}
                    {responseTime !== null && (
                      <div className="flex items-center gap-1 text-[11px] font-mono text-slate-400">
                        <Clock className="w-3 h-3 text-slate-500" />
                        <span>{responseTime} ms</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex-1 p-2 overflow-auto">
                  <pre 
                    id="api-response-output"
                    className="font-mono text-xs text-slate-200 whitespace-pre-wrap p-2 bg-slate-950 rounded h-full select-all overflow-y-auto"
                  >
                    {responseBody || 'Click "Send" above to execute this API endpoint.'}
                  </pre>
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
