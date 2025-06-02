"use client";

import Link from 'next/link';

export default function ForexReliabilityIndicator() {
  return (
    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-green-800 mb-2 flex items-center">
            <span className="mr-2">📈</span>
            예측 신뢰도 향상 시스템
          </h3>
          <p className="text-sm text-green-700 mb-3">
            AI 앙상블 모델과 실시간 시장 분석을 통해 환율 예측의 정확도를 높였습니다.
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <div className="bg-white p-3 rounded-lg border border-green-100">
              <div className="text-xs text-green-600 font-medium">앙상블 모델</div>
              <div className="text-lg font-bold text-green-700">+8%</div>
              <div className="text-xs text-gray-600">신뢰도 향상</div>
            </div>
            
            <div className="bg-white p-3 rounded-lg border border-green-100">
              <div className="text-xs text-green-600 font-medium">변동성 조정</div>
              <div className="text-lg font-bold text-green-700">+5%</div>
              <div className="text-xs text-gray-600">신뢰도 향상</div>
            </div>
            
            <div className="bg-white p-3 rounded-lg border border-green-100">
              <div className="text-xs text-green-600 font-medium">시장 체제 인식</div>
              <div className="text-lg font-bold text-green-700">+4%</div>
              <div className="text-xs text-gray-600">신뢰도 향상</div>
            </div>
            
            <div className="bg-white p-3 rounded-lg border border-green-100">
              <div className="text-xs text-green-600 font-medium">실시간 분석</div>
              <div className="text-lg font-bold text-green-700">+3%</div>
              <div className="text-xs text-gray-600">신뢰도 향상</div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-sm text-green-600">
              <span className="font-medium">총 신뢰도 향상:</span> 
              <span className="text-lg font-bold ml-1">5-15%</span>
            </div>
            <div className="text-xs text-gray-500">
              * 기존 ARIMA 모델 대비
            </div>
          </div>
        </div>
        
        <div className="ml-6 flex flex-col space-y-2">
          <Link 
            href="/charts" 
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium text-center"
          >
            환율 차트 보기
          </Link>
          <div className="text-xs text-center text-gray-500">
            통화별 상세 분석
          </div>
        </div>
      </div>
      
      {/* 기술 설명 */}
      <div className="mt-4 pt-4 border-t border-green-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <span className="font-medium text-green-700">앙상블 방법론:</span>
            <span className="text-gray-600 ml-1">ARIMA + 선형회귀 + 지수평활 + 이동평균 조합</span>
          </div>
          <div>
            <span className="font-medium text-green-700">실시간 조정:</span>
            <span className="text-gray-600 ml-1">시장 변동성, 트렌드 강도, 데이터 품질 반영</span>
          </div>
          <div>
            <span className="font-medium text-green-700">시장 체제:</span>
            <span className="text-gray-600 ml-1">정상/변동성/위기 상황 자동 감지</span>
          </div>
          <div>
            <span className="font-medium text-green-700">성능 모니터링:</span>
            <span className="text-gray-600 ml-1">백테스팅 기반 실시간 성능 평가</span>
          </div>
        </div>
      </div>
    </div>
  );
} 