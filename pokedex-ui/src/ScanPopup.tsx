import React, { useRef, useState, useEffect } from 'react';
import spinner from './assets/spinner.svg';


interface ScanPopupProps {
  open: boolean;
  onClose: () => void;
  onScanResult: (creature: any) => void;
  onScanError?: (error: string) => void;
}


const ScanPopup: React.FC<ScanPopupProps> = ({ open, onClose, onScanResult, onScanError }) => {
  // Inject keyframes for animations
  useEffect(() => {
    const styleId = 'scan-popup-animations';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.innerHTML = `
        @keyframes scan-x-hover {
          0% { transform: scale(1) rotate(0deg); }
          60% { transform: scale(1.2) rotate(-20deg); }
          100% { transform: scale(1.1) rotate(-10deg); }
        }
        .scan-x-anim:hover {
          animation: scan-x-hover 0.35s cubic-bezier(.5,1.5,.5,1) forwards;
        }
        @keyframes scan-btn-hover {
          0% { transform: scale(1); }
          60% { transform: scale(1.08); }
          100% { transform: scale(1.04); }
        }
        .scan-btn-anim:hover {
          animation: scan-btn-hover 0.25s cubic-bezier(.5,1.5,.5,1) forwards;
        }
      `;
      document.head.appendChild(style);
    }
    return () => {
      const style = document.getElementById(styleId);
      if (style) style.remove();
    };
  }, []);
  // Reset image selection
  const handleRetake = () => {
    setImagePreview(null);
    setImageFile(null);
    setImageReady(false);
    setShowCamera(false);
  };
  // Track if an image has been uploaded or captured
  const [imageReady, setImageReady] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // (removed duplicate handleAnalyze)

  // Handle file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (ev) => {
        setImagePreview(ev.target?.result as string);
        setShowCamera(false);
        setImageReady(true);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle webcam (set flag, actual open in useEffect)
  const handleOpenCamera = () => {
    setShowCamera(true);
    setImagePreview(null);
  };

  // Open webcam stream when showCamera is true
  useEffect(() => {
    if (showCamera && videoRef.current) {
      let stream: MediaStream;
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(s => {
          stream = s;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play();
          }
        })
        .catch(() => {
          alert('Could not access webcam.');
          setShowCamera(false);
        });
      // Cleanup: stop stream when camera closes
      return () => {
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
        }
      };
    }
  }, [showCamera]);

  // Capture image from webcam as a square
  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      const size = 240;
      // Get video dimensions
      const videoWidth = video.videoWidth;
      const videoHeight = video.videoHeight;
      // Find the largest centered square
      const side = Math.min(videoWidth, videoHeight);
      const sx = (videoWidth - side) / 2;
      const sy = (videoHeight - side) / 2;
      if (context) {
        context.clearRect(0, 0, size, size);
        // Draw the cropped square from the video to the canvas (no circle clipping)
        context.drawImage(video, sx, sy, side, side, 0, 0, size, size);
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], 'webcam.png', { type: 'image/png' });
            setImageFile(file);
            setImagePreview(canvas.toDataURL('image/png'));
            setImageReady(true);
          }
        }, 'image/png');
      }
    }
    if (videoRef.current && videoRef.current.srcObject) {
      (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
    }
    setShowCamera(false);
  };
  // Send image to backend
  const handleAnalyze = async () => {
    if (!imageFile) return;
    setAnalyzing(true);
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      const res = await fetch('http://localhost:8000/api/v1/creature/identify', {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || 'Failed to identify creature');
      }
      const creature = await res.json();
      onScanResult(creature);
      setImagePreview(null);
      setImageFile(null);
      setAnalyzing(false);
      setImageReady(false);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Unknown error');
      if (onScanError) onScanError(err.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  // Close popup and stop camera if open
  const handleClosePopup = () => {
    onClose();
    setImagePreview(null);
    setShowCamera(false);
    setImageReady(false);
    setAnalyzing(false);
    if (videoRef.current && videoRef.current.srcObject) {
      (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
    }
  };


  if (!open) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
          background: 'rgba(0,0,0,0.45)',
        zIndex: 2000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      onClick={handleClosePopup}
    >
      <div
        style={{
            background: 'var(--pokedex-bg)',
            borderRadius: 24,
            padding: '2.5rem 2.5rem 2rem 2.5rem',
            minWidth: 420,
            maxWidth: 540,
            boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
        }}
        onClick={e => e.stopPropagation()}
      >
        <button
          className="scan-x-anim"
          style={{
            position: 'absolute',
            top: 18,
            right: 18,
            background: 'var(--pokedex-black)',
            color: 'var(--pokedex-bg)',
            border: 'none',
            borderRadius: '50%',
            width: 40,
            height: 40,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 24,
            cursor: 'pointer',
            boxShadow: '0 2px 6px rgba(0,0,0,0.10)',
            padding: 0,
            lineHeight: 1,
            transition: 'transform 0.18s',
          }}
          onClick={handleClosePopup}
          aria-label="Close scan popup"
        >
          ✕
        </button>
        <h2 style={{ margin: '0 0 1.5rem 0', color: '#d32f2f', fontWeight: 900, fontSize: '1.6rem' }}>Scan a Creature</h2>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24, width: '100%' }}>
          {analyzing && imagePreview ? (
            <div style={{ marginTop: 16, textAlign: 'center', width: '100%' }}>
              <img
                src={imagePreview}
                alt="Preview"
                style={{
                  width: 180,
                  height: 180,
                  borderRadius: 0,
                  objectFit: 'cover',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
                  background: '#eee',
                  display: 'block',
                  margin: '0 auto 18px auto',
                }}
              />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginTop: 12 }}>
                {error ? (
                  <span style={{ fontWeight: 500, color: '#d32f2f', fontSize: '0.95rem' }}>
                    Something went wrong, please try again
                  </span>
                ) : (
                  <>
                    <span>
                      <img src={spinner} alt="Loading" style={{ width: 28, height: 28, verticalAlign: 'middle' }} />
                    </span>
                      <span style={{ fontWeight: 700, color: 'var(--pokedex-red)', fontSize: '1.2rem' }}>Analyzing...</span>
                  </>
                )}
              </div>
            </div>
          ) : imagePreview && imageReady ? (
            <div style={{ marginTop: 16, textAlign: 'center' }}>
              <img
                src={imagePreview}
                alt="Preview"
                style={{
                  width: 180,
                  height: 180,
                  borderRadius: 0,
                  objectFit: 'cover',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
                  background: 'var(--pokedex-gray)',
                  display: 'block',
                  margin: '0 auto',
                }}
              />
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                <button
                  className="scan-btn-anim"
                  style={{
                    background: 'var(--pokedex-green)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 20,
                    padding: '0.5rem 1.5rem',
                    fontWeight: 700,
                    fontSize: '1.1rem',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    marginTop: 16,
                    opacity: loading ? 0.7 : 1,
                    transition: 'background 0.2s, color 0.2s, transform 0.18s',
                  }}
                  onClick={handleAnalyze}
                  disabled={loading}
                >
                  Analyze
                </button>
                <button
                  className="scan-btn-anim"
                  style={{
                      background: 'var(--pokedex-red)',
                      color: '#fff',
                    border: 'none',
                    borderRadius: 20,
                    padding: '0.5rem 1.5rem',
                    fontWeight: 700,
                    fontSize: '1.1rem',
                    cursor: 'pointer',
                    marginTop: 8,
                    transition: 'background 0.2s, color 0.2s, transform 0.18s',
                  }}
                  onClick={handleRetake}
                >
                  Retake
                </button>
              </div>
            </div>
          ) : (
            <>
              <label
                htmlFor="scan-upload-input"
                className="scan-btn-anim"
                style={{
                    background: 'var(--pokedex-red)',
                    color: 'var(--pokedex-bg)',
                  border: 'none',
                  borderRadius: 20,
                  padding: '0.5rem 1.5rem',
                  fontWeight: 700,
                  fontSize: '1.1rem',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  transition: 'background 0.2s, color 0.2s, transform 0.18s',
                  marginBottom: 12,
                  display: 'inline-block',
                }}
              >
                Upload Image
                <input
                  id="scan-upload-input"
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleFileChange}
                />
              </label>
              <span style={{ color: '#888', fontWeight: 500, fontSize: '1rem' }}>or</span>
              {!showCamera && (
                <button
                  className="scan-btn-anim"
                  style={{
                      background: 'var(--pokedex-red)',
                      color: 'var(--pokedex-bg)',
                    border: 'none',
                    borderRadius: 20,
                    padding: '0.5rem 1.5rem',
                    fontWeight: 700,
                    fontSize: '1.1rem',
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    transition: 'background 0.2s, color 0.2s, transform 0.18s',
                  }}
                  onClick={handleOpenCamera}
                >
                  Use Webcam
                </button>
              )}
              {showCamera && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 240,
                    height: 240,
                    borderRadius: 0,
                    overflow: 'hidden',
                    background: 'var(--pokedex-gray)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                  }}>
                    <video
                      ref={videoRef}
                      width={240}
                      height={240}
                      style={{
                        width: 240,
                        height: 240,
                        objectFit: 'cover',
                        borderRadius: 0,
                        background: 'var(--pokedex-gray)',
                        display: 'block',
                      }}
                    />
                  </div>
                  <button
                    className="scan-btn-anim"
                    style={{
                        background: 'var(--pokedex-green)',
                        color: '#fff',
                      border: 'none',
                      borderRadius: 20,
                      padding: '0.5rem 1.5rem',
                      fontWeight: 700,
                      fontSize: '1.1rem',
                      cursor: 'pointer',
                      marginTop: 8,
                      transition: 'background 0.2s, color 0.2s, transform 0.18s',
                    }}
                    onClick={handleCapture}
                  >
                    Capture
                  </button>
                </div>
              )}
            </>
          )}
          {/* Hidden canvas for capturing webcam image */}
          <canvas ref={canvasRef} width={240} height={240} style={{ display: 'none' }} />
        </div>
      </div>
    </div>
  );
};

export default ScanPopup;
