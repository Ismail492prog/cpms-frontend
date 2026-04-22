import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const FileUpload = ({ paymentId, onUploadComplete, buttonText = 'Upload Receipt' }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [showUploader, setShowUploader] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      if (!allowedTypes.includes(selectedFile.type)) {
        toast.error('Please upload a PDF, JPG, or PNG file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (selectedFile.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a file');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(`http://localhost:8080/api/documents/upload/receipt/${paymentId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });
      toast.success('Receipt uploaded successfully');
      setFile(null);
      setShowUploader(false);
      if (onUploadComplete) onUploadComplete();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to upload receipt');
    } finally {
      setUploading(false);
    }
  };

  if (!showUploader) {
    return (
      <button 
        className="upload-receipt-btn"
        onClick={() => setShowUploader(true)}
        title="Upload Receipt"
      >
        📎 {buttonText}
      </button>
    );
  }

  return (
    <div className="file-upload-popup">
      <input 
        type="file" 
        accept="image/*,.pdf" 
        onChange={handleFileChange}
        className="file-input"
      />
      {file && (
        <div className="file-info">
          <span>{file.name}</span>
          <button onClick={handleUpload} disabled={uploading} className="confirm-upload">
            {uploading ? 'Uploading...' : '✓'}
          </button>
        </div>
      )}
      <button onClick={() => setShowUploader(false)} className="cancel-upload">
        ✕
      </button>
    </div>
  );
};

export default FileUpload;