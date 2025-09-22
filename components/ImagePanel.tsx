import React, { useState, DragEvent } from 'react';
import { UploadIcon, SpinnerIcon } from './IconComponents';

interface ImagePanelProps {
  title: string;
  imageUrl: string | null;
  isLoading?: boolean;
  onFileChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onFileDrop?: (file: File) => void;
  inputId: string;
}

const ImagePanel: React.FC<ImagePanelProps> = ({ title, imageUrl, isLoading = false, onFileChange, onFileDrop, inputId }) => {
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (onFileDrop) {
      setIsDraggingOver(true);
    }
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
  };
  
  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);

    if (onFileDrop && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileDrop(e.dataTransfer.files[0]);
      e.dataTransfer.clearData();
    }
  };


  const content = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-gray-400">
          <SpinnerIcon className="animate-spin h-12 w-12 mb-4" />
          <p className="text-lg font-semibold">AI가 미래 모습을 생성중입니다...</p>
          <p className="text-sm">잠시만 기다려주세요.</p>
        </div>
      );
    }

    if (imageUrl) {
      return (
        <img src={imageUrl} alt={title} className="w-full h-full object-cover rounded-xl" />
      );
    }

    if (onFileChange) {
      return (
        <label htmlFor={inputId} className="cursor-pointer flex flex-col items-center justify-center h-full text-gray-400 hover:text-blue-400 transition-colors">
          <UploadIcon className="w-16 h-16 mb-4" />
          <h3 className="text-xl font-bold">아이 사진 업로드</h3>
          <p className="mt-1 text-sm">여기로 파일을 드래그하거나 클릭하세요</p>
          <input id={inputId} type="file" className="hidden" accept="image/png, image/jpeg" onChange={onFileChange} />
        </label>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500">
        <div className="w-16 h-16 mb-4 rounded-full bg-gray-700 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </div>
        <h3 className="text-xl font-bold">생성된 이미지</h3>
        <p className="mt-1 text-sm">결과가 여기에 표시됩니다</p>
      </div>
    );
  };

  const borderColor = isDraggingOver ? 'border-blue-500' : 'border-gray-600';

  return (
    <div className="w-full">
      <h2 className="text-lg font-semibold text-center mb-3">{title}</h2>
      <div 
        className={`bg-gray-800 border-2 border-dashed ${borderColor} rounded-xl aspect-square p-4 flex flex-col items-center justify-center transition-all duration-300`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <div className="w-full h-full flex items-center justify-center relative">
          {content()}
        </div>
      </div>
    </div>
  );
};

export default ImagePanel;
