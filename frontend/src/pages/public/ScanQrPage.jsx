import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Html5Qrcode } from 'html5-qrcode';
import { 
  Camera, 
  Upload, 
  Keyboard, 
  Sparkles, 
  ShieldCheck, 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  QrCode, 
  Zap,
  ExternalLink,
  Award,
  Scale
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function ScanQrPage() {
  const { certificates = [], applications = [] } = useApp();
  const navigate = useNavigate();

  const [scanMode, setScanMode] = useState('camera'); // 'camera' | 'upload' | 'manual'
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [facingMode, setFacingMode] = useState('environment'); // 'environment' (back) | 'user' (front)
  const [manualCode, setManualCode] = useState('');
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [imageError, setImageError] = useState(null);

  const html5QrCodeRef = useRef(null);
  const fileInputRef = useRef(null);

  // Play a brief positive beep using Web Audio API on scan
  const playBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5 note
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.18);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.18);
    } catch {}

    // Haptic vibration on mobile devices
    if (navigator.vibrate) {
      try {
        navigator.vibrate([60, 40, 60]);
      } catch {}
    }
  };

  // Helper to extract clean Certificate ID / Reference from raw scanned string
  const parseScannedData = (rawText) => {
    if (!rawText) return null;
    const clean = rawText.trim();

    // 1. Check if it's a URL (e.g. https://.../#/verify/CERT-2025-KL-0941 or /verify/...)
    const hashVerifyMatch = clean.match(/#\/verify\/([^/?#&]+)/i);
    if (hashVerifyMatch) return decodeURIComponent(hashVerifyMatch[1]);

    const plainVerifyMatch = clean.match(/\/verify\/([^/?#&]+)/i);
    if (plainVerifyMatch) return decodeURIComponent(plainVerifyMatch[1]);

    const certLinkMatch = clean.match(/\/certificates\/([^/?#&]+)/i);
    if (certLinkMatch) return decodeURIComponent(certLinkMatch[1]);

    // 2. Check if it's a JSON payload
    if (clean.startsWith('{') && clean.endsWith('}')) {
      try {
        const parsed = JSON.parse(clean);
        if (parsed.certificateNumber) return parsed.certificateNumber;
        if (parsed.certNumber) return parsed.certNumber;
        if (parsed.id) return parsed.id;
      } catch {}
    }

    // 3. Plain certificate or application code
    return clean;
  };

  // Handle successful scan from any source (camera, image, manual)
  const handleScanSuccess = (decodedText) => {
    const certReference = parseScannedData(decodedText);
    if (!certReference) return;

    playBeep();
    setScanResult(certReference);

    // Stop camera if running
    stopCamera();

    // Redirect to certificate page after a brief 600ms visual confirmation
    setTimeout(() => {
      navigate(`/verify/${encodeURIComponent(certReference)}`);
    }, 700);
  };

  // Start Camera
  const startCamera = async (facing = facingMode) => {
    setCameraError(null);
    setScanning(true);

    try {
      if (html5QrCodeRef.current) {
        try {
          await html5QrCodeRef.current.stop();
        } catch {}
      }

      const qrScanner = new Html5Qrcode('qr-reader-container');
      html5QrCodeRef.current = qrScanner;

      await qrScanner.start(
        { facingMode: facing },
        {
          fps: 15,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0
        },
        (decodedText) => {
          handleScanSuccess(decodedText);
        },
        () => {
          // ignore per-frame parse failures
        }
      );

      setCameraActive(true);
      setScanning(false);
    } catch (err) {
      console.warn('Camera start error:', err);
      setCameraError(
        'Could not access camera. Please allow camera permissions in your browser, or use the "Upload QR Image" / "Manual" tab.'
      );
      setCameraActive(false);
      setScanning(false);
    }
  };

  // Stop Camera
  const stopCamera = async () => {
    if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
      try {
        await html5QrCodeRef.current.stop();
      } catch (err) {
        console.warn('Error stopping camera:', err);
      }
    }
    setCameraActive(false);
  };

  // Switch facing mode (back / front camera)
  const toggleFacingMode = () => {
    const nextFacing = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextFacing);
    if (cameraActive) {
      startCamera(nextFacing);
    }
  };

  // Lifecycle for camera mode
  useEffect(() => {
    if (scanMode === 'camera') {
      startCamera(facingMode);
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [scanMode]);

  // Handle uploaded image file
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageError(null);
    try {
      const html5QrCode = new Html5Qrcode('qr-image-temp');
      const decodedText = await html5QrCode.scanFile(file, true);
      handleScanSuccess(decodedText);
    } catch (err) {
      console.warn('Image decode error:', err);
      setImageError('No valid QR code or barcode found in this image. Please ensure the code is clear and well-lit.');
    }
  };

  // Handle manual input submit
  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    handleScanSuccess(manualCode.trim());
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12">
      {/* Hidden container for image decoding */}
      <div id="qr-image-temp" className="hidden" />

      {/* Back Navigation */}
      <div className="flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-teal-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to National Portal
        </Link>
        <span className="text-xs font-mono font-bold text-teal-800 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200">
          Mobile QR Scanner v2.6
        </span>
      </div>

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-900 via-teal-800 to-emerald-900 text-white p-6 rounded-3xl shadow-xl border border-teal-700 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <QrCode className="w-48 h-48 text-white" />
        </div>
        <div className="relative z-10 flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/20">
            <Camera className="w-6 h-6 text-teal-200" />
          </div>
          <div>
            <span className="text-[11px] uppercase font-bold tracking-widest text-teal-200 block mb-1">
              Official Metrology Scanner
            </span>
            <h1 className="text-xl sm:text-2xl font-bold font-serif">
              Scan Instrument QR to Generate Certificate
            </h1>
            <p className="text-xs text-teal-100/90 mt-1 max-w-lg leading-relaxed">
              Point your smartphone camera or scanner at the statutory QR seal on any commercial weighing scale, weighbridge, or measuring instrument to authenticate and generate its Form V certificate.
            </p>
          </div>
        </div>
      </div>

      {/* Success Modal Overlay when scanned */}
      {scanResult && (
        <div className="p-6 bg-emerald-500 text-white rounded-2xl shadow-xl flex items-center gap-4 animate-in zoom-in-95">
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-7 h-7 text-white animate-bounce" />
          </div>
          <div>
            <span className="text-xs uppercase tracking-wider font-bold text-emerald-100 block">
              QR Code Detected!
            </span>
            <h3 className="font-bold text-base font-mono">
              {scanResult}
            </h3>
            <p className="text-xs text-emerald-100 mt-0.5">
              Generating official Form V Certificate...
            </p>
          </div>
        </div>
      )}

      {/* Scanner Mode Navigation Tabs */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm grid grid-cols-3 gap-2">
        <button
          onClick={() => setScanMode('camera')}
          className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
            scanMode === 'camera'
              ? 'bg-teal-800 text-white shadow-md'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Camera className="w-4 h-4" />
          <span>Live Camera</span>
        </button>

        <button
          onClick={() => setScanMode('upload')}
          className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
            scanMode === 'upload'
              ? 'bg-teal-800 text-white shadow-md'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Upload className="w-4 h-4" />
          <span>Upload Image</span>
        </button>

        <button
          onClick={() => setScanMode('manual')}
          className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
            scanMode === 'manual'
              ? 'bg-teal-800 text-white shadow-md'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Keyboard className="w-4 h-4" />
          <span>Manual / Barcode</span>
        </button>
      </div>

      {/* Active Tab Panel */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
        {/* MODE 1: Live Camera Scanner */}
        {scanMode === 'camera' && (
          <div className="space-y-4">
            <div className="relative overflow-hidden rounded-2xl bg-slate-950 min-h-[320px] flex items-center justify-center border-2 border-teal-700/50">
              {/* Html5Qrcode video inject container */}
              <div 
                id="qr-reader-container" 
                className="w-full max-w-[420px] overflow-hidden rounded-xl"
              />

              {/* Laser scan animation overlay */}
              {cameraActive && (
                <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
                  <div className="w-64 h-64 border-2 border-dashed border-teal-400/80 rounded-2xl relative shadow-[0_0_25px_rgba(20,184,166,0.3)]">
                    {/* Glowing scanning laser line */}
                    <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-teal-400 to-transparent shadow-[0_0_12px_#2dd4bf] animate-[bounce_2.5s_infinite]" />
                    <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-teal-300" />
                    <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-teal-300" />
                    <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-teal-300" />
                    <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-teal-300" />
                  </div>
                  <span className="text-[11px] font-mono text-teal-300 bg-slate-900/80 px-3 py-1 rounded-full mt-4 backdrop-blur-sm border border-teal-500/30">
                    Align QR code within the target frame
                  </span>
                </div>
              )}

              {/* Camera Loading state */}
              {scanning && !cameraActive && !cameraError && (
                <div className="absolute inset-0 bg-slate-900 flex flex-col items-center justify-center text-white space-y-3 p-4">
                  <RefreshCw className="w-8 h-8 text-teal-400 animate-spin" />
                  <p className="text-xs text-slate-300 font-medium">
                    Initializing smartphone camera stream...
                  </p>
                </div>
              )}

              {/* Error fallback */}
              {cameraError && (
                <div className="absolute inset-0 bg-slate-900 p-6 flex flex-col items-center justify-center text-center space-y-3">
                  <AlertCircle className="w-10 h-10 text-rose-500" />
                  <h4 className="text-white font-bold text-sm">Camera Unavailable</h4>
                  <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
                    {cameraError}
                  </p>
                  <button
                    onClick={() => startCamera(facingMode)}
                    className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold rounded-xl transition-colors inline-flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Retry Camera Access
                  </button>
                </div>
              )}
            </div>

            {/* Camera Controls */}
            {cameraActive && (
              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-slate-500 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping inline-block" />
                  Camera Active ({facingMode === 'environment' ? 'Rear Camera' : 'Front Camera'})
                </span>

                <button
                  onClick={toggleFacingMode}
                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl border border-slate-300 transition-colors inline-flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-teal-700" />
                  Switch Camera
                </button>
              </div>
            )}
          </div>
        )}

        {/* MODE 2: Upload Photo / Image Scanner */}
        {scanMode === 'upload' && (
          <div className="space-y-4">
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 hover:border-teal-600 bg-slate-50 hover:bg-teal-50/40 rounded-2xl p-8 text-center cursor-pointer transition-all space-y-3"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileUpload}
                className="hidden"
              />
              <div className="w-14 h-14 mx-auto rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center">
                <Upload className="w-7 h-7" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900">
                  Take a Photo or Select QR Image
                </h4>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Snap a photo of the statutory seal sticker or choose an image file from your device. Supports PNG, JPG, WEBP.
                </p>
              </div>
              <button
                type="button"
                className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold transition-colors shadow-sm inline-flex items-center gap-1.5"
              >
                <Camera className="w-4 h-4" /> Choose File / Take Photo
              </button>
            </div>

            {imageError && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{imageError}</span>
              </div>
            )}
          </div>
        )}

        {/* MODE 3: Manual Input & Barcode Gun */}
        {scanMode === 'manual' && (
          <form onSubmit={handleManualSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Certificate Number or QR Reference String
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  placeholder="e.g. KL-ERN-2026-004128 or MV-2026-0819"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-600 text-sm font-mono outline-none"
                  autoFocus
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold shrink-0 transition-colors shadow-sm"
                >
                  Generate
                </button>
              </div>
              <p className="text-[11px] text-slate-500 mt-1.5">
                Compatible with handheld USB/Bluetooth 2D barcode and QR laser scanner guns.
              </p>
            </div>
          </form>
        )}
      </div>

      {/* Interactive Quick-Test Simulation Cards */}
      <div className="bg-slate-50 rounded-3xl border border-slate-200 p-6 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-600" />
            <h3 className="font-bold text-sm text-slate-900 font-serif">
              Instant Demo Simulation (One-Click Test)
            </h3>
          </div>
          <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
            Issued Certificates
          </span>
        </div>

        <p className="text-xs text-slate-500">
          Want to test the certificate generation workflow without a physical instrument? Click any verified instrument below to simulate an instant scan:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {certificates.slice(0, 4).map((cert) => (
            <div
              key={cert.certificateNumber}
              onClick={() => handleScanSuccess(cert.certificateNumber)}
              className="p-3.5 bg-white rounded-xl border border-slate-200 hover:border-teal-500 hover:shadow-md cursor-pointer transition-all space-y-1.5 group"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-teal-900 group-hover:text-teal-700">
                  {cert.certificateNumber}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Simulate Scan →
                </span>
              </div>
              <h5 className="font-bold text-xs text-slate-800 line-clamp-1">
                {cert.instrumentType}
              </h5>
              <p className="text-[11px] text-slate-500">
                Trader: <strong>{cert.businessName}</strong>
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
