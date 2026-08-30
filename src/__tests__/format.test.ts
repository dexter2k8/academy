import { describe, it, expect } from 'vitest';
import { formatTime } from '../utils/format';

describe('formatTime', () => {
  it('formats 0 seconds as 00:00', () => {
    expect(formatTime(0)).toBe('00:00');
  });

  it('formats seconds under 10 with leading zero', () => {
    expect(formatTime(5)).toBe('00:05');
  });

  it('formats exactly 60 seconds as 01:00', () => {
    expect(formatTime(60)).toBe('01:00');
  });

  it('formats minutes and seconds correctly', () => {
    expect(formatTime(90)).toBe('01:30');
  });

  it('formats large values correctly', () => {
    expect(formatTime(3661)).toBe('61:01');
  });

  it('formats single digit seconds with leading zero', () => {
    expect(formatTime(125)).toBe('02:05');
  });
});
