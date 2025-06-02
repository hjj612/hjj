import * as tf from '@tensorflow/tfjs';

// 간단한 시계열 예측 모델 (ARIMA 대신 이동평균 기반)
interface ArimaParams {
  p: number; // AR order (자기회귀 차수)
  d: number; // Difference order (차분 차수)
  q: number; // MA order (이동평균 차수)
}

export class ArimaModel {
  private params: ArimaParams;
  private data: number[];
  private differenced: number[];
  private arCoefficients: number[];
  private maCoefficients: number[];
  private residuals: number[];

  constructor(params: ArimaParams) {
    this.params = params;
    this.data = [];
    this.differenced = [];
    this.arCoefficients = [];
    this.maCoefficients = [];
    this.residuals = [];
  }

  // 데이터 차분 (I 성분)
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

  // 자체 구현 최소제곱법 (Gauss-Seidel 반복법)
  private solveLinearSystem(X: number[][], y: number[]): number[] {
    const m = X.length;
    const n = X[0]?.length || 0;
    
    if (m === 0 || n === 0) {
      return new Array(n).fill(0);
    }

    // 정규방정식 A = X^T * X; b = X^T * y
    const A: number[][] = [];
    const b: number[] = [];

    // A = X^T * X 계산
    for (let i = 0; i < n; i++) {
      A[i] = new Array(n).fill(0);
      for (let j = 0; j < n; j++) {
        for (let k = 0; k < m; k++) {
          A[i][j] += X[k][i] * X[k][j];
        }
      }
    }

    // b = X^T * y 계산
    for (let i = 0; i < n; i++) {
      b[i] = 0;
      for (let k = 0; k < m; k++) {
        b[i] += X[k][i] * y[k];
      }
    }

    // 수치 안정성을 위한 정규화 (Ridge regression)
    for (let i = 0; i < n; i++) {
      A[i][i] += 1e-6;
    }

    // Gauss-Seidel 반복법으로 해결
    let x = new Array(n).fill(0);
    const maxIter = 100;
    const tolerance = 1e-8;

    for (let iter = 0; iter < maxIter; iter++) {
      const oldX = [...x];
      
      for (let i = 0; i < n; i++) {
        let sum = 0;
        for (let j = 0; j < n; j++) {
          if (i !== j) {
            sum += A[i][j] * x[j];
          }
        }
        
        if (Math.abs(A[i][i]) > 1e-10) {
          x[i] = (b[i] - sum) / A[i][i];
        }
      }

      // 수렴 확인
      let maxChange = 0;
      for (let i = 0; i < n; i++) {
        maxChange = Math.max(maxChange, Math.abs(x[i] - oldX[i]));
      }
      
      if (maxChange < tolerance) break;
    }

    return x;
  }

  // 자기회귀(AR) 모델 학습
  private fitAR(data: number[]): number[] {
    if (data.length <= this.params.p) {
      return new Array(this.params.p).fill(1 / this.params.p);
    }

    const X: number[][] = [];
    const y: number[] = [];

    // AR 설계행렬 생성
    for (let i = this.params.p; i < data.length; i++) {
      const row = [];
      for (let j = 0; j < this.params.p; j++) {
        row.push(data[i - j - 1]);
      }
      X.push(row);
      y.push(data[i]);
    }

    return this.solveLinearSystem(X, y);
  }

  // 이동평균(MA) 모델 학습
  private fitMA(residuals: number[]): number[] {
    if (residuals.length <= this.params.q || this.params.q === 0) {
      return new Array(this.params.q).fill(0);
    }

    const X: number[][] = [];
    const y: number[] = [];

    // MA 설계행렬 생성
    for (let i = this.params.q; i < residuals.length; i++) {
      const row = [];
      for (let j = 0; j < this.params.q; j++) {
        row.push(residuals[i - j - 1]);
      }
      X.push(row);
      y.push(residuals[i]);
    }

    return this.solveLinearSystem(X, y);
  }

