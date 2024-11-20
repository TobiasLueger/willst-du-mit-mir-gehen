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

interface CollectMessage {
  type: 'collect';
  data: any;
}

interface PantryResponse {
  message: string;
}

async function getLocationInfo(ipAddress: string) {
  try {
    const response = await fetch(`https://ipapi.co/${ipAddress}/json/`);
    if (!response.ok) {
      throw new Error('Failed to fetch location info');
    }
    const data = await response.json();
    return {
      city: data.city || 'Unknown',
      region: data.region || 'Unknown',
      country: data.country_name || 'Unknown',
      countryCode: data.country_code || 'Unknown',
      isp: data.org || 'Unknown',
      org: data.asn || 'Unknown'
    };
  } catch (error) {
    console.error('Error fetching location:', error);
    return {
      city: 'Unknown',
      region: 'Unknown',
      country: 'Unknown',
      countryCode: 'Unknown',
      isp: 'Unknown',
      org: 'Unknown'
    };
  }
}

async function getIpAddress() {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    if (!response.ok) {
      throw new Error('Failed to fetch IP address');
    }
    const data = await response.json();
    return data.ip;
  } catch (error) {
    console.error('Error fetching IP:', error);
    return 'Unknown';
  }
}

async function appendToPantryBasket(pantryId: string, basketName: string, visitorData: any) {
  try {
    console.log('Using Pantry ID:', pantryId);
    console.log('Basket name:', basketName);

    // Create new data structure with the latest visitor
    const newData = {
      visitors: [visitorData],
      lastUpdated: new Date().toISOString()
    };

    // Try to get existing data first
    try {
      const getUrl = `https://getpantry.cloud/apiv1/pantry/${pantryId}/basket/${basketName}`;
      const getResponse = await fetch(getUrl);
      
      if (getResponse.ok) {
        const responseText = await getResponse.text();
        try {
          const existingData = JSON.parse(responseText);
          if (existingData && Array.isArray(existingData.visitors)) {
            // Add new visitor and keep only the last 3
            newData.visitors = [...existingData.visitors, visitorData]
              .slice(-3); // Keep only the last 3 entries
          }
        } catch (e) {
          console.error('Error parsing existing data, starting fresh:', e);
        }
      }
    } catch (e) {
      console.error('Error fetching existing data, starting fresh:', e);
    }

    console.log('Sending data:', newData);

    // Create or update the basket
    const postUrl = `https://getpantry.cloud/apiv1/pantry/${pantryId}/basket/${basketName}`;
    const updateResponse = await fetch(postUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newData),
    });

    console.log('POST Response status:', updateResponse.status);

    if (!updateResponse.ok) {
      const errorText = await updateResponse.text();
      console.error('Update response error:', errorText);
      throw new Error(`HTTP error! status: ${updateResponse.status}`);
    }

    return { message: 'Data updated successfully' };
  } catch (error) {
    console.error('Detailed error:', error);
    if (error instanceof Error) {
      throw new Error(`Failed to update Pantry basket: ${error.message}`);
    }
    throw new Error('Failed to update Pantry basket: Unknown error');
  }
}

const worker: Worker = self as any;

worker.addEventListener('message', async (event: MessageEvent<CollectMessage>) => {
  if (event.data.type === 'collect') {
    try {
      const ipAddress = await getIpAddress();
      const locationInfo = await getLocationInfo(ipAddress);
      
      const visitorData = {
        ...event.data.data,
        ipAddress,
        location: locationInfo,
        timestamp: new Date().toISOString()
      };

      if (!visitorData.pantryId) {
        throw new Error('Pantry ID is missing');
      }

      const result = await appendToPantryBasket(visitorData.pantryId, 'valentine-visitors', visitorData);
      worker.postMessage({ type: 'success', message: result.message });

    } catch (error) {
      console.error('Error in worker:', error);
      worker.postMessage({
        type: 'error',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    }
  }
});
