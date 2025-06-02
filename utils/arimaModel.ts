// 간단한 시계열 예측 모델 (ARIMA 대신 이동평균 기반)
interface PredictionParams {
  p: number; // 과거 데이터 참조 개수
  d: number; // 차분 횟수  
  q: number; // 이동평균 개수
}

export class ArimaModel {
  private params: PredictionParams;
  private data: number[];
  private weights: number[];

  constructor(params: PredictionParams) {
    this.params = params;
    this.data = [];
    this.weights = [];
  }

  // 데이터 차분
  private difference(data: number[], order: number): number[] {
    if (order === 0) return [...data];
    let result = [...data];
    for (let i = 0; i < order; i++) {
      const temp = [];
      for (let j = 1; j < result.length; j++) {
        temp.push(result[j] - result[j - 1]);
      }
      result = temp;
    }
    return result;
  }

  // 모델 학습 (간단한 가중평균 방식)
  public fit(data: number[]) {
    this.data = [...data];
    
    if (data.length === 0) {
      this.weights = [1];
      return;
    }

    // 차분 적용
    const processedData = this.difference(data, this.params.d);
    
    if (processedData.length <= this.params.p) {
      // 데이터가 부족한 경우 균등 가중치
      this.weights = new Array(Math.min(this.params.p, processedData.length)).fill(1);
      const sum = this.weights.reduce((a, b) => a + b, 0);
      this.weights = this.weights.map(w => w / sum);
      return;
    }

    // 간단한 지수 가중 평균 계수 계산
    this.weights = [];
    for (let i = 0; i < this.params.p; i++) {
      // 최근 데이터에 더 높은 가중치
      const weight = Math.exp(-0.1 * i);
      this.weights.push(weight);
    }
    
    // 가중치 정규화
    const totalWeight = this.weights.reduce((a, b) => a + b, 0);
    if (totalWeight > 0) {
      this.weights = this.weights.map(w => w / totalWeight);
    } else {
      this.weights = new Array(this.params.p).fill(1 / this.params.p);
    }
  }

  // 예측
  public predict(steps: number): number[] {
    if (this.data.length === 0) {
      return new Array(steps).fill(0);
    }

    // 차분된 데이터로 작업
    const processedData = this.difference(this.data, this.params.d);
    
    if (processedData.length === 0) {
      const lastValue = this.data[this.data.length - 1] || 0;
      return new Array(steps).fill(lastValue);
    }

    const predictions: number[] = [];
    let recentValues = [...processedData.slice(-this.params.p)];

    // 데이터가 부족한 경우 0으로 패딩
    while (recentValues.length < this.params.p) {
      recentValues.unshift(0);
    }

    for (let i = 0; i < steps; i++) {
      let prediction = 0;
      
      // 가중 평균으로 다음 값 예측
      for (let j = 0; j < Math.min(this.weights.length, recentValues.length); j++) {
        prediction += this.weights[j] * recentValues[recentValues.length - 1 - j];
      }

      predictions.push(prediction);
      
      // 예측값을 다음 예측을 위한 데이터로 사용
      recentValues = [...recentValues.slice(1), prediction];
    }

    // 차분을 되돌리는 과정
    let result = [...predictions];
    for (let i = 0; i < this.params.d; i++) {
      const lastOriginalValue = this.data[this.data.length - 1] || 0;
      const temp = [lastOriginalValue];
      
      for (let j = 0; j < result.length; j++) {
        temp.push(temp[temp.length - 1] + result[j]);
      }
      result = temp.slice(1);
    }

    return result;
  }

  // 신뢰도 계산
  public calculateConfidence(predictions: number[]): number[] {
    const volatility = this.calculateVolatility();
    
    return predictions.map((_, index) => {
      // 예측 기간이 늘어날수록 신뢰도는 감소
      const timeFactor = Math.exp(-0.15 * (index + 1));
      const volatilityFactor = Math.max(0.3, 1 - volatility * 0.1);
      const baseConfidence = 85; // 기본 신뢰도
      
      return Math.max(30, Math.min(100, baseConfidence * timeFactor * volatilityFactor));
    });
  }

  // 변동성 계산
  private calculateVolatility(): number {
    if (this.data.length < 2) return 0.1;
    
    const returns = [];
    for (let i = 1; i < this.data.length; i++) {
      if (this.data[i - 1] !== 0) {
        returns.push((this.data[i] - this.data[i - 1]) / this.data[i - 1]);
      }
    }
    
    if (returns.length === 0) return 0.1;
    
    const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
    const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - mean, 2), 0) / returns.length;
    
    return Math.sqrt(variance);
  }

  // 표준편차 계산 (하위 호환성)
  private calculateStandardDeviation(data: number[]): number {
    if (data.length === 0) return 1;
    const mean = data.reduce((a, b) => a + b) / data.length;
    const squaredDiffs = data.map(x => Math.pow(x - mean, 2));
    const variance = squaredDiffs.reduce((a, b) => a + b) / data.length;
    return Math.sqrt(variance);
  }
} 