  // 잔차 계산
  private calculateResiduals(data: number[], arCoefficients: number[]): number[] {
    const residuals: number[] = [];
    
    for (let i = this.params.p; i < data.length; i++) {
      let predicted = 0;
      for (let j = 0; j < this.params.p; j++) {
        predicted += arCoefficients[j] * data[i - j - 1];
      }
      residuals.push(data[i] - predicted);
    }
    
    return residuals;
  }

  // 모델 학습
  public fit(data: number[]): void {
    this.data = [...data];
    
    if (data.length < this.params.p + this.params.d + 1) {
      // 데이터가 부족한 경우 기본값 설정
      this.arCoefficients = new Array(this.params.p).fill(1 / this.params.p);
      this.maCoefficients = new Array(this.params.q).fill(0);
      this.differenced = [...data];
      this.residuals = [];
      return;
    }

    // 1. 차분 적용
    this.differenced = this.difference(data, this.params.d);

    // 2. AR 모델 학습
    this.arCoefficients = this.fitAR(this.differenced);

    // 3. 잔차 계산
    this.residuals = this.calculateResiduals(this.differenced, this.arCoefficients);

    // 4. MA 모델 학습
    this.maCoefficients = this.fitMA(this.residuals);
  }

  // ARIMA 예측
  public predict(steps: number): number[] {
    if (this.data.length === 0) {
      return new Array(steps).fill(0);
    }

    const predictions: number[] = [];
    let currentData = [...this.differenced];
    let currentResiduals = [...this.residuals];

    for (let step = 0; step < steps; step++) {
      // AR 성분 계산
      let arPrediction = 0;
      for (let i = 0; i < Math.min(this.params.p, currentData.length); i++) {
        arPrediction += this.arCoefficients[i] * currentData[currentData.length - 1 - i];
      }

      // MA 성분 계산
      let maPrediction = 0;
      for (let i = 0; i < Math.min(this.params.q, currentResiduals.length); i++) {
        maPrediction += this.maCoefficients[i] * currentResiduals[currentResiduals.length - 1 - i];
      }

      const prediction = arPrediction + maPrediction;
      predictions.push(prediction);

      // 다음 예측을 위한 데이터 업데이트
      currentData.push(prediction);
      currentResiduals.push(0); // 미래 잔차는 0으로 가정
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

  // 신뢰도 계산 (ARIMA 모델 기반)
  public calculateConfidence(predictions: number[]): number[] {
    const modelVariance = this.calculateModelVariance();
    const baseConfidence = 90;
    
    return predictions.map((_, index) => {
      // 시간이 지날수록 신뢰도 감소
      const timeFactor = Math.exp(-0.1 * (index + 1));
      
      // 모델 분산 기반 신뢰도 조정
      const varianceFactor = Math.max(0.4, 1 - modelVariance * 0.05);
      
      // AR, MA 차수에 따른 신뢰도 조정
      const complexityFactor = Math.min(1, (this.params.p + this.params.q) * 0.1 + 0.7);
      
      const confidence = baseConfidence * timeFactor * varianceFactor * complexityFactor;
      return Math.max(40, Math.min(100, confidence));
    });
  }

  // 모델 분산 계산
  private calculateModelVariance(): number {
    if (this.residuals.length === 0) return 0.1;
    
    const mean = this.residuals.reduce((a, b) => a + b, 0) / this.residuals.length;
    const variance = this.residuals.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / this.residuals.length;
    
    return Math.sqrt(variance);
  }

  // AIC (Akaike Information Criterion) 계산
  public calculateAIC(): number {
    if (this.residuals.length === 0) return Infinity;
    
    const n = this.residuals.length;
    const k = this.params.p + this.params.q; // 모델 파라미터 수
    const mse = this.residuals.reduce((sum, r) => sum + r * r, 0) / n;
    
    return n * Math.log(mse) + 2 * k;
  }

  // 모델 진단 정보
  public getDiagnostics() {
    return {
      arCoefficients: this.arCoefficients,
      maCoefficients: this.maCoefficients,
      residualVariance: this.calculateModelVariance(),
      aic: this.calculateAIC(),
      dataPoints: this.data.length,
      differenceOrder: this.params.d
    };
  }
} 