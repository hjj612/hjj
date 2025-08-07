'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// Supabase 클라이언트 설정
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
  timestamp: string; // Date 대신 string 타입으로 변경
}

const exampleQuestions = [
  {
    heading: '달러 환율',
    subheading: '현재 시세는?',
    message: 'USD/KRW 현재 환율이 얼마인가요?',
    currencyCode: 'USD'
  },
  {
    heading: '엔화 환율',
    subheading: '전망이 어떤가요?',
    message: 'JPY/KRW 환율 전망을 알려주세요',
    currencyCode: 'JPY'
  },
  {
    heading: '유로화 환율',
    subheading: '변동 추이는?',
    message: 'EUR/KRW 환율 변동 추이가 어떤가요?',
    currencyCode: 'EUR'
  },
  {
    heading: '위안화 환율',
    subheading: '예측해주세요',
    message: 'CNY/KRW 환율 예측해주세요',
    currencyCode: 'CNY'
  }
];

export default function ForexChatbot() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const formatTime = (timestamp: string) => {
    if (!mounted) return ''; // 클라이언트 사이드 렌더링 전에는 시간을 표시하지 않음
    const date = new Date(timestamp);
    return date.toLocaleTimeString('ko-KR', {
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: true
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // 사용자 메시지 추가
    const userMessage: Message = {
      id: Date.now(),
      text: input,
      sender: 'user',
      timestamp: new Date().toISOString(), // 문자열로 저장
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // API 호출
      const response = await fetch('/api/forex-prediction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: input }),
      });

      const data = await response.json();

      // 봇 응답 추가
      const botResponse: Message = {
        id: Date.now() + 1,
        text: data.response || data.error || '응답을 처리할 수 없습니다.',
        sender: 'bot',
        timestamp: new Date().toISOString(), // 문자열로 저장
      };

      setMessages(prev => [...prev, botResponse]);
    } catch (error) {
      console.error('Error:', error);
      
      // 안전한 오류 메시지 생성
      let safeErrorMessage = '죄송합니다. 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
      
      if (error instanceof Error) {
        safeErrorMessage = `오류: ${error.message}`;
      }
      
      const errorMessage: Message = {
        id: Date.now() + 1,
        text: safeErrorMessage,
        sender: 'bot',
        timestamp: new Date().toISOString(), // 문자열로 저장
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExampleClick = (message: string) => {
    setInput(message);
  };

  const handleCurrencyBlockClick = (currencyCode: string) => {
    router.push(`/currency/${currencyCode.toLowerCase()}`);
  };

  return (
    <div className="flex flex-col h-[450px] sm:h-[500px] bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
      <div className="bg-white text-black p-3 sm:p-4 border-b border-gray-200">
        <h2 className="text-lg sm:text-xl font-bold">환율 예측 챗봇</h2>
        <p className="text-xs sm:text-sm text-gray-600">USD, JPY, CNY, EUR의 환율 정보를 알려드립니다.</p>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        <div className="p-3 sm:p-4 bg-blue-50 rounded-lg m-3 sm:m-4 text-gray-700">
          <p className="font-medium mb-2 text-sm sm:text-base">안녕하세요! 환율 예측 챗봇입니다.</p>
          <p className="text-xs sm:text-sm">USD, JPY, CNY, EUR 중 어떤 통화의 환율을 알고 싶으신가요? 아래 환율 블록을 클릭하면 상세 분석을 볼 수 있습니다.</p>
        </div>
      
        <div className="p-3 sm:p-4">
          <h3 className="text-xs sm:text-sm font-medium text-gray-700 mb-2">환율 정보 바로가기</h3>
          <div className="grid grid-cols-2 gap-2 sm:gap-4 mb-4 sm:mb-6">
            {exampleQuestions.map((example, index) => (
              <div
                key={index}
                className="cursor-pointer border rounded-lg p-2 sm:p-4 hover:bg-blue-50 transition-colors flex flex-col relative group min-h-[60px] sm:min-h-[80px]"
                onClick={() => handleCurrencyBlockClick(example.currencyCode)}
              >
                <div className="font-semibold text-gray-900 flex items-center text-xs sm:text-sm">
                  {example.heading}
                  <span className="ml-1 text-[10px] sm:text-xs bg-blue-100 text-blue-800 px-1 sm:px-1.5 py-0.5 rounded">상세보기</span>
                </div>
                <div className="text-[10px] sm:text-sm text-gray-600">{example.subheading}</div>
                
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="bg-blue-500 text-white px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs whitespace-nowrap shadow-md">
                    클릭하여 상세 분석 보기
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {messages.length > 0 ? (
          <div className="space-y-3 sm:space-y-4 p-3 sm:p-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] sm:max-w-[70%] rounded-lg p-2 sm:p-3 ${
                    message.sender === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  <p className="whitespace-pre-line text-sm sm:text-base">{message.text}</p>
                  {mounted ? (
                    <p className="text-[10px] sm:text-xs mt-1 opacity-70">
                      {formatTime(message.timestamp)}
                    </p>
                  ) : null}
                </div>
              </div>
            ))}
            {isLoading ? (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-lg p-2 sm:p-3">
                  <div className="animate-pulse text-sm sm:text-base">입력 중...</div>
                </div>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>

      {/* 입력 폼 - 모바일에서 더 사용하기 편하게 */}
      <form onSubmit={handleSubmit} className="p-3 sm:p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="환율에 대해 궁금한 것을 물어보세요..."
            className="flex-1 p-2 sm:p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-3 sm:px-4 py-2 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm sm:text-base min-w-[60px] sm:min-w-[80px]"
          >
            {isLoading ? '전송중...' : '전송'}
          </button>
        </div>
      </form>
    </div>
  );
}