// Hilfsfunktionen für Netzwerktest
async function testConnection(): Promise<number> {
  try {
    const startTime = performance.now();
    await fetch('https://www.google.com/favicon.ico', {
      mode: 'no-cors',
      cache: 'no-cache'
    });
    const endTime = performance.now();
    return endTime - startTime;
  } catch (error) {
    console.error('Netzwerktest fehlgeschlagen:', error);
    return -1;
  }
}

interface UserInfo {
  ipAddress: string;
  browser: string;
  os: string;
  deviceType: string;
  screenResolution: string;
  language: string;
  timezone: string;
  browserDetails: string;
  hardware: string;
  capabilities: string;
  network: string;
  location: string;
}

interface PantryData {
  userInfo: UserInfo;
  pantryId: string;
  timestamp: number;
  networkLatency: number;
}

interface PantryResponse {
  message: string;
  key: string;
  ttl: number;
}

interface CollectMessage {
  type: 'collect';
  data: {
    pantryId: string;
  } & UserInfo;
}

async function sendToPantry(data: PantryData): Promise<PantryResponse | null> {
  try {
    const response = await fetch(`https://getpantry.cloud/apiv1/pantry/${data.pantryId}/basket/valentine-responses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        timestamp: data.timestamp,
        networkLatency: data.networkLatency,
        userInfo: data.userInfo
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json() as PantryResponse;
    return result;
  } catch (error) {
    if (error instanceof Error) {
      console.error('Fehler beim Senden der Daten:', error.message);
    } else {
      console.error('Unbekannter Fehler beim Senden der Daten');
    }
    return null;
  }
}

async function collectData(data: CollectMessage['data']): Promise<void> {
  const networkLatency = await testConnection();
  
  const pantryData: PantryData = {
    userInfo: {
      ipAddress: data.ipAddress,
      browser: data.browser,
      os: data.os,
      deviceType: data.deviceType,
      screenResolution: data.screenResolution,
      language: data.language,
      timezone: data.timezone,
      browserDetails: data.browserDetails,
      hardware: data.hardware,
      capabilities: data.capabilities,
      network: data.network,
      location: data.location
    },
    pantryId: data.pantryId,
    timestamp: Date.now(),
    networkLatency
  };

  await sendToPantry(pantryData);
}

self.addEventListener('message', (event: MessageEvent<CollectMessage>) => {
  if (event.data.type === 'collect') {
    collectData(event.data.data);
  }
});
