import React, { useRef, useState } from 'react';
import Webcam from 'react-webcam';
import { predict } from '../services/api';

const UploadSection = ({ setResult, setLoading, showToast }) => {
  const [imageSrc, setImageSrc] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const webcamRef = useRef(null);
  const fileInputRef = useRef(null);

  const MAX_SIZE_MB = 16;
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

  const validateFile = (file) => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      showToast('Invalid file type. Please upload JPG, PNG, or WEBP.', 'error');
      return false;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      showToast(`File too large. Max ${MAX_SIZE_MB}MB.`, 'error');
      return false;
    }
    return true;
  };

  const handleFile = (file) => {
    if (!validateFile(file)) return;
    const reader = new FileReader();
    reader.onload = (e) => setImageSrc(e.target.result);
    reader.readAsDataURL(file);
    window.selectedFile = file;
    setShowCamera(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const capturePhoto = () => {
    const screenshot = webcamRef.current.getScreenshot();
    setImageSrc(screenshot);
    setShowCamera(false);
    fetch(screenshot)
      .then(res => res.blob())
      .then(blob => {
        const file = new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' });
        window.selectedFile = file;
      });
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) handleFile(file);
  };

  const handlePredict = async () => {
    if (!window.selectedFile) {
      showToast('Please select or capture an image first', 'error');
      return;
    }
    const formData = new FormData();
    formData.append('image', window.selectedFile);
    setLoading(true);
    try {
      const res = await predict(formData);
      setResult(res.data);
      showToast('Prediction complete!', 'success');
    } catch (err) {
      showToast('Prediction failed: ' + (err.response?.data?.msg || err.message), 'error');
    } finally {
      setLoading(false);
    }
  };

  const resetImage = () => {
    setImageSrc(null);
    window.selectedFile = null;
    setResult(null);
  };

  if (imageSrc) {
    return (
      <div className="glass-card" style={{ textAlign: 'center' }}>
        <div className="preview-container">
          <img src={imageSrc} alt="Preview" className="preview-image" />
          <button className="remove-preview" onClick={resetImage}>✕</button>
        </div>
        <button className="btn-primary" onClick={handlePredict} style={{ marginTop: '1rem' }}>
          Analyze Disease
        </button>
      </div>
    );
  }

  return (
    <div className="glass-card">
      <div
        className={`upload-zone ${dragActive ? 'drag-active' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current.click()}
      >
        <div className="upload-icon">📂</div>
        <p>Drag & drop or click to upload</p>
        <p className="small">JPG, PNG, WEBP (max 16MB)</p>
      </div>
      <div style={{ marginTop: '1rem', textAlign: 'center' }}>
        <button className="btn-outline" onClick={() => setShowCamera(true)}>
          📸 Use Camera
        </button>
      </div>
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp"
        ref={fileInputRef}
        onChange={handleFileUpload}
        style={{ display: 'none' }}
      />
      {showCamera && (
        <div className="webcam-container">
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            videoConstraints={{ facingMode: 'environment' }}
          />
          <div className="webcam-buttons">
            <button className="btn-outline" onClick={() => setShowCamera(false)}>Cancel</button>
            <button className="btn-primary" onClick={capturePhoto}>Capture</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadSection;