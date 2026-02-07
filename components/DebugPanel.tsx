import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  Share,
  Alert,
  Clipboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { logger } from '../services/logger';

interface DebugPanelProps {
  visible: boolean;
  onClose: () => void;
}

export default function DebugPanel({ visible, onClose }: DebugPanelProps) {
  const [logs, setLogs] = useState(logger.getLogs());

  const refreshLogs = () => {
    setLogs(logger.getLogs());
  };

  const handleCopyLogs = () => {
    const logsString = logger.getLogsAsString();
    Clipboard.setString(logsString);
    Alert.alert('Success', 'Logs copied to clipboard');
  };

  const handleShareLogs = async () => {
    try {
      const logsString = logger.getLogsAsString();
      await Share.share({
        message: logsString,
        title: 'App Debug Logs',
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to share logs');
    }
  };

  const handleClearLogs = () => {
    Alert.alert(
      'Clear Logs',
      'Are you sure you want to clear all logs?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            logger.clearLogs();
            refreshLogs();
          },
        },
      ]
    );
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'error':
        return '#EF4444';
      case 'warn':
        return '#F59E0B';
      case 'info':
        return '#3B82F6';
      case 'debug':
        return '#8B5CF6';
      default:
        return '#6B7280';
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-gray-900">
        {/* Header */}
        <View className="bg-gray-800 px-4 py-3 border-b border-gray-700">
          <View className="flex-row items-center justify-between">
            <Text className="text-white text-lg font-semibold">Debug Logs</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#FFF" />
            </TouchableOpacity>
          </View>
          
          {/* Action Buttons */}
          <View className="flex-row mt-3 space-x-2">
            <TouchableOpacity
              onPress={refreshLogs}
              className="bg-blue-600 px-3 py-2 rounded-lg flex-row items-center mr-2"
            >
              <Ionicons name="refresh" size={16} color="#FFF" />
              <Text className="text-white text-sm ml-1">Refresh</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={handleCopyLogs}
              className="bg-green-600 px-3 py-2 rounded-lg flex-row items-center mr-2"
            >
              <Ionicons name="copy" size={16} color="#FFF" />
              <Text className="text-white text-sm ml-1">Copy</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={handleShareLogs}
              className="bg-purple-600 px-3 py-2 rounded-lg flex-row items-center mr-2"
            >
              <Ionicons name="share" size={16} color="#FFF" />
              <Text className="text-white text-sm ml-1">Share</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={handleClearLogs}
              className="bg-red-600 px-3 py-2 rounded-lg flex-row items-center"
            >
              <Ionicons name="trash" size={16} color="#FFF" />
              <Text className="text-white text-sm ml-1">Clear</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Logs List */}
        <ScrollView className="flex-1 px-4 py-3">
          {logs.length === 0 ? (
            <View className="flex-1 items-center justify-center py-12">
              <Ionicons name="document-text-outline" size={48} color="#6B7280" />
              <Text className="text-gray-400 mt-4">No logs yet</Text>
            </View>
          ) : (
            logs.map((log, index) => (
              <View key={index} className="mb-3 bg-gray-800 rounded-lg p-3">
                <View className="flex-row items-center mb-1">
                  <View
                    className="w-2 h-2 rounded-full mr-2"
                    style={{ backgroundColor: getLevelColor(log.level) }}
                  />
                  <Text
                    className="text-xs font-semibold uppercase"
                    style={{ color: getLevelColor(log.level) }}
                  >
                    {log.level}
                  </Text>
                  <Text className="text-gray-500 text-xs ml-auto">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </Text>
                </View>
                
                <Text className="text-white text-sm mb-1">{log.message}</Text>
                
                {log.data && (
                  <View className="bg-gray-900 rounded p-2 mt-2">
                    <Text className="text-gray-300 text-xs font-mono">
                      {JSON.stringify(log.data, null, 2)}
                    </Text>
                  </View>
                )}
              </View>
            ))
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}
