/**
 * Scan Limiter Service
 * Tracks and enforces daily scan limits for free users
 */

import { storage, STORAGE_KEYS } from './storage';

interface ScanLimitData {
  date: string; // YYYY-MM-DD format
  scansUsed: number;
}

class ScanLimiterService {
  private static DAILY_LIMIT = 30;

  /**
   * Get the current date in YYYY-MM-DD format
   */
  private static getCurrentDate(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Get scan limit data from storage
   */
  private static async getScanLimitData(): Promise<ScanLimitData> {
    const data = await storage.getItem<ScanLimitData>(STORAGE_KEYS.SCAN_LIMIT_DATA);
    
    if (!data) {
      // Initialize with default data
      return {
        date: this.getCurrentDate(),
        scansUsed: 0,
      };
    }

    return data;
  }

  /**
   * Save scan limit data to storage
   */
  private static async saveScanLimitData(data: ScanLimitData): Promise<void> {
    await storage.setItem(STORAGE_KEYS.SCAN_LIMIT_DATA, data);
  }

  /**
   * Reset scan count if it's a new day
   */
  static async resetIfNewDay(): Promise<void> {
    const data = await this.getScanLimitData();
    const currentDate = this.getCurrentDate();

    if (data.date !== currentDate) {
      // It's a new day, reset the count
      await this.saveScanLimitData({
        date: currentDate,
        scansUsed: 0,
      });
    }
  }

  /**
   * Check if a user can perform a scan
   * @param isPro - Whether the user is a Pro subscriber
   * @returns true if the user can scan, false otherwise
   */
  static async canScan(isPro: boolean): Promise<boolean> {
    // Pro users have unlimited scans
    //@todo -remove
    return true
    if (isPro) {
      return true;
    }

    // Reset if new day
    await this.resetIfNewDay();

    // Check if free user has scans remaining
    const data = await this.getScanLimitData();
    return data.scansUsed < this.DAILY_LIMIT;
  }

  /**
   * Decrement the scan count after a successful scan
   * @returns The number of scans remaining
   */
  static async decrementScans(): Promise<number> {
    await this.resetIfNewDay();

    const data = await this.getScanLimitData();
    const newScansUsed = data.scansUsed + 1;

    await this.saveScanLimitData({
      date: data.date,
      scansUsed: newScansUsed,
    });

    return this.DAILY_LIMIT - newScansUsed;
  }

  /**
   * Get the number of scans remaining for today
   * @returns The number of scans remaining
   */
  static async getScansRemaining(): Promise<number> {
    await this.resetIfNewDay();

    const data = await this.getScanLimitData();
    const remaining = this.DAILY_LIMIT - data.scansUsed;
    return Math.max(0, remaining);
  }

  /**
   * Check if a warning should be shown (3 or fewer scans remaining)
   * @returns true if warning should be shown
   */
  static async shouldShowWarning(): Promise<boolean> {
    const remaining = await this.getScansRemaining();
    return remaining <= 3 && remaining > 0;
  }

  /**
   * Get the daily scan limit
   */
  static getDailyLimit(): number {
    return this.DAILY_LIMIT;
  }
}

export default ScanLimiterService;
