import * as tf from '@tensorflow/tfjs';
import { Matrix } from 'ml-matrix';

interface ArimaParams {
  p: number; // AR order
  d: number; // Difference order
  q: number; // MA order
}

export class ArimaModel {
  private params: ArimaParams;
  private data: number[];
  private differenced: number[];
  private coefficients: number[];

  constructor(params: ArimaParams) {
    this.params = params;
    this.data = [];
    this.differenced = [];
    this.coefficients = [];
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

  // 자기회귀(AR) 행렬 생성
  private createARMatrix(data: number[], order: number): Matrix {
    const rows = data.length - order;
    const matrix = new Array(rows);
    
    for (let i = 0; i < rows; i++) {
      matrix[i] = new Array(order);
      for (let j = 0; j < order; j++) {
        matrix[i][j] = data[i + order - j - 1];
      }
    }
    
    return new Matrix(matrix);
  }

  // 모델 학습
  public fit(data: number[]) {
    this.data = [...data];
    this.differenced = this.difference(data, this.params.d);

    const X = this.createARMatrix(this.differenced, this.params.p);
    const y = this.differenced.slice(this.params.p);

    // 최소제곱법으로 계수 추정
    const Xt = X.transpose();
    const XtX = Xt.mmul(X);
    const Xty = Xt.mmul(Matrix.columnVector(y));
    const coefficients = XtX.solve(Xty);
    
    this.coefficients = coefficients.to1DArray();
  }

  // 예측
  public predict(steps: number): number[] {
    const predictions: number[] = [];
    let lastValues = this.differenced.slice(-this.params.p);

    for (let i = 0; i < steps; i++) {
      let prediction = 0;
      for (let j = 0; j < this.params.p; j++) {
        prediction += this.coefficients[j] * lastValues[lastValues.length - 1 - j];
      }
      predictions.push(prediction);
      lastValues = [...lastValues.slice(1), prediction];
    }

    // 차분을 되돌리는 과정
    let result = [...predictions];
    for (let i = 0; i < this.params.d; i++) {
      const temp = [this.data[this.data.length - 1]];
      for (let j = 0; j < result.length; j++) {
        temp.push(temp[temp.length - 1] + result[j]);
      }
      result = temp.slice(1);
    }

    return result;
  }

  // 신뢰도 계산 (간단한 구현)
  public calculateConfidence(predictions: number[]): number[] {
    const std = this.calculateStandardDeviation(this.data);
    return predictions.map((_, index) => {
      // 예측 기간이 늘어날수록 신뢰도는 감소
      const confidenceFactor = Math.exp(-0.1 * (index + 1));
      return Math.max(0, Math.min(100, 100 * confidenceFactor));
    });
  }

  private calculateStandardDeviation(data: number[]): number {
    const mean = data.reduce((a, b) => a + b) / data.length;
    const squaredDiffs = data.map(x => Math.pow(x - mean, 2));
    const variance = squaredDiffs.reduce((a, b) => a + b) / data.length;
    return Math.sqrt(variance);
  }
} 