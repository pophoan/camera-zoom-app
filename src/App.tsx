import React, { useState, useEffect, useRef } from 'react';
import { ZoomIn, ZoomOut, Camera, Camera as FlipCamera2 } from 'lucide-react';

function App() {
  const [scale, setScale] = useState(1);
  const [hasCamera, setHasCamera] = useState(false);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [isRequesting, setIsRequesting] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [supportsOpticalZoom, setSupportsOpticalZoom] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const touchesRef = useRef<Touch[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const updateZoom = async (newScale: number) => {
    const clampedScale = Math.min(Math.max(newScale, 1), 5);
    setScale(clampedScale);

    if (supportsOpticalZoom && streamRef.current) {
      try {
        const videoTrack = streamRef.current.getVideoTracks()[0];
        const capabilities = videoTrack.getCapabilities();
        
        if (capabilities.zoom) {
          const zoomRange = capabilities.zoom.max - capabilities.zoom.min;
          const normalizedZoom = capabilities.zoom.min + (zoomRange * ((clampedScale - 1) / 4));
          await videoTrack.applyConstraints({
            advanced: [{ zoom: normalizedZoom }]
          });
          // 如果成功應用光學變焦，就不需要使用數位變焦
          return;
        }
      } catch (err) {
        console.warn('Optical zoom failed, falling back to digital zoom:', err);
      }
    }
    
    // Fallback to digital zoom if optical zoom is not supported or fails
    if (videoRef.current) {
      videoRef.current.style.transform = `scale(${clampedScale})`;
    }
  };

  const zoomIn = () => updateZoom(scale + 0.2);
  const zoomOut = () => updateZoom(scale - 0.2);

  const stopCurrentStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const startCamera = async () => {
    setIsRequesting(true);
    setError(null);
    stopCurrentStream();

    try {
      const constraints = {
        video: {
          facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      
      // Check if optical zoom is supported
      const videoTrack = stream.getVideoTracks()[0];
      const capabilities = videoTrack.getCapabilities();
      setSupportsOpticalZoom(!!capabilities.zoom);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().catch(e => {
            console.error('Video play error:', e);
            setError('無法播放相機畫面，請重新整理頁面');
          });
        };
        setHasCamera(true);
      }
    } catch (err) {
      console.error('Camera access error:', err);
      setHasCamera(false);
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError') {
          setError('相機權限被拒絕，請在瀏覽器設定中允許使用相機');
        } else if (err.name === 'NotFoundError') {
          setError('找不到相機裝置');
        } else if (err.name === 'NotReadableError') {
          setError('無法存取相機，可能被其他應用程式占用');
        } else {
          setError('相機存取發生錯誤，請重新整理頁面');
        }
      }
    } finally {
      setIsRequesting(false);
    }
  };

  const toggleCamera = async () => {
    const newMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(newMode);
    await startCamera();
  };

  useEffect(() => {
    startCamera();
    return () => {
      stopCurrentStream();
    };
  }, []);

  useEffect(() => {
    const content = contentRef.current;
    if (!content) return;

    let initialDistance = 0;
    let initialScale = 1;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        initialDistance = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        initialScale = scale;
      }
      touchesRef.current = Array.from(e.touches);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length !== 2) return;
      e.preventDefault();

      const currentDistance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      
      const scaleFactor = currentDistance / initialDistance;
      updateZoom(initialScale * scaleFactor);
    };

    const handleTouchEnd = () => {
      touchesRef.current = [];
      initialDistance = 0;
    };

    content.addEventListener('touchstart', handleTouchStart);
    content.addEventListener('touchmove', handleTouchMove, { passive: false });
    content.addEventListener('touchend', handleTouchEnd);

    return () => {
      content.removeEventListener('touchstart', handleTouchStart);
      content.removeEventListener('touchmove', handleTouchMove);
      content.removeEventListener('touchend', handleTouchEnd);
    };
  }, [scale]);

  return (
    <div className="min-h-screen bg-black">
      <div className="relative h-screen flex flex-col">
        {/* Camera View */}
        <div 
          ref={contentRef}
          className="flex-1 relative overflow-hidden"
          style={{ touchAction: 'none' }}
        >
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-cover ${hasCamera ? 'block' : 'hidden'}`}
            style={{ 
              transform: `scale(${!supportsOpticalZoom ? scale : 1})`,
              transition: 'transform 0.1s ease-out'
            }}
          />
          
          {(!hasCamera || error) && (
            <div className="w-full h-full flex items-center justify-center bg-gray-900">
              <div className="text-center text-white p-6">
                <Camera className="w-20 h-20 mx-auto mb-6 opacity-50" />
                <h2 className="text-2xl font-semibold mb-4">
                  {isRequesting ? '請允許相機權限' : error || '無法存取相機'}
                </h2>
                <p className="text-base opacity-70 max-w-xs mx-auto">
                  {isRequesting 
                    ? '請在彈出的視窗中允許使用相機，以開始使用此功能'
                    : '請確認您的瀏覽器設定中已允許使用相機，並重新整理頁面'}
                </p>
                {(!isRequesting || error) && (
                  <button
                    onClick={() => {
                      setError(null);
                      startCamera();
                    }}
                    className="mt-6 px-6 py-2 bg-white/20 rounded-full text-white hover:bg-white/30 transition-colors"
                  >
                    重試
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Zoom Level Indicator */}
          {hasCamera && (
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black/50 px-4 py-2 rounded-full backdrop-blur-sm">
              <span className="text-white text-sm font-medium">
                縮放: {(scale * 100).toFixed(0)}%
                {supportsOpticalZoom ? ' (光學)' : ' (數位)'}
              </span>
            </div>
          )}
        </div>

        {/* Controls */}
        {hasCamera && !error && (
          <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/80 to-transparent">
            <div className="flex justify-between items-center max-w-md mx-auto">
              <button
                onClick={zoomOut}
                className="flex items-center justify-center w-16 h-16 bg-white/20 rounded-full backdrop-blur-sm hover:bg-white/30 active:bg-white/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={scale <= 1}
              >
                <ZoomOut className="w-8 h-8 text-white" />
              </button>
              
              <button
                onClick={toggleCamera}
                className="flex items-center justify-center w-16 h-16 bg-white/20 rounded-full backdrop-blur-sm hover:bg-white/30 active:bg-white/40 transition-colors mx-4"
              >
                <FlipCamera2 className="w-8 h-8 text-white" />
              </button>

              <button
                onClick={zoomIn}
                className="flex items-center justify-center w-16 h-16 bg-white/20 rounded-full backdrop-blur-sm hover:bg-white/30 active:bg-white/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={scale >= 5}
              >
                <ZoomIn className="w-8 h-8 text-white" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;