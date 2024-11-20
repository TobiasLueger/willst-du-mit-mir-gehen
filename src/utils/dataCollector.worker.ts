// Datensammlung und -übertragung im Hintergrund
let collectedData: any = null;

// Hilfsfunktionen für Netzwerktest
async function testConnection() {
  try {
    const startTime = performance.now();
    await fetch('https://www.google.com/favicon.ico', {
      mode: 'no-cors',
      cache: 'no-store'
    });
    const duration = performance.now() - startTime;
    
    let quality = 'unknown';
    if (duration < 100) quality = 'excellent';
    else if (duration < 300) quality = 'good';
    else if (duration < 750) quality = 'fair';
    else quality = 'poor';

    return {
      pingTime: Math.round(duration),
      connectionQuality: quality,
      estimatedSpeed: duration < 100 ? 'high' : duration < 300 ? 'medium' : 'low'
    };
  } catch {
    return {
      pingTime: null,
      connectionQuality: 'unknown',
      estimatedSpeed: 'unknown'
    };
  }
}

// Daten an Pantry senden
async function sendToPantry(data: any) {
  const pantryId = data.pantryId;
  if (!pantryId) {
    console.error('Pantry API Key nicht gefunden');
    return;
  }

  try {
    const response = await fetch(`https://getpantry.cloud/apiv1/pantry/${pantryId}/basket/valentine-visitors`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        timestamp: new Date().toISOString(),
        ...data
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    console.log('✅ Besucherinformationen erfolgreich gespeichert');
  } catch (error) {
    console.error('❌ Fehler beim Speichern der Besucherinformationen:', error);
  }
}

// Hauptfunktion zur Datensammlung
async function collectData(data: any) {
  // Netzwerktest im Hintergrund durchführen
  const networkInfo = await testConnection();
  
  // Daten mit Netzwerkinfo ergänzen
  const enrichedData = {
    ...data,
    network: {
      ...data.network,
      ...networkInfo
    }
  };

  // Daten an Pantry senden
  await sendToPantry(enrichedData);
}

// Event Listener für Nachrichten vom Hauptthread
self.addEventListener('message', async (e) => {
  if (e.data.type === 'collect') {
    await collectData(e.data.data);
  }
});
