/**
 * Example usage of FeatureGateService
 * This file demonstrates how to use the FeatureGateService in your components
 */

import React, { useState } from 'react';
import { View, Button } from 'react-native';
import { useSubscription } from '../context/SubscriptionContext';
import FeatureGateService from './feature-gate';
import SubscriptionModal from '../components/SubscriptionModal';

/**
 * Example 1: Using canAccessFeature to check access
 */
export function ExampleCheckAccess() {
  const { isPro } = useSubscription();

  const handleFeatureAccess = () => {
    // Check if user can access a feature
    const canAccess = FeatureGateService.canAccessFeature('unlimited_scans', isPro);
    
    if (canAccess) {
      // User has access, proceed with feature
      console.log('User has access to unlimited scans');
    } else {
      // User doesn't have access, handle accordingly
      console.log('User needs Pro subscription');
    }
  };

  return (
    <View>
      <Button title="Check Access" onPress={handleFeatureAccess} />
    </View>
  );
}

/**
 * Example 2: Using requiresProAccess to automatically show modal
 */
export function ExampleRequireProAccess() {
  const { isPro } = useSubscription();
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);

  const handleSubmitForAnalysis = () => {
    // Check if user has access and show modal if not
    const hasAccess = FeatureGateService.requiresProAccess(
      'submit_for_analysis',
      isPro,
      () => setShowSubscriptionModal(true)
    );

    if (!hasAccess) {
      // Modal will be shown automatically, just return
      return;
    }

    // User has access, proceed with the feature
    console.log('Submitting product for analysis...');
    // ... rest of your logic
  };

  return (
    <View>
      <Button title="Submit for Analysis" onPress={handleSubmitForAnalysis} />
      
      <SubscriptionModal
        visible={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
        trigger="feature_access"
      />
    </View>
  );
}

/**
 * Example 3: Simplified pattern (recommended)
 */
export function ExampleSimplified() {
  const { isPro } = useSubscription();
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);

  const handleProFeature = () => {
    // One-liner to check access and show modal
    if (!FeatureGateService.requiresProAccess('athlete_mode', isPro, () => setShowSubscriptionModal(true))) {
      return; // User doesn't have access, modal shown
    }

    // User has access, continue with feature
    console.log('Accessing athlete mode...');
  };

  return (
    <View>
      <Button title="Access Athlete Mode" onPress={handleProFeature} />
      
      <SubscriptionModal
        visible={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
        trigger="feature_access"
      />
    </View>
  );
}

/**
 * Example 4: Checking multiple features
 */
export function ExampleMultipleFeatures() {
  const { isPro } = useSubscription();

  const checkAllFeatures = () => {
    const features = [
      'unlimited_scans',
      'unlimited_saves',
      'submit_for_analysis',
      'recipe_early_access',
      'athlete_mode',
    ] as const;

    features.forEach((feature) => {
      const hasAccess = FeatureGateService.canAccessFeature(feature, isPro);
      console.log(`${feature}: ${hasAccess ? 'Available' : 'Requires Pro'}`);
    });
  };

  return (
    <View>
      <Button title="Check All Features" onPress={checkAllFeatures} />
    </View>
  );
}
