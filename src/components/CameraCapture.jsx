/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';

const CameraCapture = ({ onCapture, onClose }) => {
  const [stream, setStream] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    streamRef.current = stream;
  }, [stream]);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch {
      toast.error('Unable to access camera. Please check permissions.');
    }
  };

  useEffect(() => {
    startCamera();
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      context.drawImage(videoRef.current, 0, 0);
      const imageData = canvasRef.current.toDataURL('image/jpeg');
      setCapturedImage(imageData);
      stopCamera();
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    startCamera();
  };

  const savePhoto = () => {
    if (capturedImage) {
      onCapture(capturedImage);
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content camera-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>📸 Capture Receipt</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="camera-container">
          {!capturedImage ? (
            <>
              <video ref={videoRef} autoPlay playsInline className="camera-preview" />
              <canvas ref={canvasRef} style={{ display: 'none' }} />
              <button className="capture-btn" onClick={capturePhoto}>
                📷 Capture
              </button>
            </>
          ) : (
            <>
              <img src={capturedImage} alt="Captured receipt" className="captured-image" />
              <div className="capture-buttons">
                <button className="btn-secondary" onClick={retakePhoto}>Retake</button>
                <button className="btn-primary" onClick={savePhoto}>Use Photo</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CameraCapture;