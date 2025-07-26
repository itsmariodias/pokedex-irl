import React, { useRef, useState, useEffect } from 'react';
import spinner from './assets/spinner.gif';


interface ScanPopupProps {
  open: boolean;
  onClose: () => void;
  onScanResult: (creature: any) => void;
  onScanError?: (error: string) => void;
}


const ScanPopup: React.FC<ScanPopupProps> = ({ open, onClose, onScanResult, onScanError }) => {
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
  const videoRef = useRef<HTMLVideoElement>(null);
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

  // Capture image from webcam as a perfect circle
  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const size = 240;
      const context = canvasRef.current.getContext('2d');
      if (context) {
        context.clearRect(0, 0, size, size);
        context.save();
        context.beginPath();
        context.arc(size / 2, size / 2, size / 2, 0, 2 * Math.PI);
        context.closePath();
        context.clip();
        context.drawImage(videoRef.current, 0, 0, size, size);
        context.restore();
        canvasRef.current.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], 'webcam.png', { type: 'image/png' });
            setImageFile(file);
            if (canvasRef.current) {
              setImagePreview(canvasRef.current.toDataURL('image/png'));
              setImageReady(true);
            }
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
          background: 'white',
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
          style={{
            position: 'absolute',
            top: 18,
            right: 18,
            background: '#d32f2f',
            color: 'white',
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
                  borderRadius: '50%',
                  objectFit: 'cover',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
                  background: '#eee',
                  display: 'block',
                  margin: '0 auto 18px auto',
                }}
              />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginTop: 12 }}>
                <span>
                  <img src={spinner} alt="Loading" style={{ width: 28, height: 28, verticalAlign: 'middle' }} />
                </span>
                <span style={{ fontWeight: 700, color: '#d32f2f', fontSize: '1.2rem' }}>Analyzing...</span>
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
                  borderRadius: '50%',
                  objectFit: 'cover',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
                  background: '#eee',
                  display: 'block',
                  margin: '0 auto',
                }}
              />
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                <button
                  style={{
                    background: '#388e3c',
                    color: 'white',
                    border: 'none',
                    borderRadius: 20,
                    padding: '0.5rem 1.5rem',
                    fontWeight: 700,
                    fontSize: '1.1rem',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    marginTop: 16,
                    opacity: loading ? 0.7 : 1,
                  }}
                  onClick={handleAnalyze}
                  disabled={loading}
                >
                  Analyze
                </button>
                <button
                  style={{
                    background: '#d32f2f',
                    color: 'white',
                    border: 'none',
                    borderRadius: 20,
                    padding: '0.5rem 1.5rem',
                    fontWeight: 700,
                    fontSize: '1.1rem',
                    cursor: 'pointer',
                    marginTop: 8,
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
                style={{
                  background: '#d32f2f',
                  color: 'white',
                  border: 'none',
                  borderRadius: 20,
                  padding: '0.5rem 1.5rem',
                  fontWeight: 700,
                  fontSize: '1.1rem',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  transition: 'background 0.2s, color 0.2s',
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
                  style={{
                    background: '#d32f2f',
                    color: 'white',
                    border: 'none',
                    borderRadius: 20,
                    padding: '0.5rem 1.5rem',
                    fontWeight: 700,
                    fontSize: '1.1rem',
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    transition: 'background 0.2s, color 0.2s',
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
                    borderRadius: '50%',
                    overflow: 'hidden',
                    background: '#eee',
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
                        borderRadius: '50%',
                        background: '#eee',
                        display: 'block',
                      }}
                    />
                  </div>
                  <button
                    style={{
                      background: '#388e3c',
                      color: 'white',
                      border: 'none',
                      borderRadius: 20,
                      padding: '0.5rem 1.5rem',
                      fontWeight: 700,
                      fontSize: '1.1rem',
                      cursor: 'pointer',
                      marginTop: 8,
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
