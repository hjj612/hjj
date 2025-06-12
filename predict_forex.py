import sys
import json
import pandas as pd
import numpy as np
from statsmodels.tsa.arima.model import ARIMA
from datetime import datetime, timedelta

def predict_forex(historical_data):
    try:
        # JSON 문자열을 파이썬 객체로 변환
        if isinstance(historical_data, str):
            data = json.loads(historical_data)
        else:
            data = historical_data
        
        # 데이터프레임 생성
        df = pd.DataFrame(data)
        df['timestamp'] = pd.to_datetime(df['timestamp'])
        df = df.sort_values('timestamp')
        
        # 타임스탬프를 인덱스로 설정
        df.set_index('timestamp', inplace=True)
        
        print("Data loaded successfully:", len(df), "records")
        print("Sample data:", df.head().to_dict('records'))
        
        # ARIMA 모델 파라미터
        p, d, q = 5, 1, 0  # AR=5, 차분=1, MA=0
        
        # 모델 학습
        model = ARIMA(df['rate'], order=(p,d,q))
        results = model.fit()
        
        print("Model fitted successfully")
        
        # 7일 예측
        forecast = results.forecast(steps=7)
        
        # 신뢰구간 계산 (95%)
        confidence = 0.95
        
        # 예측 결과 포맷팅
        predictions = []
        last_date = df.index[-1]
        
        for i in range(7):
            future_date = (last_date + timedelta(days=i+1)).date()
            predictions.append({
                'target_date': future_date.isoformat(),
                'predicted_rate': float(forecast.iloc[i]),
                'confidence': confidence
            })
        
        print("Predictions generated successfully")
        return json.dumps(predictions)
    
    except Exception as e:
        print("Error in predict_forex:", str(e))
        raise

if __name__ == "__main__":
    try:
        # 명령줄 인수에서 데이터 읽기
        if len(sys.argv) > 1:
            historical_data = sys.argv[1]
        else:
            # 테스트 데이터 생성
            test_data = []
            base_rate = 1386.85
            base_date = datetime.now()  # 현재 날짜를 기준으로 변경
            
            for i in range(90):
                test_data.append({
                    'currency': 'USD',
                    'rate': base_rate + np.random.normal(0, 1),
                    'timestamp': (base_date - timedelta(days=i)).isoformat()
                })
            historical_data = test_data
        
        # 예측 수행 및 결과 출력
        result = predict_forex(historical_data)
        print("\nPrediction results:")
        print(result)
    
    except Exception as e:
        print("Error in main:", str(e))
        sys.exit(1) 