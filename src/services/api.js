const API_BASE_URL = 'http://127.0.0.1:8888';

export const apiService = {
  async verifyGoogleAuth(accessToken, userInfo) {
    try {
      const response = await fetch(`${API_BASE_URL}/chat/user_query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          type: 'auth_verification',
          google_token: accessToken,
          user_info: userInfo,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Auth verification failed:', error);
      throw error;
    }
  },

  async sendChatMessage(message, accessToken) {
    try {
      const response = await fetch(`${API_BASE_URL}/chat/user_query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          type: 'chat_message',
          message: message,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Chat message failed:', error);
      throw error;
    }
  }
};