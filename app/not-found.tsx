import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">404 - 페이지를 찾을 수 없습니다</h2>
        <p className="text-gray-600 mb-6">
          요청하신 페이지를 찾을 수 없습니다. URL을 확인하시거나 메인 페이지로 이동해 주세요.
        </p>
        <Link
          href="/"
          className="inline-block bg-blue-500 text-white py-2 px-6 rounded hover:bg-blue-600 transition-colors"
        >
          메인 페이지로 이동
        </Link>
      </div>
    </div>
  );
} 