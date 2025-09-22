import { Gender } from '../types';

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1]); // Remove the data URL prefix
    };
    reader.onerror = error => reject(error);
  });
};

const professions = [
  '운동선수', '의사', '교사', '아이돌', '만화가', '경찰', '요리사', 
  '변호사', 'IT전문가', '군인', '디자이너', '간호사', '사업가'
];

export const generateFutureImage = async (imageFile: File, gender: Gender): Promise<string> => {
  const base64Data = await fileToBase64(imageFile);
  const mimeType = imageFile.type;

  // 서버리스 API만 호출 (브라우저 번들에서 API 키 참조 제거)
  const res = await fetch('/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageBase64: base64Data, mimeType, gender: gender === Gender.MALE ? 'male' : 'female' }),
  });
  if (res.ok) {
    const json = await res.json();
    if (json?.dataUrl) return json.dataUrl as string;
    throw new Error('서버 응답에 이미지 데이터가 없습니다.');
  }
  const detail = await safeReadText(res);
  throw new Error(`API 호출 실패: ${res.status}${detail ? ` - ${detail}` : ''}`);
};

async function safeReadText(res: Response): Promise<string | null> {
  try {
    const t = await res.text();
    return t?.slice(0, 200) || null;
  } catch {
    return null;
  }
}