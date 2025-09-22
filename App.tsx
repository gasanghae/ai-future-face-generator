import React, { useState } from 'react';
import { Gender } from './types';
import { generateFutureImage } from './services/geminiService';
import ImagePanel from './components/ImagePanel';
import { RefreshIcon, DownloadIcon } from './components/IconComponents';

const App: React.FC = () => {
  const [sourceImageFile, setSourceImageFile] = useState<File | null>(null);
  const [sourceImageUrl, setSourceImageUrl] = useState<string | null>(null);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [gender, setGender] = useState<Gender | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const processFile = (file: File) => {
    if (file && (file.type === 'image/jpeg' || file.type === 'image/png')) {
      setSourceImageFile(file);
      setSourceImageUrl(URL.createObjectURL(file));
      setGeneratedImageUrl(null);
      setError(null);
    } else {
      setError('JPEG 또는 PNG 형식의 이미지 파일을 업로드해주세요.');
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };
  
  const handleFileDrop = (file: File) => {
    processFile(file);
  };

  const handleGenerate = async () => {
    if (!sourceImageFile || !gender) {
      setError('사진을 업로드하고 성별을 선택해주세요.');
      return;
    }
    setError(null);
    setIsLoading(true);
    setGeneratedImageUrl(null);

    try {
      const resultUrl = await generateFutureImage(sourceImageFile, gender);
      setGeneratedImageUrl(resultUrl);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('알 수 없는 오류가 발생했습니다.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = () => {
    if (!generatedImageUrl) return;

    const link = document.createElement('a');
    link.href = generatedImageUrl;
    
    const mimeType = generatedImageUrl.match(/data:(.*);base64,/)?.[1];
    const extension = mimeType ? mimeType.split('/')[1] : 'png';

    link.download = `ai_future_face.${extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const GenderButton: React.FC<{ value: Gender; label: string }> = ({ value, label }) => {
    const isSelected = gender === value;
    return (
      <button
        onClick={() => setGender(value)}
        className={`w-full py-3 px-4 rounded-lg text-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
          isSelected 
            ? 'bg-blue-600 text-white shadow-lg transform scale-105' 
            : 'bg-gray-700 hover:bg-gray-600'
        }`}
        disabled={isLoading}
      >
        {label}
      </button>
    );
  };
  
  const isCreationDone = generatedImageUrl !== null;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 sm:p-8 flex flex-col">
      <header className="text-center my-8 sm:my-12">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
          우리 아이의 미래 모습
        </h1>
        <p className="text-lg text-gray-300 mt-2">AI 성장 예측 사진</p>
      </header>

      <main className="flex-grow container mx-auto max-w-7xl w-full grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
        <div className="w-full">
          <ImagePanel
            title="원본 사진"
            imageUrl={sourceImageUrl}
            onFileChange={handleFileChange}
            onFileDrop={handleFileDrop}
            inputId="source-image-upload"
          />
        </div>

        <div className="flex flex-col items-center justify-center space-y-6 px-4">
            <div className="w-full space-y-3">
                <p className="text-center text-gray-300 font-medium">1. 성별을 선택하세요</p>
                <div className="grid grid-cols-2 gap-4">
                    <GenderButton value={Gender.MALE} label="남자아이" />
                    <GenderButton value={Gender.FEMALE} label="여자아이" />
                </div>
            </div>
          
            {error && <p className="text-red-400 text-center bg-red-900/50 p-3 rounded-lg">{error}</p>}
          
            {isCreationDone ? (
                 <div className="w-full space-y-4">
                    <button
                        onClick={handleGenerate}
                        disabled={isLoading}
                        className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-4 px-6 rounded-lg text-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg disabled:shadow-none transform hover:scale-105 flex items-center justify-center gap-2"
                    >
                        <RefreshIcon className="w-6 h-6" />
                        다시 만들기
                    </button>
                    <button
                        onClick={handleSave}
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-lg text-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg"
                    >
                        <DownloadIcon className="w-6 h-6" />
                        이미지 저장
                    </button>
                 </div>
            ) : (
                <button
                    onClick={handleGenerate}
                    disabled={isLoading || !sourceImageFile || !gender}
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-4 px-6 rounded-lg text-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg disabled:shadow-none transform hover:scale-105"
                >
                    {isLoading ? '생성 중...' : '만들기'}
                </button>
            )}

        </div>
        
        <div className="w-full">
          <ImagePanel
            title="AI 예측 사진"
            imageUrl={generatedImageUrl}
            isLoading={isLoading}
            inputId="generated-image"
          />
        </div>
      </main>
      
      <footer className="text-center mt-8 text-gray-500">
        <p>사용 방법: 1. 아이의 정면 사진을 업로드하세요. 2. 성별을 선택하세요. 3. '만들기' 버튼을 누르고 잠시 기다려주세요.</p>
        <p className="text-xs mt-2">본 결과는 AI에 의해 생성된 가상의 이미지이며 실제와 다를 수 있습니다.</p>
      </footer>
    </div>
  );
};

export default App;