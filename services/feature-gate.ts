/**
 * Feature Gate Service
 * Controls access to premium features based on subscription status
 */

export type FeatureName =
  | 'unlimited_scans'
  | 'unlimited_saves'
  | 'submit_for_analysis'
  | 'recipe_early_access'
  | 'athlete_mode';

class FeatureGateService {
  /**
   * Check if a user can access a specific feature
   * @param feature - The feature to check access for
   * @param isPro - Whether the user has an active Pro subscription
   * @returns true if the user can access the feature, false otherwise
   */
  static canAccessFeature(feature: FeatureName, isPro: boolean): boolean {
    // All premium features require Pro subscription
    // Free users cannot access any premium features
    return isPro;
  }

  /**
   * Check if a feature requires Pro access and trigger the subscription modal for free users
   * @param feature - The feature to check
   * @param isPro - Whether the user has an active Pro subscription
   * @param showModal - Callback function to show the subscription modal
   * @returns true if the user has access (Pro user), false if access is denied (free user, modal shown)
   */
  static requiresProAccess(
    feature: FeatureName,
    isPro: boolean,
    showModal: () => void
  ): boolean {
    const hasAccess = this.canAccessFeature(feature, isPro);

    if (!hasAccess) {
      // User doesn't have access, show the subscription modal
      showModal();
      return false;
    }

    // User has access, allow them to proceed
    return true;
  }
}

export default FeatureGateService;
